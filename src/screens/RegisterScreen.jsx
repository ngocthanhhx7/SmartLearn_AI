import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = '299962616218-75ac1bfrqacan584hkinl611qa6ail96.apps.googleusercontent.com';

const LEVELS = [
  { key: 'beginner', label: 'Cơ bản' },
  { key: 'intermediate', label: 'Trung bình' },
  { key: 'advanced', label: 'Nâng cao' },
];

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [level, setLevel] = useState('beginner');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const { theme } = useTheme();

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: '299962616218-placeholder-ios.apps.googleusercontent.com',
    androidClientId: '299962616218-placeholder-android.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleResponse(response.authentication);
    }
  }, [response]);

  const handleGoogleResponse = async (authentication) => {
    if (!authentication?.accessToken) return;
    setGoogleLoading(true);
    try {
      const userInfoRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${authentication.accessToken}` },
      });
      const userInfo = await userInfoRes.json();

      await googleLogin({
        email: userInfo.email,
        name: userInfo.name,
        avatar: userInfo.picture,
        googleId: userInfo.id,
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', 'Đăng ký Google thất bại. Vui lòng thử lại.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      return Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
    }
    if (password !== confirmPassword) {
      return Alert.alert('Lỗi', 'Mật khẩu không khớp');
    }
    if (password.length < 6) {
      return Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
    }
    setLoading(true);
    try {
      await register(email.trim().toLowerCase(), password, level);
    } catch (err) {
      Alert.alert('Đăng ký thất bại', err.response?.data?.error || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Image style={styles.logo} source={require('../../assets/icon.png')} />
            <Text style={[styles.title, { color: theme.text }]}>Tạo tài khoản</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Bắt đầu hành trình học tập của bạn</Text>
          </View>

          <View style={styles.form}>
            {[
              { icon: '📧', val: email, set: setEmail, ph: 'Địa chỉ email', type: 'email-address', secure: false },
              { icon: '🔒', val: password, set: setPassword, ph: 'Mật khẩu', type: 'default', secure: true },
              { icon: '🔐', val: confirmPassword, set: setConfirmPassword, ph: 'Xác nhận mật khẩu', type: 'default', secure: true },
            ].map((field, i) => (
              <View key={i} style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={styles.inputIcon}>{field.icon}</Text>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder={field.ph}
                  placeholderTextColor={theme.textMuted}
                  value={field.val}
                  onChangeText={field.set}
                  keyboardType={field.type}
                  autoCapitalize="none"
                  secureTextEntry={field.secure}
                />
              </View>
            ))}

            <Text style={[styles.label, { color: theme.textSecondary }]}>Trình độ học tập</Text>
            <View style={styles.levelRow}>
              {LEVELS.map((l) => (
                <TouchableOpacity
                  key={l.key}
                  style={[
                    styles.levelBtn,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    level === l.key && { backgroundColor: theme.primaryLight, borderColor: theme.primary },
                  ]}
                  onPress={() => setLevel(l.key)}
                >
                  <Text style={[styles.levelText, { color: theme.textSecondary }, level === l.key && { color: theme.primary }]}>
                    {l.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.8}>
              <LinearGradient colors={[theme.primary, theme.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.button}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Tạo tài khoản</Text>}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              <Text style={[styles.dividerText, { color: theme.textMuted }]}>hoặc</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            </View>

            {/* Google Button */}
            <TouchableOpacity
              style={[styles.googleBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => promptAsync()}
              disabled={!request || googleLoading}
              activeOpacity={0.8}
            >
              {googleLoading ? (
                <ActivityIndicator color={theme.primary} />
              ) : (
                <>
                  <Image
                    source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
                    style={styles.googleIcon}
                  />
                  <Text style={[styles.googleText, { color: theme.text }]}>Đăng ký với Google</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.link}>
              <Text style={[styles.linkText, { color: theme.textSecondary }]}>
                Đã có tài khoản? <Text style={{ color: theme.primary, fontWeight: '700' }}>Đăng nhập</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 30, paddingVertical: 50 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 80, height: 80, marginBottom: 12, resizeMode: 'contain' },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: 1 },
  subtitle: { fontSize: 14, marginTop: 6 },
  form: { gap: 14 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, height: 56,
  },
  inputIcon: { fontSize: 18, marginRight: 12 },
  input: { flex: 1, fontSize: 16 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  levelRow: { flexDirection: 'row', gap: 10 },
  levelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  levelText: { fontSize: 13, fontWeight: '600' },
  button: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 16, fontSize: 13, fontWeight: '500' },

  googleBtn: {
    height: 56, borderRadius: 16, borderWidth: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  googleIcon: { width: 22, height: 22 },
  googleText: { fontSize: 16, fontWeight: '600' },

  link: { alignItems: 'center', marginTop: 4 },
  linkText: { fontSize: 14 },
});
