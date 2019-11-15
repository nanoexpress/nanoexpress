import fs from 'fs';
import { join } from 'path';
import { getMime } from './helpers/mime.js';

const prepareStaticFilesAndFolders = (path) =>
  fs
    .readdirSync(path)
    .map((file) => {
      const resolved = join(path, file);

      if (fs.lstatSync(resolved).isDirectory()) {
        return {
          files: prepareStaticFilesAndFolders(resolved),
          reduce: true
        };
      }

      const streamable = getMime(resolved);

      return {
        file,
        resolved,
        streamable,
        raw: streamable ? null : fs.readFileSync(resolved)
      };
    })
    .reduce((list, item) => {
      if (item.reduce) {
        list = list.concat(item.files);
      } else {
        list.push(item);
      }
      return list;
    }, []);

export default function staticMiddleware(
  path,
  {
    index = 'index.html',
    forcePretty = false,
    addPrettyUrl = true,
    streamConfig
  } = {}
) {
  const items = prepareStaticFilesAndFolders(path);

  const fn = (req, res, next) => {
    let fileName = req.path;

    if (forcePretty || (addPrettyUrl && req.path === '/')) {
      fileName += index;
    }

    for (const { file, streamable, resolved, raw } of items) {
      if (fileName.indexOf(file) !== -1) {
        if (streamable) {
          return res.sendFile(resolved, streamConfig);
        } else {
          return res.end(raw);
        }
      }
    }

    next();
  };
  fn.override = true;

  return fn;
}
