// Dynamic config: extends app.json with secrets that must not be committed.
// GOOGLE_MAPS_API_KEY comes from .env (local) or an EAS secret (CI/production).
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    splash: {
      image: './assets/icon-512.png',
      resizeMode: 'contain',
      backgroundColor: '#FAF7F2',
    },
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
  },
});
