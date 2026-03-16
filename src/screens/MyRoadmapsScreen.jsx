import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { getUserRoadmaps } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function MyRoadmapsScreen({ navigation }) {
  const { theme } = useTheme();
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadRoadmaps();
    }
  }, [isFocused]);

  const loadRoadmaps = async () => {
    setLoading(true);
    try {
      const response = await getUserRoadmaps();
      setRoadmaps(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: theme.surface, borderLeftColor: theme.primary }]} 
      onPress={() => navigation.navigate('RoadmapDetail', { id: item._id, topic: item.topic })}
    >
      <Text style={[styles.cardTitle, { color: theme.text }]}>{item.topic}</Text>
      <Text style={[styles.cardDate, { color: theme.textSecondary }]}>
        Tạo lúc: {new Date(item.createdAt).toLocaleDateString('vi-VN')}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.headerTitle, { color: theme.text }]}>Lộ trình của tôi</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
      ) : roadmaps.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>Bạn chưa lưu lộ trình nào.</Text>
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: theme.primary }]} 
            onPress={() => navigation.navigate('CreateRoadmap')}
          >
            <Text style={styles.primaryButtonText}>Tạo lộ trình mới</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={roadmaps}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 50 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: {
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  cardDate: { fontSize: 13 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, marginBottom: 20 },
  primaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  primaryButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
