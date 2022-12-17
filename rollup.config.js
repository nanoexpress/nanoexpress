import pkg from './package.json' assert { type: 'json' };

const dependencies = Object.keys(pkg.dependencies);
const external = dependencies.concat([
  'fs',
  'path',
  'querystring',
  'http',
  'https',
  'zlib',
  'stream',
  'util'
]);

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
  ...packedDefines,
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
      exports: 'default',
      esModule: false,
      sourcemap: true
    },
    external
  }
];
