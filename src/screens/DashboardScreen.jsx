import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { getProgress } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { theme, isDark } = useTheme();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProgress = async () => {
    try {
      const res = await getProgress();
      const data = res.data;
      setProgress({
        stats: {
          totalStudyTime: data.totalStudyTime || 0,
          totalQuizzes: data.totalQuizzes || 0,
          avgQuizScore: data.avgScore || 0,
          uniqueTopics: Object.keys(data.topicFrequency || {}).length,
          totalSessions: data.totalSessions || 0,
          todaySessions: data.todaySessions || 0,
          todayQuizzes: data.todayQuizzes || 0,
        }
      });
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
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.text }]}>{greeting} 👋</Text>
            <Text style={[styles.email, { color: theme.textSecondary }]}>{user?.email}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={[styles.logoutBtn, { backgroundColor: theme.destructive }]}>
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>

        <LinearGradient 
          colors={isDark ? ['#6C63FF', '#4834DF'] : ['#5B53F5', '#3E2FCD']} 
          style={styles.progressCard} 
          start={{ x: 0, y: 0 }} 
          end={{ x: 1, y: 1 }}
        >
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

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>🎯 Mục tiêu hôm nay</Text>
          <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>Hoàn thành ít nhất một buổi học và một bài kiểm tra!</Text>
          <View style={styles.goalRow}>
            <View style={[styles.goalDot, { backgroundColor: theme.surfaceAlt }, stats.todaySessions > 0 && { backgroundColor: theme.accent }]} />
            <Text style={[styles.goalText, { color: theme.textMuted }]}>Buổi học</Text>
            {stats.todaySessions > 0 && <Text style={styles.goalCheck}>✅</Text>}
          </View>
          <View style={styles.goalRow}>
            <View style={[styles.goalDot, { backgroundColor: theme.surfaceAlt }, stats.todayQuizzes > 0 && { backgroundColor: theme.accent }]} />
            <Text style={[styles.goalText, { color: theme.textMuted }]}>Bài kiểm tra</Text>
            {stats.todayQuizzes > 0 && <Text style={styles.goalCheck}>✅</Text>}
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>⚡ Thao tác nhanh</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={[styles.actionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => navigation.navigate(action.screen)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={[styles.actionLabel, { color: theme.text }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>🤖 Gợi ý từ AI</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 14, lineHeight: 22 }}>
            {stats.totalSessions === 0
              ? 'Hãy bắt đầu buổi học đầu tiên! Chọn một chủ đề bạn yêu thích.'
              : stats.avgQuizScore < 60
              ? 'Hãy ôn lại các phần còn yếu. Luyện tập sẽ giúp bạn tiến bộ!'
              : 'Tiến bộ tuyệt vời! Hãy thử thách bản thân với chủ đề khó hơn.'}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>🔥 Chủ đề gợi ý</Text>
        {suggestedTopics.map((topic) => (
          <TouchableOpacity
            key={topic.title}
            style={[styles.topicCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => navigation.navigate('Học tập')}
            activeOpacity={0.7}
          >
            <Text style={styles.topicIcon}>{topic.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.topicTitle, { color: theme.text }]}>{topic.title}</Text>
              <Text style={[styles.topicDifficulty, { color: theme.textSecondary }]}>{topic.difficulty}</Text>
            </View>
            <Text style={{ color: theme.primary, fontSize: 20, fontWeight: '700' }}>→</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20,
  },
  greeting: { fontSize: 24, fontWeight: '800' },
  email: { fontSize: 13, marginTop: 4 },
  logoutBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  logoutText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  progressCard: { marginHorizontal: 20, borderRadius: 20, padding: 24, marginBottom: 20 },
  progressTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statItem: { alignItems: 'center', flex: 1 },
  statNumber: { color: '#FFF', fontSize: 24, fontWeight: '800' },
  statLabel: { color: '#E0DDFF', fontSize: 11, marginTop: 4, fontWeight: '600' },
  statDivider: { width: 1, height: 40, backgroundColor: '#FFFFFF33' },
  card: { marginHorizontal: 20, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1 },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  cardSubtitle: { fontSize: 13, lineHeight: 20, marginBottom: 12 },
  goalRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  goalDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  goalText: { fontSize: 14, flex: 1 },
  goalCheck: { fontSize: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginHorizontal: 20, marginBottom: 14, marginTop: 8 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, marginBottom: 16 },
  actionCard: {
    width: '46%', borderRadius: 16, padding: 20,
    alignItems: 'center', margin: '2%', borderWidth: 1,
  },
  actionIcon: { fontSize: 32, marginBottom: 8 },
  actionLabel: { fontSize: 13, fontWeight: '600' },
  topicCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, borderRadius: 14, padding: 16, marginBottom: 10,
    borderWidth: 1,
  },
  topicIcon: { fontSize: 28, marginRight: 14 },
  topicTitle: { fontSize: 15, fontWeight: '700' },
  topicDifficulty: { fontSize: 12, marginTop: 2 },
});
