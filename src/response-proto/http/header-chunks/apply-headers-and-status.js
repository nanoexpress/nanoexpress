import { debug } from '../../../helpers/logs.js';

export default function applyHeadersAndStatus() {
  const { _headers, statusCode, aborted, corked } = this;

  if (aborted) {
    return this;
  }

  if (!corked) {
    debug({
      message: 'cork is not called, call it first',
      file: 'apply-headers-and-status.js',
      line: [10, 20],
      kind: 'handler',
      case: 'log',
      meta: {
        isCorked: corked,
        isAborted: aborted
      }
    });
    return;
  }

  if (typeof statusCode === 'string') {
    this.writeStatus(statusCode);
    this.statusCode = 200;
  }

  for (const header in _headers) {
    const value = _headers[header];

    if (value) {
      if (value.splice) {
        this.writeHeaderValues(header, value);
      } else {
        this.writeHeader(header, `${value}`);
      }
      this.removeHeader(header);
    }
  }

  return this;
}
