require('dotenv').config();

const fetch = require('node-fetch');
const unzipper = require('unzipper');

const { DATA_URL } = require('./config/download');
const { getTable, insertData } = require('./bigquery');
const bqConfig = require('./config/bigquery');

const downloadFile = async () => {
  const res = await fetch(DATA_URL);
  const json = await res.json();
  const url = json.result.resources.map(r => r.url).find(url => url.includes('full'));

  const fileReq = await fetch(url);
  fileReq.body.pipe(unzipper.Parse())
    .on('entry', function (entry) {
      const tables = ['uo', 'fop'];

      console.log('got file', entry.path);
      const table = tables.find(table => entry.path.toLowerCase().includes(table));

      if (table) {
        const tableConfig = bqConfig[table];
        getTable(tableConfig).then(() => insertData(entry, tableConfig));
      } else {
        console.log('ERROR: Table for file', entry.path, 'is not found');
        entry.autodrain();
      }
    });
};

downloadFile();
