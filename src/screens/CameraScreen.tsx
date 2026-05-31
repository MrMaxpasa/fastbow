// src/screens/CameraScreen.tsx
import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { analyzeTarget } from '../utils/targetDetection';
import { useThemeStore } from '../store/useThemeStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Camera'>;

export default function CameraScreen({ route, navigation }: Props) {
  const { sessionId, endNumber, arrowsPerEnd } = route.params;
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const insets = useSafeAreaInsets();
  const theme = useThemeStore((s) => s.theme);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });
      if (!photo) throw new Error('No se pudo capturar la foto');

      const result = await analyzeTarget(photo.uri);

      if (!result.success) {
        Alert.alert(
          'Diana no detectada',
          'Asegúrate de que la diana esté bien encuadrada y con buena iluminación.',
          [{ text: 'Reintentar', onPress: () => setIsAnalyzing(false) }]
        );
        return;
      }

      navigation.replace('ScoreReview', {
        sessionId,
        endNumber,
        detectedArrows: result.arrows.map((a) => a.score),
        imageUri: photo.uri,
      });
    } catch {
      Alert.alert('Error', 'No se pudo procesar la imagen. Inténtalo de nuevo.');
      setIsAnalyzing(false);
    }
  }, [isAnalyzing, sessionId, endNumber, navigation]);

  if (!permission) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.bg }]}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.bg }]}>
        <Text style={[styles.permissionText, { color: theme.textPrimary }]}>
          Necesitamos acceso a la cámara para fotografiar la diana.
        </Text>
        <Pressable
          style={[styles.permissionButton, { backgroundColor: theme.accent }]}
          onPress={requestPermission}
          accessibilityRole="button"
          accessibilityLabel="Conceder permiso de cámara"
        >
          <Text style={styles.permissionButtonText}>Permitir cámara</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        {/* Barra superior */}
        <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Volver"
          >
            <Text style={styles.backText}>← Volver</Text>
          </Pressable>
          <View style={styles.endBadge}>
            <Text style={styles.endBadgeText}>Serie {endNumber} · {arrowsPerEnd} flechas</Text>
          </View>
          <View style={{ width: 72 }} />
        </View>

        {/* Marco guía */}
        <View style={styles.guideFrame}>
          <View style={styles.guideCircle} />
          <View style={styles.guideTextPill}>
            <Text style={styles.guideText}>Centra la diana dentro del círculo</Text>
          </View>
        </View>

        {/* Botón de captura */}
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 24 }]}>
          {isAnalyzing ? (
            <View style={styles.analyzingBox}>
              <ActivityIndicator color="#ffffff" size="small" />
              <Text style={styles.analyzingText}>Detectando flechas…</Text>
            </View>
          ) : (
            <Pressable
              style={styles.captureButton}
              onPress={handleCapture}
              accessibilityRole="button"
              accessibilityLabel="Fotografiar diana"
            >
              <View style={styles.captureInner} />
            </Pressable>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  permissionText: { textAlign: 'center', fontSize: 16, marginBottom: 20, lineHeight: 24 },
  permissionButton: { borderRadius: 12, paddingHorizontal: 28, paddingVertical: 14 },
  permissionButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: { justifyContent: 'center', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 4 },
  backText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  endBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  endBadgeText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  guideFrame: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  guideCircle: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    opacity: 0.8,
  },
  guideTextPill: {
    marginTop: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  guideText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    textAlign: 'center',
  },
  bottomBar: { alignItems: 'center', paddingTop: 16 },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  captureInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#fff' },
  analyzingBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
  },
  analyzingText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
