import { inspect } from 'node:util';

export const debug =
  process.env.DEBUG === '*' || process.env.NODE_ENV === 'development'
    ? (data) => {
        // eslint-disable-next-line no-console
        console.debug(
          data.message
            ? data.message
            : inspect(data, { colors: true, compact: false }),
          data.message
            ? inspect(data, { colors: true, compact: false })
            : undefined
        );
      }
    : () => {
        // noop
      };

export const log =
  process.env.NODE_ENV === 'development'
    ? (data) => {
        // eslint-disable-next-line no-console
        console.log(
          data.message ? data.message : inspect(data),
          data.message ? inspect(data) : undefined
        );
      }
    : () => {
        // noop
      };
