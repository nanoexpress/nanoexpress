import { Readable } from 'stream';

export default function requestStream(req, res) {
  const stream = new Readable({
    read() {}
  });

  req.stream = stream;

  res.onData((chunk, isLast) => {
    stream.push(Buffer.concat([Buffer.from(chunk)]));
    if (isLast) {
      stream.push(null);
    }
  });
}
