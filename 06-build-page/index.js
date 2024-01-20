const { createReadStream, createWriteStream } = require('fs');
const { readdir, readFile, rm, mkdir, stat } = require('fs/promises');
const { EOL } = require('os');
const { join, extname, parse, basename } = require('path');
const readline = require('readline');

const getFilesList = async (path, fileType) => {
  const files = await readdir(path, { withFileTypes: true });
  return files.filter((file) => {
    const ext = extname(file.name);
    return file.isFile() && ext === fileType;
  });
};

const getComponents = async () => {
  const path = join(__dirname, 'components');

  return new Promise((resolve) => {
    getFilesList(path, '.html').then((htmlFiles) => {
      const components = [];
      const promises = htmlFiles.map((file) => {
        const fileName = join(file.path, file.name);
        return readFile(fileName).then((data) => {
          const name = file.name.replace('.html', '');
          components.push({ name: name, data: data });
        });
      });

      Promise.all(promises).then(() => resolve(components));
    });
  });
};

const replaceTemplates = async (path, components) => {
  const template = join(__dirname, 'template.html');
  const templateToHTML = (line) => {
    const tagIndex = line.indexOf('{{');
    if (tagIndex < 0) return line + EOL;

    let html = line;
    const tags = html.match(/{{(.*?)}}/g).map((tag) => tag);
    tags.forEach((tag) => {
      const component = components.filter((c) => {
        return `{{${c.name}}}` === tag;
      })[0];
      html = html.replace(tag, component.data);
    });

    return html.trim() + EOL;
  };

  const rl = readline.createInterface(createReadStream(template));
  const writeStream = createWriteStream(join(path, 'index.html'));

  rl.on('line', (line) => {
    const html = templateToHTML(line, components);
    writeStream.write(html);
  });
};

const mergeCSS = async (distPath, stylesPath) => {
  getFilesList(stylesPath, '.css').then((cssFiles) => {
    const writeStream = createWriteStream(join(distPath, 'style.css'));
    cssFiles.forEach((cssFile) => {
      const file = join(cssFile.path, cssFile.name);
      createReadStream(file).pipe(writeStream);
    });
  });
};

const updateFolder = async (src, dest) => {
  const fileCopy = async (src, dest) => {
    createReadStream(src).pipe(createWriteStream(dest));
  };
  const folderCopy = async (src, dest) => {
    const isFolder = (await stat(src)).isDirectory();
    const target = join(dest, basename(src));

    if (isFolder) {
      const files = await readdir(src, { withFileTypes: true });
      await mkdir(target, { recursive: true });

      files.forEach((file) => {
        const isFolder = file.isDirectory();
        if (isFolder) {
          folderCopy(join(file.path, file.name), target);
        } else {
          const src = join(file.path, file.name);
          const trg = join(target, file.name);
          fileCopy(src, trg);
        }
      });
    } else {
      const objPath = parse(src);
      const fileName = objPath.name + objPath.ext;
      fileCopy(src, join(dest, fileName));
    }
  };

  await mkdir(dest, { recursive: true });
  folderCopy(src, dest);
};

const createBundle = async () => {
  const distPath = join(__dirname, 'project-dist');
  const stylesPath = join(__dirname, 'styles');
  const assetsPath = join(__dirname, 'assets');

  await rm(distPath, { recursive: true, force: true });
  await mkdir(distPath, { recursive: true });
  const components = await getComponents();
  await replaceTemplates(distPath, components);
  await mergeCSS(distPath, stylesPath);
  await updateFolder(assetsPath, distPath);
};

createBundle();
