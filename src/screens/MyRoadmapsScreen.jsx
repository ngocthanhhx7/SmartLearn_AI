import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { getUserRoadmaps } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function MyRoadmapsScreen({ navigation }) {
  const { theme } = useTheme();
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) loadRoadmaps();
  }, [isFocused]);

  const loadRoadmaps = async () => {
    try {
      const response = await getUserRoadmaps();
      setRoadmaps(response.data || []);
    } catch {
      setRoadmaps([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); loadRoadmaps(); };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.surface }]}
      onPress={() => navigation.navigate('RoadmapDetail', { id: item._id, topic: item.topic })}
      activeOpacity={0.7}
    >
      <View style={styles.cardRow}>
        <View style={[styles.cardIcon, { backgroundColor: theme.primaryLight }]}>
          <Text style={{ fontSize: 20 }}>📊</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>{item.topic}</Text>
          <Text style={[styles.cardDate, { color: theme.textMuted }]}>
            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
          </Text>
        </View>
        <Text style={{ color: theme.primary, fontSize: 18 }}>→</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backIcon, { color: theme.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Lộ trình của tôi</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Stats bar */}
      <View style={[styles.statsBar, { backgroundColor: theme.surface }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: theme.primary }]}>{roadmaps.length}</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Lộ trình</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: theme.primary }]}>{roadmaps.length > 0 ? roadmaps.length : 0}</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Đang học</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : roadmaps.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>📚</Text>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Chưa có lộ trình nào</Text>
          <Text style={[styles.emptyDesc, { color: theme.textMuted }]}>
            Hãy tạo lộ trình đầu tiên để bắt đầu hành trình học tập!
          </Text>
          <TouchableOpacity
            style={[styles.createBtn, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('CreateRoadmap')}
          >
            <Text style={styles.createBtnText}>✨ Tạo lộ trình mới</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={roadmaps}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        />
      )}
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

  statsBar: {
    flexDirection: 'row', marginHorizontal: 20, borderRadius: 14,
    padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 2 },
  statDivider: { width: 1, height: 36, alignSelf: 'center' },

  card: {
    borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardIcon: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardDate: { fontSize: 12 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  createBtn: {
    paddingVertical: 14, paddingHorizontal: 28, borderRadius: 24,
  },
  createBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
