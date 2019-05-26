// Code from https://github.com/uNetworking/uWebSockets.js/blob/master/examples/VideoStreamer.js
// And Adapted to be used
// and create method for easy and clean
// code and usefulness

import fs from 'fs';
import promisify from './promisify';
import toArrayBuffer from './to-array-buffer';

const onAbortedOrFinishedResponse = (res, readStream) =>
  new Promise((resolve, reject) => {
    if (res.id === -1) {
      reject(
        new Error('[Server]: Error, Reject called twice for the same res!')
      );
    } else {
      readStream.destroy();
      reject(new Error('[Server]: Error, Stream was closed'));
    }
    res.id = -1;
    resolve(readStream);
  });

export default (res) => {
  return async (fileName) => {
    const fileSize = (await promisify(fs.stat, fileName)).size;
    const readStream = fs.createReadStream(fileName);

    const result = await new Promise((resolve, reject) => {
      readStream
        .on('data', (chunk) => {
          const chunkArray = toArrayBuffer(chunk);
          const lastOffset = res.getWriteOffset();
          const [ok, done] = res.tryEnd(chunkArray, fileSize);

          if (done) {
            onAbortedOrFinishedResponse(res, readStream)
              .then(resolve)
              .catch(reject);
          } else if (!ok) {
            readStream.pause();

            res.chunkArray = chunkArray;
            res.chunkOffset = lastOffset;

            res.onWritable((offset) => {
              const [ok, done] = res.tryEnd(
                res.chunkArray.slice(offset - res.chunkOffset),
                fileSize
              );
              if (done) {
                onAbortedOrFinishedResponse(res, readStream)
                  .then(resolve)
                  .catch(reject);
              } else if (ok) {
                readStream.resume();
              }
              return ok;
            });
          }
        })
        .on('error', () => {
          reject(
            new Error(
              '[Server]: Unhandled read error from Node.js, you need to handle this!'
            )
          );
        });

      res.onAborted(() => {
        onAbortedOrFinishedResponse(res, readStream)
          .then(resolve)
          .catch(reject);
      });
    });

    // Maybe we just return?
    return result;
  };
};
