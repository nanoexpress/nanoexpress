import { createBrotliCompress, createDeflate, createGzip } from 'node:zlib';

const priority = ['gzip', 'br', 'deflate'];

export default (stream, headers) => {
  const contentEncoding = headers['accept-encoding'];
  const encoding = priority.find(
    (encodingItem) =>
      contentEncoding && contentEncoding.indexOf(encodingItem) !== -1
  );

  const compression =
    encoding === 'br'
      ? createBrotliCompress()
      : encoding === 'gzip'
        ? createGzip()
        : encoding === 'deflate'
          ? createDeflate()
          : null;

  if (compression) {
    stream.pipe(compression);

    headers['Content-Encoding'] = encoding;
  }

  return compression;
};
