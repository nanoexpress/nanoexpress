import resolve from 'rollup-plugin-node-resolve';
import run from 'rollup-plugin-run';
import json from 'rollup-plugin-json';

import pkg from './package.json';

const dev = process.env.NODE_ENV === 'development';
const watch = process.env.ROLLUP_WATCH;

const dependencies = Object.keys(pkg.dependencies);

export default {
  input: './src/nanoexpress.js',
  output: {
    format: 'cjs',
    file: './build/nanoexpress.js',
    esModule: false,
    sourcemap: !watch,
    sourcemapFile: './build/nanoexpress.js.map'
  },
  external: dependencies.concat([
    'fs',
    'path',
    'querystring',
    'http',
    'zlib',
    'stream',
    'util'
  ]),
  plugins: [
    json(),
    resolve({
      preferBuiltins: true,
      mainFields: ['module', 'main'],
      extensions: ['.mjs', '.js', '.json'],
      exclude: 'node_modules/**'
    }),
    dev && watch && run()
  ]
};
