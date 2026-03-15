import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Alert } from 'react-native';
import { getRoadmapById } from '../services/api';

export default function RoadmapDetailScreen({ navigation, route }) {
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{topic}</Text>
        <View style={{ width: 40 }} />
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#6C63FF" style={{ marginTop: 50 }} />
      ) : roadmapData ? (
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {roadmapData.levels?.map((level, index) => (
            <View key={index} style={styles.levelCard}>
              <Text style={styles.levelTitle}>Cấp độ {index + 1}: {level.title}</Text>
              
              <Text style={styles.sectionHeader}>Topics:</Text>
              {level.topics?.map((t, i) => (
                <Text key={i} style={styles.bulletItem}>• {t}</Text>
              ))}

              <Text style={styles.sectionHeader}>Tài liệu tham khảo (Nhấn để mở):</Text>
              {level.resources?.map((res, i) => (
                <TouchableOpacity key={i} style={styles.resourceCard} onPress={() => handleOpenLink(res.url)}>
                  <Text style={styles.resourceTitle}>{res.title}</Text>
                  <Text style={styles.resourceDesc}>{res.description}</Text>
                  <Text style={styles.resourceUrl}>{res.url}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      ) : (
        <View style={styles.errorState}>
          <Text style={styles.errorText}>Dữ liệu trống.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F23', paddingTop: 50 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  backIcon: { color: '#FFF', fontSize: 24 },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center' },
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
  resourceUrl: { color: '#6C63FF', fontSize: 13, marginTop: 4, textDecorationLine: 'underline' },
  errorState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#8E8E93', fontSize: 16 },
});
