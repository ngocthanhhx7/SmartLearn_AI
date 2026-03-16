import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

export default function StopwatchScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const [time, setTime] = useState(0); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('stopwatch'); // stopwatch, pomodoro (25m), shortBreak (5m)
  
  const timerRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime((prev) => {
          if (mode === 'stopwatch') return prev + 1;
          // Countdown for Pomodoro
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            return 0; // Completed
          }
          return prev - 1;
        });
      }, 1000);
      
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
        ])
      ).start();
    } else {
      clearInterval(timerRef.current);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, mode]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    if (mode === 'pomodoro') setTime(25 * 60);
    else if (mode === 'shortBreak') setTime(5 * 60);
    else setTime(0);
  };

  const changeMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'pomodoro') setTime(25 * 60);
    else if (newMode === 'shortBreak') setTime(5 * 60);
    else setTime(0);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backIcon, { color: theme.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>⏱️ Đồng hồ bấm giờ</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.modeSelector, { backgroundColor: theme.surface }]}>
        <TouchableOpacity style={[styles.modeBtn, mode === 'stopwatch' && [styles.activeMode, { backgroundColor: theme.primary }]]} onPress={() => changeMode('stopwatch')}>
          <Text style={[styles.modeText, { color: theme.textMuted }, mode === 'stopwatch' && styles.activeModeText]}>Bấm giờ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.modeBtn, mode === 'pomodoro' && [styles.activeMode, { backgroundColor: theme.primary }]]} onPress={() => changeMode('pomodoro')}>
          <Text style={[styles.modeText, { color: theme.textMuted }, mode === 'pomodoro' && styles.activeModeText]}>Pomodoro (25')</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timerContainer}>
        <Animated.View style={[styles.timerCircle, { transform: [{ scale: pulseAnim }], borderColor: isRunning ? theme.primary : theme.border, backgroundColor: theme.surface }]}>
          <Text style={[styles.timeText, { color: theme.text }]}>{formatTime(time)}</Text>
          <Text style={[styles.timeSubtitle, { color: theme.textSecondary }]}>{mode === 'stopwatch' ? 'Thời gian đã học' : 'Thời gian còn lại'}</Text>
        </Animated.View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={toggleTimer} activeOpacity={0.8} style={{ flex: 1, marginRight: 10 }}>
          <LinearGradient colors={isRunning ? ['#FF4757', '#EE5253'] : ['#2ED573', '#1ABC9C']} style={styles.controlBtn}>
            <Text style={styles.controlText}>{isRunning ? '⏸ Tạm dừng' : '▶ Bắt đầu'}</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={resetTimer} activeOpacity={0.8} style={{ flex: 1, marginLeft: 10 }}>
          <View style={[styles.resetBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.resetText, { color: theme.text }]}>🔄 Đặt lại</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={styles.infoTitle}>💡 Phương pháp Pomodoro</Text>
        <Text style={[styles.infoDesc, { color: theme.textSecondary }]}>Học tập trung trong 25 phút, sau đó nghỉ ngắn 5 phút. Lặp lại 4 lần sẽ có một kỳ nghỉ dài hơn. Giúp tăng hiệu suất và giảm căng thẳng trí não.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backIcon: { fontSize: 24 },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  modeSelector: { flexDirection: 'row', marginHorizontal: 20, borderRadius: 12, padding: 4, marginBottom: 40 },
  modeBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  activeMode: { },
  modeText: { fontWeight: '600', fontSize: 14 },
  activeModeText: { color: '#FFF' },
  timerContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: 20 },
  timerCircle: { width: 280, height: 280, borderRadius: 140, borderWidth: 4, justifyContent: 'center', alignItems: 'center' },
  timeText: { fontSize: 72, fontWeight: '200', fontVariant: ['tabular-nums'] },
  timeSubtitle: { fontSize: 14, marginTop: 10 },
  controls: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 50 },
  controlBtn: { paddingVertical: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  controlText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  resetBtn: { paddingVertical: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  resetText: { fontSize: 18, fontWeight: '700' },
  infoCard: { margin: 20, marginTop: 40, padding: 20, borderRadius: 16, borderWidth: 1 },
  infoTitle: { color: '#FFD32A', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  infoDesc: { fontSize: 14, lineHeight: 22 },
});
