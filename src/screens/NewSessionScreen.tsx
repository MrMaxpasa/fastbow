// src/screens/NewSessionScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, RoundType } from '../types';
import { roundLabel } from '../types';
import { useAppStore } from '../store/useAppStore';
import { useThemeStore } from '../store/useThemeStore';
import type { Theme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'NewSession'>;

const ROUND_OPTIONS: { type: RoundType; arrowsPerEnd: number; totalEnds: number }[] = [
  { type: 'indoor_18m', arrowsPerEnd: 3, totalEnds: 10 },
  { type: 'indoor_25m', arrowsPerEnd: 3, totalEnds: 10 },
  { type: 'outdoor_30m', arrowsPerEnd: 6, totalEnds: 6 },
  { type: 'outdoor_50m', arrowsPerEnd: 6, totalEnds: 6 },
  { type: 'outdoor_70m', arrowsPerEnd: 6, totalEnds: 6 },
  { type: 'field', arrowsPerEnd: 3, totalEnds: 24 },
  { type: 'custom', arrowsPerEnd: 3, totalEnds: 10 },
];

export default function NewSessionScreen({ navigation }: Props) {
  const { archer, createSession } = useAppStore();
  const theme = useThemeStore((s) => s.theme);
  const st = makeStyles(theme);

  const [name, setName] = useState(archer?.name ?? '');
  const [selectedRound, setSelectedRound] = useState(ROUND_OPTIONS[0]);
  const [arrowsPerEnd, setArrowsPerEnd] = useState('3');
  const [totalEnds, setTotalEnds] = useState('10');

  const isCustom = selectedRound.type === 'custom';
  const canStart = name.trim().length > 0;

  function handleStart() {
    if (!canStart) return;
    const session = createSession({
      archerName: name.trim(),
      roundType: selectedRound.type,
      arrowsPerEnd: isCustom ? parseInt(arrowsPerEnd, 10) || 3 : selectedRound.arrowsPerEnd,
      totalEnds: isCustom ? parseInt(totalEnds, 10) || 10 : selectedRound.totalEnds,
    });
    navigation.replace('Camera', {
      sessionId: session.id,
      endNumber: 1,
      arrowsPerEnd: isCustom ? parseInt(arrowsPerEnd, 10) || 3 : selectedRound.arrowsPerEnd,
    });
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={st.content}>
      <Text style={st.label}>Nombre del arquero</Text>
      <TextInput
        style={st.input}
        value={name}
        onChangeText={setName}
        placeholder="Tu nombre"
        placeholderTextColor={theme.textMuted}
        autoFocus
        accessibilityLabel="Nombre del arquero"
      />

      <Text style={[st.label, { marginTop: 24 }]}>Modalidad</Text>
      <View style={st.roundGrid}>
        {ROUND_OPTIONS.map((opt) => {
          const active = selectedRound.type === opt.type;
          return (
            <Pressable
              key={opt.type}
              style={[st.roundChip, active && st.roundChipActive]}
              onPress={() => setSelectedRound(opt)}
              accessibilityRole="radio"
              accessibilityLabel={roundLabel(opt.type)}
              accessibilityState={{ checked: active }}
            >
              <Text style={[st.roundChipText, active && st.roundChipTextActive]}>
                {roundLabel(opt.type)}
              </Text>
              {opt.type !== 'custom' && (
                <Text style={[st.roundChipSub, active && st.roundChipSubActive]}>
                  {opt.totalEnds} × {opt.arrowsPerEnd} flechas
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>

      {isCustom && (
        <View style={st.customRow}>
          <View style={st.customField}>
            <Text style={st.label}>Flechas / serie</Text>
            <TextInput
              style={st.input}
              value={arrowsPerEnd}
              onChangeText={setArrowsPerEnd}
              keyboardType="number-pad"
              maxLength={1}
              accessibilityLabel="Número de flechas por serie"
            />
          </View>
          <View style={st.customField}>
            <Text style={st.label}>Número de series</Text>
            <TextInput
              style={st.input}
              value={totalEnds}
              onChangeText={setTotalEnds}
              keyboardType="number-pad"
              maxLength={2}
              accessibilityLabel="Número de series"
            />
          </View>
        </View>
      )}

      {!isCustom && (
        <View style={st.summaryBox}>
          <Text style={st.summaryText}>
            {selectedRound.totalEnds} series × {selectedRound.arrowsPerEnd} flechas ={' '}
            <Text style={st.summaryHighlight}>
              {selectedRound.totalEnds * selectedRound.arrowsPerEnd * 10} pts máx.
            </Text>
          </Text>
        </View>
      )}

      <Pressable
        style={[st.startButton, !canStart && st.startButtonDisabled]}
        onPress={handleStart}
        disabled={!canStart}
        accessibilityRole="button"
        accessibilityLabel="Iniciar sesión"
        accessibilityState={{ disabled: !canStart }}
      >
        <Text style={st.startButtonText}>Iniciar sesión</Text>
      </Pressable>
    </ScrollView>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    content: { padding: 20, paddingBottom: 60 },
    label: {
      fontSize: 11,
      fontWeight: '600',
      color: t.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      marginBottom: 8,
    },
    input: {
      backgroundColor: t.bgInput,
      borderRadius: 10,
      padding: 14,
      color: t.textPrimary,
      fontSize: 16,
      borderWidth: 1,
      borderColor: t.border,
    },
    roundGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    roundChip: {
      backgroundColor: t.bgCard,
      borderRadius: 10,
      padding: 12,
      borderWidth: 1,
      borderColor: t.border,
      minWidth: '45%',
      flex: 1,
    },
    roundChipActive: { borderColor: t.accent, backgroundColor: t.accentSoft },
    roundChipText: { fontSize: 14, fontWeight: '600', color: t.textSecondary },
    roundChipTextActive: { color: t.accent },
    roundChipSub: { fontSize: 11, color: t.textMuted, marginTop: 2 },
    roundChipSubActive: { color: t.accent, opacity: 0.7 },
    customRow: { flexDirection: 'row', gap: 16, marginTop: 16 },
    customField: { flex: 1 },
    summaryBox: {
      backgroundColor: t.accentSoft,
      borderRadius: 10,
      padding: 14,
      marginTop: 20,
      borderWidth: 1,
      borderColor: t.accent,
    },
    summaryText: { fontSize: 14, color: t.textSecondary, textAlign: 'center' },
    summaryHighlight: { color: t.accent, fontWeight: '700' },
    startButton: {
      backgroundColor: t.accent,
      borderRadius: 16,
      padding: 18,
      alignItems: 'center',
      marginTop: 32,
    },
    startButtonDisabled: { opacity: 0.4 },
    startButtonText: { fontSize: 18, fontWeight: '800', color: '#fff' },
  });
}
