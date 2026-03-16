import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

export default function LearningScreen({ navigation }) {
  const { theme, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>📚 Trợ lý học tập AI</Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
            Sử dụng trí tuệ nhân tạo để thiết kế các lộ trình học tập cá nhân hóa, tối ưu hóa thời gian và hiệu quả.
          </Text>
        </View>

        <View style={styles.roadmapActions}>
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={() => navigation.navigate('CreateRoadmap')}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#FF6B6B', '#EE5253']} style={styles.actionGradient}>
              <View style={styles.iconContainer}>
                <Text style={styles.actionIcon}>✨</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.actionTitle}>Tạo lộ trình AI nâng cao</Text>
                <Text style={styles.actionDesc}>Phân tích chi tiết mục tiêu, điểm mạnh để tạo lộ trình chuyên sâu.</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={() => navigation.navigate('MyRoadmaps')}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#10AC84', '#1DD1A1']} style={styles.actionGradient}>
              <View style={styles.iconContainer}>
                <Text style={styles.actionIcon}>📂</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.actionTitle}>Lộ trình của tôi</Text>
                <Text style={styles.actionDesc}>Quản lý và theo dõi tiến độ các lộ trình bạn đang học.</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 25 },
  headerTitle: { fontSize: 26, fontWeight: '800' },
  headerSub: { fontSize: 13, marginTop: 8, lineHeight: 20 },
  roadmapActions: { paddingHorizontal: 20, gap: 16 },
  actionBtn: { borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  actionGradient: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 16 },
  iconContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  actionIcon: { fontSize: 24 },
  textContainer: { flex: 1 },
  actionTitle: { color: '#FFF', fontSize: 17, fontWeight: '800', marginBottom: 4 },
  actionDesc: { color: 'rgba(255, 255, 255, 0.9)', fontSize: 12, lineHeight: 18 },
});
