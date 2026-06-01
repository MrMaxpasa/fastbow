// src/screens/SettingsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { Archer, TabParamList } from '../types';
import { useAppStore } from '../store/useAppStore';
import { useThemeStore } from '../store/useThemeStore';
import type { Theme } from '../theme';

const BOW_TYPES: { value: Archer['bowType']; label: string }[] = [
  { value: 'recurvo',     label: 'Recurvo' },
  { value: 'compuesto',   label: 'Compuesto' },
  { value: 'barebow',     label: 'Barebow' },
  { value: 'arco_largo',  label: 'Arco largo' },
  { value: 'tradicional', label: 'Tradicional' },
];

const ACCESSORIES: { key: keyof Archer['accessories']; label: string; onlyFor?: Archer['bowType'][] }[] = [
  // Apuntería
  { key: 'mira',                  label: 'Mira' },
  { key: 'lupa',                  label: 'Lupa',                       onlyFor: ['recurvo', 'compuesto', 'barebow'] },
  { key: 'visor_peep',            label: 'Peep sight',                 onlyFor: ['compuesto'] },

  // Disparo
  { key: 'cliquer',               label: 'Clicker',                    onlyFor: ['recurvo', 'barebow'] },
  { key: 'release',               label: 'Release',                    onlyFor: ['compuesto'] },
  { key: 'dedil',                 label: 'Dedil' },
  { key: 'dragonera',             label: 'Dragonera' },

  // Estabilización
  { key: 'estabilizador',         label: 'Estabilizador largo' },
  { key: 'estabilizador_lateral', label: 'Estabilizador lateral' },
  { key: 'amortiguador',          label: 'Amortiguador' },
  { key: 'v_bar',                 label: 'V-Bar',                      onlyFor: ['recurvo', 'compuesto'] },

  // Flechas
  { key: 'flecha_carbono',        label: 'Flecha carbono' },
  { key: 'flecha_aluminio',       label: 'Flecha aluminio' },
  { key: 'flecha_madera',         label: 'Flecha madera',              onlyFor: ['arco_largo', 'tradicional'] },
  { key: 'flecha_acero',          label: 'Flecha acero' },

  // Protección
  { key: 'brazal',                label: 'Brazal' },
  { key: 'protector_pecho',       label: 'Protector pecho' },

  // Arco
  { key: 'rest',                  label: 'Rest (apoyo flecha)' },
  { key: 'nocking_point',         label: 'Nocking point' },
  { key: 'silenciadores',         label: 'Silenciadores' },
  { key: 'arco_desmontable',      label: 'Arco desmontable (takedown)' },
];

type Props = BottomTabScreenProps<TabParamList, 'Settings'>;

export default function SettingsScreen(_: Props) {
  const { archer, setArcher, sessions, deleteSession } = useAppStore();
  const { isDark, toggle, theme } = useThemeStore();
  const st = makeStyles(theme);

  const [name, setName] = useState(archer?.name ?? '');
  const [bowType, setBowType] = useState<Archer['bowType']>(archer?.bowType ?? 'recurvo');
  const [accessories, setAccessories] = useState<Archer['accessories']>(
    archer?.accessories ?? {
      mira: false,
      lupa: false,
      visor_peep: false,
      cliquer: false,
      release: false,
      dedil: false,
      dragonera: false,
      estabilizador: false,
      estabilizador_lateral: false,
      amortiguador: false,
      v_bar: false,
      flecha_carbono: false,
      flecha_aluminio: false,
      flecha_madera: false,
      flecha_acero: false,
      brazal: false,
      protector_pecho: false,
      rest: false,
      nocking_point: false,
      silenciadores: false,
      arco_desmontable: false,
    }
  );
  const [category, setCategory] = useState(archer?.category ?? '');
  const [saved, setSaved] = useState(false);
  const [bowDropdownOpen, setBowDropdownOpen] = useState(false);

  function handleSave() {
    setArcher({
      id: archer?.id ?? 'default',
      name,
      bowType,
      accessories,
      category,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleDeleteAll() {
    Alert.alert(
      'Borrar todo el historial',
      `Esto eliminará ${sessions.length} sesiones. ¿Estás seguro?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar todo',
          style: 'destructive',
          onPress: () => sessions.forEach((s) => deleteSession(s.id)),
        },
      ]
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={st.content}>

      {/* Apariencia */}
      <Text style={st.sectionTitle}>Apariencia</Text>
      <View style={st.themeCard}>
        <Pressable
          style={[st.themeChip, isDark && st.themeChipActive]}
          onPress={() => { if (!isDark) toggle(); }}
          accessibilityRole="radio"
          accessibilityLabel="Tema oscuro"
          accessibilityState={{ checked: isDark }}
        >
          <Text style={[st.themeChipText, isDark && st.themeChipTextActive]}>Oscuro</Text>
        </Pressable>
        <Pressable
          style={[st.themeChip, !isDark && st.themeChipActive]}
          onPress={() => { if (isDark) toggle(); }}
          accessibilityRole="radio"
          accessibilityLabel="Tema claro"
          accessibilityState={{ checked: !isDark }}
        >
          <Text style={[st.themeChipText, !isDark && st.themeChipTextActive]}>Claro</Text>
        </Pressable>
      </View>

      {/* Perfil */}
      <Text style={[st.sectionTitle, { marginTop: 32 }]}>Perfil de arquero</Text>

      <Text style={st.label}>Nombre</Text>
      <TextInput
        style={st.input}
        value={name}
        onChangeText={setName}
        placeholder="Tu nombre"
        placeholderTextColor={theme.textMuted}
        accessibilityLabel="Nombre del arquero"
      />

      <Text style={[st.label, { color: theme.textSecondary }]}>Tipo de arco</Text>

      <Pressable
        style={[st.dropdown, { backgroundColor: theme.bgCard, borderColor: bowDropdownOpen ? theme.accent : theme.border }]}
        onPress={() => setBowDropdownOpen(!bowDropdownOpen)}
        accessibilityRole="button"
        accessibilityLabel="Seleccionar tipo de arco"
      >
        <Text style={[st.dropdownValue, { color: theme.textPrimary }]}>
          {BOW_TYPES.find(b => b.value === bowType)?.label ?? 'Seleccionar'}
        </Text>
        <Ionicons
          name={bowDropdownOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={theme.textSecondary}
        />
      </Pressable>

      {bowDropdownOpen && (
        <View style={[st.dropdownList, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          {BOW_TYPES.map((bt) => (
            <Pressable
              key={bt.value}
              style={[
                st.dropdownItem,
                { borderBottomColor: theme.border },
                bowType === bt.value && { backgroundColor: theme.accentSoft },
              ]}
              onPress={() => {
                setBowType(bt.value);
                setBowDropdownOpen(false);
              }}
              accessibilityRole="radio"
              accessibilityLabel={bt.label}
              accessibilityState={{ checked: bowType === bt.value }}
            >
              <Text style={[
                st.dropdownItemText,
                { color: bowType === bt.value ? theme.accent : theme.textPrimary },
              ]}>
                {bt.label}
              </Text>
              {bowType === bt.value && (
                <Ionicons name="checkmark" size={16} color={theme.accent} />
              )}
            </Pressable>
          ))}
        </View>
      )}

      <Text style={[st.label, { color: theme.textSecondary, marginTop: 20 }]}>Accesorios</Text>
      <View style={st.accessoriesGrid}>
        {ACCESSORIES
          .filter(acc => !acc.onlyFor || acc.onlyFor.includes(bowType))
          .map((acc) => {
            const active = accessories[acc.key];
            return (
              <Pressable
                key={acc.key}
                style={[
                  st.accessoryChip,
                  {
                    backgroundColor: active ? theme.accentSoft : theme.bgCard,
                    borderColor: active ? theme.accent : theme.border,
                  },
                ]}
                onPress={() =>
                  setAccessories(prev => ({ ...prev, [acc.key]: !prev[acc.key] }))
                }
                accessibilityRole="checkbox"
                accessibilityLabel={acc.label}
                accessibilityState={{ checked: active }}
              >
                <Ionicons
                  name={active ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={active ? theme.accent : theme.textMuted}
                  style={{ marginRight: 6 }}
                />
                <Text style={[
                  st.accessoryChipText,
                  { color: active ? theme.accent : theme.textSecondary },
                ]}>
                  {acc.label}
                </Text>
              </Pressable>
            );
          })
        }
      </View>

      <Text style={st.label}>Categoría</Text>
      <TextInput
        style={st.input}
        value={category}
        onChangeText={setCategory}
        placeholder="Senior, Júnior, Master…"
        placeholderTextColor={theme.textMuted}
        accessibilityLabel="Categoría"
      />

      <Pressable
        style={st.saveButton}
        onPress={handleSave}
        accessibilityRole="button"
        accessibilityLabel="Guardar perfil"
      >
        <Text style={st.saveButtonText}>{saved ? 'Guardado' : 'Guardar perfil'}</Text>
      </Pressable>

      {/* Datos */}
      <Text style={[st.sectionTitle, { marginTop: 32 }]}>Datos</Text>
      <View style={st.infoRow}>
        <Text style={st.infoLabel}>Sesiones guardadas</Text>
        <Text style={st.infoValue}>{sessions.length}</Text>
      </View>

      {sessions.length > 0 && (
        <Pressable
          style={st.dangerButton}
          onPress={handleDeleteAll}
          accessibilityRole="button"
          accessibilityLabel="Borrar todo el historial"
        >
          <Text style={st.dangerButtonText}>Borrar historial</Text>
        </Pressable>
      )}

      {/* Acerca de */}
      <Text style={[st.sectionTitle, { marginTop: 32 }]}>Acerca de</Text>
      <View style={st.aboutCard}>
        <Text style={st.about}>
          FastBow v1.0{'\n'}
          Desarrollada por Max Padulo Santamaria.{'\n'}
          Detección de flechas con visión por computador.{'\n'}
          Funciona completamente sin internet.
        </Text>
      </View>
    </ScrollView>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    content: { padding: 20, paddingBottom: 60 },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '600',
      color: t.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      marginBottom: 12,
    },
    themeCard: {
      flexDirection: 'row',
      gap: 12,
    },
    themeChip: {
      flex: 1,
      borderRadius: 10,
      padding: 14,
      alignItems: 'center',
      backgroundColor: t.bgCard,
      borderWidth: 1,
      borderColor: t.border,
    },
    themeChipActive: {
      backgroundColor: t.accentSoft,
      borderColor: t.accent,
    },
    themeChipText: {
      fontSize: 14,
      fontWeight: '600',
      color: t.textSecondary,
    },
    themeChipTextActive: {
      color: t.accent,
    },
    label: {
      fontSize: 11,
      fontWeight: '600',
      color: t.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 6,
      marginTop: 14,
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
    saveButton: {
      backgroundColor: t.accent,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 20,
    },
    saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: t.bgCard,
      borderRadius: 10,
      padding: 14,
      borderWidth: 1,
      borderColor: t.border,
    },
    infoLabel: { color: t.textSecondary, fontSize: 15 },
    infoValue: { color: t.textPrimary, fontWeight: '700', fontSize: 15 },
    dangerButton: {
      borderWidth: 1,
      borderColor: t.danger,
      borderRadius: 12,
      padding: 14,
      alignItems: 'center',
      marginTop: 12,
    },
    dangerButtonText: { color: t.danger, fontWeight: '600', fontSize: 15 },
    aboutCard: {
      backgroundColor: t.bgCard,
      borderRadius: 10,
      padding: 14,
      borderWidth: 1,
      borderColor: t.border,
    },
    about: { color: t.textMuted, fontSize: 13, lineHeight: 22 },
    dropdown: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: 10,
      borderWidth: 1,
      padding: 14,
    },
    dropdownValue: {
      fontSize: 16,
      fontWeight: '500',
    },
    dropdownList: {
      borderRadius: 10,
      borderWidth: 1,
      marginTop: 4,
      overflow: 'hidden',
    },
    dropdownItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 14,
      borderBottomWidth: 1,
    },
    dropdownItemText: {
      fontSize: 15,
      fontWeight: '500',
    },
    accessoriesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    accessoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 20,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 9,
    },
    accessoryChipText: {
      fontSize: 14,
      fontWeight: '500',
    },
  });
}
