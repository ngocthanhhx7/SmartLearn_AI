import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

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
  const { register } = useAuth();

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
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.logo}>🧠</Text>
            <Text style={styles.title}>Tạo tài khoản</Text>
            <Text style={styles.subtitle}>Bắt đầu hành trình học tập của bạn</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>📧</Text>
              <TextInput
                style={styles.input}
                placeholder="Địa chỉ email"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>🔐</Text>
              <TextInput
                style={styles.input}
                placeholder="Xác nhận mật khẩu"
                placeholderTextColor="#666"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <Text style={styles.label}>Trình độ học tập</Text>
            <View style={styles.levelRow}>
              {LEVELS.map((l) => (
                <TouchableOpacity
                  key={l.key}
                  style={[styles.levelBtn, level === l.key && styles.levelBtnActive]}
                  onPress={() => setLevel(l.key)}
                >
                  <Text style={[styles.levelText, level === l.key && styles.levelTextActive]}>
                    {l.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.8}>
              <LinearGradient
                colors={['#6C63FF', '#4834DF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>Tạo tài khoản</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.link}>
              <Text style={styles.linkText}>
                Đã có tài khoản? <Text style={styles.linkBold}>Đăng nhập</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F23' },
  inner: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 30, paddingVertical: 50 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 56, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: '#FFF', letterSpacing: 1 },
  subtitle: { fontSize: 14, color: '#8E8EAA', marginTop: 6 },
  form: { gap: 14 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A2E',
    borderRadius: 16, borderWidth: 1, borderColor: '#2A2A4A', paddingHorizontal: 16, height: 56,
  },
  inputIcon: { fontSize: 18, marginRight: 12 },
  input: { flex: 1, color: '#FFF', fontSize: 16 },
  label: { color: '#8E8EAA', fontSize: 14, fontWeight: '600', marginTop: 4 },
  levelRow: { flexDirection: 'row', gap: 10 },
  levelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#1A1A2E',
    borderWidth: 1, borderColor: '#2A2A4A', alignItems: 'center',
  },
  levelBtnActive: { backgroundColor: '#6C63FF22', borderColor: '#6C63FF' },
  levelText: { color: '#8E8EAA', fontSize: 13, fontWeight: '600' },
  levelTextActive: { color: '#6C63FF' },
  button: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  link: { alignItems: 'center', marginTop: 16 },
  linkText: { color: '#8E8EAA', fontSize: 14 },
  linkBold: { color: '#6C63FF', fontWeight: '700' },
});
