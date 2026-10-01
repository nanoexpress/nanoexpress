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
    // uWS recycles the chunk ArrayBuffer after this callback, so the bytes
    // must be copied (Buffer.from(TypedArray) copies) — a view would read
    // garbage when the stream consumer reads it later
    stream.push(Buffer.from(new Uint8Array(chunk)));

    if (isLast) {
      stream.push(null);
    }
  });
}
