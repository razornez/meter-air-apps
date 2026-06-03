module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Reanimated v3: plugin WAJIB di posisi terakhir.
    plugins: ['react-native-reanimated/plugin'],
  };
};
