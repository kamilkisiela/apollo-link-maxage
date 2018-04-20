const globals = {
  'apollo-link': 'apolloLink.core',
};

export default {
  input: 'dist/index.js',
  output: {
    file: 'dist/bundle.umd.js',
    format: 'umd',
    exports: 'named',
    name: 'apolloLink.maxage',
    sourcemap: true,
    globals,
  },
  external: Object.keys(globals),
  onwarn,
};

function onwarn(message) {
  const suppressed = ['UNRESOLVED_IMPORT', 'THIS_IS_UNDEFINED'];

  if (!suppressed.find(code => message.code === code)) {
    return console.warn(message.message);
  }
}
