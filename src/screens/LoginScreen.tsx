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
  ScrollView,
  Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import GlowAvatar from '../components/GlowAvatar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DARK = '#101114';
const EMERALD = '#0F9D58';
const EMERALD_DARK = '#0C7C46';
const INK = '#1C1C1E';
const SUBTLE = '#8E8E93';

// Height of the wave card's curved top section (the SVG canvas)
const WAVE_HEIGHT = 90;

export default function LoginScreen() {
  const { login, isSubmitting, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await login(email.trim(), password);
  };

  return (
    <View style={styles.flex}>
      {/* Dark top section with floating character avatars */}
      <View style={styles.darkSection}>
        <View style={styles.avatarCluster}>
          <GlowAvatar
            source={require('../assets/images/avatar-3.png')}
            glowColor="#7FD9C8"
            size={78}
            style={styles.avatarTopRight}
          />
          <GlowAvatar
            source={require('../assets/images/avatar-1.png')}
            glowColor="#F4B6C2"
            size={92}
            style={styles.avatarLeft}
          />
          <GlowAvatar
            source={require('../assets/images/avatar-2.png')}
            glowColor="#A9E4A0"
            size={82}
            style={styles.avatarBottom}
          />

          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>Salam!</Text>
          </View>
        </View>

        <Text style={styles.heading}>Let's get you{'\n'}signed in!</Text>
      </View>

      {/* Wave-shaped white card */}
      <View style={styles.waveWrapper}>
        <Svg width={SCREEN_WIDTH} height={WAVE_HEIGHT} viewBox={`0 0 ${SCREEN_WIDTH} ${WAVE_HEIGHT}`}>
          <Path
            fill="#FFFFFF"
            d={`M0 ${WAVE_HEIGHT} L0 40 Q ${SCREEN_WIDTH * 0.5} -30 ${SCREEN_WIDTH} 40 L${SCREEN_WIDTH} ${WAVE_HEIGHT} Z`}
          />
        </Svg>
      </View>

      <KeyboardAvoidingView
        style={styles.cardBody}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.cardContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.helperText}>
            Accounts are created by your school admin.
          </Text>
          <Text style={styles.helperLink}>Contact your admin for access</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@school.com"
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

          <View style={styles.inputWrapper}>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Password"
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
                <Text style={styles.toggleText}>{secure ? 'Show' : 'Hide'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, !canSubmit && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFFFFF' },
  darkSection: {
    backgroundColor: DARK,
    paddingTop: 70,
    paddingBottom: 50,
    paddingHorizontal: 24,
  },
  avatarCluster: {
    height: 190,
    marginBottom: 10,
  },
  avatarLeft: { position: 'absolute', left: 10, top: 20 },
  avatarTopRight: { position: 'absolute', right: 20, top: 0 },
  avatarBottom: { position: 'absolute', left: 90, top: 90 },
  speechBubble: {
    position: 'absolute',
    left: 130,
    top: 65,
    backgroundColor: '#3A3A3C',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  speechText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  heading: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
  },
  waveWrapper: { backgroundColor: DARK },
  cardBody: { flex: 1, backgroundColor: '#FFFFFF', marginTop: -1 },
  cardContent: { paddingHorizontal: 28, paddingBottom: 40 },
  helperText: { fontSize: 14, color: SUBTLE, textAlign: 'center', marginBottom: 4 },
  helperLink: {
    fontSize: 15,
    color: INK,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputWrapper: { marginBottom: 16 },
  label: { fontSize: 13, color: SUBTLE, marginBottom: 6 },
  input: {
    fontSize: 16,
    color: INK,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 14,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 14,
  },
  passwordInput: { flex: 1, backgroundColor: 'transparent' },
  toggleText: {
    color: EMERALD,
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
  },
  forgotText: {
    color: SUBTLE,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  errorText: {
    color: '#D70015',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: DARK,
    borderRadius: 30,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
