// src/screens/HomeScreen.tsx
import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../types';
import { useAppStore } from '../store/useAppStore';
import { roundLabel, isSessionFinished, nextEndNumber } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { useThemeStore } from '../store/useThemeStore';
import type { Theme } from '../theme';
import { computeRank } from '../types/ranks';
import RankCard from '../components/RankCard';

type Props = BottomTabScreenProps<TabParamList, 'Home'>;
type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen(_: Props) {
  const insets = useSafeAreaInsets();
  const { sessions, loadData } = useAppStore();
  const navigation = useNavigation<NavProp>();
  const theme = useThemeStore((s) => s.theme);
  const st = makeStyles(theme);

  useEffect(() => {
    loadData();
  }, []);

  const lastSession = sessions[0];
  const lastSessionUnfinished = lastSession && !isSessionFinished(lastSession);
  const rankResult = useMemo(() => computeRank(sessions), [sessions]);

  function handleContinueSession(session: typeof lastSession) {
    Alert.alert(
      'Sesión en curso',
      `Tienes una sesión de ${session.archerName} con ${session.ends.length} de ${session.totalEnds} series completadas. ¿Quieres continuar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          onPress: () => navigation.navigate('Camera', {
            sessionId: session.id,
            endNumber: nextEndNumber(session),
            arrowsPerEnd: session.arrowsPerEnd,
          }),
        },
      ]
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={[st.content, { paddingTop: insets.top + 16 }]}
    >
      {/* Header */}
      <View style={st.header}>
        <Text style={st.title}>ARCHERY</Text>
        <View style={st.titleUnderline} />
        <Text style={st.subtitle}>Registra tu puntuación con una foto</Text>
      </View>

      {/* Botón principal */}
      <Pressable
        style={st.primaryButton}
        onPress={() => navigation.navigate('NewSession')}
        accessibilityRole="button"
        accessibilityLabel="Iniciar nueva sesión de tiro"
      >
        <Text style={st.primaryButtonText}>Nueva sesión</Text>
        <Text style={st.primaryButtonSub}>Fotografía la diana y detectamos las flechas</Text>
      </Pressable>

      {/* Rango actual */}
      {sessions.length >= 1 && (
        <View style={st.section}>
          <Text style={st.sectionTitle}>Tu rango</Text>
          <RankCard result={rankResult} />
        </View>
      )}

      {/* Última sesión */}
      {lastSession && (
        <View style={st.section}>
          <Text style={st.sectionTitle}>Última sesión</Text>
          <Pressable
            style={st.sessionCard}
            onPress={() => navigation.navigate('SessionDetail', { sessionId: lastSession.id })}
            accessibilityRole="button"
            accessibilityLabel={`Ver sesión de ${lastSession.archerName}`}
          >
            <View style={st.sessionRow}>
              <View>
                {!isSessionFinished(lastSession) && (
                  <View style={[st.inProgressBadge, { backgroundColor: theme.accentSoft, borderColor: theme.accent }]}>
                    <Text style={[st.inProgressText, { color: theme.accent }]}>En curso</Text>
                  </View>
                )}
                <Text style={st.sessionName}>{lastSession.archerName}</Text>
                <Text style={st.sessionMeta}>
                  {roundLabel(lastSession.roundType)} ·{' '}
                  {format(lastSession.date, "d MMM yyyy", { locale: es })}
                </Text>
              </View>
              <View style={st.scoreBox}>
                <Text style={st.scoreNumber}>{lastSession.grandTotal}</Text>
                <Text style={st.scoreMax}>/ {lastSession.maxPossible}</Text>
              </View>
            </View>
            <View style={st.progressBarBg}>
              <View
                style={[
                  st.progressBarFill,
                  { width: `${(lastSession.grandTotal / lastSession.maxPossible) * 100}%` },
                ]}
              />
            </View>
            {lastSessionUnfinished && (
              <Pressable
                style={[st.continueButton, { borderColor: theme.accent, backgroundColor: theme.accentSoft }]}
                onPress={() => handleContinueSession(lastSession)}
                accessibilityRole="button"
                accessibilityLabel="Continuar sesión inacabada"
              >
                <Ionicons name="play-circle-outline" size={18} color={theme.accent} style={{ marginRight: 8 }} />
                <Text style={[st.continueButtonText, { color: theme.accent }]}>
                  Continuar — Serie {nextEndNumber(lastSession)} de {lastSession.totalEnds}
                </Text>
              </Pressable>
            )}
          </Pressable>
        </View>
      )}

      {/* Stats rápidas */}
      {sessions.length > 0 && (
        <View style={st.section}>
          <Text style={st.sectionTitle}>Estadísticas globales</Text>
          <View style={st.statsRow}>
            <View style={st.statCard}>
              <Text style={st.statNumber}>{sessions.length}</Text>
              <Text style={st.statLabel}>Sesiones</Text>
            </View>
            <View style={st.statCard}>
              <Text style={st.statNumber}>
                {Math.round(
                  sessions.reduce((acc, sess) => acc + sess.grandTotal / sess.maxPossible, 0) /
                    sessions.length * 100
                )}%
              </Text>
              <Text style={st.statLabel}>Eficiencia media</Text>
            </View>
            <View style={st.statCard}>
              <Text style={st.statNumber}>
                {Math.max(...sessions.map((sess) => sess.grandTotal), 0)}
              </Text>
              <Text style={st.statLabel}>Mejor marca</Text>
            </View>
          </View>
        </View>
      )}

      {sessions.length === 0 && (
        <View style={st.emptyState}>
          <Text style={st.emptyText}>
            Aún no tienes sesiones registradas.{'\n'}Empieza tirando.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    content: { padding: 20, paddingBottom: 40 },
    header: { alignItems: 'center', marginBottom: 32 },
    title: { fontSize: 28, fontWeight: '900', color: t.textPrimary, letterSpacing: 3 },
    titleUnderline: { width: 48, height: 3, backgroundColor: t.accent, borderRadius: 2, marginTop: 6, marginBottom: 8 },
    subtitle: { fontSize: 14, color: t.textMuted, marginTop: 4 },
    primaryButton: {
      backgroundColor: t.accent,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      marginBottom: 32,
    },
    primaryButtonText: { fontSize: 22, fontWeight: '800', color: '#fff' },
    primaryButtonSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4, textAlign: 'center' },
    section: { marginBottom: 24 },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '600',
      color: t.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      marginBottom: 12,
    },
    sessionCard: {
      backgroundColor: t.bgCard,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: t.border,
    },
    sessionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    sessionName: { fontSize: 17, fontWeight: '700', color: t.textPrimary },
    sessionMeta: { fontSize: 13, color: t.textSecondary, marginTop: 2 },
    scoreBox: { alignItems: 'flex-end' },
    scoreNumber: { fontSize: 28, fontWeight: '800', color: t.accent },
    scoreMax: { fontSize: 12, color: t.textMuted },
    progressBarBg: { height: 6, backgroundColor: t.border, borderRadius: 3, marginTop: 12 },
    progressBarFill: { height: 6, backgroundColor: t.accent, borderRadius: 3 },
    statsRow: { flexDirection: 'row', gap: 12 },
    statCard: {
      flex: 1,
      backgroundColor: t.bgCard,
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: t.border,
    },
    statNumber: { fontSize: 24, fontWeight: '800', color: t.accent },
    statLabel: { fontSize: 11, color: t.textMuted, marginTop: 4, textAlign: 'center' },
    emptyState: { alignItems: 'center', marginTop: 40 },
    emptyText: { fontSize: 15, color: t.textMuted, textAlign: 'center', lineHeight: 22 },
    continueButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 14,
      marginTop: 12,
    },
    continueButtonText: {
      fontSize: 14,
      fontWeight: '700',
    },
    inProgressBadge: {
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
      marginBottom: 6,
    },
    inProgressText: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
  });
}
