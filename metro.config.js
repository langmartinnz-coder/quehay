const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('./scripts/metro-transform'),
};

config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    if (moduleName === '@opentelemetry/api') {
      return {
        type: 'sourceFile',
        filePath: path.resolve(__dirname, 'shims/otel-empty.js'),
      };
    }
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
