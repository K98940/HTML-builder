const { createWriteStream } = require('fs');
const { join } = require('path');
const { stdin, stdout } = require('process');
const { EOL } = require('os');
const readline = require('readline');

const colors = {
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
};
const fileName = 'writeStream.txt';
const filePath = join(__dirname, fileName);

const writeStream = createWriteStream(filePath, { encoding: 'utf-8' });
const rl = readline.createInterface(stdin, stdout);
rl.setPrompt(colors.green + 'you can type text here:' + EOL + colors.reset);
rl.prompt();

rl.on('line', (line) => {
  if (line.toLocaleLowerCase().trim() === 'exit') {
    rl.close();
    return;
  }
  writeStream.write(line + EOL);
}).on('close', () => {
  console.log(colors.green, EOL + 'this is the end', colors.reset);
});

writeStream.on('error', (err) => {
  console.log(colors.red, 'Oh, i have error: ' + err, colors.reset);
});
