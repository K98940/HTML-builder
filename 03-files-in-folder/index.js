const { join, extname } = require('path');
const { readdir } = require('fs/promises');
const { stat } = require('fs');

const colors = {
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
};
const folderName = 'secret-folder';
const path = join(__dirname, folderName);

const readDir = (path) => {
  return new Promise((resolve) => {
    const fileList = readdir(path, { withFileTypes: true });
    resolve(fileList);
  });
};

const printFiles = (fileList) => {
  fileList.forEach((file) => {
    if (!file.isFile()) return;

    const fullPath = join(file.path, file.name);
    let fileExt = extname(file.name);
    const fileName = file.name.replace(fileExt, '');
    fileExt = fileExt.replace('.', '');

    stat(fullPath, (_, stats) => {
      console.log(
        colors.bold,
        `${fileName} - ${fileExt} - ${stats.size} byte`,
        colors.reset,
      );
    });
  });
};

readDir(path).then(printFiles);
