import { pipe } from '../../../helpers/index.js';

export default function(stream) {
  pipe(stream, this, true);
  return stream;
}
