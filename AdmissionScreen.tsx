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
  findPossibleDuplicates,
  AdmissionInput,
  ClassOption,
  SectionOption,
} from '../../services/adminService';

const DANGER_SOFT = '#FDECEA';

// Plain text fields. Class + Section are ID pickers, handled separately below.
const TEXT_FIELDS: {
  key: keyof AdmissionInput;
  label: string;
  required?: boolean;
  keyboard?: 'default' | 'email-address' | 'phone-pad';
  secure?: boolean;
  helper?: string;
}[] = [
  { key: 'name', label: 'Full name', required: true },
  { key: 'email', label: 'Email', keyboard: 'email-address' },
  { key: 'phone', label: 'Phone', keyboard: 'phone-pad' },
  {
    key: 'password',
    label: 'Password',
    secure: true,
    helper: 'Login password for this student. Leave blank to auto-generate one.',
  },
  { key: 'guardian_name', label: 'Guardian name' },
  { key: 'code', label: 'Student code' },
];

// Extra fields for orphan/orphanage schools. These already exist on the
// child's profile (see updateOrphanProfile in adminService) but previously
// had no way to be filled in at admission time, forcing a second edit step
// right after creating the record.
const ORPHAN_FIELDS: {
  key: keyof AdmissionInput;
  label: string;
  keyboard?: 'default' | 'phone-pad';
}[] = [
  { key: 'orphan_id_number', label: 'Orphan ID number' },
  { key: 'guardian_relation', label: 'Guardian relation (e.g. Uncle, Grandmother)' },
  { key: 'guardian_phone', label: 'Guardian phone', keyboard: 'phone-pad' },
  { key: 'health_status', label: 'Health status' },
  { key: 'special_needs', label: 'Special needs' },
  { key: 'admission_reason', label: 'Admission reason' },
];

export default function AdmissionScreen() {
  const navigation = useNavigation();
  const { token, user } = useAuth();
  const isOrphanSchool = !!user?.is_orphan;

  const [form, setForm] = useState<AdmissionInput>({ name: '' });
  const [submitting, setSubmitting] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);

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

  const runSubmit = async () => {
    if (!token) return;
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

  const onSubmit = async () => {
    if (!form.name?.trim()) {
      Alert.alert('Missing name', 'A student needs at least a full name.');
      return;
    }
    if (!token) {
      Alert.alert('Not signed in', 'Your session expired. Please log in again.');
      return;
    }

    // Duplicate guard: warn if a student with the same name already exists
    // in this school before creating a second record for the same person.
    setCheckingDuplicate(true);
    try {
      const duplicates = await findPossibleDuplicates(token, form.name);
      setCheckingDuplicate(false);
      if (duplicates.length > 0) {
        Alert.alert(
          'Possible duplicate',
          `A student named "${form.name.trim()}" is already in your school. Add another one anyway?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Add anyway', style: 'destructive', onPress: runSubmit },
          ],
        );
        return;
      }
    } catch {
      // If the duplicate check itself fails (e.g. offline), don't block
      // admission on it - just proceed without the warning.
      setCheckingDuplicate(false);
    }

    await runSubmit();
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

  const renderTextField = (f: (typeof TEXT_FIELDS)[number]) => (
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
        autoCapitalize={f.key === 'email' ? 'none' : f.secure ? 'none' : 'words'}
        secureTextEntry={f.secure}
        placeholder={f.label}
        placeholderTextColor={SUBTLE}
      />
      {f.helper ? <Text style={styles.helper}>{f.helper}</Text> : null}
    </View>
  );

  const busy = submitting || checkingDuplicate;

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

        {TEXT_FIELDS.map(renderTextField)}

        {renderChips('Class', classes, form.class_id, (id) =>
          setForm((prev) => ({ ...prev, class_id: id, section_id: undefined })),
        )}
        {renderChips('Section', sections, form.section_id, (id) => set('section_id', id))}

        {isOrphanSchool ? (
          <View style={styles.orphanSection}>
            <Text style={styles.sectionTitle}>Orphan details</Text>
            <Text style={styles.sectionSubtitle}>
              This school is registered as an orphanage, so these details help complete
              the child's profile right away.
            </Text>
            {ORPHAN_FIELDS.map((f) => (
              <View key={f.key} style={styles.fieldWrap}>
                <Text style={styles.label}>{f.label}</Text>
                <TextInput
                  style={styles.input}
                  value={(form[f.key] as string) ?? ''}
                  onChangeText={(t) => set(f.key, t)}
                  keyboardType={f.keyboard ?? 'default'}
                  autoCapitalize="words"
                  placeholder={f.label}
                  placeholderTextColor={SUBTLE}
                />
              </View>
            ))}
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.button, busy && styles.buttonDisabled]}
          onPress={onSubmit}
          disabled={busy}
          activeOpacity={0.85}
        >
          {busy ? (
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
  helper: { fontSize: 12, color: SUBTLE, marginTop: 6 },
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
  orphanSection: {
    marginTop: 8,
    marginBottom: 8,
    padding: 16,
    borderRadius: 18,
    backgroundColor: DANGER_SOFT,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: INK, marginBottom: 4 },
  sectionSubtitle: { fontSize: 12, color: SUBTLE, marginBottom: 16, lineHeight: 17 },
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
