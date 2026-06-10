const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Añadir extensión .tflite como asset
config.resolver.assetExts.push('tflite');

module.exports = config;
