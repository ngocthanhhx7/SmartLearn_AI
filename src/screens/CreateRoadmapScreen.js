import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { generateRoadmap } from '../services/api';

const EXAMPLES = ['React Native', 'Machine Learning', 'Thiết kế UI/UX', 'Học JavaScript'];

export default function CreateRoadmapScreen({ navigation }) {
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
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Tạo Lộ Trình Học Tập</Text>

      <Text style={styles.label}>Bạn muốn học gì?</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập chủ đề... (VD: React Native)"
        placeholderTextColor="#8E8E93"
        value={topic}
        onChangeText={setTopic}
      />

      <Text style={styles.subLabel}>Hoặc chọn chủ đề gợi ý:</Text>
      <View style={styles.tagsContainer}>
        {EXAMPLES.map((ex, idx) => (
          <TouchableOpacity key={idx} style={styles.tag} onPress={() => setTopic(ex)}>
            <Text style={styles.tagText}>{ex}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
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
  container: { flex: 1, backgroundColor: '#0F0F23', padding: 20, paddingTop: 60 },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  label: { color: '#CCC', fontSize: 16, marginBottom: 10 },
  input: {
    backgroundColor: '#1A1A2E',
    color: '#FFF',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2A2A4A',
    marginBottom: 20,
  },
  subLabel: { color: '#8E8E93', fontSize: 14, marginBottom: 10 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 40 },
  tag: {
    backgroundColor: '#2A2A4A',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  tagText: { color: '#CCC', fontSize: 14 },
  button: {
    backgroundColor: '#6C63FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  buttonDisabled: { backgroundColor: '#4A4A6A' },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});
