import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { generateQuiz, saveQuizResult } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function QuizScreen({ route }) {
  const { theme, isDark } = useTheme();
  const [topic, setTopic] = useState('');

  React.useEffect(() => {
    if (route?.params?.initialTopic) {
      setTopic(route.params.initialTopic);
    }
  }, [route?.params?.initialTopic]);

  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return Alert.alert('Lỗi', 'Vui lòng nhập chủ đề');
    setLoading(true);
    setQuestions(null);
    setCurrentQ(0);
    setAnswers({});
    setShowResults(false);
    setScore(null);
    try {
      const res = await generateQuiz(topic.trim());
      setQuestions(res.data.questions);
    } catch (err) {
      Alert.alert('Lỗi', err.response?.data?.error || 'Không thể tạo câu hỏi kiểm tra');
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (questionIdx, answer) => {
    setAnswers((prev) => ({ ...prev, [questionIdx]: answer }));
  };

  const submitQuiz = async () => {
    let correct = 0;
    const quizData = questions.map((q, i) => {
      const userAnswer = answers[i] || '';
      const isCorrect = userAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
      if (isCorrect) correct++;
      return { ...q, userAnswer, isCorrect };
    });

    const scorePercent = Math.round((correct / questions.length) * 100);
    setScore({ correct, total: questions.length, percent: scorePercent });
    setShowResults(true);

    try {
      await saveQuizResult({
        topic,
        quiz: quizData,
        score: scorePercent,
        totalQuestions: questions.length,
        correctAnswers: correct,
      });
    } catch (err) {
      console.error('Lỗi lưu kết quả:', err);
    }
  };

  const resetQuiz = () => {
    setQuestions(null);
    setCurrentQ(0);
    setAnswers({});
    setShowResults(false);
    setScore(null);
    setTopic('');
  };

  if (showResults && score) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>📊 Kết quả kiểm tra</Text>
          </View>

          <LinearGradient
            colors={score.percent >= 70 ? (isDark ? ['#2ED57333', '#1A1A2E'] : ['#2ED57311', theme.surface]) : (isDark ? ['#FF475733', '#1A1A2E'] : ['#FF475711', theme.surface])}
            style={[styles.scoreCard, { borderColor: theme.border }]}
          >
            <Text style={styles.scoreEmoji}>{score.percent >= 70 ? '🎉' : '💪'}</Text>
            <Text style={[styles.scorePercent, { color: theme.text }]}>{score.percent}%</Text>
            <Text style={[styles.scoreText, { color: theme.textSecondary }]}>
              {score.correct}/{score.total} câu trả lời đúng
            </Text>
            <Text style={[styles.scoreMsg, { color: theme.textMuted }]}>
              {score.percent >= 90 ? 'Xuất sắc! Bạn đã nắm vững chủ đề này!' :
               score.percent >= 70 ? 'Làm tốt lắm! Hãy tiếp tục nhé!' :
               score.percent >= 50 ? 'Cố gắng tốt! Xem lại giải thích bên dưới nhé.' :
               'Hãy luyện tập thêm! Ôn lại tài liệu và thử lại.'}
            </Text>
          </LinearGradient>

          {questions.map((q, i) => {
            const userAns = answers[i] || 'Chưa trả lời';
            const isCorrect = userAns.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
            return (
              <View key={i} style={[styles.resultCard, { borderColor: isCorrect ? theme.accent : theme.destructive, backgroundColor: isCorrect ? theme.accentLight : theme.destructiveLight }]}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultIcon}>{isCorrect ? '✅' : '❌'}</Text>
                  <Text style={[styles.resultQ, { color: theme.text }]} numberOfLines={2}>{q.question}</Text>
                </View>
                <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 4 }}>Câu trả lời của bạn: {userAns}</Text>
                {!isCorrect && <Text style={{ color: theme.accent, fontSize: 13, fontWeight: '600', marginBottom: 4 }}>Đáp án đúng: {q.correctAnswer}</Text>}
                <Text style={{ color: theme.textMuted, fontSize: 12, lineHeight: 18, marginTop: 6, fontStyle: 'italic' }}>{q.explanation}</Text>
              </View>
            );
          })}

          <TouchableOpacity onPress={resetQuiz} activeOpacity={0.8}>
            <LinearGradient colors={['#6C63FF', '#4834DF']} style={styles.resetBtn}>
              <Text style={styles.resetText}>Làm bài kiểm tra khác</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (questions && !showResults) {
    const q = questions[currentQ];
    const isLastQuestion = currentQ === questions.length - 1;

    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>❓ Kiểm tra: {topic}</Text>
            <Text style={[styles.headerSub, { color: theme.textSecondary }]}>Câu hỏi {currentQ + 1}/{questions.length}</Text>
          </View>

          <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
            <View style={[styles.progressFill, { width: `${((currentQ + 1) / questions.length) * 100}%`, backgroundColor: theme.primary }]} />
          </View>

          <View style={[styles.questionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.typeBadge, { backgroundColor: theme.primaryLight }]}>
              <Text style={[styles.typeText, { color: theme.primary }]}>
                {q.type === 'multiple_choice' ? '📝 Trắc nghiệm' : q.type === 'true_false' ? '⚖️ Đúng/Sai' : '✍️ Tự luận ngắn'}
              </Text>
            </View>
            <Text style={[styles.questionText, { color: theme.text }]}>{q.question}</Text>

            {q.type === 'short_answer' ? (
              <TextInput
                style={[styles.shortInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="Nhập câu trả lời..."
                placeholderTextColor={theme.textMuted}
                value={answers[currentQ] || ''}
                onChangeText={(text) => selectAnswer(currentQ, text)}
              />
            ) : (
              q.options?.map((opt, oi) => (
                <TouchableOpacity
                  key={oi}
                  style={[styles.optionBtn, { backgroundColor: theme.background, borderColor: theme.border }, answers[currentQ] === opt && { borderColor: theme.primary, backgroundColor: theme.primaryLight }]}
                  onPress={() => selectAnswer(currentQ, opt)}
                >
                  <Text style={[styles.optionText, { color: theme.text }, answers[currentQ] === opt && { color: theme.primary, fontWeight: '600' }]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>

          <View style={styles.navRow}>
            {currentQ > 0 && (
              <TouchableOpacity style={[styles.navBtn, { backgroundColor: theme.surface }]} onPress={() => setCurrentQ(currentQ - 1)}>
                <Text style={[styles.navBtnText, { color: theme.primary }]}>← Trước</Text>
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }} />
            {isLastQuestion ? (
              <TouchableOpacity onPress={submitQuiz} activeOpacity={0.8}>
                <LinearGradient colors={['#2ED573', '#1ABC9C']} style={styles.submitBtn}>
                  <Text style={styles.submitText}>Nộp bài</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.navBtn, { backgroundColor: theme.surface }]} onPress={() => setCurrentQ(currentQ + 1)}>
                <Text style={[styles.navBtnText, { color: theme.primary }]}>Tiếp →</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>❓ Tạo câu hỏi AI</Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>Nhập chủ đề và AI sẽ tạo câu hỏi kiểm tra riêng cho bạn</Text>
        </View>

        <View style={styles.inputSection}>
          <TextInput
            style={[styles.topicInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
            placeholder='VD: "Lập trình JavaScript"'
            placeholderTextColor={theme.textMuted}
            value={topic}
            onChangeText={setTopic}
            editable={!loading}
          />
          <TouchableOpacity onPress={handleGenerate} disabled={loading} activeOpacity={0.8}>
            <LinearGradient colors={['#6C63FF', '#4834DF']} style={styles.generateBtn}>
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.generateText}>🎯 Tạo bài kiểm tra</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={[styles.loadingCard, { backgroundColor: theme.surface }]}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>AI đang tạo câu hỏi cho bạn...</Text>
          </View>
        )}

        <View style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.infoTitle, { color: theme.text }]}>Định dạng bài kiểm tra</Text>
          <View style={styles.infoRow}><Text style={styles.infoIcon}>📝</Text><Text style={[styles.infoText, { color: theme.textSecondary }]}>5 câu trắc nghiệm</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoIcon}>⚖️</Text><Text style={[styles.infoText, { color: theme.textSecondary }]}>3 câu đúng/sai</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoIcon}>✍️</Text><Text style={[styles.infoText, { color: theme.textSecondary }]}>2 câu tự luận ngắn</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoIcon}>💡</Text><Text style={[styles.infoText, { color: theme.textSecondary }]}>Kèm giải thích chi tiết</Text></View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '800' },
  headerSub: { fontSize: 13, marginTop: 6, lineHeight: 20 },
  inputSection: { paddingHorizontal: 20, gap: 12 },
  topicInput: {
    borderRadius: 14, paddingHorizontal: 16, height: 50,
    fontSize: 15, borderWidth: 1,
  },
  generateBtn: { height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  generateText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  loadingCard: { alignItems: 'center', padding: 40, margin: 20, borderRadius: 16 },
  loadingText: { marginTop: 16, fontSize: 14 },
  infoCard: {
    margin: 20, borderRadius: 16, padding: 20, borderWidth: 1,
  },
  infoTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoIcon: { fontSize: 18, marginRight: 10 },
  infoText: { fontSize: 14 },
  progressBar: { height: 6, marginHorizontal: 20, borderRadius: 3, marginBottom: 20 },
  progressFill: { height: 6, borderRadius: 3 },
  questionCard: {
    marginHorizontal: 20, borderRadius: 16, padding: 24, borderWidth: 1,
  },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 16 },
  typeText: { fontSize: 12, fontWeight: '700' },
  questionText: { fontSize: 17, fontWeight: '600', lineHeight: 26, marginBottom: 20 },
  optionBtn: {
    borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1,
  },
  optionText: { fontSize: 15 },
  shortInput: {
    borderRadius: 12, padding: 16, fontSize: 15, borderWidth: 1,
  },
  navRow: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 20 },
  navBtn: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12 },
  navBtnText: { fontWeight: '700', fontSize: 14 },
  submitBtn: { paddingHorizontal: 30, paddingVertical: 14, borderRadius: 12 },
  submitText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  scoreCard: { marginHorizontal: 20, borderRadius: 20, padding: 30, alignItems: 'center', marginBottom: 20, borderWidth: 1 },
  scoreEmoji: { fontSize: 48, marginBottom: 10 },
  scorePercent: { fontSize: 48, fontWeight: '900' },
  scoreText: { fontSize: 16, marginTop: 6 },
  scoreMsg: { fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 22 },
  resultCard: { marginHorizontal: 20, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1 },
  resultHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  resultIcon: { fontSize: 18, marginRight: 10, marginTop: 2 },
  resultQ: { fontSize: 14, fontWeight: '600', flex: 1 },
  resetBtn: { marginHorizontal: 20, height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  resetText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
