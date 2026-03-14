import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Switch, Alert, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function ReminderScreen({ navigation }) {
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⏰ Nhắc lịch học</Text>
        <Text style={styles.headerSub}>Không bỏ lỡ mục tiêu học tập hàng ngày</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Analytics')} style={styles.analyticsBtn}>
          <Text style={styles.analyticsText}>📊 Thống kê</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.cardTitle}>Nhắc nhở hàng ngày</Text>
            <Text style={styles.cardSub}>Nhận thông báo nhắc học mỗi ngày</Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={toggleReminder}
            trackColor={{ false: '#2A2A4A', true: '#6C63FF66' }}
            thumbColor={enabled ? '#6C63FF' : '#555'}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🕐 Giờ học</Text>
        <View style={styles.timeContainer}>
          <View style={styles.timeColumn}>
            <TouchableOpacity onPress={() => adjustTime('hour', 1)} style={styles.timeBtn}>
              <Text style={styles.timeBtnText}>▲</Text>
            </TouchableOpacity>
            <Text style={styles.timeDigit}>{(hour % 12 || 12).toString().padStart(2, '0')}</Text>
            <TouchableOpacity onPress={() => adjustTime('hour', -1)} style={styles.timeBtn}>
              <Text style={styles.timeBtnText}>▼</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.timeSep}>:</Text>

          <View style={styles.timeColumn}>
            <TouchableOpacity onPress={() => adjustTime('minute', 5)} style={styles.timeBtn}>
              <Text style={styles.timeBtnText}>▲</Text>
            </TouchableOpacity>
            <Text style={styles.timeDigit}>{minute.toString().padStart(2, '0')}</Text>
            <TouchableOpacity onPress={() => adjustTime('minute', -5)} style={styles.timeBtn}>
              <Text style={styles.timeBtnText}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timeColumn}>
            <TouchableOpacity onPress={() => setHour((prev) => (prev + 12) % 24)} style={styles.periodBtn}>
              <Text style={styles.periodText}>{hour >= 12 ? 'CH' : 'SA'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {enabled && (
        <TouchableOpacity onPress={scheduleReminder} activeOpacity={0.8} style={{ paddingHorizontal: 20 }}>
          <LinearGradient colors={['#6C63FF', '#4834DF']} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>💾 Lưu nhắc nhở</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {scheduled && (
        <View style={styles.statusCard}>
          <Text style={styles.statusIcon}>✅</Text>
          <View>
            <Text style={styles.statusTitle}>Nhắc nhở đang hoạt động</Text>
            <Text style={styles.statusTime}>Hàng ngày lúc {formatTime(hour, minute)}</Text>
          </View>
        </View>
      )}

      <View style={[styles.card, { marginTop: 20 }]}>
        <Text style={styles.infoTitle}>💡 Mẹo học tập</Text>
        <Text style={styles.infoText}>• Kiên trì là chìa khóa - học mỗi ngày một ít</Text>
        <Text style={styles.infoText}>• Buổi sáng là thời điểm học hiệu quả nhất</Text>
        <Text style={styles.infoText}>• Nghỉ giải lao sau mỗi 25 phút (Pomodoro)</Text>
        <Text style={styles.infoText}>• Ôn lại bài kiểm tra để củng cố kiến thức</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F23' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 13, color: '#8E8EAA', marginTop: 6 },
  analyticsBtn: { backgroundColor: '#1A1A2E', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, alignSelf: 'flex-start', marginTop: 12, borderWidth: 1, borderColor: '#2A2A4A' },
  analyticsText: { color: '#6C63FF', fontWeight: '700', fontSize: 14 },
  card: {
    backgroundColor: '#1A1A2E', marginHorizontal: 20, borderRadius: 16, padding: 20,
    marginBottom: 16, borderWidth: 1, borderColor: '#2A2A4A',
  },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  cardSub: { color: '#8E8EAA', fontSize: 13, marginTop: 4 },
  timeContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, gap: 10 },
  timeColumn: { alignItems: 'center' },
  timeBtn: { padding: 10 },
  timeBtnText: { color: '#6C63FF', fontSize: 20, fontWeight: '700' },
  timeDigit: { color: '#FFF', fontSize: 42, fontWeight: '800', width: 70, textAlign: 'center' },
  timeSep: { color: '#6C63FF', fontSize: 42, fontWeight: '800', marginBottom: 10 },
  periodBtn: { backgroundColor: '#6C63FF22', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
  periodText: { color: '#6C63FF', fontSize: 18, fontWeight: '800' },
  saveBtn: { height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  statusCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#2ED57315', margin: 20,
    borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#2ED57344', gap: 12,
  },
  statusIcon: { fontSize: 28 },
  statusTitle: { color: '#2ED573', fontSize: 15, fontWeight: '700' },
  statusTime: { color: '#8E8EAA', fontSize: 13, marginTop: 2 },
  infoTitle: { color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  infoText: { color: '#8E8EAA', fontSize: 13, lineHeight: 22 },
});
