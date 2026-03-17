import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Image, Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Nam', icon: '👨' },
  { value: 'female', label: 'Nữ', icon: '👩' },
  { value: 'other', label: 'Khác', icon: '🧑' },
];

export default function EditProfileScreen({ navigation }) {
  const { theme } = useTheme();
  const { user, updateUser } = useAuth();

  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [dateOfBirth, setDateOfBirth] = useState(
    user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') : ''
  );
  const [gender, setGender] = useState(user?.gender || '');
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh để chọn avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setAvatar(base64);
    }
  };

  const parseDateVN = (str) => {
    const parts = str.split('/');
    if (parts.length !== 3) return null;
    const [d, m, y] = parts.map(Number);
    if (!d || !m || !y || d > 31 || m > 12) return null;
    return new Date(y, m - 1, d);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = { username, avatar, gender };

      if (dateOfBirth.trim()) {
        const parsed = parseDateVN(dateOfBirth);
        if (!parsed) {
          Alert.alert('Lỗi', 'Ngày sinh không hợp lệ. Định dạng: dd/mm/yyyy');
          setSaving(false);
          return;
        }
        data.dateOfBirth = parsed.toISOString();
      } else {
        data.dateOfBirth = null;
      }

      await updateUser(data);
      Alert.alert('Thành công', 'Thông tin đã được cập nhật!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', 'Không thể cập nhật. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={[styles.backIcon, { color: theme.text }]}>←</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Chỉnh sửa hồ sơ</Text>
            <View style={{ width: 32 }} />
          </View>

          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
              <View style={[styles.avatarCircle, { backgroundColor: theme.primaryLight }]}>
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.avatarImage} />
                ) : (
                  <Text style={{ fontSize: 40 }}>👤</Text>
                )}
              </View>
              <View style={[styles.cameraBadge, { backgroundColor: theme.primary }]}>
                <Text style={{ fontSize: 14, color: '#FFF' }}>📷</Text>
              </View>
            </TouchableOpacity>
            <Text style={[styles.avatarHint, { color: theme.textMuted }]}>Nhấn để thay đổi ảnh đại diện</Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            {/* Username */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Tên hiển thị</Text>
              <View style={[styles.inputWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Nhập tên của bạn"
                  placeholderTextColor={theme.textMuted}
                />
              </View>
            </View>

            {/* Email (readonly) */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Email</Text>
              <View style={[styles.inputWrap, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
                <Text style={styles.inputIcon}>📧</Text>
                <TextInput
                  style={[styles.input, { color: theme.textMuted }]}
                  value={user?.email || ''}
                  editable={false}
                />
              </View>
            </View>

            {/* Date of Birth */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Ngày sinh</Text>
              <View style={[styles.inputWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={styles.inputIcon}>🎂</Text>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={dateOfBirth}
                  onChangeText={setDateOfBirth}
                  placeholder="dd/mm/yyyy"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Gender */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Giới tính</Text>
              <View style={styles.genderRow}>
                {GENDER_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.genderBtn,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                      gender === opt.value && {
                        backgroundColor: theme.primaryLight,
                        borderColor: theme.primary,
                      },
                    ]}
                    onPress={() => setGender(opt.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 18, marginBottom: 4 }}>{opt.icon}</Text>
                    <Text style={[
                      styles.genderLabel,
                      { color: theme.textSecondary },
                      gender === opt.value && { color: theme.primary, fontWeight: '700' },
                    ]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.btnSection}>
            <TouchableOpacity onPress={handleSave} disabled={saving} activeOpacity={0.85}>
              <LinearGradient
                colors={[theme.headerGradientStart, theme.headerGradientEnd]}
                style={styles.saveBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {saving ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.saveBtnText}>💾 Lưu thay đổi</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 22, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '800' },

  avatarSection: { alignItems: 'center', marginVertical: 24 },
  avatarCircle: {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  cameraBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#FFF',
  },
  avatarHint: { fontSize: 13, marginTop: 10 },

  formSection: { paddingHorizontal: 20, gap: 20 },
  fieldGroup: {},
  fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, height: 52,
  },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, fontSize: 15 },

  genderRow: { flexDirection: 'row', gap: 12 },
  genderBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 16,
    borderRadius: 16, borderWidth: 1.5,
  },
  genderLabel: { fontSize: 13 },

  btnSection: { paddingHorizontal: 20, marginTop: 32 },
  saveBtn: {
    height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center',
  },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
