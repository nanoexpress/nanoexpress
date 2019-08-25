import { Readable } from 'stream';
import { parse } from 'querystring';

export default async (req, res) => {
  const stream = new Readable();
  stream._read = () => true;
  req.pipe = stream.pipe.bind(stream);
  req.stream = stream;

  if (!res || !res.onData) {
    return undefined;
  }

  let isAborted = false;
  let body = await new Promise((resolve) => {
    /* Register error cb */
    res.onAborted(() => {
      if (res.stream) {
        res.stream.destroy();
      }
      isAborted = true;
      resolve();
    });

    let buffer;
    res.onData((chunkPart, isLast) => {
      if (isAborted) {
        return;
      }
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
