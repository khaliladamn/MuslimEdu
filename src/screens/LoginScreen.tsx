import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import GlowAvatar from '../components/GlowAvatar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');

const INK = '#1C1C1E';
const SUBTLE_LIGHT = 'rgba(255,255,255,0.75)';

const WAVE_HEIGHT = 70;
const COLLAPSED_CARD_HEIGHT = SCREEN_HEIGHT * 0.52;
const COLLAPSED_TOP = SCREEN_HEIGHT - COLLAPSED_CARD_HEIGHT;

export default function LoginScreen() {
  const { login, isSubmitting, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [focusCount, setFocusCount] = useState(0);

  const passwordRef = useRef<TextInput>(null);
  const anim = useRef(new Animated.Value(0)).current;

  const animatedTop = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLLAPSED_TOP, 0],
  });

  const expand = () => {
    setFocusCount((c) => c + 1);
    Animated.timing(anim, { toValue: 1, duration: 320, useNativeDriver: false }).start();
  };

  const collapseIfUnfocused = () => {
    setFocusCount((c) => {
      const next = Math.max(0, c - 1);
      if (next === 0) {
        Animated.timing(anim, { toValue: 0, duration: 320, useNativeDriver: false }).start();
      }
      return next;
    });
  };

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await login(email.trim(), password);
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.flex}>
        <StatusBar hidden />

        {/* Floating character avatars + heading */}
        <View style={styles.topContent}>
          <View style={styles.avatarCluster}>
            <GlowAvatar
              source={require('../assets/images/avatar-3.png')}
              glowColor="#7FD9C8"
              size={70}
              style={styles.avatarTopRight}
            />
            <GlowAvatar
              source={require('../assets/images/avatar-1.png')}
              glowColor="#F4B6C2"
              size={82}
              style={styles.avatarLeft}
            />
            <GlowAvatar
              source={require('../assets/images/avatar-2.png')}
              glowColor="#A9E4A0"
              size={74}
              style={styles.avatarBottom}
            />
            <View style={styles.speechBubble}>
              <Text style={styles.speechText}>Salam!</Text>
            </View>
          </View>

          <Text style={styles.heading}>Let's get you{'\n'}signed in!</Text>
        </View>

        {/* Animated card - gradient matching the app logo, expands to cover the whole screen on focus */}
        <Animated.View style={[styles.card, { top: animatedTop }]}>
          <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT} style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="cardGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#4CAF50" />
                <Stop offset="0.55" stopColor="#2E8B74" />
                <Stop offset="1" stopColor="#2C5364" />
              </LinearGradient>
            </Defs>
            <Path
              fill="url(#cardGradient)"
              d={`M0 ${WAVE_HEIGHT} L0 ${SCREEN_HEIGHT} L${SCREEN_WIDTH} ${SCREEN_HEIGHT} L${SCREEN_WIDTH} 40 Q ${SCREEN_WIDTH * 0.5} -30 0 40 Z`}
            />
          </Svg>
          <View style={styles.glassOverlay} pointerEvents="none" />

          <View style={styles.cardBody}>
            {/* Centered form content - fills whatever height the card currently has,
                whether collapsed (half screen) or expanded (full screen) */}
            <View style={styles.formCenter}>
              <Text style={styles.helperText}>Accounts are created by your school admin.</Text>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={SUBTLE_LIGHT}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  returnKeyType="next"
                  value={email}
                  onFocus={expand}
                  onBlur={collapseIfUnfocused}
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) clearError();
                  }}
                />
              </View>

              <View style={styles.inputWrapper}>
                <View style={styles.passwordRow}>
                  <TextInput
                    ref={passwordRef}
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Password"
                    placeholderTextColor={SUBTLE_LIGHT}
                    secureTextEntry={secure}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    value={password}
                    onFocus={expand}
                    onBlur={collapseIfUnfocused}
                    onSubmitEditing={() => Keyboard.dismiss()}
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
                  <ActivityIndicator color="#2C5364" />
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFFFFF' },
  topContent: {
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  avatarCluster: { height: 150, marginBottom: 6 },
  avatarLeft: { position: 'absolute', left: 6, top: 12 },
  avatarTopRight: { position: 'absolute', right: 16, top: 0 },
  avatarBottom: { position: 'absolute', left: 76, top: 70 },
  speechBubble: {
    position: 'absolute',
    left: 110,
    top: 48,
    backgroundColor: 'rgba(44,83,100,0.85)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
  },
  speechText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  heading: { color: INK, fontSize: 26, fontWeight: '700', lineHeight: 32 },

  card: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#2C5364',
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  cardBody: {
    flex: 1,
    paddingTop: WAVE_HEIGHT + 10,
    paddingBottom: 20,
  },
  formCenter: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 26,
  },
  helperText: { fontSize: 13, color: SUBTLE_LIGHT, textAlign: 'center', marginBottom: 18 },
  inputWrapper: { marginBottom: 14 },
  input: {
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 13,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  passwordInput: { flex: 1, backgroundColor: 'transparent', borderWidth: 0 },
  toggleText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', paddingHorizontal: 16 },
  forgotText: { color: SUBTLE_LIGHT, fontSize: 13, textAlign: 'center', marginTop: 2, marginBottom: 16 },
  errorText: { color: '#FFE0E0', fontSize: 14, marginBottom: 12, textAlign: 'center' },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#2C5364', fontSize: 16, fontWeight: '700' },
});
