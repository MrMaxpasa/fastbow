// src/utils/targetDetection.ts
//
// INTEGRACIÓN MODELO TFLITE — YOLOv11 Nano
// Para activar detección real: cambiar IS_MOCK = false
// y copiar el archivo fastbow_model.tflite en assets/models/
//
// Clases del modelo:
//   0 = flecha
//   1 = anillo negro exterior
//   2 = anillo azul
//   3 = anillo rojo
//   4 = anillo amarillo
//   5 = bullseye

import * as ImageManipulator from 'expo-image-manipulator';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { InferenceSession, Tensor } from 'onnxruntime-react-native';
import type { ArrowScore } from '../types';

const IS_MOCK = true;

// ─── Tipos internos ───────────────────────────────────────────────

interface BoundingBox {
  xCenter: number;
  yCenter: number;
  width: number;
  height: number;
  confidence: number;
  classId: number;
}

interface DianaGeometry {
  centerX: number;
  centerY: number;
  rings: {
    classId: number;
    radius: number;
  }[];
  totalRadius: number;
}

export interface ArrowDetection {
  score: ArrowScore;
  x: number;
  y: number;
  confidence: number;
}

export interface TendencyResult {
  horizontal: 'izquierda' | 'centro' | 'derecha';
  vertical: 'arriba' | 'centro' | 'abajo';
  offsetX: number; // -1 a 1, negativo = izquierda, positivo = derecha
  offsetY: number; // -1 a 1, negativo = arriba, positivo = abajo
  description: string;
}

export interface DetectionResult {
  arrows: ArrowDetection[];
  tendency: TendencyResult | null;
  dianaCenter: { x: number; y: number };
  dianaRadius: number;
  success: boolean;
  errorMessage?: string;
}

// ─── Geometría WA — proporciones fijas de diana World Archery ─────
// Los 10 anillos están espaciados uniformemente
// Radio de cada anillo como % del radio total:
const WA_RING_RATIOS: Record<number, { min: number; max: number; scores: ArrowScore[] }> = {
  5: { min: 0,    max: 0.10, scores: ['X', '10'] }, // bullseye
  4: { min: 0.10, max: 0.20, scores: ['9'] },        // amarillo interior
  3: { min: 0.20, max: 0.40, scores: ['8', '7'] },   // rojo
  2: { min: 0.40, max: 0.60, scores: ['6', '5'] },   // azul
  1: { min: 0.60, max: 0.80, scores: ['4', '3'] },   // negro
  0: { min: 0.80, max: 1.00, scores: ['2', '1'] },   // blanco exterior
};

// ─── Calcula puntuación desde distancia al centro ─────────────────
function distanceToScore(
  arrowX: number,
  arrowY: number,
  diana: DianaGeometry
): ArrowScore {
  const dx = arrowX - diana.centerX;
  const dy = arrowY - diana.centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const ratio = distance / diana.totalRadius;

  if (ratio > 1.0) return 'M';

  // Buscar en qué anillo cae según proporciones WA
  for (const [classIdStr, ring] of Object.entries(WA_RING_RATIOS)) {
    if (ratio >= ring.min && ratio < ring.max) {
      // Para bullseye distinguir X de 10 por distancia al centro exacto
      if (parseInt(classIdStr) === 5) {
        return ratio < 0.05 ? 'X' : '10';
      }
      // Para anillos con dos puntuaciones, la interior vale más
      if (ring.scores.length === 2) {
        const mid = ring.min + (ring.max - ring.min) / 2;
        return ratio < mid ? ring.scores[0] : ring.scores[1];
      }
      return ring.scores[0];
    }
  }

  return 'M';
}

// ─── Extrae geometría de la diana desde las detecciones ──────────
function extractDianaGeometry(boxes: BoundingBox[]): DianaGeometry | null {
  // Buscar bullseye (clase 5) para obtener el centro
  const bullseye = boxes
    .filter(b => b.classId === 5 && b.confidence > 0.5)
    .sort((a, b) => b.confidence - a.confidence)[0];

  // Si no hay bullseye intentar con anillo interior más pequeño disponible
  const centerSource = bullseye ?? boxes
    .filter(b => b.classId >= 3 && b.confidence > 0.4)
    .sort((a, b) => a.width - b.width)[0];

  if (!centerSource) return null;

  const centerX = centerSource.xCenter;
  const centerY = centerSource.yCenter;

  // Buscar anillo exterior (clase 1) para el radio total
  const outerRing = boxes
    .filter(b => b.classId === 1 && b.confidence > 0.4)
    .sort((a, b) => b.width - a.width)[0];

  // Si no hay anillo exterior, estimar desde el bullseye
  // El bullseye es ~10% del radio total en diana WA
  const totalRadius = outerRing
    ? Math.max(outerRing.width, outerRing.height) / 2
    : (Math.max(centerSource.width, centerSource.height) / 2) / 0.10;

  const rings = boxes
    .filter(b => b.classId >= 1 && b.classId <= 5)
    .map(b => ({
      classId: b.classId,
      radius: Math.max(b.width, b.height) / 2,
    }));

  return { centerX, centerY, rings, totalRadius };
}

// ─── Calcula tendencia de disparo ────────────────────────────────
function calculateTendency(
  arrows: ArrowDetection[],
  diana: DianaGeometry
): TendencyResult | null {
  const validArrows = arrows.filter(a => a.score !== 'M');
  if (validArrows.length < 2) return null;

  // Media de posiciones relativas al centro de la diana
  const avgOffsetX = validArrows.reduce((sum, a) => sum + (a.x - diana.centerX), 0) / validArrows.length;
  const avgOffsetY = validArrows.reduce((sum, a) => sum + (a.y - diana.centerY), 0) / validArrows.length;

  // Normalizar por radio total
  const normX = avgOffsetX / diana.totalRadius;
  const normY = avgOffsetY / diana.totalRadius;

  const THRESHOLD = 0.15;

  const horizontal: TendencyResult['horizontal'] =
    normX < -THRESHOLD ? 'izquierda' :
    normX > THRESHOLD ? 'derecha' : 'centro';

  const vertical: TendencyResult['vertical'] =
    normY < -THRESHOLD ? 'arriba' :
    normY > THRESHOLD ? 'abajo' : 'centro';

  let description = '';
  if (horizontal === 'centro' && vertical === 'centro') {
    description = 'Agrupación centrada. Muy buena consistencia.';
  } else {
    const parts = [];
    if (vertical !== 'centro') parts.push(vertical);
    if (horizontal !== 'centro') parts.push(horizontal);
    description = `Tendencia hacia ${parts.join('-')}. Ajusta tu apuntería.`;
  }

  return { horizontal, vertical, offsetX: normX, offsetY: normY, description };
}

// ─── INTEGRACIÓN TFLITE ───────────────────────────────────────────
// El modelo debe estar en: assets/models/fastbow_model.tflite

// TODO: cambiar IS_MOCK = false para activar el modelo real.
// El modelo debe estar en assets/models/fastbow_model.tflite

let loadedSession: InferenceSession | null = null;

async function loadModel(): Promise<InferenceSession> {
  if (loadedSession) return loadedSession;

  const asset = Asset.fromModule(require('../../assets/models/fastbow_model.tflite'));
  await asset.downloadAsync();

  if (!asset.localUri) throw new Error('No se pudo cargar el modelo');

  loadedSession = await InferenceSession.create(asset.localUri);
  return loadedSession;
}

// Non-Maximum Suppression simple por clase
function applyNMS(boxes: BoundingBox[], iouThreshold: number): BoundingBox[] {
  const result: BoundingBox[] = [];
  const sorted = [...boxes].sort((a, b) => b.confidence - a.confidence);

  for (const box of sorted) {
    const overlap = result.filter(b => b.classId === box.classId).some(b => {
      const interX = Math.min(box.xCenter + box.width / 2, b.xCenter + b.width / 2) -
                     Math.max(box.xCenter - box.width / 2, b.xCenter - b.width / 2);
      const interY = Math.min(box.yCenter + box.height / 2, b.yCenter + b.height / 2) -
                     Math.max(box.yCenter - box.height / 2, b.yCenter - b.height / 2);
      if (interX <= 0 || interY <= 0) return false;
      const interArea = interX * interY;
      const unionArea = box.width * box.height + b.width * b.height - interArea;
      return interArea / unionArea > iouThreshold;
    });
    if (!overlap) result.push(box);
  }
  return result;
}

async function runModelInference(imageUri: string): Promise<BoundingBox[]> {
  const session = await loadModel();

  const resized = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 640, height: 640 } }],
    { format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );

  if (!resized.base64) throw new Error('No se pudo procesar la imagen');

  // Convertir base64 a Float32Array normalizado [1, 3, 640, 640]
  const binaryString = atob(resized.base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const float32 = new Float32Array(1 * 3 * 640 * 640);
  for (let i = 0; i < 640 * 640; i++) {
    float32[i]                  = bytes[i * 3]     / 255.0;
    float32[i + 640 * 640]      = bytes[i * 3 + 1] / 255.0;
    float32[i + 640 * 640 * 2]  = bytes[i * 3 + 2] / 255.0;
  }

  const inputTensor = new Tensor('float32', float32, [1, 3, 640, 640]);
  const results = await session.run({ images: inputTensor });

  const output = results[Object.keys(results)[0]];
  const data = Array.from(output.data as Float32Array);

  const NUM_DETECTIONS = 8400;
  const NUM_VALUES = 10; // 4 bbox + 6 classes
  const boxes: BoundingBox[] = [];
  const CONF_THRESHOLD = 0.45;

  for (let i = 0; i < NUM_DETECTIONS; i++) {
    const offset = i * NUM_VALUES;
    const xCenter = data[offset];
    const yCenter = data[offset + 1];
    const width   = data[offset + 2];
    const height  = data[offset + 3];
    const scores  = data.slice(offset + 4, offset + 4 + 6);
    const maxScore = Math.max(...scores);
    const classId  = scores.indexOf(maxScore);

    if (maxScore >= CONF_THRESHOLD) {
      boxes.push({ xCenter, yCenter, width, height, confidence: maxScore, classId });
    }
  }

  return applyNMS(boxes, 0.5);
}

// ─── Función principal de análisis ───────────────────────────────
export async function analyzeTarget(imageUri: string): Promise<DetectionResult> {
  await new Promise(resolve => setTimeout(resolve, 800));

  if (IS_MOCK) {
    return generateMockDetection();
  }

  try {
    const boxes = await runModelInference(imageUri);
    const diana = extractDianaGeometry(boxes);

    if (!diana) {
      return {
        arrows: [],
        tendency: null,
        dianaCenter: { x: 0.5, y: 0.5 },
        dianaRadius: 0.4,
        success: false,
        errorMessage: 'No se detectó la diana. Asegúrate de que esté bien encuadrada.',
      };
    }

    const arrowBoxes = boxes.filter(b => b.classId === 0 && b.confidence > 0.45);

    const arrows: ArrowDetection[] = arrowBoxes.map(box => ({
      score: distanceToScore(box.xCenter, box.yCenter, diana),
      x: box.xCenter,
      y: box.yCenter,
      confidence: box.confidence,
    }));

    if (arrows.length === 0) {
      return {
        arrows: [],
        tendency: null,
        dianaCenter: { x: diana.centerX, y: diana.centerY },
        dianaRadius: diana.totalRadius,
        success: false,
        errorMessage: 'Se detectó la diana pero no se encontraron flechas.',
      };
    }

    const tendency = calculateTendency(arrows, diana);

    return {
      arrows,
      tendency,
      dianaCenter: { x: diana.centerX, y: diana.centerY },
      dianaRadius: diana.totalRadius,
      success: true,
    };

  } catch (error) {
    return {
      arrows: [],
      tendency: null,
      dianaCenter: { x: 0.5, y: 0.5 },
      dianaRadius: 0.4,
      success: false,
      errorMessage: 'Error al procesar la imagen.',
    };
  }
}

// ─── Mock realista para desarrollo ───────────────────────────────
function generateMockDetection(): DetectionResult {
  const center = { x: 0.5, y: 0.5 };
  const radius = 0.4;

  // Simular tendencia hacia arriba-derecha como ejemplo
  const tendencyBias = { x: 0.04, y: -0.03 };

  const arrows: ArrowDetection[] = Array.from({ length: 3 }, () => {
    const angle = Math.random() * 2 * Math.PI;
    const distRatio = Math.random() < 0.7
      ? Math.random() * 0.45
      : 0.45 + Math.random() * 0.55;

    const dist = distRatio * radius;
    const x = center.x + Math.cos(angle) * dist + tendencyBias.x;
    const y = center.y + Math.sin(angle) * dist + tendencyBias.y;

    const diana: DianaGeometry = {
      centerX: center.x,
      centerY: center.y,
      rings: [],
      totalRadius: radius,
    };

    const score = distanceToScore(
      Math.max(0, Math.min(1, x)),
      Math.max(0, Math.min(1, y)),
      diana
    );

    return {
      score,
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
      confidence: 0.85 + Math.random() * 0.14,
    };
  });

  const diana: DianaGeometry = {
    centerX: center.x,
    centerY: center.y,
    rings: [],
    totalRadius: radius,
  };

  const tendency = calculateTendency(arrows, diana);

  return {
    arrows,
    tendency,
    dianaCenter: center,
    dianaRadius: radius,
    success: true,
  };
}
