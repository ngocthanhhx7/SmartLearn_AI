import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { generateRoadmap } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const EXAMPLES = [
  { emoji: '⚛️', label: 'React Native' },
  { emoji: '🤖', label: 'Machine Learning' },
  { emoji: '🎨', label: 'Thiết kế UI/UX' },
  { emoji: '📱', label: 'Học JavaScript' },
  { emoji: '🐍', label: 'Python' },
  { emoji: '☁️', label: 'Cloud Computing' },
];

export default function CreateRoadmapScreen({ navigation }) {
  const { theme } = useTheme();
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập chủ đề bạn muốn học.');
      return;
    }
    setLoading(true);
    try {
      const response = await generateRoadmap(topic);
      if (response.data) {
        navigation.navigate('PreviewRoadmap', { roadmap: response.data, topic });
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể tạo lộ trình. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={[styles.backIcon, { color: theme.text }]}>←</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Tạo Lộ Trình</Text>
            <View style={{ width: 32 }} />
          </View>

          {/* Hero card */}
          <View style={[styles.heroCard, { backgroundColor: theme.surface }]}>
            <View style={[styles.heroIconCircle, { backgroundColor: theme.primaryLight }]}>
              <Text style={{ fontSize: 26 }}>🗺️</Text>
            </View>
            <Text style={[styles.heroTitle, { color: theme.text }]}>Lộ trình học tập AI</Text>
            <Text style={[styles.heroDesc, { color: theme.textSecondary }]}>
              AI sẽ phân tích chủ đề và tạo lộ trình học tập chi tiết, phù hợp với trình độ của bạn.
            </Text>
          </View>

          {/* Input Section */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Bạn muốn học gì?</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={styles.inputIcon}>🔍</Text>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Nhập chủ đề... (VD: React Native)"
                placeholderTextColor={theme.textMuted}
                value={topic}
                onChangeText={setTopic}
                editable={!loading}
              />
            </View>
          </View>

          {/* Suggestions */}
          <View style={styles.suggestSection}>
            <Text style={[styles.suggestLabel, { color: theme.textMuted }]}>Chủ đề gợi ý</Text>
            <View style={styles.tagsContainer}>
              {EXAMPLES.map((ex, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.tag, { backgroundColor: theme.surface }, topic === ex.label && { backgroundColor: theme.primaryLight, borderColor: theme.primary, borderWidth: 1 }]}
                  onPress={() => setTopic(ex.label)}
                >
                  <Text style={{ fontSize: 14, marginRight: 6 }}>{ex.emoji}</Text>
                  <Text style={[styles.tagText, { color: theme.textSecondary }, topic === ex.label && { color: theme.primary, fontWeight: '600' }]}>{ex.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Info Card */}
          <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
            <Text style={{ fontSize: 16, marginBottom: 8 }}>📋</Text>
            <Text style={[styles.infoTitle, { color: theme.text }]}>Lộ trình sẽ bao gồm</Text>
            {[
              { icon: '📚', text: 'Các giai đoạn học tập chi tiết' },
              { icon: '🎯', text: 'Mục tiêu cụ thể cho từng phần' },
              { icon: '📖', text: 'Tài liệu và nguồn học tập' },
              { icon: '⏱️', text: 'Thời gian ước tính hoàn thành' },
            ].map((item, idx) => (
              <View key={idx} style={styles.infoRow}>
                <Text style={{ fontSize: 14 }}>{item.icon}</Text>
                <Text style={[styles.infoText, { color: theme.textSecondary }]}>{item.text}</Text>
              </View>
            ))}
          </View>

          {/* Loading indicator */}
          {loading && (
            <View style={[styles.loadingCard, { backgroundColor: theme.surface }]}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>AI đang tạo lộ trình cho bạn...</Text>
              <Text style={[styles.loadingHint, { color: theme.textMuted }]}>Quá trình này có thể mất 15-30 giây</Text>
            </View>
          )}

          {/* Generate Button */}
          <View style={styles.btnSection}>
            <TouchableOpacity
              onPress={handleGenerate}
              disabled={loading || !topic.trim()}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={!topic.trim() ? [theme.border, theme.border] : [theme.headerGradientStart, theme.headerGradientEnd]}
                style={styles.generateBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={[styles.generateText, !topic.trim() && { color: theme.textMuted }]}>
                    ✨ Tạo lộ trình học tập
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 22, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '800' },

  heroCard: {
    marginHorizontal: 20, borderRadius: 18, padding: 24, alignItems: 'center', marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  heroIconCircle: {
    width: 64, height: 64, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  heroTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  heroDesc: { fontSize: 13, lineHeight: 20, textAlign: 'center' },

  inputSection: { paddingHorizontal: 20, marginBottom: 20 },
  inputLabel: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, height: 52,
  },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, fontSize: 15 },

  suggestSection: { paddingHorizontal: 20, marginBottom: 24 },
  suggestLabel: { fontSize: 13, fontWeight: '600', marginBottom: 12 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tag: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 16, borderRadius: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  tagText: { fontSize: 13 },

  infoCard: {
    marginHorizontal: 20, borderRadius: 16, padding: 20, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  infoTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  infoText: { fontSize: 13, flex: 1 },

  loadingCard: {
    marginHorizontal: 20, borderRadius: 18, padding: 30, alignItems: 'center', marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  loadingText: { marginTop: 14, fontSize: 15, fontWeight: '600' },
  loadingHint: { marginTop: 6, fontSize: 12 },

  btnSection: { paddingHorizontal: 20 },
  generateBtn: {
    height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center',
  },
  generateText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
