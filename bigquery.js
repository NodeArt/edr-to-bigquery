const { BigQuery } = require('@google-cloud/bigquery');
const sax = require('sax');
const iconv = require('iconv-lite');
const { pipeline } = require('stream');

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
  const entityTag = 'subject';
  const skipTags = ['data', 'subject'];
  const written = false;
  const buffer = [];
  let entity = [{}];
  let paused = false;
  let count = 0;

  const bqStream = db.dataset(bigqueryConfig.datasetID).table(tableConfig.tableID).createWriteStream({
    sourceFormat: 'NEWLINE_DELIMITED_JSON',
  });

  bqStream.on('error', function (e) {
    console.log(e);
    process.exit(1);
  });

  const iconvStream = iconv.decodeStream('win1251');

  const saxStream = sax.createStream(true);

  pipeline(
    fileStream,
    iconvStream,
    saxStream,
    (err) => {
      if (err) {
        console.error('Pipeline failed', err);
      } else {
        console.log('Pipeline succeeded');
      }
    },
  );

  saxStream.on('error', function (e) {
    console.error('error!', e);

    this._parser.error = null;
    this._parser.resume();
  });

  saxStream.on('opentag', function (node) {
    // if tag is <entity>, then create new entity and fill it with tag attriutes
    if (node.name.toLowerCase() === entityTag) {
      entity = [
        Object.keys(node.attributes).reduce((a, v) => {
          a[v.toLowerCase()] = node.attributes[v].replace('&quot;', '').replace('"', '');
          return a;
        }, {}),
      ];
    }

    // if tag is <data> or <entity>, then return to prevent entity from pushing additional object
    if (skipTags.includes(node.name.toLowerCase())) return;

    // add new level of nesting
    entity.push({});
  });

  saxStream.on('text', function (text) {
    // if text exists, replace nested object with string
    if (text.trim() !== '') entity[entity.length - 1] = text;
  });

  saxStream.on('closetag', function (name) {
    const lname = name.toLowerCase();

    // if tag is </entity>, then entity is complete, so encode it into JSONL and write to BQ stream
    if (name.toLowerCase() === entityTag) {
      if (paused) {
        buffer.push(JSON.stringify(entity[entity.length - 1]) + '\n');
        return;
      }

      while (buffer.length > 0) {
        bqStream.write(buffer.shift(), 'utf8');
      }

      if (!written) {
        const writable = bqStream.write(JSON.stringify(entity[entity.length - 1]) + '\n', 'utf8');
        count++;
        if (count % 10000 === 0) {
          console.log(count);
        }

        if (!writable) {
          paused = true;
          iconvStream.pause();
          bqStream.once('drain', () => {
            paused = false;
            iconvStream.resume();
          });
        }
      } else {
        bqStream.once('complete', () => {
          console.log('bq end');
          process.exit(0);
        });
        bqStream.end();
      }
    }

    // skip </data> and </entity>
    if (skipTags.includes(lname)) return;

    // as tag closes, write all of it's data to previous level
    let data = entity.pop();
    // check if data contains only one element that is an array. If so, then rewrite data as array to flatten data
    if (tableConfig.repeated.includes(lname) && Object.keys(data).length === 1) data = [].concat(Object.entries(data)[0][1]);
    // if data is empty, then write null
    if (typeof data === 'object' && Object.keys(data).length === 0) {
      if (tableConfig.repeated.includes(lname)) {
        data = [];
      } else if (tableConfig.record.includes(lname)) {
        data = {};
      } else {
        data = '';
      }
    }

    // check if such tag already exists; if not, then just write data to it
    if (entity[entity.length - 1][lname]) {
      // if it's already an array, then push data to it; if not, then create the array with existing and new data
      if (Array.isArray(entity[entity.length - 1][lname])) {
        entity[entity.length - 1][lname].push(data);
      } else {
        entity[entity.length - 1][lname] = [entity[entity.length - 1][lname], data];
      }
    } else {
      entity[entity.length - 1][lname] = data;
    }
  });

  // manually end the bqStream if no XML data is left to write all remaining entities
  saxStream.on('end', () => (console.log('SAX stream end'), bqStream.end()));

  bqStream.once('complete', () => {
    console.log('bq end');
    process.exit(0);
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
