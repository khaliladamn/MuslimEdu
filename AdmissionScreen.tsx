import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { EMERALD, EMERALD_SOFT, INK, SUBTLE } from '../dashboards/DashboardShell';
import {
  admitStudent,
  fetchClasses,
  fetchSections,
  AdmissionInput,
  ClassOption,
  SectionOption,
} from '../../services/adminService';

// Plain text fields. Class + Section are ID pickers, handled separately below.
const TEXT_FIELDS: {
  key: keyof AdmissionInput;
  label: string;
  required?: boolean;
  keyboard?: 'default' | 'email-address' | 'phone-pad';
}[] = [
  { key: 'name', label: 'Full name', required: true },
  { key: 'email', label: 'Email', keyboard: 'email-address' },
  { key: 'phone', label: 'Phone', keyboard: 'phone-pad' },
  { key: 'guardian_name', label: 'Guardian name' },
  { key: 'code', label: 'Student code' },
];

export default function AdmissionScreen() {
  const navigation = useNavigation();
  const { token } = useAuth();
  const [form, setForm] = useState<AdmissionInput>({ name: '' });
  const [submitting, setSubmitting] = useState(false);

  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [sections, setSections] = useState<SectionOption[]>([]);

  const set = (key: keyof AdmissionInput, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Load classes once. Sections reload whenever the chosen class changes.
  useEffect(() => {
    if (!token) return;
    fetchClasses(token)
      .then(setClasses)
      .catch(() => {
        /* silent - picker just stays empty, admin can still submit name-only */
      });
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchSections(token, form.class_id)
      .then(setSections)
      .catch(() => setSections([]));
  }, [token, form.class_id]);

  const onSubmit = async () => {
    if (!form.name?.trim()) {
      Alert.alert('Missing name', 'A student needs at least a full name.');
      return;
    }
    if (!token) {
      Alert.alert('Not signed in', 'Your session expired. Please log in again.');
      return;
    }
    setSubmitting(true);
    try {
      const student = await admitStudent(token, form);
      Alert.alert('Admitted', `${student.name} has been added.`, [
        { text: 'OK', onPress: () => (navigation as any).goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Could not admit', err?.message ?? 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderChips = (
    label: string,
    options: { id: number; name: string }[],
    selectedId: string | undefined,
    onSelect: (id: string) => void,
  ) => {
    if (options.length === 0) return null;
    return (
      <View style={styles.fieldWrap}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.chipRow}>
          {options.map((opt) => {
            const active = selectedId === String(opt.id);
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => onSelect(String(opt.id))}
                activeOpacity={0.85}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {opt.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>New Admission</Text>
        <Text style={styles.subtitle}>Add a single student to your school.</Text>

        {TEXT_FIELDS.map((f) => (
          <View key={f.key} style={styles.fieldWrap}>
            <Text style={styles.label}>
              {f.label}
              {f.required ? ' *' : ''}
            </Text>
            <TextInput
              style={styles.input}
              value={(form[f.key] as string) ?? ''}
              onChangeText={(t) => set(f.key, t)}
              keyboardType={f.keyboard ?? 'default'}
              autoCapitalize={f.key === 'email' ? 'none' : 'words'}
              placeholder={f.label}
              placeholderTextColor={SUBTLE}
            />
          </View>
        ))}

        {renderChips('Class', classes, form.class_id, (id) =>
          setForm((prev) => ({ ...prev, class_id: id, section_id: undefined })),
        )}
        {renderChips('Section', sections, form.section_id, (id) => set('section_id', id))}

        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={onSubmit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Admit Student</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 60 },
  title: { fontSize: 26, fontWeight: '800', color: INK },
  subtitle: { fontSize: 14, color: SUBTLE, marginTop: 4, marginBottom: 24 },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: INK, marginBottom: 6 },
  input: {
    backgroundColor: EMERALD_SOFT,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: INK,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: EMERALD_SOFT,
  },
  chipActive: { backgroundColor: EMERALD },
  chipText: { fontSize: 14, fontWeight: '600', color: EMERALD },
  chipTextActive: { color: '#FFFFFF' },
  button: {
    backgroundColor: EMERALD,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
