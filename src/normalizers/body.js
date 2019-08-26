import { Readable } from 'stream';

export default (req, res) =>
  new Promise((resolve) => {
    if (!res || !res.onData) {
      return resolve();
    }

    const stream = new Readable();
    stream._read = () => true;
    req.pipe = stream.pipe.bind(stream);
    req.stream = stream;

    let isAborted = false;
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
