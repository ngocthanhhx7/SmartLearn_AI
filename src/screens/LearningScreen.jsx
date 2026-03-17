import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, RefreshControl, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useIsFocused } from '@react-navigation/native';
import { getUserRoadmaps } from '../services/api';

export default function LearningScreen({ navigation }) {
  const { theme } = useTheme();
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  const loadRoadmaps = async () => {
    try {
      const response = await getUserRoadmaps();
      setRoadmaps(response.data || []);
    } catch {
      setRoadmaps([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused) loadRoadmaps();
  }, [isFocused]);

  const onRefresh = () => { setRefreshing(true); loadRoadmaps(); };

  const suggestedTopics = [
    { icon: '💻', title: 'Lập trình', color: '#F26B3A' },
    { icon: '🌐', title: 'Ngoại ngữ', color: '#4A6BF5' },
    { icon: '🎨', title: 'Thiết kế', color: '#F26B3A' },
    { icon: '📈', title: 'Kinh doanh', color: '#F7954A' },
    { icon: '🧬', title: 'Khoa học', color: '#4A6BF5' },
    { icon: '📐', title: 'Toán học', color: '#F26B3A' },
  ];

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

        {/* CTA Card */}
        <TouchableOpacity
          style={styles.ctaWrapper}
          onPress={() => navigation.navigate('CreateRoadmap')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[theme.cardGradientStart, theme.cardGradientEnd]}
            style={styles.ctaCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.ctaBadge}>
              <Text style={styles.ctaBadgeText}>MỚI</Text>
            </View>

            <View style={styles.ctaIconCircle}>
              <Text style={styles.ctaIcon}>✨</Text>
            </View>

            <Text style={styles.ctaTitle}>Tạo lộ trình AI nâng cao</Text>
            <Text style={styles.ctaDesc}>
              Dựa trên mục tiêu và trình độ hiện tại, AI sẽ thiết kế một lộ trình học tập tối ưu chỉ dành riêng cho bạn.
            </Text>

            <View style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Bắt đầu ngay →</Text>
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

          {loading ? (
            <View style={[styles.roadmapCard, { backgroundColor: theme.surface }]}>
              <ActivityIndicator size="small" color={theme.primary} />
            </View>
          ) : roadmaps.length === 0 ? (
            <TouchableOpacity
              style={[styles.roadmapCard, { backgroundColor: theme.surface }]}
              onPress={() => navigation.navigate('CreateRoadmap')}
              activeOpacity={0.7}
            >
              <View style={styles.emptyRoadmap}>
                <Text style={{ fontSize: 28, marginBottom: 8 }}>📚</Text>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  Chưa có lộ trình nào
                </Text>
                <Text style={[styles.emptyHint, { color: theme.textMuted }]}>
                  Nhấn để tạo lộ trình học tập đầu tiên
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.roadmapCard, { backgroundColor: theme.surface }]}>
              <Text style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 6 }}>
                Đang thực hiện {roadmaps.length} khóa học
              </Text>
              {roadmaps.slice(0, 3).map((rm, idx) => (
                <TouchableOpacity
                  key={rm._id || idx}
                  style={[styles.roadmapItem, idx < Math.min(roadmaps.length, 3) - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}
                  onPress={() => navigation.navigate('RoadmapDetail', { id: rm._id, topic: rm.topic })}
                  activeOpacity={0.7}
                >
                  <View style={[styles.roadmapIcon, { backgroundColor: theme.text }]}>
                    <Text style={{ fontSize: 14 }}>📊</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.roadmapName, { color: theme.text }]} numberOfLines={1}>{rm.topic}</Text>
                    <View style={styles.progressBarWrap}>
                      <View style={[styles.progressBarBg, { backgroundColor: theme.surfaceAlt }]}>
                        <View style={[styles.progressBarFill, {
                          width: `${Math.min(100, Math.max(10, (idx + 1) * 25))}%`,
                          backgroundColor: theme.primary,
                        }]} />
                      </View>
                      <Text style={[styles.progressPercent, { color: theme.primary }]}>
                        {Math.min(100, Math.max(10, (idx + 1) * 25))}%
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Chủ đề gợi ý */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitleLarge, { color: theme.text }]}>Chủ đề gợi ý</Text>
          <View style={styles.topicsGrid}>
            {suggestedTopics.map((topic) => (
              <TouchableOpacity
                key={topic.title}
                style={[styles.topicCard, { backgroundColor: theme.surface }]}
                onPress={() => navigation.navigate('CreateRoadmap')}
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

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={[styles.quickCard, { backgroundColor: theme.surface }]}>
            <Text style={{ fontSize: 16 }}>💡</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.quickTitle, { color: theme.text }]}>Mẹo học tập</Text>
              <Text style={[styles.quickDesc, { color: theme.textSecondary }]}>
                Chia nhỏ mục tiêu, học đều đặn mỗi ngày và ôn tập thường xuyên sẽ giúp bạn tiến bộ nhanh hơn!
              </Text>
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

  ctaWrapper: { marginHorizontal: 20, marginBottom: 28 },
  ctaCard: { borderRadius: 22, padding: 24, overflow: 'hidden', position: 'relative' },
  ctaBadge: {
    position: 'absolute', top: 20, right: 20,
    backgroundColor: '#FFFFFF40', paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 10,
  },
  ctaBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  ctaIconCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  ctaIcon: { fontSize: 24 },
  ctaTitle: { color: '#FFF', fontSize: 19, fontWeight: '800', marginBottom: 8 },
  ctaDesc: { color: 'rgba(255,255,255,0.9)', fontSize: 13, lineHeight: 20, marginBottom: 18 },
  ctaButton: {
    backgroundColor: '#FFF', alignSelf: 'flex-start',
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24,
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
    marginHorizontal: 20, borderRadius: 18, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  emptyRoadmap: { alignItems: 'center', paddingVertical: 16 },
  emptyText: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  emptyHint: { fontSize: 13 },

  roadmapItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  roadmapIcon: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  roadmapName: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  progressBarWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressBarBg: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: 6, borderRadius: 3 },
  progressPercent: { fontSize: 13, fontWeight: '700', minWidth: 36, textAlign: 'right' },

  sectionTitleLarge: { fontSize: 20, fontWeight: '800', paddingHorizontal: 20, marginBottom: 16 },
  topicsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14,
  },
  topicCard: {
    width: '29.3%', margin: '2%', borderRadius: 18, paddingVertical: 20,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  topicIconCircle: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  topicEmoji: { fontSize: 22 },
  topicLabel: { fontSize: 12, fontWeight: '600' },

  quickCard: {
    marginHorizontal: 20, borderRadius: 16, padding: 18,
    flexDirection: 'row', alignItems: 'flex-start',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  quickTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  quickDesc: { fontSize: 13, lineHeight: 20 },
});
