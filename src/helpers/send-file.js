import { createReadStream, statSync } from 'node:fs';
import { getMime } from './mime.js';

export default function sendFile(
  path,
  lastModified = true,
  compressed = false
) {
  const { $headers } = this;
  const stat = statSync(path);
  let { size } = stat;

  // handling last modified
  if (lastModified) {
    const { mtime } = stat;

    mtime.setMilliseconds(0);
    const mtimeutc = mtime.toUTCString();

    // Return 304 if last-modified
    if ($headers?.['if-modified-since']) {
      if (new Date($headers['if-modified-since']) >= mtime) {
        this.writeStatus('304 Not Modified');
        return this.end();
      }
    }
    this.writeHeader('last-modified', mtimeutc);
  }
  this.writeHeader('content-type', getMime(path));

  // write data
  let start = 0;
  let end = 0;

  if ($headers?.range) {
    [start, end] = $headers.range
      .substr(6)
      .split('-')
      .map((byte) => (byte ? Number.parseInt(byte, 10) : undefined));

    // Chrome patch to make it work
    if (end === undefined) {
      end = size - 1;
    }

    if (start !== undefined) {
      this.writeStatus('206 Partial Content');
      this.writeHeader('accept-ranges', 'bytes');
      this.writeHeader('content-range', `bytes ${start}-${end}/${size}`);
      size = end - start + 1;
    }
  }

  // for size = 0
  if (end < 0) {
    end = 0;
  }

  const createStreamInstance = end
    ? createReadStream(path, { start, end })
    : createReadStream(path);

  const pipe = this.pipe(createStreamInstance, size, compressed);

  return pipe;
}
