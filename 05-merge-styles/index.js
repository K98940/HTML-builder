const { readdir, readFile, writeFile } = require('fs/promises');
const { join, extname } = require('path');

const srcDir = 'styles';
const srcPath = join(__dirname, srcDir);
const destdir = 'project-dist';
const bundleName = 'bundle.css';
const destPath = join(__dirname, destdir, bundleName);

const readDir = async () => {
  const files = await readdir(srcPath, { withFileTypes: true });
  return files.filter((file) => {
    const ext = extname(file.name);
    return file.isFile() && ext === '.css';
  });
};

const mergeFiles = async (files, destPath) => {
  const promises = files.map((file) => {
    const src = join(file.path, file.name);
    return readFile(src, { encoding: 'utf-8' });
  });

  Promise.all(promises).then((result) => writeFile(destPath, result));
};

const createBundle = async () => {
  const files = await readDir();
  mergeFiles(files, destPath);
};

createBundle();
