import { Readable } from 'stream';
const { parse } = require('querystring');

export default async (req, res) => {
  const stream = new Readable();
  stream._read = () => true;
  req.pipe = stream.pipe.bind(stream);
  req.stream = stream;

  if (!res || !res.onData) {
    return undefined;
  }

  let body = await new Promise((resolve) => {
    /* Register error cb */
    if (!res.abortHandler && res.onAborted) {
      res.onAborted(() => {
        if (res.readStream) {
          res.readStream.destroy();
        }
        res.aborted = true;
        resolve();
      });
      res.abortHandler = true;
    }

    let buffer;
    res.onData((chunkPart, isLast) => {
      const chunk = Buffer.from(chunkPart);
      stream.push(
        new Uint8Array(
          chunkPart.slice(chunkPart.byteOffset, chunkPart.byteLength)
        )
      );
      if (isLast) {
        stream.push(null);
        if (buffer) {
          resolve(Buffer.concat([buffer, chunk]).toString('utf8'));
        } else {
          resolve(chunk.toString('utf8'));
        }
      } else {
        if (buffer) {
          buffer = Buffer.concat([buffer, chunk]);
        } else {
          buffer = Buffer.concat([chunk]);
        }
      }
    });
  });

  if (!body) {
    return undefined;
  }

  const { headers } = req;

  if (headers) {
    const contentType = headers['content-type'];
    if (contentType) {
      if (contentType.indexOf('/json') !== -1) {
        body = JSON.parse(body);
      } else if (contentType.indexOf('/x-www-form-urlencoded') !== -1) {
        body = parse(req.body);
      }
    }
  }

  return body;
};
