// src/screens/ScoreReviewScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, ArrowScore } from '../types';
import { ARROW_SCORES, SCORE_COLORS, arrowToPoints, endTotal, scoreTextColor, scoreBgColor, scoreBorderColor } from '../types';
import { useAppStore } from '../store/useAppStore';
import { useThemeStore } from '../store/useThemeStore';
import type { Theme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ScoreReview'>;

export default function ScoreReviewScreen({ route, navigation }: Props) {
  const { sessionId, endNumber, detectedArrows, imageUri } = route.params;
  const { addEnd, getSession } = useAppStore();
  const theme = useThemeStore((s) => s.theme);
  const st = makeStyles(theme);

  const [arrows, setArrows] = useState<ArrowScore[]>(detectedArrows);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const session = getSession(sessionId);
  const total = endTotal(arrows);
  const isLastEnd = session ? endNumber >= session.totalEnds : false;

  const handleArrowChange = useCallback(
    (index: number, score: ArrowScore) => {
      setArrows((prev) => {
        const next = [...prev];
        next[index] = score;
        return next;
      });
      setEditingIndex(null);
    },
    []
  );

  function handleConfirm() {
    const end = {
      id: Date.now().toString(36),
      endNumber,
      arrows,
      total,
      imageUri,
      timestamp: Date.now(),
    };
    addEnd(sessionId, end);

    if (isLastEnd) {
      Alert.alert(
        'Sesión completada',
        `Puntuación final: ${(session?.grandTotal ?? 0) + total} / ${session?.maxPossible}`,
        [
          {
            text: 'Ver ficha completa',
            onPress: () =>
              navigation.reset({
                index: 1,
                routes: [{ name: 'Tabs' }, { name: 'SessionDetail', params: { sessionId } }],
              }),
          },
        ]
      );
    } else {
      navigation.replace('Camera', {
        sessionId,
        endNumber: endNumber + 1,
        arrowsPerEnd: arrows.length,
      });
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={st.content}>
      {/* Foto de la diana */}
      <View style={st.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={st.image}
          accessibilityLabel="Foto de la diana"
        />
        <View style={st.imageBadge}>
          <Text style={st.imageBadgeText}>Serie {endNumber}</Text>
        </View>
      </View>

      {/* Flechas detectadas */}
      <Text style={st.sectionTitle}>Flechas detectadas</Text>
      <Text style={st.sectionSub}>
        Toca una flecha para corregir si la detección no es correcta
      </Text>

      <View style={st.arrowsRow}>
        {arrows.map((score, i) => (
          <Pressable
            key={i}
            style={[
              st.arrowBubble,
              editingIndex === i && st.arrowBubbleEditing,
              {
                backgroundColor: scoreBgColor(score),
                borderColor: scoreBorderColor(score),
              },
            ]}
            onPress={() => setEditingIndex(editingIndex === i ? null : i)}
            accessibilityRole="button"
            accessibilityLabel={`Flecha ${i + 1}: ${score}. Toca para editar`}
          >
            <Text style={[st.arrowScore, { color: scoreTextColor(score) }]}>{score}</Text>
            <Text style={st.arrowPoints}>{arrowToPoints(score)} pts</Text>
          </Pressable>
        ))}
      </View>

      {/* Picker de corrección */}
      {editingIndex !== null && (
        <View style={st.picker}>
          <Text style={st.pickerTitle}>Corregir flecha {editingIndex + 1}</Text>
          <View style={st.pickerGrid}>
            {ARROW_SCORES.map((s) => (
              <Pressable
                key={s}
                style={[
                  st.pickerChip,
                  arrows[editingIndex] === s && st.pickerChipActive,
                  {
                    backgroundColor: scoreBgColor(s),
                    borderColor: scoreBorderColor(s),
                  },
                ]}
                onPress={() => handleArrowChange(editingIndex, s)}
                accessibilityRole="radio"
                accessibilityLabel={`Puntuación ${s}`}
                accessibilityState={{ checked: arrows[editingIndex] === s }}
              >
                <Text style={[st.pickerChipText, { color: scoreTextColor(s) }]}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Total de la serie */}
      <View style={st.totalBox}>
        <Text style={st.totalLabel}>Total serie {endNumber}</Text>
        <Text style={st.totalNumber}>{total}</Text>
        {session && (
          <Text style={st.runningTotal}>
            Acumulado: {session.grandTotal + total} / {session.maxPossible}
          </Text>
        )}
      </View>

      {/* Acción */}
      <Pressable
        style={st.confirmButton}
        onPress={handleConfirm}
        accessibilityRole="button"
        accessibilityLabel={isLastEnd ? 'Finalizar sesión' : 'Confirmar y siguiente serie'}
      >
        <Text style={st.confirmButtonText}>
          {isLastEnd ? 'Finalizar sesión' : 'Confirmar · Serie siguiente'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    content: { paddingBottom: 40 },
    imageContainer: { position: 'relative' },
    image: { width: '100%', height: 260, resizeMode: 'cover' },
    imageBadge: {
      position: 'absolute',
      top: 12,
      right: 12,
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 5,
    },
    imageBadgeText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: t.textPrimary, marginTop: 20, marginHorizontal: 20 },
    sectionSub: { fontSize: 13, color: t.textSecondary, marginTop: 4, marginHorizontal: 20, marginBottom: 16 },
    arrowsRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, paddingHorizontal: 20 },
    arrowBubble: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 2,
      padding: 14,
      alignItems: 'center',
    },
    arrowBubbleEditing: { transform: [{ scale: 1.05 }] },
    arrowScore: { fontSize: 28, fontWeight: '800' },
    arrowPoints: { fontSize: 12, color: t.textMuted, marginTop: 2 },
    picker: {
      margin: 20,
      backgroundColor: t.bgCard,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: t.border,
    },
    pickerTitle: {
      fontSize: 11,
      fontWeight: '600',
      color: t.textMuted,
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    pickerChip: {
      borderWidth: 1.5,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 8,
      minWidth: 44,
      alignItems: 'center',
    },
    pickerChipActive: { backgroundColor: 'rgba(255,255,255,0.08)' },
    pickerChipText: { fontWeight: '700', fontSize: 16 },
    totalBox: {
      margin: 20,
      backgroundColor: t.bgCard,
      borderRadius: 14,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: t.border,
    },
    totalLabel: {
      fontSize: 11,
      color: t.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    totalNumber: { fontSize: 48, fontWeight: '900', color: t.accent, marginTop: 4 },
    runningTotal: { fontSize: 14, color: t.textSecondary, marginTop: 4 },
    confirmButton: {
      backgroundColor: t.accent,
      marginHorizontal: 20,
      borderRadius: 14,
      padding: 18,
      alignItems: 'center',
    },
    confirmButtonText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  });
}
