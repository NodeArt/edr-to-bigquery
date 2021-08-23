require('dotenv').config();

const fetch = require('node-fetch');
const unzipper = require('unzip-stream');
const path = require('path');
const rrs = require('request-retry-stream');

const { DATA_URL } = require('./config/download');
const { getTable, insertData } = require('./bigquery');
const bqConfig = require('./config/bigquery');
const Downloader = require('nodejs-file-downloader');

const downloadFile = async () => {
  const res = await fetch(DATA_URL);
  const json = await res.json();
  const url = json.result.resources.map(r => r.url).find(url => url.includes('full'));

  let prevPercent = 0;
  const downloader = new Downloader({
    url,
    directory: "./downloads",
    onProgress: (percentage) => {
      if (Math.floor(percentage) !== prevPercent) {
        prevPercent = Math.floor(percentage);
        console.log('% ', percentage);
      }
    }
  })
  try {
    await downloader.download();
    console.log('Download finished!');

    const filename = url.split('/').pop();
    // rrs.get(url, {timeout: 1000, logFunction: console.warn}).pipe(unzipper.Parse())
    require('fs').createReadStream('./downloads/'+filename).pipe(unzipper.Parse())
      .on('entry', function (entry) {
        const tables = ['uo', 'fop'];

        console.log('got file', entry.path);

        if (entry.type !== 'File') {
          console.log('Entry type is ' + entry.type + ', skipping');
          return;
        }

        const table = tables.find(table => path.basename(entry.path).toLowerCase().includes(table));

        if (table) {
          const tableConfig = bqConfig[table];
          getTable(tableConfig).then(() => insertData(entry, tableConfig));
        } else {
          console.log('ERROR: Table for file', entry.path, 'is not found');
          entry.autodrain();
        }
      });
    } catch (error) {
      console.log('Download failed',error)
    }
};

downloadFile();
