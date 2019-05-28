import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import run from 'rollup-plugin-run';
import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';

import pkg from './package.json';

const dev = process.env.NODE_ENV === 'development';
const watch = process.env.ROLLUP_WATCH;

export default {
  input: './src/nanoexpress.js',
  output: {
    format: 'cjs',
    file: './build/nanoexpress.js',
    esModule: false
  },
  external: Object.keys(pkg.dependencies).concat([
    'fs',
    'querystring',
    'http',
    'zlib',
    'stream'
  ]),
  plugins: [
    json(),
    commonjs({
      sourceMap: false
    }),
    resolve({
      mainFields: ['module', 'main'],
      extensions: ['.mjs', '.js', '.json']
    }),
    !dev &&
      !watch &&
      babel({
        babelrc: true,
        exclude: 'node_modules/**'
      }),
    dev && watch && run()
  ]
};
