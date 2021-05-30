import pkg from './package.json';

const dependencies = Object.keys(pkg.dependencies);
const external = dependencies.concat([
  'fs',
  'path',
  'querystring',
  'http',
  'zlib',
  'stream',
  'util'
]);

// Export config for Rollup
export default [
  {
    input: './src/Route.js',
    output: {
      format: 'cjs',
      file: './cjs/Route.js',
      sourcemap: true
    },
    external
  },
  {
    input: './src/nanoexpress.js',
    output: {
      format: 'cjs',
      file: './cjs/nanoexpress.js',
      exports: 'default',
      esModule: false,
      sourcemap: true
    },
    external
  }
];
