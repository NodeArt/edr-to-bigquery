const { BigQuery } = require('@google-cloud/bigquery');
const iconv = require('iconv-lite');
const { pipeline } = require('stream');
const readline = require('readline');
const xmlToJson = require('xml-to-json-stream');
const parser = xmlToJson();

const { bigqueryConfig } = require('./config/bigquery');

if (Object.values(bigqueryConfig).includes(undefined)) {
  console.error('no connection settings in env');
  process.exit(100);
}

const db = new BigQuery({
  projectId: bigqueryConfig.projectID,
  credentials: {
    client_email: bigqueryConfig.client_email,
    private_key: bigqueryConfig.private_key,
  },
  clientOptions: {
    clientId: bigqueryConfig.clientId,
  },
});

const createTable = (tableConfig) => {
  const options = {
    schema: tableConfig.settlementsSchema,
  };

  console.log('creating table', tableConfig.tableID);

  return db.dataset(bigqueryConfig.datasetID).createTable(tableConfig.tableID, options);
};

module.exports.getTable = async (tableConfig) => {
  const exists = await db.dataset(bigqueryConfig.datasetID).table(tableConfig.tableID).exists();

  if (exists[0]) {
    console.log('Drop table');
    await db.dataset(bigqueryConfig.datasetID).table(tableConfig.tableID).delete();
  }

  return createTable(tableConfig);
};

module.exports.insertData = (fileStream, tableConfig) => {
  const entityTag = 'SUBJECT';

  const bqStream = db.dataset(bigqueryConfig.datasetID).table(tableConfig.tableID).createWriteStream({
    sourceFormat: 'NEWLINE_DELIMITED_JSON',
  });

  bqStream.on('error', function (e) {
    console.log(e);
    process.exit(1);
  });

  const iconvStream = iconv.decodeStream('win1251');

  const pl = pipeline(
    fileStream,
    iconvStream,
    (err) => {
      if (err) {
        console.error('Pipeline failed', err);
      } else {
        console.log('Pipeline succeeded');
      }
    },
  );

  const rl = readline.createInterface({
    input: pl,
  });

  const get = (obj, path) => path ? path.split('.').reduce((a, v) => Array.isArray(a) ? a.map(e => e[v]) : a[v], obj) : obj;
  const set = (obj, path, val) => {
    const arr = path.split('.');
    const last = arr.pop();

    if (typeof val !== 'function') val = () => val;

    const target = get(obj, arr.join('.'));
    Array.isArray(target) ? target.map(e => e[last] = val(e[last])) : target[last] = val(target[last]);
  };

  let count = 0;

  rl.on('line', (line) => {
    parser.xmlToJson(line, (err, json) => {
      try {
        if (typeof json === 'undefined') return;
        if (!Object.keys(json).includes(entityTag)) return;
        const entity = json[entityTag];
        for (const field of tableConfig.repeated) {
          const value = get(entity, field.toUpperCase());
          if (typeof value === 'object' && Object.keys(value).length === 1) {
            set(entity, field.toUpperCase(), (v) => Object.entries(v)[0][1]);
          }
          if (!Array.isArray(entity[field.toUpperCase()])) {
            set(entity, field.toUpperCase(), []);
          }
        }

        for (const field of tableConfig.record) {
          if (typeof get(entity, field.toUpperCase()) !== 'object') {
            set(entity, field.toUpperCase(), {});
          }
        }

        const getStrings = (prefix, elems) => (
          elems.flatMap(e => e.fields ? getStrings(prefix + e.name.toUpperCase() + '.', e.fields) : prefix + e.name.toUpperCase())
        );

        const names = getStrings('', tableConfig.settlementsSchema);

        for (const name of names) {
          if (!tableConfig.repeated.includes(name.toLowerCase()) && Array.isArray(get(entity, name))) {
            set(entity, name, e => Array.isArray(e) ? e[0] : e);
          }
        }

        count++;
        if (count % 1000 === 0) {
          console.log(count);
        }

        const writable = bqStream.write(JSON.stringify(entity) + '\n', 'utf8');
      } catch (error) {
        console.log(error);
        process.exit(1);
      }
    });
  });

  bqStream.once('complete', () => {
    console.log('bq end');
  });

  bqStream.on('error', (e) => console.log(e));

  fileStream.on('error', () => (console.log('File stream error'), bqStream.end()));
  fileStream.on('end', () => (console.log('File stream end'), bqStream.end()));
  iconvStream.on('error', () => (console.log('Iconv stream error'), bqStream.end()));
  iconvStream.on('end', () => (console.log('Iconv stream end'), bqStream.end()));

  process.on('SIGINT', () => {
    bqStream.end();
    console.info('SIGINT signal received.');
    process.exit(0);
  });
};
