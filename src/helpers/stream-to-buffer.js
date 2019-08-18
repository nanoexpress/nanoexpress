export default function stob(stream) {
  return new Promise((resolve) => {
    const buffers = [];
    stream.on('data', buffers.push.bind(buffers));

    stream.on('end', () => {
      const buffLen = buffers.length;

      if (buffLen === 0) {
        resolve(Buffer.allocUnsafe(0));
      } else if (buffLen === 1) {
        resolve(buffers[0]);
      } else {
        resolve(Buffer.concat(buffers));
      }
    });
  });
}
