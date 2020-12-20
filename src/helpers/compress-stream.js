import { createBrotliCompress, createDeflate, createGzip } from 'zlib';

const priority = ['gzip', 'br', 'deflate'];

export default (stream, headers) => {
  const contentEncoding = headers['accept-encoding'];
  const encoding = priority.find(
    (encodingItem) =>
      contentEncoding && contentEncoding.indexOf(encodingItem) !== -1
  );

  const compression =
    // eslint-disable-next-line no-nested-ternary
    encoding === 'br'
      ? createBrotliCompress()
      : // eslint-disable-next-line no-nested-ternary
      encoding === 'gzip'
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
