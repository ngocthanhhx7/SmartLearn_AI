import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions,
  TouchableOpacity, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { getAnalytics, analyzePerformance } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const chartWidth = width - 40;

export default function AnalyticsScreen() {
  const { theme, isDark } = useTheme();
  const [data, setData] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const chartConfig = {
    backgroundColor: theme.surface,
    backgroundGradientFrom: theme.surface,
    backgroundGradientTo: theme.surface,
    color: (opacity = 1) => theme.primary,
    labelColor: () => theme.textMuted,
    strokeWidth: 2,
    barPercentage: 0.6,
    propsForDots: { r: '5', strokeWidth: '2', stroke: theme.primary },
    decimalPlaces: 0,
  };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await getAnalytics();
      setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const runAIAnalysis = async () => {
    if (!data) return;
    setAnalyzing(true);
    try {
      const res = await analyzePerformance(
        { totalStudyTime: data.totalStudyTime, sessions: data.totalSessions, streak: data.streak },
        { avgScore: data.avgScore, totalQuizzes: data.totalQuizzes, scores: data.quizScores }
      );
      setAiAnalysis(res.data);
    } catch {
      Alert.alert('Lỗi', 'Không thể phân tích bằng AI');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const dailyLabels = data?.dailyStudy ? Object.keys(data.dailyStudy).slice(-7).map((d) => d.slice(5)) : [];
  const dailyValues = data?.dailyStudy ? Object.values(data.dailyStudy).slice(-7) : [];

  const quizLabels = data?.quizScores?.slice(-7).map((q) => q.date.slice(5)) || [];
  const quizValues = data?.quizScores?.slice(-7).map((q) => q.score) || [];

  const topicData = data?.topicFrequency || {};
  const topicColors = [theme.primary, theme.accent, '#2ED573', '#FFA502', '#1E90FF', '#FF69B4'];
  const pieData = Object.entries(topicData).slice(0, 6).map(([name, count], i) => ({
    name: name.length > 10 ? name.slice(0, 10) + '...' : name,
    population: count,
    color: topicColors[i % topicColors.length],
    legendFontColor: theme.textMuted,
    legendFontSize: 12,
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>📊 Thống kê học tập</Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>Theo dõi tiến độ và hiệu suất học tập</Text>
        </View>

        <LinearGradient colors={['#6C63FF', '#4834DF']} style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{data?.totalStudyTime || 0}</Text>
              <Text style={styles.statLbl}>Phút học</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{data?.streak || 0}</Text>
              <Text style={styles.statLbl}>Ngày liên tiếp 🔥</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{data?.avgScore || 0}%</Text>
              <Text style={styles.statLbl}>Điểm TB</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{data?.totalQuizzes || 0}</Text>
              <Text style={styles.statLbl}>Bài kiểm tra</Text>
            </View>
          </View>
        </LinearGradient>

        {dailyLabels.length > 0 && (
          <View style={[styles.chartCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>📈 Thời gian học (7 ngày gần nhất)</Text>
            <LineChart
              data={{ labels: dailyLabels, datasets: [{ data: dailyValues.length > 0 ? dailyValues : [0] }] }}
              width={chartWidth - 40}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={{ borderRadius: 12 }}
            />
          </View>
        )}

        {quizLabels.length > 0 && (
          <View style={[styles.chartCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>📝 Điểm kiểm tra</Text>
            <BarChart
              data={{ labels: quizLabels, datasets: [{ data: quizValues.length > 0 ? quizValues : [0] }] }}
              width={chartWidth - 40}
              height={200}
              chartConfig={{ ...chartConfig, color: (opacity = 1) => `rgba(46, 213, 115, ${opacity})` }}
              style={{ borderRadius: 12 }}
              fromZero
            />
          </View>
        )}

        {pieData.length > 0 && (
          <View style={[styles.chartCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>📚 Chủ đề đã học</Text>
            <PieChart
              data={pieData}
              width={chartWidth - 40}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
            />
          </View>
        )}

        <TouchableOpacity onPress={runAIAnalysis} disabled={analyzing} activeOpacity={0.8} style={{ paddingHorizontal: 20 }}>
          <LinearGradient colors={['#FF6B6B', '#FF4757']} style={styles.analyzeBtn}>
            {analyzing ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.analyzeBtnText}>🤖 Phân tích bằng AI</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {aiAnalysis && (
          <View style={[styles.analysisCard, { backgroundColor: theme.surface, borderColor: theme.accent }]}>
            <Text style={[styles.analysisTitle, { color: theme.text }]}>🤖 Phân tích AI</Text>

            {aiAnalysis.overallAssessment && (
              <Text style={[styles.assessmentText, { color: theme.textSecondary }]}>{aiAnalysis.overallAssessment}</Text>
            )}

            {aiAnalysis.strengths?.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { color: theme.text }]}>💪 Điểm mạnh</Text>
                {aiAnalysis.strengths.map((s, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={styles.bulletGreen}>✅</Text>
                    <Text style={[styles.bulletText, { color: theme.textSecondary }]}>{s}</Text>
                  </View>
                ))}
              </>
            )}

            {aiAnalysis.weaknesses?.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { color: theme.text }]}>📌 Cần cải thiện</Text>
                {aiAnalysis.weaknesses.map((w, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={styles.bulletRed}>⚠️</Text>
                    <Text style={[styles.bulletText, { color: theme.textSecondary }]}>{w}</Text>
                  </View>
                ))}
              </>
            )}

            {aiAnalysis.recommendedTopics?.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { color: theme.text }]}>🎯 Chủ đề gợi ý</Text>
                {aiAnalysis.recommendedTopics.map((t, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={styles.bulletBlue}>📖</Text>
                    <Text style={[styles.bulletText, { color: theme.textSecondary }]}>{t}</Text>
                  </View>
                ))}
              </>
            )}

            {aiAnalysis.optimalSchedule && (
              <>
                <Text style={[styles.sectionLabel, { color: theme.text }]}>⏰ Lịch học tối ưu</Text>
                <Text style={[styles.scheduleText, { color: theme.textMuted }]}>{aiAnalysis.optimalSchedule}</Text>
              </>
            )}
          </View>
        )}

        {(!data || (data.totalSessions === 0 && data.totalQuizzes === 0)) && (
          <View style={[styles.emptyCard, { backgroundColor: theme.surface }]}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Chưa có dữ liệu</Text>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>Bắt đầu học và làm kiểm tra để xem thống kê tại đây!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '800' },
  headerSub: { fontSize: 13, marginTop: 6 },
  statsCard: { marginHorizontal: 20, borderRadius: 20, padding: 20, marginBottom: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  statBox: { width: '50%', alignItems: 'center', paddingVertical: 10 },
  statNum: { color: '#FFF', fontSize: 28, fontWeight: '900' },
  statLbl: { color: '#E0DDFF', fontSize: 12, marginTop: 4, fontWeight: '600' },
  chartCard: {
    marginHorizontal: 20, borderRadius: 16, padding: 20,
    marginBottom: 16, borderWidth: 1,
  },
  chartTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  analyzeBtn: { height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  analyzeBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  analysisCard: {
    marginHorizontal: 20, borderRadius: 16, padding: 20,
    borderWidth: 1,
  },
  analysisTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  assessmentText: { fontSize: 14, lineHeight: 22, marginBottom: 16 },
  sectionLabel: { fontSize: 15, fontWeight: '700', marginTop: 14, marginBottom: 8 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  bulletGreen: { marginRight: 8, fontSize: 14 },
  bulletRed: { marginRight: 8, fontSize: 14 },
  bulletBlue: { marginRight: 8, fontSize: 14 },
  bulletText: { fontSize: 13, lineHeight: 20, flex: 1 },
  scheduleText: { fontSize: 13, lineHeight: 20 },
  emptyCard: { alignItems: 'center', padding: 40, margin: 20, borderRadius: 16 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyText: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 22 },
});
