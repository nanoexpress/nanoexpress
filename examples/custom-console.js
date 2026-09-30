// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-console */
import nanoexpress from '../src/nanoexpress.js';

const log = (...texts) => {
  console.log('\x1b[0m%s', ...texts, '\x1b[0m');
};
const error = (...texts) => {
  console.log('\x1b[31m%s', '✘', ...texts, '\x1b[0m');
};
const done = (...texts) => {
  console.log('\x1b[32m%s', '✓', ...texts, '\x1b[0m');
};
const warn = (...texts) => {
  console.log('\x1b[33m%s', '\u26A0', ...texts, '\x1b[0m');
};
const info = (...texts) => {
  console.log('\x1b[34m%s', '\u2139', ...texts, '\x1b[0m');
};

const app = nanoexpress({
  console: {
    log,
    error,
    done,
    warn,
    info
  }
});

app.get(
  '/',
  {
    isRaw: true
  },
  (req, res) => {
    res.end('hello world');
  }
);

app.listen(4000);
