const { createReadStream, createWriteStream } = require('fs');
const { readdir, readFile, rm, mkdir } = require('fs/promises');
const { EOL } = require('os');
const { join, extname } = require('path');
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

const mergeCSS = async (path) => {
  getFilesList(path, '.css').then((cssFiles) => {});
};

const createBundle = async () => {
  const distPath = join(__dirname, 'project-dist');

  await rm(distPath, { recursive: true, force: true });
  await mkdir(distPath, { recursive: true });
  const components = await getComponents();
  replaceTemplates(distPath, components);
  mergeCSS(distPath);
};

createBundle();
