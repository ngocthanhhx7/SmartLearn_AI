import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

// Beautiful Custom Animated Theme Toggle syncing with global context
const ThemeToggle = () => {
  const { isDark, toggleTheme, theme } = useTheme();
  
  // Initialize animValue to 1 if dark, 0 if light initially
  const animValue = useRef(new Animated.Value(isDark ? 1 : 0)).current;

  // We only run the animation when isDark changes
  useEffect(() => {
    Animated.timing(animValue, {
      toValue: isDark ? 1 : 0,
      duration: 500,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();
  }, [isDark]);

  const sunTranslateY = animValue.interpolate({ inputRange: [0, 1], outputRange: [0, 30] });
  const sunOpacity = animValue.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  
  const moonTranslateY = animValue.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] });
  const moonOpacity = animValue.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  const bgColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5E7EB', '#2A2A4A'] // Light grey background for sun, dark for moon
  });

  return (
    <View style={styles.toggleContainer}>
      <Text style={[styles.toggleLabel, { color: theme.text }]}>Chế độ giao diện</Text>
      <TouchableOpacity activeOpacity={0.8} onPress={toggleTheme} style={styles.toggleBtnWrapper}>
        <Animated.View style={[styles.customToggle, { backgroundColor: bgColor, borderColor: theme.border }]}>
          <View style={styles.iconContainer}>
            <Animated.Text style={[styles.toggleIcon, { opacity: sunOpacity, transform: [{ translateY: sunTranslateY }] }]}>
              ☀️
            </Animated.Text>
            <Animated.Text style={[styles.toggleIcon, styles.moonIcon, { opacity: moonOpacity, transform: [{ translateY: moonTranslateY }] }]}>
              🌙
            </Animated.Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

export default function MoreScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const menuItems = [
    { id: 'Analytics', icon: '📊', title: 'Thống kê học tập', desc: 'Biểu đồ tiến độ chi tiết' },
    { id: 'Reminders', icon: '⏰', title: 'Nhắc nhở học tập', desc: 'Cài đặt giờ học hàng ngày' },
    { id: 'Stopwatch', icon: '⏱️', title: 'Đồng hồ bấm giờ', desc: 'Tập trung học tập Pomodoro' },
    { id: 'ChangePassword', icon: '🔒', title: 'Đổi mật khẩu', desc: 'Bảo mật tài khoản của bạn' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>⚙️ Thêm</Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.themeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ThemeToggle />
          <Text style={[styles.themeHint, { color: theme.textMuted }]}>*Lưu ý: Chế độ nền sáng đang tiếp tục được tối ưu hóa.</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Công cụ</Text>
        <View style={[styles.menuList, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                { borderBottomColor: theme.border },
                index === menuItems.length - 1 && { borderBottomWidth: 0 }
              ]}
              onPress={() => navigation.navigate(item.id)}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: theme.background }]}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={[styles.menuTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.menuDesc, { color: theme.textSecondary }]}>{item.desc}</Text>
              </View>
              <Text style={[styles.arrow, { color: theme.primary }]}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: '800' },
  content: { paddingHorizontal: 20 },
  themeCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  toggleContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleLabel: { fontSize: 16, fontWeight: '600' },
  toggleBtnWrapper: { borderRadius: 30, overflow: 'hidden' },
  customToggle: {
    width: 60,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  iconContainer: {
    width: 24, height: 24, overflow: 'hidden', justifyContent: 'center', alignItems: 'center'
  },
  toggleIcon: { fontSize: 16, position: 'absolute' },
  moonIcon: { color: '#6C63FF' },
  themeHint: { fontSize: 12, marginTop: 12, fontStyle: 'italic', lineHeight: 18 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  menuList: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuIcon: { fontSize: 20 },
  menuTextContainer: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  menuDesc: { fontSize: 13 },
  arrow: { fontSize: 24, paddingLeft: 10 },
});
