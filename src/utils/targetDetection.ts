// src/utils/targetDetection.ts
//
// FASE 1 — Detección geométrica con OpenCV.js / heurísticas de color
// FASE 2 — Reemplazar analyzeTarget() con un modelo TensorFlow Lite entrenado
//
// La función analyzeTarget() es el único punto de entrada que necesitas cambiar
// para mejorar la precisión. El resto de la app no cambia.

import type { ArrowDetection, ArrowScore } from '../types';

export interface DetectionResult {
  arrows: ArrowDetection[];
  dianaCenter: { x: number; y: number };
  dianaRadius: number;
  success: boolean;
  errorMessage?: string;
}

// Convierte coordenadas de imagen (px) a puntuación WA estándar
// Los anillos están a: 10%(X/10), 20%(9), 30%(8), 40%(7), 50%(6),
//                       60%(5), 70%(4), 80%(3), 90%(2), 100%(1)
function distanceToScore(
  distance: number,
  dianaRadius: number
): ArrowScore {
  const ratio = distance / dianaRadius;
  if (ratio <= 0.05) return 'X';
  if (ratio <= 0.15) return '10';
  if (ratio <= 0.25) return '9';
  if (ratio <= 0.35) return '8';
  if (ratio <= 0.45) return '7';
  if (ratio <= 0.55) return '6';
  if (ratio <= 0.65) return '5';
  if (ratio <= 0.75) return '4';
  if (ratio <= 0.85) return '3';
  if (ratio <= 0.92) return '2';
  if (ratio <= 1.0) return '1';
  return 'M';
}

// ─────────────────────────────────────────────────────────────────
// PUNTO DE INTEGRACIÓN CV
// ─────────────────────────────────────────────────────────────────
// Recibe la URI de la imagen (local) y devuelve las flechas detectadas.
// Actualmente usa una simulación. En FASE 2, aquí iría:
//   1. Cargar imagen con expo-image-manipulator (escalar a 640x640)
//   2. Correr modelo TFLite de detección de keypoints
//   3. Mapear keypoints a scores con distanceToScore()
//
export async function analyzeTarget(imageUri: string): Promise<DetectionResult> {
  // Simula una pequeña latencia de procesamiento
  await new Promise((resolve) => setTimeout(resolve, 800));

  // ── TODO FASE 2: reemplazar este bloque con inferencia real ──
  const isMock = true;
  if (isMock) {
    return generateMockDetection();
  }
  // ─────────────────────────────────────────────────────────────

  return { arrows: [], dianaCenter: { x: 0.5, y: 0.5 }, dianaRadius: 0.4, success: false };
}

// Genera una detección simulada realista para desarrollo
function generateMockDetection(): DetectionResult {
  const center = { x: 0.5, y: 0.5 };
  const radius = 0.4;

  const arrows: ArrowDetection[] = Array.from({ length: 3 }, () => {
    // Distribución realista: mayoría en zona 7-10
    const angle = Math.random() * 2 * Math.PI;
    const distRatio = Math.random() < 0.7
      ? Math.random() * 0.45       // buen tirador: zona 7-X
      : 0.45 + Math.random() * 0.55; // dispersión

    const dist = distRatio * radius;
    const x = center.x + Math.cos(angle) * dist;
    const y = center.y + Math.sin(angle) * dist;

    const pixelDist = distRatio * radius;
    const score = distanceToScore(pixelDist, radius);

    return {
      score,
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
      confidence: 0.85 + Math.random() * 0.14,
    };
  });

  return {
    arrows,
    dianaCenter: center,
    dianaRadius: radius,
    success: true,
  };
}
