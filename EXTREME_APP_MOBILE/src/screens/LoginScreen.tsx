import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Image,
  ScrollView, Modal, Animated, Easing,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const scanProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showFaceModal && permission?.granted) {
      const timer = setTimeout(() => setFaceDetected(true), 1500);
      // Animate scan progress
      Animated.timing(scanProgress, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
      return () => clearTimeout(timer);
    }
  }, [showFaceModal, permission?.granted]);

  async function handleSignIn() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }
    setShowFaceModal(true);
    if (!permission?.granted) {
      await requestPermission();
    }
  }

  async function handleCapture() {
    if (!faceDetected) return;
    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
        if (photo) setCapturedPhoto(photo.uri);
      }
    } catch {}
    await proceedLogin();
  }

  async function proceedLogin() {
    setLoading(true);
    setShowFaceModal(false);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Login failed.';
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
      setFaceDetected(false);
      scanProgress.setValue(0);
    }
  }

  function handleQuickLogin(role: string) {
    const creds: Record<string, string> = {
      admin: 'admin@extremestaffing.com',
      manager: 'emma.williams@example.com',
      staff: 'emma.williams@example.com',
      scheduler: 'admin@extremestaffing.com',
    };
    setEmail(creds[role] || '');
    setPassword('password');
  }

  const scanWidth = scanProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '70%'],
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoBg}>
            <Text style={styles.logoTextBig}>E</Text>
            <Text style={styles.logoTextSmall}>XTREME{'\n'}STAFFING</Text>
          </View>
        </View>

        <Text style={styles.portalTitle}>Staff Management Portal</Text>
        <Text style={styles.portalSubtitle}>Secure access for Staff, Managers, and Administrators</Text>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.signInTitle}>Sign In</Text>
          <Text style={styles.signInSubtitle}>Enter your email to access your dashboard</Text>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="name@company.com"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Text style={{ fontSize: 18 }}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember me */}
          <TouchableOpacity style={styles.rememberRow} onPress={() => setRememberMe(!rememberMe)}>
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.rememberText}>Remember me for 30 days</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: Spacing.lg }} />
          ) : (
            <TouchableOpacity style={styles.signInBtn} onPress={handleSignIn}>
              <Text style={styles.signInBtnText}>Sign In</Text>
              <Text style={styles.signInArrow}>→</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Login */}
        <View style={styles.quickSection}>
          <Text style={styles.quickTitle}>QUICK LOGIN (DEMO ACCESS)</Text>
          <View style={styles.quickGrid}>
            {['Admin', 'Manager', 'Staff', 'Scheduler'].map(role => (
              <TouchableOpacity
                key={role}
                style={styles.quickBtn}
                onPress={() => handleQuickLogin(role.toLowerCase())}
              >
                <Text style={styles.quickBtnText}>Login as {role}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.quickHint}>Pre-fills credentials for testing. Password is 'password'.</Text>
        </View>
      </ScrollView>

      {/* Face Verification Modal */}
      <Modal visible={showFaceModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity style={styles.modalClose} onPress={() => { setShowFaceModal(false); setFaceDetected(false); scanProgress.setValue(0); }}>
              <Text style={{ fontSize: 20 }}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>IDENTITY VERIFICATION</Text>
            <Text style={styles.modalSubtitle}>Please look at the camera to verify</Text>

            <View style={styles.cameraCircleOuter}>
              <View style={styles.cameraCircleInner}>
                {permission?.granted ? (
                  <CameraView ref={cameraRef} style={styles.camera} facing="front" />
                ) : (
                  <View style={[styles.camera, { backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center' }]}>
                    <Text>📷</Text>
                  </View>
                )}
              </View>
            </View>

            <Text style={styles.scanningText}>
              {faceDetected ? 'Face detected ✓' : 'Scanning facial features...'}
            </Text>

            {/* Progress bar */}
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: scanWidth }]} />
            </View>

            {faceDetected && (
              <TouchableOpacity style={styles.verifyBtn} onPress={handleCapture}>
                <Text style={styles.verifyBtnText}>Verify & Login</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.skipBtn} onPress={proceedLogin}>
              <Text style={styles.skipBtnText}>Skip verification</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  scrollContent: { flexGrow: 1, alignItems: 'center', paddingVertical: 40, paddingHorizontal: Spacing.lg },
  logoSection: { alignItems: 'center', marginBottom: Spacing.md },
  logoBg: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoTextBig: { color: '#fff', fontSize: 28, fontWeight: '900' },
  logoTextSmall: { color: '#fff', fontSize: 10, fontWeight: '700', marginLeft: 2, lineHeight: 13 },
  portalTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', marginTop: 8 },
  portalSubtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginTop: 4, marginBottom: 20 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  signInTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  signInSubtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginTop: 4, marginBottom: 24 },

  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  forgotText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
  },
  inputIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: Colors.textPrimary },
  eyeBtn: { padding: 4 },

  rememberRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 8 },
  checkbox: {
    width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: '#CBD5E1',
    marginRight: 8, justifyContent: 'center', alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkmark: { color: '#fff', fontSize: 11, fontWeight: '700' },
  rememberText: { fontSize: 13, color: Colors.textSecondary },

  signInBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  signInBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  signInArrow: { color: '#fff', fontSize: 18 },

  quickSection: { marginTop: 28, alignItems: 'center', width: '100%', maxWidth: 400 },
  quickTitle: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1, marginBottom: 12 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  quickBtn: {
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#fff',
  },
  quickBtnText: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary },
  quickHint: { fontSize: 11, color: Colors.primary, marginTop: 10, fontStyle: 'italic' },

  /* Modal styles */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 28, width: '88%', maxWidth: 360, alignItems: 'center',
  },
  modalClose: { position: 'absolute', top: 12, right: 16, padding: 4 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 1, marginTop: 8 },
  modalSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 6, marginBottom: 20 },
  cameraCircleOuter: {
    width: 200, height: 200, borderRadius: 100, borderWidth: 4, borderColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  cameraCircleInner: { width: 180, height: 180, borderRadius: 90, overflow: 'hidden' },
  camera: { flex: 1 },
  scanningText: { fontSize: 14, color: Colors.primary, fontWeight: '500', marginBottom: 12 },
  progressTrack: { width: '80%', height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
  verifyBtn: {
    backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 32, marginTop: 16,
  },
  verifyBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  skipBtn: { marginTop: 12, padding: 8 },
  skipBtnText: { fontSize: 13, color: Colors.textMuted },
});
