import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { generateQuiz, saveQuizResult } from '../services/api';

export default function QuizScreen() {
  const [topic, setTopic] = useState('');
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
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>📊 Kết quả kiểm tra</Text>
          </View>

          <LinearGradient
            colors={score.percent >= 70 ? ['#2ED57333', '#1A1A2E'] : ['#FF475733', '#1A1A2E']}
            style={styles.scoreCard}
          >
            <Text style={styles.scoreEmoji}>{score.percent >= 70 ? '🎉' : '💪'}</Text>
            <Text style={styles.scorePercent}>{score.percent}%</Text>
            <Text style={styles.scoreText}>
              {score.correct}/{score.total} câu trả lời đúng
            </Text>
            <Text style={styles.scoreMsg}>
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
              <View key={i} style={[styles.resultCard, isCorrect ? styles.correctCard : styles.wrongCard]}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultIcon}>{isCorrect ? '✅' : '❌'}</Text>
                  <Text style={styles.resultQ} numberOfLines={2}>{q.question}</Text>
                </View>
                <Text style={styles.resultAnswer}>Câu trả lời của bạn: {userAns}</Text>
                {!isCorrect && <Text style={styles.correctAnswer}>Đáp án đúng: {q.correctAnswer}</Text>}
                <Text style={styles.explanation}>{q.explanation}</Text>
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
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>❓ Kiểm tra: {topic}</Text>
            <Text style={styles.headerSub}>Câu hỏi {currentQ + 1}/{questions.length}</Text>
          </View>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${((currentQ + 1) / questions.length) * 100}%` }]} />
          </View>

          <View style={styles.questionCard}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>
                {q.type === 'multiple_choice' ? '📝 Trắc nghiệm' : q.type === 'true_false' ? '⚖️ Đúng/Sai' : '✍️ Tự luận ngắn'}
              </Text>
            </View>
            <Text style={styles.questionText}>{q.question}</Text>

            {q.type === 'short_answer' ? (
              <TextInput
                style={styles.shortInput}
                placeholder="Nhập câu trả lời..."
                placeholderTextColor="#666"
                value={answers[currentQ] || ''}
                onChangeText={(text) => selectAnswer(currentQ, text)}
              />
            ) : (
              q.options?.map((opt, oi) => (
                <TouchableOpacity
                  key={oi}
                  style={[styles.optionBtn, answers[currentQ] === opt && styles.optionSelected]}
                  onPress={() => selectAnswer(currentQ, opt)}
                >
                  <Text style={[styles.optionText, answers[currentQ] === opt && styles.optionTextSelected]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>

          <View style={styles.navRow}>
            {currentQ > 0 && (
              <TouchableOpacity style={styles.navBtn} onPress={() => setCurrentQ(currentQ - 1)}>
                <Text style={styles.navBtnText}>← Trước</Text>
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
              <TouchableOpacity style={styles.navBtn} onPress={() => setCurrentQ(currentQ + 1)}>
                <Text style={styles.navBtnText}>Tiếp →</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>❓ Tạo câu hỏi AI</Text>
          <Text style={styles.headerSub}>Nhập chủ đề và AI sẽ tạo câu hỏi kiểm tra riêng cho bạn</Text>
        </View>

        <View style={styles.inputSection}>
          <TextInput
            style={styles.topicInput}
            placeholder='VD: "Lập trình JavaScript"'
            placeholderTextColor="#666"
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
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#6C63FF" />
            <Text style={styles.loadingText}>AI đang tạo câu hỏi cho bạn...</Text>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Định dạng bài kiểm tra</Text>
          <View style={styles.infoRow}><Text style={styles.infoIcon}>📝</Text><Text style={styles.infoText}>5 câu trắc nghiệm</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoIcon}>⚖️</Text><Text style={styles.infoText}>3 câu đúng/sai</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoIcon}>✍️</Text><Text style={styles.infoText}>2 câu tự luận ngắn</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoIcon}>💡</Text><Text style={styles.infoText}>Kèm giải thích chi tiết</Text></View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F23' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 13, color: '#8E8EAA', marginTop: 6, lineHeight: 20 },
  inputSection: { paddingHorizontal: 20, gap: 12 },
  topicInput: {
    backgroundColor: '#1A1A2E', borderRadius: 14, paddingHorizontal: 16, height: 50,
    color: '#FFF', fontSize: 15, borderWidth: 1, borderColor: '#2A2A4A',
  },
  generateBtn: { height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  generateText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  loadingCard: { alignItems: 'center', padding: 40, margin: 20, backgroundColor: '#1A1A2E', borderRadius: 16 },
  loadingText: { color: '#8E8EAA', marginTop: 16, fontSize: 14 },
  infoCard: {
    backgroundColor: '#1A1A2E', margin: 20, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: '#2A2A4A',
  },
  infoTitle: { color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoIcon: { fontSize: 18, marginRight: 10 },
  infoText: { color: '#B8B8D0', fontSize: 14 },
  progressBar: { height: 6, backgroundColor: '#2A2A4A', marginHorizontal: 20, borderRadius: 3, marginBottom: 20 },
  progressFill: { height: 6, backgroundColor: '#6C63FF', borderRadius: 3 },
  questionCard: {
    backgroundColor: '#1A1A2E', marginHorizontal: 20, borderRadius: 16, padding: 24,
    borderWidth: 1, borderColor: '#2A2A4A',
  },
  typeBadge: { backgroundColor: '#6C63FF22', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 16 },
  typeText: { color: '#6C63FF', fontSize: 12, fontWeight: '700' },
  questionText: { color: '#FFF', fontSize: 17, fontWeight: '600', lineHeight: 26, marginBottom: 20 },
  optionBtn: {
    backgroundColor: '#0F0F23', borderRadius: 12, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#2A2A4A',
  },
  optionSelected: { borderColor: '#6C63FF', backgroundColor: '#6C63FF11' },
  optionText: { color: '#CCC', fontSize: 15 },
  optionTextSelected: { color: '#6C63FF', fontWeight: '600' },
  shortInput: {
    backgroundColor: '#0F0F23', borderRadius: 12, padding: 16, color: '#FFF',
    fontSize: 15, borderWidth: 1, borderColor: '#2A2A4A',
  },
  navRow: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 20 },
  navBtn: { backgroundColor: '#1A1A2E', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12 },
  navBtnText: { color: '#6C63FF', fontWeight: '700', fontSize: 14 },
  submitBtn: { paddingHorizontal: 30, paddingVertical: 14, borderRadius: 12 },
  submitText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  scoreCard: { marginHorizontal: 20, borderRadius: 20, padding: 30, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#2A2A4A' },
  scoreEmoji: { fontSize: 48, marginBottom: 10 },
  scorePercent: { color: '#FFF', fontSize: 48, fontWeight: '900' },
  scoreText: { color: '#B8B8D0', fontSize: 16, marginTop: 6 },
  scoreMsg: { color: '#8E8EAA', fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 22 },
  resultCard: { marginHorizontal: 20, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1 },
  correctCard: { backgroundColor: '#2ED57310', borderColor: '#2ED57344' },
  wrongCard: { backgroundColor: '#FF475710', borderColor: '#FF475744' },
  resultHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  resultIcon: { fontSize: 18, marginRight: 10, marginTop: 2 },
  resultQ: { color: '#FFF', fontSize: 14, fontWeight: '600', flex: 1 },
  resultAnswer: { color: '#B8B8D0', fontSize: 13, marginBottom: 4 },
  correctAnswer: { color: '#2ED573', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  explanation: { color: '#8E8EAA', fontSize: 12, lineHeight: 18, marginTop: 6, fontStyle: 'italic' },
  resetBtn: { marginHorizontal: 20, height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  resetText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
