export default (res) =>
  new Promise((resolve, reject) => {
    let buffer;
    /* Register data cb */
    res.onData((chunkPart, isLast) => {
      const chunk = Buffer.from(chunkPart);
      if (isLast) {
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
  });
