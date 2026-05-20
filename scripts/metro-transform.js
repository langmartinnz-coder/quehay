const path = require('path');

const upstreamTransformer = require(
  path.resolve(__dirname, '../node_modules/expo/node_modules/@expo/metro-config/build/babel-transformer')
);

const SUPABASE_PATTERN = /node_modules[\\/]@supabase[\\/]supabase-js/;
const OTEL_IMPORT_PATTERN = /import\(\s*(?:\/\*[\s\S]*?\*\/\s*)*OTEL_PKG\s*\)/;

module.exports = {
  ...upstreamTransformer,
  transform: async (config) => {
    if (SUPABASE_PATTERN.test(config.filename) && OTEL_IMPORT_PATTERN.test(config.src)) {
      config = {
        ...config,
        src: config.src.replace(OTEL_IMPORT_PATTERN, "import('@opentelemetry/api')"),
      };
    }
    return upstreamTransformer.transform(config);
  },
};
