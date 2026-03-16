import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { generateLearningPlan, createStudySession } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function LearningScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return Alert.alert('Lỗi', 'Vui lòng nhập chủ đề');
    setLoading(true);
    setPlan(null);
    try {
      const res = await generateLearningPlan(topic.trim());
      setPlan(res.data);
      await createStudySession({ topic: topic.trim(), duration: 5 });
    } catch (err) {
      Alert.alert('Lỗi', err.response?.data?.error || 'Không thể tạo lộ trình học tập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>📚 Trợ lý học tập AI</Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>Nhập chủ đề bất kỳ và AI sẽ tạo lộ trình học tập riêng cho bạn</Text>
        </View>

        <View style={styles.roadmapActions}>
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={() => navigation.navigate('CreateRoadmap')}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#FF6B6B', '#EE5253']} style={styles.actionGradient}>
              <Text style={styles.actionIcon}>✨</Text>
              <Text style={styles.actionText}>Tạo lộ trình AI nâng cao</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={() => navigation.navigate('MyRoadmaps')}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#10AC84', '#1DD1A1']} style={styles.actionGradient}>
              <Text style={styles.actionIcon}>📂</Text>
              <Text style={styles.actionText}>Lộ trình của tôi</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
            placeholder='VD: "Tôi muốn học React"'
            placeholderTextColor={theme.textMuted}
            value={topic}
            onChangeText={setTopic}
            editable={!loading}
          />
          <TouchableOpacity onPress={handleGenerate} disabled={loading} activeOpacity={0.8}>
            <LinearGradient colors={['#6C63FF', '#4834DF']} style={styles.genBtn}>
              {loading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.genBtnText}>Tạo</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={[styles.loadingCard, { backgroundColor: theme.surface }]}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>AI đang tạo lộ trình học tập cho bạn...</Text>
          </View>
        )}

        {plan && (
          <View style={styles.planContainer}>
            <LinearGradient colors={isDark ? ['#2ED57333', '#1A1A2E'] : ['#2ED57311', theme.surface]} style={[styles.overviewCard, { borderColor: theme.border }]}>
              <Text style={styles.overviewTitle}>🗺️ Lộ trình: {plan.topic}</Text>
              <Text style={[styles.overviewText, { color: theme.textSecondary }]}>{plan.roadmap.overview}</Text>
            </LinearGradient>

            <Text style={[styles.sectionTitle, { color: theme.text }]}>📖 Khái niệm chính</Text>
            {plan.roadmap.concepts?.map((c, i) => (
              <View key={i} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.conceptHeader}>
                  <View style={[styles.badge, { backgroundColor: theme.primary }]}><Text style={styles.badgeText}>{c.order || i + 1}</Text></View>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>{c.title}</Text>
                </View>
                <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>{c.description}</Text>
              </View>
            ))}

            <Text style={[styles.sectionTitle, { color: theme.text }]}>🔗 Tài liệu tham khảo</Text>
            {plan.roadmap.resources?.map((r, i) => (
              <View key={i} style={[styles.resourceCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={styles.resourceType}>{r.type === 'video' ? '🎬' : r.type === 'documentation' ? '📄' : '📝'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>{r.title}</Text>
                  <Text style={[styles.resourceUrl, { color: theme.primary }]} numberOfLines={1}>{r.url}</Text>
                </View>
              </View>
            ))}

            <Text style={[styles.sectionTitle, { color: theme.text }]}>💪 Bài tập thực hành</Text>
            {plan.roadmap.exercises?.map((e, i) => (
              <View key={i} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.exerciseHeader}>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>{e.title}</Text>
                  <View style={[styles.diffBadge, { backgroundColor: theme.primaryLight }, e.difficulty === 'advanced' && { backgroundColor: theme.destructiveLight }]}>
                    <Text style={[styles.diffText, { color: theme.primary }, e.difficulty === 'advanced' && { color: theme.destructive }]}>
                      {e.difficulty === 'beginner' ? 'Cơ bản' : e.difficulty === 'intermediate' ? 'Trung bình' : 'Nâng cao'}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>{e.description}</Text>
              </View>
            ))}

            {plan.roadmap.miniProject && (
              <>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>🚀 Dự án mini</Text>
                <LinearGradient colors={isDark ? ['#6C63FF22', '#1A1A2E'] : ['#6C63FF11', theme.surface]} style={[styles.projectCard, { borderColor: theme.border }]}>
                  <Text style={[styles.projectTitle, { color: theme.primary }]}>{plan.roadmap.miniProject.title}</Text>
                  <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>{plan.roadmap.miniProject.description}</Text>
                  {plan.roadmap.miniProject.steps?.map((step, i) => (
                    <View key={i} style={styles.stepRow}>
                      <Text style={[styles.stepNum, { color: theme.primary }]}>{i + 1}</Text>
                      <Text style={[styles.stepText, { color: theme.textSecondary }]}>{step}</Text>
                    </View>
                  ))}
                </LinearGradient>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: '800' },
  headerSub: { fontSize: 13, marginTop: 6, lineHeight: 20 },
  roadmapActions: { paddingHorizontal: 20, marginBottom: 25, gap: 12 },
  actionBtn: { borderRadius: 14, overflow: 'hidden' },
  actionGradient: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14 },
  actionIcon: { fontSize: 20, marginRight: 12 },
  actionText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  inputRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  input: {
    flex: 1, borderRadius: 14, paddingHorizontal: 16,
    height: 50, fontSize: 15, borderWidth: 1,
  },
  genBtn: { height: 50, paddingHorizontal: 20, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  genBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  loadingCard: { alignItems: 'center', padding: 40, margin: 20, borderRadius: 16 },
  loadingText: { marginTop: 16, fontSize: 14 },
  planContainer: { paddingHorizontal: 20 },
  overviewCard: { borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1 },
  overviewTitle: { color: '#2ED573', fontSize: 18, fontWeight: '800', marginBottom: 10 },
  overviewText: { fontSize: 14, lineHeight: 22 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginTop: 8, marginBottom: 12 },
  card: {
    borderRadius: 14, padding: 16, marginBottom: 10,
    borderWidth: 1,
  },
  conceptHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  badge: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  badgeText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  cardTitle: { fontSize: 15, fontWeight: '700', flex: 1 },
  cardDesc: { fontSize: 13, lineHeight: 20 },
  resourceCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 14,
    padding: 16, marginBottom: 10, borderWidth: 1, gap: 12,
  },
  resourceType: { fontSize: 24 },
  resourceUrl: { fontSize: 12, marginTop: 2 },
  exerciseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  diffBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  diffText: { fontSize: 11, fontWeight: '700' },
  projectCard: { borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1 },
  projectTitle: { fontSize: 18, fontWeight: '800', marginBottom: 10 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 10 },
  stepNum: { fontWeight: '800', fontSize: 14, marginRight: 10, width: 20 },
  stepText: { fontSize: 13, lineHeight: 20, flex: 1 },
});
