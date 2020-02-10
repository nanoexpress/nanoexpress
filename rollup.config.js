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

// Prepare middlewares export
const packedMiddleware = [
  'body-parser',
  'file-upload',
  'passport',
  'redoc',
  'swagger-ui',
  'index'
].map((name) => ({
  input: `./src/packed/middlewares/${name}.js`,
  output: {
    format: 'cjs',
    file: `./cjs/middlewares/${name}.cjs`,
    sourcemap: true
  },
  external
}));

// Prepare defines export
const packedProxy = ['proxy', 'webrtc-server', 'index'].map((name) => ({
  input: `./src/packed/defines/${name}.js`,
  output: {
    format: 'cjs',
    file: `./cjs/defines/${name}.cjs`,
    sourcemap: true
  },
  external
}));

// Export config for Rollup
export default [
  ...packedMiddleware,
  ...packedProxy,
  {
    input: './src/static.js',
    output: {
      format: 'cjs',
      file: './cjs/static.cjs',
      sourcemap: true
    },
    external
  },
  {
    input: './src/Route.js',
    output: {
      format: 'cjs',
      file: './cjs/Route.cjs',
      sourcemap: true
    },
    external
  },
  {
    input: './src/nanoexpress.js',
    output: {
      format: 'cjs',
      file: './cjs/nanoexpress.cjs',
      esModule: false,
      sourcemap: true
    },
    external
  }
];
