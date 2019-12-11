import { getMime } from './mime.js';
import { statSync, createReadStream } from 'fs';

export default function(path, lastModified = true, compressed = false) {
  const res = this;
  const req = res.__request;
  const { headers } = req;
  const responseHeaders = {};

  const stat = statSync(path);
  let { size } = stat;

  // handling last modified
  if (lastModified) {
    const { mtime } = stat;

    mtime.setMilliseconds(0);
    const mtimeutc = mtime.toUTCString();

    // Return 304 if last-modified
    if (headers && headers['if-modified-since']) {
      if (new Date(headers['if-modified-since']) >= mtime) {
        res.writeStatus('304 Not Modified');
        return res.end();
      }
    }
    responseHeaders['last-modified'] = mtimeutc;
  }
  responseHeaders['content-type'] = getMime(path);

  // write data
  let start = 0;
  let end = 0;

  if (headers && headers.range) {
    [start, end] = headers.range
      .substr(6)
      .split('-')
      .map((byte) => (byte ? parseInt(byte, 10) : undefined));

    // Chrome patch for work
    if (end === undefined) {
      end = size - 1;
    }

    if (start !== undefined) {
      res.writeStatus('206 Partial Content');
      responseHeaders['accept-ranges'] = 'bytes';
      responseHeaders['content-range'] = `bytes ${start}-${end}/${size}`;
      size = end - start + 1;
    }
  }

  // for size = 0
  if (end < 0) {
    end = 0;
  }

  req.responseHeaders = responseHeaders;

  const createStreamInstance = end
    ? createReadStream(path, { start, end })
    : createReadStream(path);

  const pipe = res.pipe(createStreamInstance, size, compressed);
  res.writeHeaders(responseHeaders);

  return pipe;
}
