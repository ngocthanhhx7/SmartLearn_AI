import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { generateRoadmap } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const EXAMPLES = ['React Native', 'Machine Learning', 'Thiết kế UI/UX', 'Học JavaScript'];

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
      <Text style={[styles.headerTitle, { color: theme.text }]}>Tạo Lộ Trình Học Tập</Text>

      <Text style={[styles.label, { color: theme.textSecondary }]}>Bạn muốn học gì?</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
        placeholder="Nhập chủ đề... (VD: React Native)"
        placeholderTextColor={theme.textMuted}
        value={topic}
        onChangeText={setTopic}
      />

      <Text style={[styles.subLabel, { color: theme.textMuted }]}>Hoặc chọn chủ đề gợi ý:</Text>
      <View style={styles.tagsContainer}>
        {EXAMPLES.map((ex, idx) => (
          <TouchableOpacity key={idx} style={[styles.tag, { backgroundColor: theme.surface }]} onPress={() => setTopic(ex)}>
            <Text style={[styles.tagText, { color: theme.textSecondary }]}>{ex}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: theme.primary, shadowColor: theme.primary }, loading && styles.buttonDisabled]} 
        onPress={handleGenerate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Tạo lộ trình học</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  label: { fontSize: 16, marginBottom: 10 },
  input: {
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  subLabel: { fontSize: 14, marginBottom: 10 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 40 },
  tag: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  tagText: { fontSize: 14 },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  buttonDisabled: { backgroundColor: '#4A4A6A' },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});
