import Busboy from 'busboy';
import { createWriteStream } from 'fs';
import { mimes } from '../../helpers/mime.js';

const mimeKeys = Object.keys(mimes);
const mimeValues = Object.values(mimes);
export default () => {
  const middleware = (req, res, next) => {
    // eslint-disable-next-line prefer-const
    let { headers, body } = req;

    if (headers && body) {
      const contentType = headers['content-type'];
      if (contentType) {
        if (contentType.indexOf('multipart/form-data') === 0) {
          const form = new Busboy(req);
          form.on('field', (key, value) => {
            if (typeof body !== 'object' || body.length) {
              req.body = {};
              body = req.body;
            }
            if (key.endsWith('[]')) {
              key = key.substr(0, key.length - 2);

              if (!body[key] || !body[key].length) {
                value = [value];
              } else {
                body[key].push(value);
                value = body[key];
              }
            }
            if (value === 'null') {
              value = null;
            } else if (value === 'undefined') {
              value = undefined;
            }
            body[key] = value;
          });
          form.on('file', (key, file, filename, encoding, mime) => {
            if (!req.files) {
              req.files = [];
            }
            file.field = key;
            file.filename = filename;
            file.encoding = encoding;
            file.mime = mime;
            file.extension = filename.substr(filename.lastIndexOf('.'));
            file.type = file.extension.substr(1);

            file.mv = (filePath) =>
              new Promise((resolve, reject) => {
                const stream = createWriteStream(filePath);
                file.pipe(stream);
                stream.on('finish', resolve);
                stream.on('error', reject);
              });

            req.files.push(file);
          });
          req.pipe(form);
          next();
        } else {
          const mimeIndex = mimeValues.findIndex(
            (value) => value === contentType
          );

          // Binary upload support
          if (mimeIndex !== -1) {
            const mimeType = mimeKeys[mimeIndex];

            if (!req.files) {
              req.files = [];
            }
            if (
              mimeType.indexOf('x-www-form-urlencoded') !== -1 ||
              mimeType.indexOf('json') !== -1
            ) {
              return next();
            }

            const file = {
              type: mimeType,
              extension: `.${mimeType}`,
              buffer: { data: body }
            };
            req.body = null;

            file.mv = (filePath) =>
              new Promise((resolve, reject) => {
                const stream = createWriteStream(filePath);
                stream.write(file.buffer.data);
                stream.end();
                stream.on('finish', resolve);
                stream.on('error', reject);
              });
            req.files.push(file);
          }

          next();
        }
      }
    }
  };
  middleware.methods = 'POST, PUT';

  return middleware;
};
