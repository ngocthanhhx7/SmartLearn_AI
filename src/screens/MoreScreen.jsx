import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function MoreScreen() {
  const navigation = useNavigation();
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const toolItems = [
    { id: 'Analytics', icon: '📊', title: 'Thống kê học tập', desc: 'Xem tiến độ tuần này', color: '#F26B3A' },
    { id: 'Reminders', icon: '⏰', title: 'Nhắc nhở', desc: 'Lịch học hàng ngày', color: '#4A6BF5' },
    { id: 'Stopwatch', icon: '🍅', title: 'Pomodoro', desc: 'Tập trung hiệu quả', color: '#F26B3A' },
    { id: 'ChangePassword', icon: '🔒', title: 'Mật khẩu', desc: 'Thay đổi định kỳ', color: '#4A6BF5' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Thêm</Text>
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.surface }]}>
          <View style={styles.profileRow}>
            <View style={[styles.avatar, { backgroundColor: theme.primaryLight }]}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarText}>👤</Text>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.text }]}>{user?.username || user?.name || 'Người dùng'}</Text>
              <Text style={[styles.profileSub, { color: theme.textSecondary }]}>
                {user?.email || 'Học viên'}
              </Text>
              <View style={[styles.proBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.proBadgeText}>PRO PLAN</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.editBtn, { backgroundColor: theme.surfaceAlt }]}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Text style={{ fontSize: 14 }}>✏️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Section */}
        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>CÀI ĐẶT HỆ THỐNG</Text>
        <View style={[styles.settingsCard, { backgroundColor: theme.surface }]}>
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: '#FFF0EB' }]}>
              <Text style={{ fontSize: 16 }}>🌓</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>Chế độ giao diện</Text>
              <Text style={[styles.settingDesc, { color: theme.textMuted }]}>Chuyển đổi sáng và tối</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#E8E8EE', true: '#F26B3A' }}
              thumbColor="#FFF"
            />
          </View>

          <View style={[styles.settingDivider, { backgroundColor: theme.border }]} />

          <TouchableOpacity style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: '#E8F0FF' }]}>
              <Text style={{ fontSize: 16 }}>🌍</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>Ngôn ngữ</Text>
              <Text style={[styles.settingDesc, { color: theme.textMuted }]}>Tiếng Việt (VN)</Text>
            </View>
            <Text style={[styles.arrow, { color: theme.textMuted }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Tools Section */}
        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>CÔNG CỤ & TIỆN ÍCH</Text>
        <View style={styles.toolsGrid}>
          {toolItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.toolCard, { backgroundColor: theme.surface }]}
              onPress={() => navigation.navigate(item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.toolIcon, { backgroundColor: item.color + '15' }]}>
                <Text style={{ fontSize: 20 }}>{item.icon}</Text>
              </View>
              <Text style={[styles.toolTitle, { color: theme.text }]}>{item.title}</Text>
              <Text style={[styles.toolDesc, { color: theme.textMuted }]}>{item.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Support Banner */}
        <View style={[styles.supportBanner, { backgroundColor: theme.primaryLight }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.supportTitle, { color: theme.primary }]}>Trung tâm hỗ trợ</Text>
            <Text style={[styles.supportDesc, { color: theme.textSecondary }]}>Bạn cần giúp đỡ?</Text>
          </View>
          <TouchableOpacity style={[styles.supportBtn, { backgroundColor: theme.primary }]}>
            <Text style={styles.supportBtnText}>Liên hệ</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity onPress={logout} style={[styles.logoutBtn, { borderColor: theme.border }]}>
          <Text style={{ fontSize: 16 }}>🚪</Text>
          <Text style={[styles.logoutText, { color: theme.destructive }]}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: '800' },

  profileCard: {
    marginHorizontal: 20, borderRadius: 18, padding: 20, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 24 },
  avatarImg: { width: 56, height: 56, borderRadius: 28 },
  profileInfo: { flex: 1, marginLeft: 14 },
  profileName: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
  profileSub: { fontSize: 13, marginBottom: 6 },
  proBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  proBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  editBtn: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },

  sectionLabel: {
    fontSize: 12, fontWeight: '700', letterSpacing: 1,
    paddingHorizontal: 20, marginBottom: 12,
  },

  settingsCard: {
    marginHorizontal: 20, borderRadius: 18, padding: 6, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12,
  },
  settingIcon: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  settingTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  settingDesc: { fontSize: 12 },
  settingDivider: { height: 1, marginHorizontal: 14 },
  arrow: { fontSize: 24, fontWeight: '300' },

  toolsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, marginBottom: 24,
  },
  toolCard: {
    width: '46%', margin: '2%', borderRadius: 18, padding: 18,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  toolIcon: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  toolTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  toolDesc: { fontSize: 11, textAlign: 'center' },

  supportBanner: {
    marginHorizontal: 20, borderRadius: 16, padding: 18,
    flexDirection: 'row', alignItems: 'center', marginBottom: 20,
  },
  supportTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  supportDesc: { fontSize: 12 },
  supportBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  supportBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },

  logoutBtn: {
    marginHorizontal: 20, borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1,
  },
  logoutText: { fontSize: 15, fontWeight: '700' },
});
