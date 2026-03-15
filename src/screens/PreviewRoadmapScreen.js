import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { saveRoadmap } from '../services/api';

export default function PreviewRoadmapScreen({ navigation, route }) {
  const { roadmap, topic } = route.params;
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveRoadmap({ topic, roadmapData: roadmap });
      Alert.alert('Thành công', 'Đã lưu lộ trình học tập của bạn!', [
        { text: 'Xem lộ trình của tôi', onPress: () => navigation.navigate('MyRoadmaps') }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể lưu lộ trình. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Chi tiết lộ trình: {topic}</Text>
      
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {roadmap.levels?.map((level, index) => (
          <View key={index} style={styles.levelCard}>
            <Text style={styles.levelTitle}>Cấp độ {index + 1}: {level.title}</Text>
            
            <Text style={styles.sectionHeader}>Topics:</Text>
            {level.topics?.map((t, i) => (
              <Text key={i} style={styles.bulletItem}>• {t}</Text>
            ))}

            <Text style={styles.sectionHeader}>Tài liệu tham khảo:</Text>
            {level.resources?.map((res, i) => (
              <View key={i} style={styles.resourceCard}>
                <Text style={styles.resourceTitle}>{res.title}</Text>
                <Text style={styles.resourceDesc}>{res.description}</Text>
                <Text style={styles.resourceUrl}>{res.url}</Text>
              </View>
            ))}
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.outlineButton} onPress={() => navigation.goBack()} disabled={saving}>
          <Text style={styles.outlineButtonText}>Tạo lại</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.primaryButton, saving && styles.disabledButton]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Lưu lộ trình</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F23', paddingTop: 50 },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, paddingHorizontal: 20 },
  scrollContent: { paddingHorizontal: 20 },
  levelCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  levelTitle: { color: '#6C63FF', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  sectionHeader: { color: '#CCC', fontSize: 16, fontWeight: '600', marginTop: 10, marginBottom: 6 },
  bulletItem: { color: '#E0E0E0', fontSize: 15, marginLeft: 8, marginBottom: 4 },
  resourceCard: {
    backgroundColor: '#0F0F23',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  resourceTitle: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  resourceDesc: { color: '#AAA', fontSize: 13, marginTop: 2 },
  resourceUrl: { color: '#6C63FF', fontSize: 13, marginTop: 4 },
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#1A1A2E',
    borderTopWidth: 1,
    borderTopColor: '#2A2A4A',
  },
  outlineButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6C63FF',
    alignItems: 'center',
    marginRight: 10,
  },
  outlineButtonText: { color: '#6C63FF', fontSize: 16, fontWeight: 'bold' },
  primaryButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    marginLeft: 10,
  },
  disabledButton: { backgroundColor: '#4A4A6A' },
  primaryButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
