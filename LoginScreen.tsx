import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  StatusBar,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';

/* ------------------------------------------------------------------ *
 * Brand palette
 * BRAND_GREEN is the single solid brand green used for the primary
 * button and green accents (replaces the old teal-fading gradient).
 * ------------------------------------------------------------------ */
const BRAND_GREEN = '#0F9D58';
const INK = '#111827';
const TEXT_MUTED = '#6B7280';
const PLACEHOLDER = '#9AA0A6';
const BORDER = '#E7EAEE';
const DANGER = '#D70015';
const WHITE = '#FFFFFF';

/* ---------------------------- Icons ------------------------------- */
function MailIcon({ color = BRAND_GREEN, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="5" width="18" height="14" rx="3" stroke={color} strokeWidth={1.8} />
      <Path d="M4 7l8 6 8-6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function LockIcon({ color = BRAND_GREEN, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="10" width="16" height="10" rx="3" stroke={color} strokeWidth={1.8} />
      <Path d="M8 10V8a4 4 0 118 0v2" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function EyeIcon({ open, color = TEXT_MUTED, size = 22 }: { open: boolean; color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={1.8} />
      {!open && <Line x1="4" y1="20" x2="20" y2="4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />}
    </Svg>
  );
}
function ChevronLeftIcon({ color = INK, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 5l-7 7 7 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function ChevronRightIcon({ color = BRAND_GREEN, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 6l6 6-6 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function CheckIcon({ color = WHITE, size = 14 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 13l4 4 10-11" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function SchoolIcon({ color = BRAND_GREEN, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 10l9-5 9 5-9 5-9-5z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M7 12v5c0 1 2.2 2 5 2s5-1 5-2v-5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function AlumniIcon({ color = BRAND_GREEN, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="3.4" stroke={color} strokeWidth={1.8} />
      <Path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login, isSubmitting, error, clearError } = useAuth();
  const { width } = useWindowDimensions();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await login(email.trim(), password);
  };

  // Responsive hero illustration: ~46% of screen width, clamped so it stays
  // ~50-70% larger than the old 240px while never overflowing on small phones.
  const heroSize = Math.min(Math.max(width * 0.46, 170), 230);

  return (
    <View style={styles.flex}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ---------------- Top bar: back button + brand ---------------- */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => navigation.canGoBack() && navigation.goBack()}
              hitSlop={12}
              style={styles.backButton}
              activeOpacity={0.8}
            >
              <ChevronLeftIcon />
            </TouchableOpacity>

            <View style={styles.brandRow}>
              <Image
                source={require('../assets/images/app-icon.png')}
                style={styles.brandLogo}
                resizeMode="contain"
              />
              <Text style={styles.brandName}>MuslimEdu</Text>
            </View>
          </View>

          {/* ---------------------- Hero: text + art --------------------- */}
          <View style={styles.hero}>
            <View style={styles.heroText}>
              <Text style={styles.title}>
                Peace be{'\n'}
                <Text style={styles.titleGreen}>upon you!</Text>
              </Text>
              <Text style={styles.subtitle}>
                Connect through <Text style={styles.subtitleGreen}>Education.</Text>
              </Text>
            </View>

            <Image
              source={require('../assets/images/students-illustration-transparent.png')}
              style={{ width: heroSize, height: heroSize }}
              resizeMode="contain"
            />
          </View>

          {/* --------------------------- Form ---------------------------- */}
          <View style={styles.form}>
            <Text style={styles.fieldLabel}>E-Mail</Text>
            <View style={styles.inputRow}>
              <MailIcon />
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={PLACEHOLDER}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) clearError();
                }}
              />
            </View>

            <Text style={[styles.fieldLabel, styles.passwordLabel]}>Password</Text>
            <View style={styles.inputRow}>
              <LockIcon />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={PLACEHOLDER}
                secureTextEntry={secure}
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) clearError();
                }}
              />
              <TouchableOpacity onPress={() => setSecure((s) => !s)} hitSlop={12}>
                <EyeIcon open={!secure} />
              </TouchableOpacity>
            </View>

            {/* Remember me / Forgot password */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberRow}
                onPress={() => setRememberMe((r) => !r)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <CheckIcon />}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity hitSlop={8}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Solid brand-green Log In button */}
            <TouchableOpacity
              style={[styles.loginButton, !canSubmit && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color={WHITE} />
              ) : (
                <Text style={styles.loginButtonText}>LOG IN</Text>
              )}
            </TouchableOpacity>

            {/* OR divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Register your school */}
            <TouchableOpacity style={styles.outlinedButton} activeOpacity={0.85}>
              <SchoolIcon />
              <Text style={styles.outlinedButtonText}>Register your school</Text>
              <ChevronRightIcon />
            </TouchableOpacity>

            {/* Create your Alumni Account */}
            <TouchableOpacity style={[styles.outlinedButton, styles.outlinedButtonSpacer]} activeOpacity={0.85}>
              <AlumniIcon />
              <Text style={styles.outlinedButtonText}>Create your Alumni Account</Text>
              <ChevronRightIcon />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: WHITE },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 64 : 44,
    paddingBottom: 40,
  },

  /* Top bar */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brandLogo: { width: 34, height: 34, borderRadius: 9, marginRight: 8 },
  brandName: { fontSize: 20, fontWeight: '800', color: INK, letterSpacing: 0.2 },

  /* Hero */
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 40,
  },
  heroText: { flex: 1, paddingRight: 8 },
  title: { fontSize: 38, fontWeight: '800', color: INK, lineHeight: 44 },
  titleGreen: { color: BRAND_GREEN },
  subtitle: { fontSize: 15, color: TEXT_MUTED, marginTop: 12 },
  subtitleGreen: { color: BRAND_GREEN, fontWeight: '700' },

  /* Form */
  form: { marginTop: 4 },
  fieldLabel: { fontSize: 15, fontWeight: '700', color: INK, marginBottom: 10 },
  passwordLabel: { marginTop: 24 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 62,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  input: { flex: 1, fontSize: 16, color: INK, marginLeft: 12, paddingVertical: 0 },

  /* Remember / Forgot */
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 8,
  },
  rememberRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: BORDER,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: BRAND_GREEN, borderColor: BRAND_GREEN },
  rememberText: { fontSize: 15, color: INK },
  forgotText: { fontSize: 15, color: BRAND_GREEN, fontWeight: '700' },

  errorText: { color: DANGER, fontSize: 13, marginTop: 6, marginBottom: 2, textAlign: 'center' },

  /* Primary button */
  loginButton: {
    height: 60,
    borderRadius: 30,
    backgroundColor: BRAND_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    shadowColor: BRAND_GREEN,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  buttonDisabled: { opacity: 0.5 },
  loginButtonText: { color: WHITE, fontSize: 16, fontWeight: '800', letterSpacing: 1.5 },

  /* Divider */
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 26, marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: BORDER },
  dividerText: { fontSize: 13, color: PLACEHOLDER, marginHorizontal: 14, fontWeight: '700', letterSpacing: 1 },

  /* Outlined buttons */
  outlinedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: BRAND_GREEN,
    paddingHorizontal: 18,
    backgroundColor: WHITE,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  outlinedButtonSpacer: { marginTop: 14 },
  outlinedButtonText: { flex: 1, fontSize: 15, fontWeight: '700', color: BRAND_GREEN, marginLeft: 12 },
});
