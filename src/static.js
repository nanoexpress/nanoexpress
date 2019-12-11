import { readdirSync, readFileSync, lstatSync } from 'fs';
import { join } from 'path';
import { getMime } from './helpers/mime.js';

const prepareStaticFilesAndFolders = (path) =>
  readdirSync(path)
    .map((file) => {
      const resolved = join(path, file);

      if (lstatSync(resolved).isDirectory()) {
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
        raw: streamable ? null : readFileSync(resolved)
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
    lastModified = true,
    compressed = true
  } = {}
) {
  const items = prepareStaticFilesAndFolders(path);

  const fn = async (req, res) => {
    let fileName = req.path;

    if (forcePretty || (addPrettyUrl && req.path === '/')) {
      fileName += index;
    }

    for (const { file, streamable, resolved, raw } of items) {
      if (fileName.indexOf(file) !== -1) {
        if (streamable) {
          return res.sendFile(resolved, lastModified, compressed);
        } else {
          return res.end(raw);
        }
      }
    }
  };
  fn.override = true;

  return fn;
}
