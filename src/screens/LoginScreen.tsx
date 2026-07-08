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
  Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const EMERALD = '#0F9D58'; // emerald green
const EMERALD_DARK = '#0C7C46';
const INK = '#1C1C1E'; // near-black, Apple-style text color
const SUBTLE = '#8E8E93'; // Apple-style secondary gray

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
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Replace with your actual MuslimEdu app icon asset */}
        <Image
          source={require('../assets/images/app-icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>MuslimEdu</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <View style={styles.form}>
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
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="••••••••"
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 48,
  },
  logo: {
    width: 72,
    height: 72,
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: INK,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: SUBTLE,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 36,
  },
  form: { width: '100%' },
  inputWrapper: { marginBottom: 20 },
  label: {
    fontSize: 13,
    color: SUBTLE,
    marginBottom: 6,
  },
  input: {
    fontSize: 16,
    color: INK,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F2F2F7', // Apple-style light gray field
    borderRadius: 12,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  toggleText: {
    color: EMERALD,
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
  },
  errorText: {
    color: '#D70015',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: EMERALD,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    backgroundColor: EMERALD_DARK,
    opacity: 0.4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
