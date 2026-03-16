import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getRoadmapById } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function RoadmapDetailScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { id, topic } = route.params;
  const [roadmapData, setRoadmapData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetail();
  }, []);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const response = await getRoadmapById(id);
      setRoadmapData(response.data.roadmapData);
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể tải chi tiết lộ trình.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenLink = async (url) => {
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Lỗi', 'Không thể mở liên kết này.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={[styles.backIcon, { color: theme.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>{topic}</Text>
        <View style={{ width: 40 }} />
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
      ) : roadmapData ? (
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {roadmapData.levels?.map((level, index) => (
            <View key={index} style={[styles.levelCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.levelTitle, { color: theme.primary }]}>Cấp độ {index + 1}: {level.title}</Text>
              
              <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>Topics:</Text>
              {level.topics?.map((t, i) => (
                <Text key={i} style={[styles.bulletItem, { color: theme.text }]}>• {t}</Text>
              ))}

              <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>Tài liệu tham khảo (Nhấn để mở):</Text>
              {level.resources?.map((res, i) => (
                <TouchableOpacity key={i} style={[styles.resourceCard, { backgroundColor: theme.background, borderLeftColor: '#4CAF50' }]} onPress={() => handleOpenLink(res.url)}>
                  <Text style={[styles.resourceTitle, { color: theme.text }]}>{res.title}</Text>
                  <Text style={[styles.resourceDesc, { color: theme.textSecondary }]}>{res.description}</Text>
                  <Text style={[styles.resourceUrl, { color: theme.primary }]}>{res.url}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity 
                style={{ marginTop: 24 }}
                onPress={() => navigation.navigate('MainTabs', {
                  screen: 'Kiểm tra',
                  params: { initialTopic: `${topic} - ${level.title}` }
                })}
                activeOpacity={0.8}
              >
                <LinearGradient colors={['#6C63FF', '#4834DF']} style={styles.quizBtn}>
                  <Text style={styles.quizBtnText}>📝 Tạo bài kiểm tra kiến thức phần này</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      ) : (
        <View style={styles.errorState}>
          <Text style={[styles.errorText, { color: theme.textMuted }]}>Dữ liệu trống.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  backIcon: { fontSize: 24 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center' },
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
  resourceUrl: { fontSize: 13, marginTop: 4, textDecorationLine: 'underline' },
  errorState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16 },
  quizBtn: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  quizBtnText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
});
