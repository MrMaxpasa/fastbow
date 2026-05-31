import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'ArcheryScore',
  slug: 'archery-score-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    resizeMode: 'contain',
    backgroundColor: '#1a1a2e',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#1a1a2e',
    },
    permissions: [
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
    ],
  },
  plugins: [
    [
      'expo-camera',
      {
        cameraPermission: 'Necesitamos acceso a la cámara para fotografiar la diana.',
      },
    ],
    [
      'expo-media-library',
      {
        photosPermission: 'Necesitamos acceso a tus fotos para guardar las fichas.',
      },
    ],
  ],
};

export default config;
