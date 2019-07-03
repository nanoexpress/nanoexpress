export default function stob(stream) {
  return new Promise((resolve) => {
    const buffers = [];
    stream.on('data', buffers.push.bind(buffers));

    stream.on('end', () => {
      switch (buffers.length) {
      case 0:
        resolve(Buffer.allocUnsafe(0));
        break;
      case 1:
        resolve(buffers[0]);
        break;
      default:
        resolve(Buffer.concat(buffers));
      }
    });
  });
}
