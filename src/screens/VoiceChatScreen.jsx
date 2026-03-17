import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Alert, Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://smartlearn-backend-qxm7.onrender.com/api';
const WS_BASE = API_URL.replace(/^https?/, 'wss').replace(/\/api$/, '');
const IDLE_AI_TEXT = 'Nhấn nút micro để bắt đầu trò chuyện';

const RECORDING_OPTIONS = {
  android: {
    extension: '.wav',
    outputFormat: Audio.AndroidOutputFormat.DEFAULT,
    audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 256000,
  },
  ios: {
    extension: '.wav',
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 256000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {},
};

// Helper: Create WAV Header for PCM 16-bit 24kHz Mono
function createWavHeader(pcmDataLength, sampleRate = 24000) {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  /* RIFF identifier */
  view.setUint32(0, 0x52494646, false); // "RIFF"
  /* file length */
  view.setUint32(4, 36 + pcmDataLength, true);
  /* RIFF type */
  view.setUint32(8, 0x57415645, false); // "WAVE"
  /* format chunk identifier */
  view.setUint32(12, 0x666d7420, false); // "fmt "
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, 1, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 2, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  view.setUint32(36, 0x64617461, false); // "data"
  /* data chunk length */
  view.setUint32(40, pcmDataLength, true);

  return header;
}

export default function VoiceChatScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const [status, setStatus] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [aiText, setAiText] = useState(IDLE_AI_TEXT);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef(null);
  const recordingRef = useRef(null);
  const soundRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pcmAccumulatorRef = useRef([]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  useEffect(() => {
    if (status === 'recording') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 600, useNativeDriver: false }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: false }),
        ])
      ).start();
      Animated.timing(glowAnim, { toValue: 1, duration: 300, useNativeDriver: false }).start();
    } else if (status === 'aiSpeaking') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 400, useNativeDriver: false }),
          Animated.timing(glowAnim, { toValue: 0.3, duration: 400, useNativeDriver: false }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      glowAnim.stopAnimation();
      Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
      Animated.timing(glowAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    }
  }, [status]);

  const connect = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        return;
      }

      setStatus('connecting');
      setAiText('Đang kết nối với Gia sư AI...');

      const wsUrl = `${WS_BASE}/voice-chat?token=${token}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          switch (msg.type) {
            case 'ready':
              setIsConnected(true);
              setStatus('idle');
              setAiText('Gia sư AI sẵn sàng! Nhấn nút micro để nói.');
              break;

            case 'status':
              if (msg.status === 'reconnecting') {
                setIsConnected(false);
                setStatus('connecting');
                setAiText(msg.message || 'Đang kết nối lại với Gia sư AI...');
              }
              break;

            case 'audio':
              if (msg.data) {
                pcmAccumulatorRef.current.push({ data: msg.data, mimeType: msg.mimeType });
                setStatus('aiSpeaking');
              }
              break;

            case 'text':
              setAiText((prev) => {
                // If it's the initial placeholder, clear it
                if (prev === 'Đang nghe...' || prev === 'Đang xử lý...' || prev === 'Gia sư AI sẵn sàng! Nhấn nút micro để nói.' || prev === IDLE_AI_TEXT) {
                  return msg.data;
                }
                return prev + msg.data;
              });
              break;

            case 'transcript':
              if (msg.source === 'user') {
                setTranscript(msg.data || '');
              }
              if (msg.source === 'assistant' && msg.data) {
                setAiText((prev) => {
                  const placeholders = ['Đang nghe...', 'Đang xử lý...', 'Gia sư AI sẵn sàng! Nhấn nút micro để nói.', IDLE_AI_TEXT];
                  if (placeholders.includes(prev)) return msg.data;
                  return prev + msg.data;
                });
              }
              break;

            case 'turnComplete':
              playAccumulatedAudio();
              break;

            case 'error':
              setAiText(`Lỗi: ${msg.message}`);
              setStatus('idle');
              if (msg.code === 'SESSION_ENDED' || msg.code === 'GEMINI_WS_ERROR') {
                setIsConnected(false);
              }
              break;
          }
        } catch (err) {
          console.error('Parse error:', err);
        }
      };

      ws.onerror = () => {
        setAiText('Không thể kết nối. Vui lòng thử lại.');
        setStatus('idle');
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setStatus('idle');
        wsRef.current = null;
      };

      wsRef.current = ws;
    } catch (err) {
      Alert.alert('Lỗi kết nối', err.message);
      setStatus('idle');
    }
  }, []);

  const disconnect = useCallback(() => {
    if (recordingRef.current) {
      recordingRef.current.stopAndUnloadAsync().catch(() => { });
      recordingRef.current = null;
    }
    if (soundRef.current) {
      soundRef.current.unloadAsync().catch(() => { });
      soundRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    pcmAccumulatorRef.current = [];
    setIsConnected(false);
    setStatus('idle');
    setAiText(IDLE_AI_TEXT);
    setTranscript('');
  }, []);

  const playAccumulatedAudio = async () => {
    const chunks = pcmAccumulatorRef.current;
    pcmAccumulatorRef.current = [];

    if (chunks.length === 0) {
      setStatus('idle');
      return;
    }

    try {
      // Get sample rate from first chunk (all chunks share same session sample rate)
      const rateMatch = chunks[0].mimeType?.match(/rate=(\d+)/);
      const sampleRate = rateMatch ? parseInt(rateMatch[1]) : 24000;

      // Concatenate all raw PCM binary data into one continuous stream.
      // This is the key fix for stuttering: instead of playing each tiny chunk
      // (~100ms) separately with create/play/unload overhead, we merge everything
      // into one file and play it seamlessly.
      let totalPcmBinary = '';
      for (const chunk of chunks) {
        totalPcmBinary += atob(chunk.data);
      }

      const pcmLength = totalPcmBinary.length;
      const headerBuffer = createWavHeader(pcmLength, sampleRate);
      const headerBytes = new Uint8Array(headerBuffer);

      let wavBinary = '';
      for (let i = 0; i < headerBytes.length; i++) {
        wavBinary += String.fromCharCode(headerBytes[i]);
      }
      wavBinary += totalPcmBinary;
      const wavBase64 = btoa(wavBinary);

      const uri = `data:audio/wav;base64,${wavBase64}`;

      const { sound } = await Audio.Sound.createAsync({ uri });
      soundRef.current = sound;

      await sound.playAsync();

      await new Promise((resolve) => {
        sound.setOnPlaybackStatusUpdate((s) => {
          if (s.didJustFinish) resolve();
          if (s.error) {
            console.error('Playback error:', s.error);
            resolve();
          }
        });
      });

      await sound.unloadAsync();
      soundRef.current = null;
    } catch (err) {
      console.error('Audio playback error:', err);
    } finally {
      setStatus('idle');
    }
  };

  const startRecording = async () => {
    try {
      if (!isConnected) {
        await connect();
        return;
      }

      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cho phép sử dụng micro');
        return;
      }

      // Stop any current playback if user interrupts
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      pcmAccumulatorRef.current = [];

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      setStatus('recording');
      setAiText('Đang nghe...');
      setTranscript('');

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(RECORDING_OPTIONS);
      await recording.startAsync();
      recordingRef.current = recording;
    } catch (err) {
      console.error('Recording error:', err);
      setStatus('idle');
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    try {
      setStatus('processing');
      setAiText('Đang xử lý...');

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      if (uri && wsRef.current?.readyState === WebSocket.OPEN) {
        const response = await fetch(uri);
        const blob = await response.blob();
        const mimeType = blob.type || (Platform.OS === 'ios' ? 'audio/wav' : 'audio/x-wav');

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result.split(',')[1];
          wsRef.current.send(JSON.stringify({
            type: 'audio',
            data: base64,
            mimeType,
          }));
        };
        reader.readAsDataURL(blob);
      }
    } catch (err) {
      console.error('Stop recording error:', err);
      setStatus('idle');
    }
  };

  const handleMicPress = () => {
    if (status === 'recording') {
      stopRecording();
    } else if (status === 'idle' || status === 'aiSpeaking') {
      startRecording();
    }
  };

  const getMicIcon = () => {
    switch (status) {
      case 'connecting': return '⏳';
      case 'recording': return '🔴';
      case 'processing': return '⏳';
      case 'aiSpeaking': return '🔊';
      default: return '🎙️';
    }
  };

  const getStatusDisplay = () => {
    switch (status) {
      case 'connecting': return 'Đang kết nối...';
      case 'recording': return '🔴 Đang ghi âm - Nhấn để dừng';
      case 'processing': return 'AI đang suy nghĩ...';
      case 'aiSpeaking': return '🔊 AI đang trả lời';
      default: return isConnected ? '✅ Đã kết nối' : '⬇️ Nhấn micro để kết nối';
    }
  };

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', status === 'recording' ? '#EF4444' : theme.primary]
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.primary }]}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>🎙️ Gia sư AI Voice</Text>
        {isConnected && (
          <TouchableOpacity onPress={disconnect} style={[styles.disconnectBtn, { backgroundColor: theme.destructiveLight }]}>
            <Text style={[styles.disconnectText, { color: theme.destructive }]}>Ngắt</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* AI Response Area */}
      <View style={styles.contentArea}>
        <View style={[styles.aiResponseCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.aiLabel, { color: theme.textSecondary }]}>💬 Gia sư AI nói:</Text>
          <Text style={[styles.aiResponseText, { color: theme.text }]}>{aiText}</Text>
        </View>

        {transcript ? (
          <View style={[styles.userTranscript, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}>
            <Text style={[styles.transcriptLabel, { color: theme.primary }]}>🗣️ Bạn nói:</Text>
            <Text style={[styles.transcriptText, { color: theme.text }]}>{transcript}</Text>
          </View>
        ) : null}
      </View>

      {/* Mic Button */}
      <View style={styles.micArea}>
        <Text style={[styles.statusText, { color: theme.textSecondary }]}>{getStatusDisplay()}</Text>

        <Animated.View style={[
          styles.micGlow,
          { backgroundColor: glowColor, transform: [{ scale: pulseAnim }] }
        ]}>
          <TouchableOpacity
            style={[
              styles.micButton,
              { backgroundColor: status === 'recording' ? '#EF4444' : theme.primary },
              (status === 'connecting' || status === 'processing') && { opacity: 0.5 }
            ]}
            onPress={handleMicPress}
            disabled={status === 'connecting' || status === 'processing'}
            activeOpacity={0.7}
          >
            <Text style={styles.micIcon}>{getMicIcon()}</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={[styles.hint, { color: theme.textMuted }]}>
          {status === 'idle' && !isConnected ? 'Nhấn để kết nối & bắt đầu' : 'Nhấn để nói / dừng'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 14, borderBottomWidth: 1,
  },
  backBtn: { paddingVertical: 4 },
  backText: { fontSize: 15, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  disconnectBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  disconnectText: { fontSize: 13, fontWeight: '700' },

  contentArea: { flex: 1, paddingHorizontal: 20, paddingTop: 24, gap: 16 },

  aiResponseCard: {
    borderRadius: 16, padding: 20, borderWidth: 1, minHeight: 120,
  },
  aiLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  aiResponseText: { fontSize: 17, lineHeight: 26, fontWeight: '500' },

  userTranscript: {
    borderRadius: 12, padding: 14, borderWidth: 1, borderLeftWidth: 3,
  },
  transcriptLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  transcriptText: { fontSize: 14, lineHeight: 20 },

  micArea: { alignItems: 'center', paddingBottom: 50, paddingTop: 20, gap: 16 },

  statusText: { fontSize: 14, fontWeight: '600' },

  micGlow: {
    width: 120, height: 120, borderRadius: 60,
    justifyContent: 'center', alignItems: 'center',
  },
  micButton: {
    width: 90, height: 90, borderRadius: 45,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  micIcon: { fontSize: 36 },

  hint: { fontSize: 12 },
});
