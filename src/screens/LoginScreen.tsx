import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Defs, LinearGradient, Stop, Rect, Circle, Line } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';

const TEAL_DARK = '#1E4A52';
const INK = '#1C1C1E';
const SUBTLE = '#9AA0A6';
const BORDER = '#E6E9EC';
const DANGER = '#D70015';

// Brand gradient stops used for the Log In button
const GRADIENT_COLORS = ['#46C35F', '#2FAE72', '#228C8D', '#2B6F8C'];

// --- Small inline icons (react-native-svg, no extra icon library needed) ---

function MailIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 6.5C3 5.67 3.67 5 4.5 5h15c.83 0 1.5.67 1.5 1.5v11c0 .83-.67 1.5-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11Z"
        stroke={SUBTLE}
        strokeWidth={1.6}
      />
      <Path d="M4 6.5 12 13l8-6.5" stroke={SUBTLE} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function LockIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Rect x={5} y={11} width={14} height={9} rx={2} stroke={SUBTLE} strokeWidth={1.6} />
      <Path d="M8 11V8a4 4 0 0 1 8 0v3" stroke={SUBTLE} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  if (!open) {
    return (
      <Svg width={19} height={19} viewBox="0 0 24 24" fill="none">
        <Path
          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
          stroke={SUBTLE}
          strokeWidth={1.6}
        />
        <Circle cx={12} cy={12} r={3} stroke={SUBTLE} strokeWidth={1.6} />
      </Svg>
    );
  }
  return (
    <Svg width={19} height={19} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        stroke={SUBTLE}
        strokeWidth={1.6}
      />
      <Circle cx={12} cy={12} r={3} stroke={SUBTLE} strokeWidth={1.6} />
      <Line x1={4} y1={20} x2={20} y2={4} stroke={SUBTLE} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

function ChevronLeftIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M15 18l-6-6 6-6" stroke={TEAL_DARK} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Path d="M4 12l6 6L20 6" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login, isSubmitting, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await login(email.trim(), password);
  };

  return (
    <View style={styles.flex}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.canGoBack() && navigation.goBack()}
            hitSlop={10}
            style={styles.backButton}
          >
            <ChevronLeftIcon />
          </TouchableOpacity>

          <View style={styles.brandRow}>
            <Image source={require('../assets/images/app-icon.png')} style={styles.brandLogo} />
            <Text style={styles.brandName}>MuslimEdu</Text>
          </View>
        </View>

        {/* Greeting */}
        <Text style={styles.title}>Peace be upon you!</Text>
        <Text style={styles.subtitle}>Connect through Education.</Text>

        {/* Illustration */}
        <Image
          source={require('../assets/images/students-illustration.png')}
          style={styles.illustration}
          resizeMode="contain"
        />

        {/* Form */}
        <Text style={styles.fieldLabel}>E-Mail</Text>
        <View style={styles.inputRow}>
          <MailIcon />
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor={SUBTLE}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) clearError();
            }}
          />
        </View>

        <Text style={[styles.fieldLabel, { marginTop: 18 }]}>Password</Text>
        <View style={styles.inputRow}>
          <LockIcon />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor={SUBTLE}
            secureTextEntry={secure}
            autoCapitalize="none"
            autoCorrect={false}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (error) clearError();
            }}
          />
          <TouchableOpacity onPress={() => setSecure((s) => !s)} hitSlop={10}>
            <EyeIcon open={!secure} />
          </TouchableOpacity>
        </View>

        {/* Remember me / Forgot password */}
        <View style={styles.optionsRow}>
          <TouchableOpacity style={styles.rememberRow} onPress={() => setRememberMe((r) => !r)}>
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <CheckIcon />}
            </View>
            <Text style={styles.rememberText}>Remember me</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Gradient Log In button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={[styles.buttonWrapper, !canSubmit && styles.buttonDisabled]}
        >
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
            <Defs>
              <LinearGradient id="btnGradient" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={GRADIENT_COLORS[0]} />
                <Stop offset="0.35" stopColor={GRADIENT_COLORS[1]} />
                <Stop offset="0.68" stopColor={GRADIENT_COLORS[2]} />
                <Stop offset="1" stopColor={GRADIENT_COLORS[3]} />
              </LinearGradient>
            </Defs>
            <Rect x={0} y={0} width="100%" height="100%" rx={18} fill="url(#btnGradient)" />
          </Svg>
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>LOG IN</Text>
          )}
        </TouchableOpacity>

        {/* Register your school */}
        <TouchableOpacity style={styles.registerButton} activeOpacity={0.7}>
          <Text style={styles.registerText}>Register your school</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flex: 1, paddingHorizontal: 24, paddingTop: 50, paddingBottom: 20 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { padding: 4 },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brandLogo: { width: 28, height: 28, borderRadius: 8, marginRight: 8 },
  brandName: { fontSize: 18, fontWeight: '700', color: TEAL_DARK },

  title: { fontSize: 26, fontWeight: '800', color: TEAL_DARK, marginTop: 18, lineHeight: 31 },
  subtitle: { fontSize: 14, color: SUBTLE, marginTop: 6 },

  illustration: { width: 210, height: 210, alignSelf: 'center', marginVertical: 4 },

  fieldLabel: { fontSize: 13, fontWeight: '700', color: INK, marginBottom: 8 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  input: { flex: 1, fontSize: 15, color: INK, marginLeft: 10 },

  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  rememberRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 19,
    height: 19,
    borderRadius: 5,
    borderWidth: 1.4,
    borderColor: BORDER,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#2FAE72', borderColor: '#2FAE72' },
  rememberText: { fontSize: 13, color: INK },
  forgotText: { fontSize: 13, color: '#228C8D', fontWeight: '600' },

  errorText: { color: DANGER, fontSize: 13, marginTop: 4, marginBottom: 8, textAlign: 'center' },

  buttonWrapper: {
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    overflow: 'hidden',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: 1.2 },

  registerButton: { marginTop: 14, alignItems: 'center', paddingVertical: 6 },
  registerText: { fontSize: 14, fontWeight: '700', color: '#228C8D' },
});
