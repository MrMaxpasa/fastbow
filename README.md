# 🏹 FastBow

App Android para registrar puntuaciones de tiro con arco fotografiando la diana.

## Características
- 📸 Foto de la diana → detección automática de flechas
- ✏️ Corrección manual de puntuaciones con un toque
- 📋 Fichas de puntuación completas (por serie y acumulado)
- 📊 Historial y estadísticas de sesiones
- ✈️ Funciona 100% sin internet (datos en el móvil)
- 🎯 Soporta Indoor 18m/25m, Outdoor, Campo y personalizado

---

## 🚀 Instalación

### Requisitos
- Node.js 18+
- Expo CLI
- Android Studio (para emulador) o móvil Android con Expo Go

### Pasos

```bash
# 1. Instalar dependencias
npm install

# 2. Arrancar el servidor de desarrollo
npx expo start

# 3. Escanear QR con Expo Go (Android) o pulsar 'a' para emulador
```

---

## 🗂️ Estructura del proyecto

```
src/
├── navigation/     # Navegación (Stack + Tabs)
├── screens/        # Pantallas de la app
│   ├── HomeScreen          ← Pantalla principal
│   ├── NewSessionScreen    ← Crear nueva sesión
│   ├── CameraScreen        ← Capturar foto de diana
│   ├── ScoreReviewScreen   ← Revisar/corregir puntuación
│   ├── SessionDetailScreen ← Ficha completa de sesión
│   ├── HistoryScreen       ← Historial de sesiones
│   └── SettingsScreen      ← Perfil y ajustes
├── store/          # Estado global (Zustand)
├── types/          # Tipos TypeScript compartidos
└── utils/
    └── targetDetection.ts  ← ⚠️ Aquí va la lógica de CV
```

---

## 🔬 Integrar detección real (Fase 2)

El único archivo que necesitas modificar para mejorar la detección es:

**`src/utils/targetDetection.ts`** → función `analyzeTarget(imageUri)`

Actualmente usa una **simulación** para desarrollo. Para integrar detección real:

### Opción A — Detección geométrica (sin entrenamiento)
```bash
npx expo install @technicallyfeasible/expo-opencv
```
Usar detección de círculos Hough para localizar la diana, y contornos de color para las flechas.

### Opción B — TensorFlow Lite (modelo entrenado)
```bash
npx expo install @tensorflow/tfjs @tensorflow/tfjs-react-native
```
1. Entrenar un modelo YOLO-lite con fotos de dianas con flechas
2. Convertir a TFLite con `tensorflowjs_converter`
3. Bundlear el `.tflite` en los assets de la app
4. Llamar al modelo en `analyzeTarget()` y mapear keypoints a puntuaciones

---

## 📋 Flujo de uso

1. **Inicio** → pulsar "Nueva sesión"
2. **Configurar** nombre, modalidad y número de series
3. **Fotografiar** la diana encuadrando dentro del círculo guía
4. **Revisar** las puntuaciones detectadas, corregir si hace falta
5. **Confirmar** → automáticamente pasa a la siguiente serie
6. Al acabar todas las series → ver ficha completa

---

## 🛣️ Roadmap

- [ ] Fase 1 (actual): app completa con simulación de detección
- [ ] Fase 2: detección geométrica con OpenCV
- [ ] Fase 3: modelo TFLite entrenado con fotos reales
- [ ] Fase 4: exportar ficha en PDF, soporte multi-arquero
