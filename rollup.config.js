import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

import pkg from './package.json';

const dependencies = Object.keys(pkg.dependencies);

const plugins = [
  resolve({
    preferBuiltins: true,
    mainFields: ['module', 'main'],
    extensions: ['.mjs', '.js', '.json'],
    exclude: 'node_modules/**'
  }),
  commonjs()
];
const external = dependencies.concat([
  'fs',
  'path',
  'querystring',
  'http',
  'zlib',
  'stream',
  'util'
]);

export default [
  {
    input: './src/static.js',
    output: {
      format: 'cjs',
      file: './build/static.js'
    },
    plugins,
    external
  },
  {
    input: './src/Route.js',
    output: {
      format: 'cjs',
      file: './build/Route.js'
    },
    plugins,
    external
  },
  {
    input: './src/nanoexpress.js',
    output: {
      format: 'cjs',
      file: './build/nanoexpress.js',
      esModule: false
    },
    external,
    plugins
  }
];
