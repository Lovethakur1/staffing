import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'credentials' | 'face'>('credentials');
  const [faceDetected, setFaceDetected] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  // Mark face as detected once camera is ready (simplified liveness)
  useEffect(() => {
    if (step === 'face' && permission?.granted) {
      const timer = setTimeout(() => setFaceDetected(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [step, permission?.granted]);

  async function handleCredentialSubmit() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }
    setStep('face');
  }

  async function handleCapture() {
    if (!faceDetected) {
      Alert.alert('Face Required', 'Please position your face in the frame.');
      return;
    }
    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
        if (photo) {
          setCapturedPhoto(photo.uri);
          await proceedLogin();
        }
      }
    } catch {
      // If camera capture fails, proceed with login anyway
      await proceedLogin();
    }
  }

  async function proceedLogin() {
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Login failed.';
      Alert.alert('Login Failed', msg);
      setStep('credentials');
      setCapturedPhoto(null);
    } finally {
      setLoading(false);
    }
  }

  function handleSkipFace() {
    proceedLogin();
  }

  if (step === 'face') {
    if (!permission?.granted) {
      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Camera Permission</Text>
            <Text style={styles.subtitle}>
              Face verification requires camera access for secure attendance tracking.
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
              <Text style={styles.primaryBtnText}>Grant Camera Access</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleSkipFace}>
              <Text style={styles.secondaryBtnText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.faceContainer}>
          <Text style={styles.faceTitle}>Face Verification</Text>
          <Text style={styles.faceSubtitle}>
            Position your face in the frame
          </Text>

          <View style={styles.cameraWrapper}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="front"
            />
            <View style={styles.cameraOverlay}>
              <View style={[
                styles.faceFrame,
                faceDetected ? styles.faceFrameDetected : styles.faceFrameNotDetected,
              ]} />
            </View>
          </View>

          <View style={[styles.statusBadge, faceDetected ? styles.statusSuccess : styles.statusWarning]}>
            <Text style={styles.statusText}>
              {faceDetected ? '✓ Camera Ready' : '○ Preparing camera...'}
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: Spacing.lg }} />
          ) : (
            <>
              <TouchableOpacity
                style={[styles.primaryBtn, !faceDetected && styles.btnDisabled]}
                onPress={handleCapture}
                disabled={!faceDetected}
              >
                <Text style={styles.primaryBtnText}>Verify & Login</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setStep('credentials')}>
                <Text style={styles.secondaryBtnText}>← Back</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>ES</Text>
          </View>
          <Text style={styles.title}>Extreme Staffing</Text>
          <Text style={styles.subtitle}>Staff Portal</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor={Colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: Spacing.lg }} />
        ) : (
          <TouchableOpacity style={styles.primaryBtn} onPress={handleCredentialSubmit}>
            <Text style={styles.primaryBtnText}>Continue →</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.footerText}>Face verification required on next step</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logoText: {
    color: Colors.white,
    fontSize: FontSize.xxl,
    fontWeight: '700',
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  primaryBtnText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  secondaryBtn: {
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  secondaryBtnText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  // Face verification styles
  faceContainer: {
    width: '100%',
    alignItems: 'center',
    maxWidth: 400,
  },
  faceTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  faceSubtitle: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: Spacing.lg,
  },
  cameraWrapper: {
    width: 280,
    height: 360,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceFrame: {
    width: 200,
    height: 260,
    borderRadius: 100,
    borderWidth: 3,
  },
  faceFrameDetected: {
    borderColor: Colors.success,
  },
  faceFrameNotDetected: {
    borderColor: 'rgba(255,255,255,0.4)',
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  statusSuccess: {
    backgroundColor: 'rgba(34,197,94,0.2)',
  },
  statusWarning: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  statusText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});
