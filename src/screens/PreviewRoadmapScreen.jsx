import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { saveRoadmap } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function PreviewRoadmapScreen({ navigation, route }) {
  const { theme } = useTheme();
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.headerTitle, { color: theme.text }]}>Chi tiết lộ trình: {topic}</Text>
      
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {roadmap.levels?.map((level, index) => (
          <View key={index} style={[styles.levelCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.levelTitle, { color: theme.primary }]}>Cấp độ {index + 1}: {level.title}</Text>
            
            <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>Topics:</Text>
            {level.topics?.map((t, i) => (
              <Text key={i} style={[styles.bulletItem, { color: theme.text }]}>• {t}</Text>
            ))}

            <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>Tài liệu tham khảo:</Text>
            {level.resources?.map((res, i) => (
              <View key={i} style={[styles.resourceCard, { backgroundColor: theme.background, borderLeftColor: '#4CAF50' }]}>
                <Text style={[styles.resourceTitle, { color: theme.text }]}>{res.title}</Text>
                <Text style={[styles.resourceDesc, { color: theme.textSecondary }]}>{res.description}</Text>
                <Text style={[styles.resourceUrl, { color: theme.primary }]}>{res.url}</Text>
              </View>
            ))}
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <TouchableOpacity style={[styles.outlineButton, { borderColor: theme.primary }]} onPress={() => navigation.goBack()} disabled={saving}>
          <Text style={[styles.outlineButtonText, { color: theme.primary }]}>Tạo lại</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.primary }, saving && styles.disabledButton]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Lưu lộ trình</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, paddingHorizontal: 20 },
  scrollContent: { paddingHorizontal: 20 },
  levelCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  levelTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  sectionHeader: { fontSize: 16, fontWeight: '600', marginTop: 10, marginBottom: 6 },
  bulletItem: { fontSize: 15, marginLeft: 8, marginBottom: 4 },
  resourceCard: {
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 3,
  },
  resourceTitle: { fontSize: 15, fontWeight: 'bold' },
  resourceDesc: { fontSize: 13, marginTop: 2 },
  resourceUrl: { fontSize: 13, marginTop: 4 },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
  },
  outlineButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginRight: 10,
  },
  outlineButtonText: { fontSize: 16, fontWeight: 'bold' },
  primaryButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  disabledButton: { backgroundColor: '#4A4A6A' },
  primaryButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
