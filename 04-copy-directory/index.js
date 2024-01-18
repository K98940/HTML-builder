const { mkdir, readdir, rm, copyFile } = require('fs/promises');
const { join } = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
};
const srcName = 'files';
const srcPath = join(__dirname, srcName);
const destName = `${srcName}-copy`;
const destPath = join(__dirname, destName);

const readDir = async () => {
  const files = await readdir(srcPath, { withFileTypes: true });
  return files.filter((file) => file.isFile());
};

const copyFiles = async (files, destPath) => {
  files.forEach((file) => {
    console.log(colors.green, `copy ${file.name}`);
    const src = join(file.path, file.name);
    const dest = join(destPath, file.name);
    copyFile(src, dest);
  });
};

const copyDir = async () => {
  await rm(destPath, { recursive: true, force: true });
  const files = await readDir();
  await mkdir(destPath, { recursive: true });
  copyFiles(files, destPath);
};

copyDir();
