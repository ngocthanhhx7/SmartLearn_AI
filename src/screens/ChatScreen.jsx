import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
  Image, Alert, ActionSheetIOS,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { chatWithAI, chatWithImage } from '../services/api';
import MessageFormatter from '../components/MessageFormatter';
import { useTheme } from '../context/ThemeContext';

export default function ChatScreen({ navigation }) {
  const { theme } = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Xin chào! Mình là Gia sư AI của bạn. 👋\n\nMình có thể giải thích khái niệm, đưa ví dụ, so sánh ý tưởng và giúp bạn học bất kỳ chủ đề nào.\n\n📷 Bạn cũng có thể gửi ảnh bài tập để mình giải thích nhé!\n\nBạn muốn học gì hôm nay?' },
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const scrollRef = useRef();

  const pickImage = async (useCamera) => {
    const permMethod = useCamera
      ? ImagePicker.requestCameraPermissionsAsync
      : ImagePicker.requestMediaLibraryPermissionsAsync;

    const { status } = await permMethod();
    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập', useCamera ? 'Vui lòng cho phép truy cập camera' : 'Vui lòng cho phép truy cập thư viện ảnh');
      return;
    }

    const launchMethod = useCamera
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync;

    const result = await launchMethod({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets?.[0]) {
      setSelectedImage(result.assets[0]);
    }
  };

  const showImageOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Hủy', '📷 Chụp ảnh', '🖼️ Chọn từ thư viện'],
          cancelButtonIndex: 0,
        },
        (idx) => {
          if (idx === 1) pickImage(true);
          if (idx === 2) pickImage(false);
        }
      );
    } else {
      Alert.alert('Tải ảnh lên', 'Chọn nguồn ảnh', [
        { text: 'Hủy', style: 'cancel' },
        { text: '📷 Chụp ảnh', onPress: () => pickImage(true) },
        { text: '🖼️ Thư viện ảnh', onPress: () => pickImage(false) },
      ]);
    }
  };

  const removeImage = () => setSelectedImage(null);

  const sendMessage = async () => {
    if ((!message.trim() && !selectedImage) || loading) return;

    const userContent = message.trim() || (selectedImage ? 'Hãy phân tích hình ảnh này' : '');
    const userMsg = {
      role: 'user',
      content: userContent,
      image: selectedImage?.uri || null,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setMessage('');
    const imgToSend = selectedImage;
    setSelectedImage(null);
    setLoading(true);

    try {
      let res;
      if (imgToSend?.base64) {
        res = await chatWithImage(userContent, imgToSend.base64, 'image/jpeg');
      } else {
        const history = newMessages
          .filter((m) => !m.image)
          .map((m) => ({ role: m.role, content: m.content }));
        res = await chatWithAI(userContent, history.slice(-10));
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Xin lỗi, mình không thể xử lý yêu cầu này. Vui lòng thử lại nhé.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.avatarContainer, { backgroundColor: theme.primaryLight, borderColor: theme.primaryLight }]}>
            <Text style={styles.avatarText}>🤖</Text>
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Gia sư AI</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: theme.accent }]} />
              <Text style={[styles.headerSub, { color: theme.textSecondary }]}>Sẵn sàng hỗ trợ bạn</Text>
            </View>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        {/* Chat Messages */}
        <ScrollView
          ref={scrollRef}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          style={styles.chatArea}
          contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, i) => (
            <View key={i} style={[styles.msgRow, msg.role === 'user' && styles.msgRowUser]}>
              {msg.role === 'assistant' && (
                <View style={[styles.aiAvatar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Text style={{ fontSize: 16 }}>🤖</Text>
                </View>
              )}
              <View style={[styles.bubble, msg.role === 'user' ? [styles.userBubble, { backgroundColor: theme.primary }] : [styles.aiBubble, { backgroundColor: theme.surface, borderColor: theme.border }]]}>
                {msg.image && (
                  <Image source={{ uri: msg.image }} style={styles.chatImage} resizeMode="cover" />
                )}
                {msg.role === 'assistant' ? (
                  <MessageFormatter text={msg.content} />
                ) : (
                  <Text style={[styles.userText, { color: '#FFF' }]}>{msg.content}</Text>
                )}
              </View>
            </View>
          ))}

          {loading && (
            <View style={[styles.msgRow]}>
              <View style={[styles.aiAvatar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={{ fontSize: 16 }}>🤖</Text>
              </View>
              <View style={[styles.aiBubble, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.typingRow}>
                  <ActivityIndicator size="small" color={theme.primary} />
                  <Text style={[styles.typingText, { color: theme.textSecondary }]}>Đang suy nghĩ...</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Image Preview */}
        {selectedImage && (
          <View style={[styles.previewBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
            <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
            <View style={styles.previewInfo}>
              <Text style={[styles.previewLabel, { color: theme.text }]}>📷 Ảnh đã chọn</Text>
              <Text style={[styles.previewHint, { color: theme.textMuted }]}>Nhập câu hỏi hoặc bấm gửi</Text>
            </View>
            <TouchableOpacity onPress={removeImage} style={[styles.removeBtn, { backgroundColor: theme.destructiveLight }]}>
              <Text style={[styles.removeText, { color: theme.destructive }]}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input Bar */}
        <View style={[styles.inputBar, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
          <TouchableOpacity onPress={showImageOptions} style={[styles.imageBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} disabled={loading}>
            <Text style={styles.imageBtnIcon}>📷</Text>
          </TouchableOpacity>
          <TextInput
            style={[styles.chatInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
            placeholder="Nhập câu hỏi của bạn..."
            placeholderTextColor={theme.textMuted}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={2000}
            editable={!loading}
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={loading || (!message.trim() && !selectedImage)}
            style={[styles.sendBtn, { backgroundColor: theme.primary }, (!message.trim() && !selectedImage || loading) && { opacity: 0.4 }]}
          >
            <Text style={styles.sendIcon}>📤</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('VoiceChat')}
            style={[styles.voiceBtn, { backgroundColor: theme.accent }]}
            disabled={loading}
          >
            <Text style={styles.sendIcon}>🎙️</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 14, borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarContainer: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1,
  },
  avatarText: { fontSize: 20 },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  headerSub: { fontSize: 12 },

  // Chat area
  chatArea: { flex: 1 },
  msgRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' },
  msgRowUser: { justifyContent: 'flex-end' },
  aiAvatar: {
    width: 30, height: 30, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center', marginRight: 8, marginTop: 4,
    borderWidth: 1,
  },

  // Bubbles
  bubble: { maxWidth: '80%', borderRadius: 18, padding: 14 },
  userBubble: { borderBottomRightRadius: 4, marginLeft: 'auto' },
  aiBubble: { borderBottomLeftRadius: 4, borderWidth: 1 },
  userText: { fontSize: 15, lineHeight: 22 },

  // Chat image
  chatImage: { width: 200, height: 150, borderRadius: 12, marginBottom: 8 },

  // Typing
  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typingText: { fontSize: 13 },

  // Image preview
  previewBar: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 1, gap: 12,
  },
  previewImage: { width: 50, height: 50, borderRadius: 10 },
  previewInfo: { flex: 1 },
  previewLabel: { fontSize: 13, fontWeight: '600' },
  previewHint: { fontSize: 11, marginTop: 2 },
  removeBtn: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  removeText: { fontWeight: '800', fontSize: 14 },

  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12,
    paddingVertical: 10, borderTopWidth: 1,
  },
  imageBtn: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', marginRight: 8, borderWidth: 1,
  },
  imageBtnIcon: { fontSize: 18 },
  chatInput: {
    flex: 1, borderRadius: 20, paddingHorizontal: 16,
    paddingVertical: 10, fontSize: 15, maxHeight: 100, borderWidth: 1,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', marginLeft: 8,
  },
  sendIcon: { fontSize: 18 },
  voiceBtn: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', marginLeft: 6,
  },
});
