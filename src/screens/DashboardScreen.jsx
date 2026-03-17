import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { getProgress } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
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

  const suggestedTopics = [
    { icon: '💻', title: 'Lập trình', color: '#F26B3A' },
    { icon: '🌐', title: 'Ngoại ngữ', color: '#4A6BF5' },
    { icon: '🎨', title: 'Thiết kế', color: '#F26B3A' },
    { icon: '📈', title: 'Kinh doanh', color: '#F7954A' },
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.logoIcon, { backgroundColor: theme.primary }]}>
              <Image source={require('../../assets/icon.png')} style={styles.logoEmoji} />
            </View>
            <Text style={[styles.logoText, { color: theme.text }]}>Smartlearn AI</Text>
          </View>
          <TouchableOpacity style={[styles.notifBtn, { backgroundColor: theme.surface }]}>
            <Text style={styles.notifIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={[styles.heroTitle, { color: theme.text }]}>Trợ lý học tập AI</Text>
          <Text style={[styles.heroSub, { color: theme.textSecondary }]}>
            Tối ưu hóa hành trình chinh phục kiến thức với sức mạnh trí tuệ nhân tạo cá nhân hóa.
          </Text>
        </View>

        {/* CTA Card - Tạo lộ trình AI */}
        <TouchableOpacity
          style={styles.ctaCardWrapper}
          onPress={() => navigation.navigate('CreateRoadmap')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[theme.cardGradientStart, theme.cardGradientEnd]}
            style={styles.ctaCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.ctaContent}>
              <View style={styles.ctaBadge}>
                <Text style={styles.ctaBadgeText}>MỚI</Text>
              </View>
              <View style={styles.ctaIconCircle}>
                <Text style={styles.ctaIcon}>✨</Text>
              </View>
              <Text style={styles.ctaTitle}>Tạo lộ trình AI nâng cao</Text>
              <Text style={styles.ctaDesc}>
                Dựa trên mục tiêu, trình độ hiện tại, AI sẽ thiết kế một lộ trình học tập tối ưu chỉ dành riêng cho bạn.
              </Text>
              <View style={styles.ctaButton}>
                <Text style={styles.ctaButtonText}>Bắt đầu ngay →</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Lộ trình của tôi */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionDot, { backgroundColor: theme.primary }]} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Lộ trình của tôi</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('MyRoadmaps')}>
              <Text style={[styles.seeAll, { color: theme.primary }]}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.roadmapCard, { backgroundColor: theme.surface }]}
            onPress={() => navigation.navigate('MyRoadmaps')}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 4 }}>
              Đang thực hiện {stats.uniqueTopics || 0} khóa học
            </Text>
            <View style={styles.roadmapRow}>
              <View style={[styles.roadmapIcon, { backgroundColor: '#1A1A2E' }]}>
                <Text style={{ fontSize: 16 }}>📊</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.roadmapName, { color: theme.text }]}>Data Science Foundation</Text>
                <View style={styles.progressBarWrap}>
                  <View style={[styles.progressBarBg, { backgroundColor: theme.surfaceAlt }]}>
                    <View style={[styles.progressBarFill, { width: '65%', backgroundColor: theme.primary }]} />
                  </View>
                  <Text style={[styles.progressPercent, { color: theme.primary }]}>65%</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Chủ đề gợi ý */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitleLarge, { color: theme.text }]}>Chủ đề gợi ý</Text>
          <View style={styles.topicsGrid}>
            {suggestedTopics.map((topic) => (
              <TouchableOpacity
                key={topic.title}
                style={[styles.topicCard, { backgroundColor: theme.surface }]}
                onPress={() => navigation.navigate('Học tập')}
                activeOpacity={0.7}
              >
                <View style={[styles.topicIconCircle, { backgroundColor: topic.color + '15' }]}>
                  <Text style={styles.topicEmoji}>{topic.icon}</Text>
                </View>
                <Text style={[styles.topicLabel, { color: theme.text }]}>{topic.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats card */}
        <View style={styles.section}>
          <View style={[styles.statsCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statsCardTitle, { color: theme.text }]}>📈 Tiến độ học tập</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.primary }]}>{stats.totalStudyTime || 0}</Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Phút học</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.primary }]}>{stats.totalQuizzes || 0}</Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Bài kiểm tra</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.primary }]}>{stats.avgQuizScore || 0}%</Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Điểm TB</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoIcon: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  logoEmoji: { width: 22, height: 22, borderRadius: 6 },
  logoText: { fontSize: 20, fontWeight: '800' },
  notifBtn: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 3,
  },
  notifIcon: { fontSize: 18 },

  heroSection: { paddingHorizontal: 20, marginBottom: 20 },
  heroTitle: { fontSize: 26, fontWeight: '800', marginBottom: 8 },
  heroSub: { fontSize: 14, lineHeight: 22 },

  ctaCardWrapper: { marginHorizontal: 20, marginBottom: 24 },
  ctaCard: { borderRadius: 22, padding: 24, overflow: 'hidden' },
  ctaContent: { position: 'relative' },
  ctaBadge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#FFFFFF40', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 10,
  },
  ctaBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  ctaIconCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
  },
  ctaIcon: { fontSize: 24 },
  ctaTitle: { color: '#FFF', fontSize: 19, fontWeight: '800', marginBottom: 8 },
  ctaDesc: { color: 'rgba(255,255,255,0.9)', fontSize: 13, lineHeight: 20, marginBottom: 16 },
  ctaButton: {
    backgroundColor: '#FFF', alignSelf: 'flex-start',
    paddingHorizontal: 22, paddingVertical: 12, borderRadius: 24,
  },
  ctaButtonText: { color: '#F26B3A', fontWeight: '700', fontSize: 14 },

  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 14,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  seeAll: { fontSize: 14, fontWeight: '600' },

  roadmapCard: {
    marginHorizontal: 20, borderRadius: 16, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  roadmapRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  roadmapIcon: {
    width: 42, height: 42, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  roadmapName: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
  progressBarWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressBarBg: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: 6, borderRadius: 3 },
  progressPercent: { fontSize: 13, fontWeight: '700' },

  sectionTitleLarge: { fontSize: 20, fontWeight: '800', paddingHorizontal: 20, marginBottom: 16 },
  topicsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 14, gap: 0,
  },
  topicCard: {
    width: '46%', margin: '2%', borderRadius: 18, padding: 22,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  topicIconCircle: {
    width: 52, height: 52, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  topicEmoji: { fontSize: 24 },
  topicLabel: { fontSize: 14, fontWeight: '600' },

  statsCard: {
    marginHorizontal: 20, borderRadius: 18, padding: 22,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  statsCardTitle: { fontSize: 17, fontWeight: '700', marginBottom: 18 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statItem: { alignItems: 'center', flex: 1 },
  statNumber: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 4, fontWeight: '600' },
  statDivider: { width: 1, height: 36 },
});
