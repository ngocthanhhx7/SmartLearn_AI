import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { changePassword } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function ChangePasswordScreen({ navigation }) {
  const { theme } = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = async () => {
    if (!currentPassword || !newPassword) {
      return Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
    }
    if (newPassword.length < 6) {
      return Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự');
    }
    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      Alert.alert('Thành công', 'Đổi mật khẩu thành công!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Lỗi', err.response?.data?.error || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={[styles.backIcon, { color: theme.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>🔒 Đổi mật khẩu</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Mật khẩu hiện tại</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={theme.textMuted}
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Mật khẩu mới</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={theme.textMuted}
            value={newPassword}
            onChangeText={setNewPassword}
          />
        </View>

        <TouchableOpacity onPress={handleChange} disabled={loading} activeOpacity={0.8}>
          <LinearGradient colors={['#6C63FF', '#4834DF']} style={styles.submitBtn}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Xác nhận đổi</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Text style={[styles.securityNote, { color: theme.textMuted }]}>
        *Lưu ý: Bạn nên sử dụng mật khẩu mạnh bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt để bảo vệ tài khoản tốt hơn.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    marginBottom: 20,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backIcon: { fontSize: 24 },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  formContainer: { paddingHorizontal: 20 },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  submitBtn: {
    paddingVertical: 18,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  securityNote: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginHorizontal: 40,
    marginTop: 40,
    fontStyle: 'italic',
  },
});
