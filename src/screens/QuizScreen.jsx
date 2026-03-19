import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { generateQuiz, saveQuizResult } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function QuizScreen({ route, navigation }) {
  const { theme, isDark } = useTheme();
  const [topic, setTopic] = useState('');
  const [formatCounts, setFormatCounts] = useState({
    multiple_choice: 5,
    true_false: 3,
    short_answer: 2,
  });

  const updateFormatCount = (type, delta) => {
    setFormatCounts((prev) => {
      const current = prev[type];
      const next = current + delta;
      // Tránh âm và giới hạn tối đa tổng thể có thể tránh AI timeout nếu số quá lớn,
      // ở đây ta chặn min = 0, max = 15.
      if (next < 0 || next > 15) return prev;
      return { ...prev, [type]: next };
    });
  };

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
    const total = formatCounts.multiple_choice + formatCounts.true_false + formatCounts.short_answer;
    if (total === 0) return Alert.alert('Lỗi', 'Vui lòng chọn ít nhất 1 câu hỏi');
    
    setLoading(true);
    setQuestions(null);
    setCurrentQ(0);
    setAnswers({});
    setShowResults(false);
    setScore(null);
    try {
      const res = await generateQuiz(topic.trim(), formatCounts);
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

  // Results view
  if (showResults && score) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>📊 Kết quả kiểm tra</Text>
          </View>

          <View style={[styles.scoreCard, { backgroundColor: theme.surface }]}>
            <Text style={styles.scoreEmoji}>{score.percent >= 70 ? '🎉' : '💪'}</Text>
            <Text style={[styles.scorePercent, { color: theme.primary }]}>{score.percent}%</Text>
            <Text style={[styles.scoreText, { color: theme.textSecondary }]}>
              {score.correct}/{score.total} câu trả lời đúng
            </Text>
            <Text style={[styles.scoreMsg, { color: theme.textMuted }]}>
              {score.percent >= 90 ? 'Xuất sắc! Bạn đã nắm vững chủ đề này!' :
               score.percent >= 70 ? 'Làm tốt lắm! Hãy tiếp tục nhé!' :
               score.percent >= 50 ? 'Cố gắng tốt! Xem lại giải thích bên dưới nhé.' :
               'Hãy luyện tập thêm! Ôn lại tài liệu và thử lại.'}
            </Text>
          </View>

          {questions.map((q, i) => {
            const userAns = answers[i] || 'Chưa trả lời';
            const isCorrect = userAns.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
            return (
              <View key={i} style={[styles.resultCard, { backgroundColor: isCorrect ? '#E8FFF0' : '#FFF0F0', borderLeftColor: isCorrect ? '#2ED573' : '#EF4444' }]}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultIcon}>{isCorrect ? '✅' : '❌'}</Text>
                  <Text style={[styles.resultQ, { color: theme.text }]} numberOfLines={2}>{q.question}</Text>
                </View>
                <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 4 }}>Câu trả lời của bạn: {userAns}</Text>
                {!isCorrect && <Text style={{ color: '#2ED573', fontSize: 13, fontWeight: '600', marginBottom: 4 }}>Đáp án đúng: {q.correctAnswer}</Text>}
                <Text style={{ color: theme.textMuted, fontSize: 12, lineHeight: 18, marginTop: 6, fontStyle: 'italic' }}>{q.explanation}</Text>
              </View>
            );
          })}

          <TouchableOpacity onPress={resetQuiz} activeOpacity={0.8}>
            <LinearGradient colors={[theme.headerGradientStart, theme.headerGradientEnd]} style={styles.resetBtn}>
              <Text style={styles.resetText}>Làm bài kiểm tra khác</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Quiz in progress view
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

          <View style={[styles.questionCard, { backgroundColor: theme.surface }]}>
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

  // Initial quiz creation view
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Kiểm tra</Text>
        </View>

        {/* AI Quiz Card */}
        <View style={[styles.aiQuizCard, { backgroundColor: theme.surface }]}>
          <View style={styles.aiQuizHeader}>
            <View style={[styles.aiQuizIcon, { backgroundColor: theme.primaryLight }]}>
              <Text style={{ fontSize: 22 }}>📝</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.aiQuizTitle, { color: theme.text }]}>Tạo câu hỏi AI</Text>
              <Text style={[styles.aiQuizDesc, { color: theme.textSecondary }]}>
                Hệ thống AI thông minh giúp bạn soạn đề nhanh chóng
              </Text>
            </View>
          </View>
        </View>

        {/* Topic Input */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Chủ đề bài kiểm tra</Text>
          <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TextInput
              style={[styles.topicInput, { color: theme.text }]}
              placeholder="Nhập chủ đề hoặc dán nội dung văn bản tại đây để AI phân tích và tạo câu hỏi..."
              placeholderTextColor={theme.textMuted}
              value={topic}
              onChangeText={setTopic}
              multiline
              editable={!loading}
            />
          </View>

          {/* Quick suggestion icons */}
          <View style={styles.quickSuggestions}>
            {['📊', '💻', '🧬', '📐', '🌍', '📖'].map((emoji, idx) => (
              <TouchableOpacity key={idx} style={[styles.suggestionBtn, { backgroundColor: theme.surfaceAlt }]}>
                <Text style={{ fontSize: 18 }}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quiz Format Card */}
        <View style={[styles.formatCard, { backgroundColor: theme.surface }]}>
          <View style={styles.formatHeader}>
            <Text style={{ fontSize: 16 }}>⚙️</Text>
            <Text style={[styles.formatTitle, { color: theme.text }]}>ĐỊNH DẠNG BÀI TẬP</Text>
          </View>

          <View style={styles.formatList}>
            <View style={styles.formatItem}>
              <View style={[styles.formatIcon, { backgroundColor: '#FFF0EB' }]}>
                <Text style={{ fontSize: 16 }}>📝</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.formatName, { color: theme.text }]}>Trắc nghiệm</Text>
                <Text style={[styles.formatDesc, { color: theme.textMuted }]}>Nhiều lựa chọn (A, B, C, D)</Text>
              </View>
              <View style={styles.quantityControls}>
                <TouchableOpacity onPress={() => updateFormatCount('multiple_choice', -1)} style={[styles.quantityBtn, { backgroundColor: theme.surfaceAlt }]}>
                  <Text style={[styles.quantityBtnText, { color: theme.text }]}>-</Text>
                </TouchableOpacity>
                <Text style={[styles.quantityText, { color: theme.text }]}>{formatCounts.multiple_choice}</Text>
                <TouchableOpacity onPress={() => updateFormatCount('multiple_choice', 1)} style={[styles.quantityBtn, { backgroundColor: theme.primaryLight }]}>
                  <Text style={[styles.quantityBtnText, { color: theme.primary }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.formatDivider, { backgroundColor: theme.border }]} />

            <View style={styles.formatItem}>
              <View style={[styles.formatIcon, { backgroundColor: '#E8F4FD' }]}>
                <Text style={{ fontSize: 16 }}>⚖️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.formatName, { color: theme.text }]}>Đúng / Sai</Text>
                <Text style={[styles.formatDesc, { color: theme.textMuted }]}>Kiểm tra kiến thức cốt lõi</Text>
              </View>
              <View style={styles.quantityControls}>
                <TouchableOpacity onPress={() => updateFormatCount('true_false', -1)} style={[styles.quantityBtn, { backgroundColor: theme.surfaceAlt }]}>
                  <Text style={[styles.quantityBtnText, { color: theme.text }]}>-</Text>
                </TouchableOpacity>
                <Text style={[styles.quantityText, { color: theme.text }]}>{formatCounts.true_false}</Text>
                <TouchableOpacity onPress={() => updateFormatCount('true_false', 1)} style={[styles.quantityBtn, { backgroundColor: theme.primaryLight }]}>
                  <Text style={[styles.quantityBtnText, { color: theme.primary }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.formatDivider, { backgroundColor: theme.border }]} />

            <View style={styles.formatItem}>
              <View style={[styles.formatIcon, { backgroundColor: '#FFF8E8' }]}>
                <Text style={{ fontSize: 16 }}>✍️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.formatName, { color: theme.text }]}>Tự luận ngắn</Text>
                <Text style={[styles.formatDesc, { color: theme.textMuted }]}>Phát triển tư duy phân tích</Text>
              </View>
              <View style={styles.quantityControls}>
                <TouchableOpacity onPress={() => updateFormatCount('short_answer', -1)} style={[styles.quantityBtn, { backgroundColor: theme.surfaceAlt }]}>
                  <Text style={[styles.quantityBtnText, { color: theme.text }]}>-</Text>
                </TouchableOpacity>
                <Text style={[styles.quantityText, { color: theme.text }]}>{formatCounts.short_answer}</Text>
                <TouchableOpacity onPress={() => updateFormatCount('short_answer', 1)} style={[styles.quantityBtn, { backgroundColor: theme.primaryLight }]}>
                  <Text style={[styles.quantityBtnText, { color: theme.primary }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Generate Button */}
        <View style={styles.generateSection}>
          <TouchableOpacity onPress={handleGenerate} disabled={loading} activeOpacity={0.8}>
            <LinearGradient colors={[theme.headerGradientStart, theme.headerGradientEnd]} style={styles.generateBtn}>
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.generateText}>✨ Tạo bài kiểm tra</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          <Text style={[styles.generateHint, { color: theme.textMuted }]}>
            AI có thể mất 10-15 giây để tạo nội dung chất lượng cao
          </Text>
        </View>

        {loading && (
          <View style={[styles.loadingCard, { backgroundColor: theme.surface }]}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>AI đang tạo câu hỏi cho bạn...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  headerSub: { fontSize: 13, marginTop: 6, lineHeight: 20 },

  aiQuizCard: {
    marginHorizontal: 20, borderRadius: 18, padding: 20, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  aiQuizHeader: { flexDirection: 'row', alignItems: 'center' },
  aiQuizIcon: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  aiQuizTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  aiQuizDesc: { fontSize: 13, lineHeight: 18 },

  inputSection: { paddingHorizontal: 20, marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  inputWrapper: {
    borderRadius: 14, borderWidth: 1, padding: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  topicInput: { padding: 14, fontSize: 14, lineHeight: 22, minHeight: 80, textAlignVertical: 'top' },

  quickSuggestions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  suggestionBtn: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },

  formatCard: {
    marginHorizontal: 20, borderRadius: 18, padding: 20, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  formatHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 },
  formatTitle: { fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  formatList: {},
  formatItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  formatIcon: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  formatName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  formatDesc: { fontSize: 12 },
  formatDivider: { height: 1, marginVertical: 2 },

  quantityControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  quantityBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  quantityBtnText: { fontSize: 18, fontWeight: '700', lineHeight: 22 },
  quantityText: { fontSize: 16, fontWeight: '700', minWidth: 20, textAlign: 'center' },

  generateSection: { paddingHorizontal: 20, alignItems: 'center' },
  generateBtn: {
    height: 54, borderRadius: 27, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 50,
  },
  generateText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  generateHint: { fontSize: 12, marginTop: 10, textAlign: 'center' },

  loadingCard: {
    alignItems: 'center', padding: 40, margin: 20, borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  loadingText: { marginTop: 16, fontSize: 14 },

  progressBar: { height: 6, marginHorizontal: 20, borderRadius: 3, marginBottom: 20 },
  progressFill: { height: 6, borderRadius: 3 },
  questionCard: {
    marginHorizontal: 20, borderRadius: 18, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginBottom: 16 },
  typeText: { fontSize: 12, fontWeight: '700' },
  questionText: { fontSize: 17, fontWeight: '600', lineHeight: 26, marginBottom: 20 },
  optionBtn: {
    borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1,
  },
  optionText: { fontSize: 15 },
  shortInput: {
    borderRadius: 14, padding: 16, fontSize: 15, borderWidth: 1,
  },
  navRow: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 20 },
  navBtn: {
    paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  navBtnText: { fontWeight: '700', fontSize: 14 },
  submitBtn: { paddingHorizontal: 30, paddingVertical: 14, borderRadius: 14 },
  submitText: { color: '#FFF', fontWeight: '700', fontSize: 15 },

  scoreCard: {
    marginHorizontal: 20, borderRadius: 20, padding: 30, alignItems: 'center', marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  scoreEmoji: { fontSize: 48, marginBottom: 10 },
  scorePercent: { fontSize: 48, fontWeight: '900' },
  scoreText: { fontSize: 16, marginTop: 6 },
  scoreMsg: { fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 22 },
  resultCard: {
    marginHorizontal: 20, borderRadius: 14, padding: 16, marginBottom: 10,
    borderLeftWidth: 4,
  },
  resultHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  resultIcon: { fontSize: 18, marginRight: 10, marginTop: 2 },
  resultQ: { fontSize: 14, fontWeight: '600', flex: 1 },
  resetBtn: { marginHorizontal: 20, height: 54, borderRadius: 27, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  resetText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
