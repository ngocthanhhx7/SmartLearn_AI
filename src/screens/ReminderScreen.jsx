import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Switch, Alert, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useTheme } from '../context/ThemeContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function ReminderScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const [enabled, setEnabled] = useState(false);
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [scheduled, setScheduled] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    if (!Device.isDevice) return;
    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'granted') setEnabled(true);
  };

  const requestPermissions = async () => {
    if (!Device.isDevice) {
      Alert.alert('Thông báo', 'Thông báo đẩy cần thiết bị thật');
      return false;
    }
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  };

  const toggleReminder = async (value) => {
    if (value) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert('Cần quyền truy cập', 'Vui lòng bật thông báo trong Cài đặt');
        return;
      }
      setEnabled(true);
      await scheduleReminder();
    } else {
      setEnabled(false);
      await Notifications.cancelAllScheduledNotificationsAsync();
      setScheduled(false);
    }
  };

  const scheduleReminder = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📚 Đến giờ học rồi!',
        body: 'Hãy tiếp tục hành trình học tập trên SmartLearn AI nhé!',
        sound: true,
      },
      trigger: {
        type: 'daily',
        hour,
        minute,
      },
    });

    setScheduled(true);
    Alert.alert('✅ Đã đặt nhắc nhở', `Nhắc nhở hàng ngày lúc ${formatTime(hour, minute)}`);
  };

  const adjustTime = (field, delta) => {
    if (field === 'hour') setHour((prev) => (prev + delta + 24) % 24);
    else setMinute((prev) => (prev + delta + 60) % 60);
  };

  const formatTime = (h, m) => {
    const period = h >= 12 ? 'CH' : 'SA';
    const displayH = h % 12 || 12;
    return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>⏰ Nhắc lịch học</Text>
        <Text style={[styles.headerSub, { color: theme.textSecondary }]}>Không bỏ lỡ mục tiêu học tập hàng ngày</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Analytics')} style={[styles.analyticsBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.analyticsText, { color: theme.primary }]}>📊 Thống kê</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.toggleRow}>
          <View>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Nhắc nhở hàng ngày</Text>
            <Text style={[styles.cardSub, { color: theme.textSecondary }]}>Nhận thông báo nhắc học mỗi ngày</Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={toggleReminder}
            trackColor={{ false: theme.border, true: theme.primary + '66' }}
            thumbColor={enabled ? theme.primary : (isDark ? '#555' : '#E5E7EB')}
          />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>🕐 Giờ học</Text>
        <View style={styles.timeContainer}>
          <View style={styles.timeColumn}>
            <TouchableOpacity onPress={() => adjustTime('hour', 1)} style={styles.timeBtn}>
              <Text style={[styles.timeBtnText, { color: theme.primary }]}>▲</Text>
            </TouchableOpacity>
            <Text style={[styles.timeDigit, { color: theme.text }]}>{(hour % 12 || 12).toString().padStart(2, '0')}</Text>
            <TouchableOpacity onPress={() => adjustTime('hour', -1)} style={styles.timeBtn}>
              <Text style={[styles.timeBtnText, { color: theme.primary }]}>▼</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.timeSep, { color: theme.primary }]}>:</Text>

          <View style={styles.timeColumn}>
            <TouchableOpacity onPress={() => adjustTime('minute', 5)} style={styles.timeBtn}>
              <Text style={[styles.timeBtnText, { color: theme.primary }]}>▲</Text>
            </TouchableOpacity>
            <Text style={[styles.timeDigit, { color: theme.text }]}>{minute.toString().padStart(2, '0')}</Text>
            <TouchableOpacity onPress={() => adjustTime('minute', -5)} style={styles.timeBtn}>
              <Text style={[styles.timeBtnText, { color: theme.primary }]}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timeColumn}>
            <TouchableOpacity onPress={() => setHour((prev) => (prev + 12) % 24)} style={[styles.periodBtn, { backgroundColor: theme.primaryLight }]}>
              <Text style={[styles.periodText, { color: theme.primary }]}>{hour >= 12 ? 'CH' : 'SA'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {enabled && (
        <TouchableOpacity onPress={scheduleReminder} activeOpacity={0.8} style={{ paddingHorizontal: 20 }}>
          <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>💾 Lưu nhắc nhở</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {scheduled && (
        <View style={[styles.statusCard, { backgroundColor: theme.accentLight, borderColor: theme.accent }]}>
          <Text style={styles.statusIcon}>✅</Text>
          <View>
            <Text style={[styles.statusTitle, { color: theme.accent }]}>Nhắc nhở đang hoạt động</Text>
            <Text style={[styles.statusTime, { color: theme.textSecondary }]}>Hàng ngày lúc {formatTime(hour, minute)}</Text>
          </View>
        </View>
      )}

      <View style={[styles.card, { marginTop: 20, backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.infoTitle, { color: theme.text }]}>💡 Mẹo học tập</Text>
        <Text style={[styles.infoText, { color: theme.textSecondary }]}>• Kiên trì là chìa khóa - học mỗi ngày một ít</Text>
        <Text style={[styles.infoText, { color: theme.textSecondary }]}>• Buổi sáng là thời điểm học hiệu quả nhất</Text>
        <Text style={[styles.infoText, { color: theme.textSecondary }]}>• Nghỉ giải lao sau mỗi 25 phút (Pomodoro)</Text>
        <Text style={[styles.infoText, { color: theme.textSecondary }]}>• Ôn lại bài kiểm tra để củng cố kiến thức</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: '800' },
  headerSub: { fontSize: 13, marginTop: 6 },
  analyticsBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, alignSelf: 'flex-start', marginTop: 12, borderWidth: 1 },
  analyticsText: { fontWeight: '700', fontSize: 14 },
  card: {
    marginHorizontal: 20, borderRadius: 16, padding: 20,
    marginBottom: 16, borderWidth: 1,
  },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardSub: { fontSize: 13, marginTop: 4 },
  timeContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, gap: 10 },
  timeColumn: { alignItems: 'center' },
  timeBtn: { padding: 10 },
  timeBtnText: { fontSize: 20, fontWeight: '700' },
  timeDigit: { fontSize: 42, fontWeight: '800', width: 70, textAlign: 'center' },
  timeSep: { fontSize: 42, fontWeight: '800', marginBottom: 10 },
  periodBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
  periodText: { fontSize: 18, fontWeight: '800' },
  saveBtn: { height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  statusCard: {
    flexDirection: 'row', alignItems: 'center', margin: 20,
    borderRadius: 14, padding: 16, borderWidth: 1, gap: 12,
  },
  statusIcon: { fontSize: 28 },
  statusTitle: { fontSize: 15, fontWeight: '700' },
  statusTime: { fontSize: 13, marginTop: 2 },
  infoTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  infoText: { fontSize: 13, lineHeight: 22 },
});
