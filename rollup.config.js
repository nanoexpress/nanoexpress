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
const packedMiddleware = ['file-upload', 'passport', 'swagger-ui', 'index'].map(
  (name) => ({
    input: `./src/packed/middlewares/${name}.js`,
    output: {
      format: 'cjs',
      file: `./cjs/packed/middlewares/${name}.js`,
      sourcemap: true
    },
    external
  })
);

// Prepare defines export
const packedDefines = ['proxy', 'webrtc-server', 'index'].map((name) => ({
  input: `./src/packed/defines/${name}.js`,
  output: {
    format: 'cjs',
    file: `./cjs/packed/defines/${name}.js`,
    sourcemap: true
  },
  external
}));

// Export config for Rollup
export default [
  ...packedMiddleware,
  ...packedDefines,
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
      esModule: false,
      sourcemap: true
    },
    external
  }
];
