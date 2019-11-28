import { pipe } from '../../../helpers/index.js';

export default function(stream, size) {
  if (!stream.onAbortHandler) {
    this.__request.onAborted(() => {
      if (!stream.destroyed) {
        stream.destroy();
        stream.destroyed = true;
      }
    });
    stream.onAbortHandler = true;
  }
  pipe(stream, this, true, size);
  return stream;
}
