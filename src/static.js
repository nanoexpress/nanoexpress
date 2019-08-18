import fs from 'fs';
import { join } from 'path';
import util from 'util';
const readFile = util.promisify(fs.readFile);
import { getMime } from './helpers/mime';

export default function staticMiddleware(
  path,
  { index = 'index.html', addPrettyUrl = true, streamConfig } = {}
) {
  return (req, res) => {
    let fileName = req.path;
    if (addPrettyUrl && req.path === '/') {
      fileName += index;
    }

    const fileResolved = join(path, fileName);

    const isStreamableResource = getMime(req.path);

    if (isStreamableResource) {
      return res.sendFile(fileResolved, streamConfig).catch(() => {
        res.writeStatus('404 Not Found');
        res.end('');
      });
    } else {
      let isAborted = false;
      res.onAborted(() => {
        isAborted = true;
      });
      return readFile(fileResolved, 'utf-8').then((data) => {
        if (!isAborted) {
          if (fileResolved.endsWith(index)) {
            res.writeHeader('Content-Type', 'text/html');
          }
          res.end(data);
        }
      });
    }
  };
}
