import busboy from 'busboy';
import { createWriteStream } from 'fs';

export default () => {
  const middleware = (req, res, next) => {
    const { headers, body } = req;

    if (headers && body) {
      const contentType = headers['content-type'];
      if (contentType) {
        if (contentType.indexOf('multipart/form-data') === 0) {
          const form = new busboy(req);
          form.on('field', (key, value) => {
            if (typeof req.body !== 'object' || req.body.length) {
              req.body = {};
            }
            req.body[key] = value;
          });
          form.on('file', (key, file, filename, encoding, mime) => {
            if (!req.files) {
              req.files = [];
            }
            file.field = key;
            file.filename = filename;
            file.encoding = encoding;
            file.mime = mime;

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
          next();
        }
      }
    }
  };
  middleware.methods = 'POST, PUT';

  return middleware;
};
