import { Readable } from 'stream';

export default (req, res) => {
  const stream = new Readable();
  stream._read = () => true;
  req.pipe = stream.pipe.bind(stream);
  req.stream = stream;

  return (
    res &&
    res.onData &&
    new Promise((resolve, reject) => {
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

      /* Register error cb */
      res.onAborted(reject);
    })
  );
};
