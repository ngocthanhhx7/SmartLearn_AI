import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { generateLearningPlan, createStudySession } from '../services/api';

export default function LearningScreen() {
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
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📚 Trợ lý học tập AI</Text>
          <Text style={styles.headerSub}>Nhập chủ đề bất kỳ và AI sẽ tạo lộ trình học tập riêng cho bạn</Text>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder='VD: "Tôi muốn học React"'
            placeholderTextColor="#666"
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
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#6C63FF" />
            <Text style={styles.loadingText}>AI đang tạo lộ trình học tập cho bạn...</Text>
          </View>
        )}

        {plan && (
          <View style={styles.planContainer}>
            <LinearGradient colors={['#2ED57333', '#1A1A2E']} style={styles.overviewCard}>
              <Text style={styles.overviewTitle}>🗺️ Lộ trình: {plan.topic}</Text>
              <Text style={styles.overviewText}>{plan.roadmap.overview}</Text>
            </LinearGradient>

            <Text style={styles.sectionTitle}>📖 Khái niệm chính</Text>
            {plan.roadmap.concepts?.map((c, i) => (
              <View key={i} style={styles.card}>
                <View style={styles.conceptHeader}>
                  <View style={styles.badge}><Text style={styles.badgeText}>{c.order || i + 1}</Text></View>
                  <Text style={styles.cardTitle}>{c.title}</Text>
                </View>
                <Text style={styles.cardDesc}>{c.description}</Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>🔗 Tài liệu tham khảo</Text>
            {plan.roadmap.resources?.map((r, i) => (
              <View key={i} style={styles.resourceCard}>
                <Text style={styles.resourceType}>{r.type === 'video' ? '🎬' : r.type === 'documentation' ? '📄' : '📝'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{r.title}</Text>
                  <Text style={styles.resourceUrl} numberOfLines={1}>{r.url}</Text>
                </View>
              </View>
            ))}

            <Text style={styles.sectionTitle}>💪 Bài tập thực hành</Text>
            {plan.roadmap.exercises?.map((e, i) => (
              <View key={i} style={styles.card}>
                <View style={styles.exerciseHeader}>
                  <Text style={styles.cardTitle}>{e.title}</Text>
                  <View style={[styles.diffBadge, e.difficulty === 'advanced' && { backgroundColor: '#FF475722' }]}>
                    <Text style={[styles.diffText, e.difficulty === 'advanced' && { color: '#FF4757' }]}>
                      {e.difficulty === 'beginner' ? 'Cơ bản' : e.difficulty === 'intermediate' ? 'Trung bình' : 'Nâng cao'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardDesc}>{e.description}</Text>
              </View>
            ))}

            {plan.roadmap.miniProject && (
              <>
                <Text style={styles.sectionTitle}>🚀 Dự án mini</Text>
                <LinearGradient colors={['#6C63FF22', '#1A1A2E']} style={styles.projectCard}>
                  <Text style={styles.projectTitle}>{plan.roadmap.miniProject.title}</Text>
                  <Text style={styles.cardDesc}>{plan.roadmap.miniProject.description}</Text>
                  {plan.roadmap.miniProject.steps?.map((step, i) => (
                    <View key={i} style={styles.stepRow}>
                      <Text style={styles.stepNum}>{i + 1}</Text>
                      <Text style={styles.stepText}>{step}</Text>
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
  container: { flex: 1, backgroundColor: '#0F0F23' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 13, color: '#8E8EAA', marginTop: 6, lineHeight: 20 },
  inputRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  input: {
    flex: 1, backgroundColor: '#1A1A2E', borderRadius: 14, paddingHorizontal: 16,
    height: 50, color: '#FFF', fontSize: 15, borderWidth: 1, borderColor: '#2A2A4A',
  },
  genBtn: { height: 50, paddingHorizontal: 20, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  genBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  loadingCard: { alignItems: 'center', padding: 40, margin: 20, backgroundColor: '#1A1A2E', borderRadius: 16 },
  loadingText: { color: '#8E8EAA', marginTop: 16, fontSize: 14 },
  planContainer: { paddingHorizontal: 20 },
  overviewCard: { borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#2ED57344' },
  overviewTitle: { color: '#2ED573', fontSize: 18, fontWeight: '800', marginBottom: 10 },
  overviewText: { color: '#B8B8D0', fontSize: 14, lineHeight: 22 },
  sectionTitle: { color: '#FFF', fontSize: 20, fontWeight: '800', marginTop: 8, marginBottom: 12 },
  card: {
    backgroundColor: '#1A1A2E', borderRadius: 14, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#2A2A4A',
  },
  conceptHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  badge: { backgroundColor: '#6C63FF', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  badgeText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  cardTitle: { color: '#FFF', fontSize: 15, fontWeight: '700', flex: 1 },
  cardDesc: { color: '#8E8EAA', fontSize: 13, lineHeight: 20 },
  resourceCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A2E', borderRadius: 14,
    padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#2A2A4A', gap: 12,
  },
  resourceType: { fontSize: 24 },
  resourceUrl: { color: '#6C63FF', fontSize: 12, marginTop: 2 },
  exerciseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  diffBadge: { backgroundColor: '#2ED57322', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  diffText: { color: '#2ED573', fontSize: 11, fontWeight: '700' },
  projectCard: { borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#6C63FF44' },
  projectTitle: { color: '#6C63FF', fontSize: 18, fontWeight: '800', marginBottom: 10 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 10 },
  stepNum: { color: '#6C63FF', fontWeight: '800', fontSize: 14, marginRight: 10, width: 20 },
  stepText: { color: '#B8B8D0', fontSize: 13, lineHeight: 20, flex: 1 },
});
