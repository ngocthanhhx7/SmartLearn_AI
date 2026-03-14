import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { getProgress } from '../services/api';

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProgress = async () => {
    try {
      const res = await getProgress();
      setProgress(res.data);
    } catch {
      setProgress(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchProgress(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchProgress(); };

  const stats = progress?.stats || {};
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  const quickActions = [
    { icon: '📚', label: 'Học chủ đề', screen: 'Học tập' },
    { icon: '❓', label: 'Làm bài kiểm tra', screen: 'Kiểm tra' },
    { icon: '💬', label: 'Hỏi Gia sư AI', screen: 'Hỏi AI' },
    { icon: '📊', label: 'Thống kê', screen: 'Thêm' },
  ];

  const suggestedTopics = [
    { icon: '⚛️', title: 'React cơ bản', difficulty: 'Cơ bản' },
    { icon: '🐍', title: 'Python cơ bản', difficulty: 'Cơ bản' },
    { icon: '🤖', title: 'Machine Learning', difficulty: 'Trung bình' },
    { icon: '☁️', title: 'Điện toán đám mây', difficulty: 'Nâng cao' },
  ];

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C63FF" />}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting} 👋</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>

        <LinearGradient colors={['#6C63FF', '#4834DF']} style={styles.progressCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={styles.progressTitle}>📈 Tiến độ học tập</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalStudyTime || 0}</Text>
              <Text style={styles.statLabel}>Phút học</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalQuizzes || 0}</Text>
              <Text style={styles.statLabel}>Bài kiểm tra</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.avgQuizScore || 0}%</Text>
              <Text style={styles.statLabel}>Điểm TB</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.uniqueTopics || 0}</Text>
              <Text style={styles.statLabel}>Chủ đề</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎯 Mục tiêu hôm nay</Text>
          <Text style={styles.cardSubtitle}>Hoàn thành ít nhất một buổi học và một bài kiểm tra!</Text>
          <View style={styles.goalRow}>
            <View style={[styles.goalDot, stats.totalSessions > 0 && styles.goalDotDone]} />
            <Text style={styles.goalText}>Buổi học</Text>
            {stats.totalSessions > 0 && <Text style={styles.goalCheck}>✅</Text>}
          </View>
          <View style={styles.goalRow}>
            <View style={[styles.goalDot, stats.totalQuizzes > 0 && styles.goalDotDone]} />
            <Text style={styles.goalText}>Bài kiểm tra</Text>
            {stats.totalQuizzes > 0 && <Text style={styles.goalCheck}>✅</Text>}
          </View>
        </View>

        <Text style={styles.sectionTitle}>⚡ Thao tác nhanh</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.screen)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🤖 Gợi ý từ AI</Text>
          <Text style={styles.aiSuggestion}>
            {stats.totalSessions === 0
              ? 'Hãy bắt đầu buổi học đầu tiên! Chọn một chủ đề bạn yêu thích.'
              : stats.avgQuizScore < 60
              ? 'Hãy ôn lại các phần còn yếu. Luyện tập sẽ giúp bạn tiến bộ!'
              : 'Tiến bộ tuyệt vời! Hãy thử thách bản thân với chủ đề khó hơn.'}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>🔥 Chủ đề gợi ý</Text>
        {suggestedTopics.map((topic) => (
          <TouchableOpacity
            key={topic.title}
            style={styles.topicCard}
            onPress={() => navigation.navigate('Học tập')}
            activeOpacity={0.7}
          >
            <Text style={styles.topicIcon}>{topic.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.topicTitle}>{topic.title}</Text>
              <Text style={styles.topicDifficulty}>{topic.difficulty}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F23' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20,
  },
  greeting: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  email: { fontSize: 13, color: '#8E8EAA', marginTop: 4 },
  logoutBtn: { backgroundColor: '#FF4757', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  logoutText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  progressCard: { marginHorizontal: 20, borderRadius: 20, padding: 24, marginBottom: 20 },
  progressTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statItem: { alignItems: 'center', flex: 1 },
  statNumber: { color: '#FFF', fontSize: 24, fontWeight: '800' },
  statLabel: { color: '#E0DDFF', fontSize: 11, marginTop: 4, fontWeight: '600' },
  statDivider: { width: 1, height: 40, backgroundColor: '#FFFFFF33' },
  card: { backgroundColor: '#1A1A2E', marginHorizontal: 20, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#2A2A4A' },
  cardTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  cardSubtitle: { color: '#8E8EAA', fontSize: 13, lineHeight: 20, marginBottom: 12 },
  goalRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  goalDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2A2A4A', marginRight: 10 },
  goalDotDone: { backgroundColor: '#2ED573' },
  goalText: { color: '#CCC', fontSize: 14, flex: 1 },
  goalCheck: { fontSize: 16 },
  sectionTitle: { color: '#FFF', fontSize: 20, fontWeight: '800', marginHorizontal: 20, marginBottom: 14, marginTop: 8 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, marginBottom: 16 },
  actionCard: {
    width: '46%', backgroundColor: '#1A1A2E', borderRadius: 16, padding: 20,
    alignItems: 'center', margin: '2%', borderWidth: 1, borderColor: '#2A2A4A',
  },
  actionIcon: { fontSize: 32, marginBottom: 8 },
  actionLabel: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  aiSuggestion: { color: '#B8B8D0', fontSize: 14, lineHeight: 22 },
  topicCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A2E',
    marginHorizontal: 20, borderRadius: 14, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#2A2A4A',
  },
  topicIcon: { fontSize: 28, marginRight: 14 },
  topicTitle: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  topicDifficulty: { color: '#8E8EAA', fontSize: 12, marginTop: 2 },
  arrow: { color: '#6C63FF', fontSize: 20, fontWeight: '700' },
});
