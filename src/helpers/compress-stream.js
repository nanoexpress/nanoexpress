import { createBrotliCompress, createGzip, createDeflate } from 'zlib';

const priority = ['gzip', 'br', 'deflate'];

export default (stream, headers) => {
  const contentEncoding = headers['accept-encoding'];
  const encoding = priority.find(
    (encoding) => contentEncoding.indexOf(encoding) !== -1
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
