import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../../context/AuthContext';
import { admitSingleStudent, AdmissionPhoto } from '../../services/adminService';

const EMERALD = '#0F9D58';
const EMERALD_SOFT = '#E7F5EC';
const INK = '#1C1C1E';
const SUBTLE = '#8A9099';
const HAIRLINE = '#EDEEF0';
const CANVAS = '#F6F7F9';
const DANGER = '#E5484D';

// --- Inline stroke icons ---
function IconUserPlus({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={8} r={4} stroke={color} strokeWidth={2} />
      <Path d="M2 20c0-3.3 3.1-5 7-5s7 1.7 7 5" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={19} y1={7} x2={19} y2={13} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={16} y1={10} x2={22} y2={10} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function IconCamera({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M4 8h3l1.5-2h7L17 8h3v11H4z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Circle cx={12} cy={13} r={3.5} stroke={color} strokeWidth={2} />
    </Svg>
  );
}
function IconCheck({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Polyline points="5 12 10 17 19 7" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

type Gender = 'male' | 'female';

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  secureTextEntry,
  required,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  secureTextEntry?: boolean;
  required?: boolean;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>
        {label}
        {required ? <Text style={styles.req}> *</Text> : null}
      </Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={SUBTLE}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'sentences'}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}

export default function AdmissionScreen() {
  const navigation = useNavigation();
  const { token } = useAuth();

  // This screen is reachable two ways: pushed from the dashboard "Admission"
  // tile (can go back) AND as the Admission bottom tab (can't go back). Only
  // render the Back control when there's actually somewhere to go back to.
  const canGoBack = navigation.canGoBack();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [birthday, setBirthday] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [photo, setPhoto] = useState<AdmissionPhoto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickPhoto = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.7 });
    if (result.didCancel || result.errorCode || !result.assets?.[0]?.uri) return;
    const a = result.assets[0];
    setPhoto({ uri: a.uri as string, fileName: a.fileName ?? null, type: a.type ?? null });
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setGender('male');
    setBirthday('');
    setPhone('');
    setAddress('');
    setClassId('');
    setSectionId('');
    setPhoto(null);
  };

  const validate = (): string | null => {
    if (!name.trim()) return 'Please enter the student name.';
    if (!email.trim()) return 'Please enter an email.';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return 'That email doesn\u2019t look right.';
    if (!password.trim() || password.length < 6) return 'Password must be at least 6 characters.';
    if (!classId.trim()) return 'Please enter a class ID.';
    if (!sectionId.trim()) return 'Please enter a section ID.';
    return null;
  };

  const handleSubmit = async () => {
    if (!token) return;
    const err = validate();
    if (err) {
      Alert.alert('Check the form', err);
      return;
    }
    setIsSubmitting(true);
    try {
      await admitSingleStudent(token, {
        name: name.trim(),
        email: email.trim(),
        password,
        gender,
        birthday: birthday.trim(),
        phone: phone.trim(),
        address: address.trim(),
        class_id: classId.trim(),
        section_id: sectionId.trim(),
        photo,
      });
      Alert.alert('Student admitted', `${name.trim()} has been added.`, [
        {
          text: 'Done',
          onPress: () => {
            resetForm();
            if (canGoBack) navigation.goBack();
          },
        },
      ]);
    } catch (e) {
      Alert.alert('Admission failed', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const initial = name.trim()?.[0]?.toUpperCase() ?? '?';

  return (
    <View style={styles.flex}>
      {/* Header */}
      <View style={styles.header}>
        {canGoBack ? (
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={12}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Polyline points="15 5 8 12 15 19" stroke={EMERALD} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}
        <Text style={styles.headerTitle}>New Admission</Text>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Intro card */}
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <View style={styles.iconChip}>
                <IconUserPlus color={EMERALD} />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.cardTitle}>Admit a Student</Text>
                <Text style={styles.cardSub}>Create a new student account for your school.</Text>
              </View>
            </View>

            {/* Photo picker */}
            <TouchableOpacity style={styles.photoRow} onPress={pickPhoto} activeOpacity={0.85}>
              {photo ? (
                <Image source={{ uri: photo.uri }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoInitial}>{initial}</Text>
                </View>
              )}
              <View style={styles.photoTextWrap}>
                <View style={styles.photoBtn}>
                  <IconCamera color={EMERALD} />
                  <Text style={styles.photoBtnText}>{photo ? 'Change photo' : 'Add photo (optional)'}</Text>
                </View>
                <Text style={styles.photoHint}>A clear headshot works best.</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Account details */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Account</Text>
            <Field label="Full name" value={name} onChangeText={setName} placeholder="e.g. Ahmad Yusuf" autoCapitalize="words" required />
            <Field label="Email" value={email} onChangeText={setEmail} placeholder="student@example.com" keyboardType="email-address" autoCapitalize="none" required />
            <Field label="Password" value={password} onChangeText={setPassword} placeholder="At least 6 characters" autoCapitalize="none" secureTextEntry required />
          </View>

          {/* Personal details */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Details</Text>

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Gender</Text>
              <View style={styles.segment}>
                {(['male', 'female'] as Gender[]).map((g) => {
                  const active = gender === g;
                  return (
                    <TouchableOpacity
                      key={g}
                      style={[styles.segmentItem, active && styles.segmentItemActive]}
                      onPress={() => setGender(g)}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                        {g === 'male' ? 'Male' : 'Female'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <Field label="Birthday" value={birthday} onChangeText={setBirthday} placeholder="YYYY-MM-DD" keyboardType="number-pad" />
            <Field label="Phone" value={phone} onChangeText={setPhone} placeholder="Contact number" keyboardType="phone-pad" />
            <Field label="Address" value={address} onChangeText={setAddress} placeholder="Home address" />
          </View>

          {/* Placement */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Placement</Text>
            <View style={styles.row2}>
              <View style={styles.half}>
                <Field label="Class ID" value={classId} onChangeText={setClassId} placeholder="e.g. 3" keyboardType="number-pad" required />
              </View>
              <View style={styles.half}>
                <Field label="Section ID" value={sectionId} onChangeText={setSectionId} placeholder="e.g. 1" keyboardType="number-pad" required />
              </View>
            </View>
            <Text style={styles.placementHint}>
              Enter the numeric class and section IDs from your school setup.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.9}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <IconCheck color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Admit Student</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: CANVAS },
  flex1: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 58,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', minWidth: 72 },
  backText: { color: EMERALD, fontSize: 16, fontWeight: '600', marginLeft: 2 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: INK },
  scroll: { padding: 16, paddingBottom: 130 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: HAIRLINE,
    shadowColor: '#0B1F13',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  iconChip: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: EMERALD_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: INK },
  cardSub: { fontSize: 13, color: SUBTLE, marginTop: 3, lineHeight: 18 },

  photoRow: { flexDirection: 'row', alignItems: 'center' },
  photo: { width: 64, height: 64, borderRadius: 32, marginRight: 16 },
  photoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: EMERALD_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  photoInitial: { color: EMERALD, fontSize: 24, fontWeight: '800' },
  photoTextWrap: { flex: 1 },
  photoBtn: { flexDirection: 'row', alignItems: 'center' },
  photoBtnText: { color: EMERALD, fontSize: 15, fontWeight: '700', marginLeft: 8 },
  photoHint: { color: SUBTLE, fontSize: 12, marginTop: 4 },

  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: SUBTLE,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 14,
  },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 13.5, fontWeight: '600', color: INK, marginBottom: 7 },
  req: { color: DANGER },
  input: {
    backgroundColor: '#FBFCFD',
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: INK,
  },

  segment: {
    flexDirection: 'row',
    backgroundColor: '#F2F4F6',
    borderRadius: 14,
    padding: 4,
  },
  segmentItem: { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: 'center' },
  segmentItemActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  segmentText: { fontSize: 14, fontWeight: '600', color: SUBTLE },
  segmentTextActive: { color: EMERALD },

  row2: { flexDirection: 'row', justifyContent: 'space-between' },
  half: { width: '48%' },
  placementHint: { fontSize: 12, color: SUBTLE, marginTop: 2, lineHeight: 17 },

  submitButton: {
    backgroundColor: EMERALD,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
