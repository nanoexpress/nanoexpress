import { Readable } from 'node:stream';

/**
 *
 * @param {import('uWebSockets.js').HttpRequest} req
 * @param {import('uWebSockets.js').HttpResponse} res
 */
export default function requestStream(req, res) {
  const stream = new Readable({
    read() {
      // any read?
    }
  });
  req.stream = stream;

  res.onData((chunk, isLast) => {
    stream.push(new Uint8Array(chunk));

    if (isLast) {
      stream.push(null);
    }
  });
}
