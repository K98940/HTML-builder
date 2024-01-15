const { createReadStream } = require('node:fs');
const { join } = require('node:path');

const colors = {
  bold: '\n\x1b[1m',
  red: '\n\x1b[31m',
  reset: '\x1b[0m\n',
};
const fileName = 'text.txt';
const filePath = join(__dirname, fileName);
const stream = createReadStream(filePath, { encoding: 'utf-8' });

stream
  .on('data', (data) => console.log(colors.bold, data, colors.reset))
  .on('error', (err) => console.log(colors.red, err.message, colors.reset));
