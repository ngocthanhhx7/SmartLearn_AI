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
    { role: 'assistant', content: 'Chào bạn! Tôi là Gia sư AI của Smartlearn. Hôm nay bạn muốn ôn tập kiến thức nào hay có câu hỏi gì cần giải đáp không?' },
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

  const sendQuickMessage = (text) => {
    setMessage(text);
  };

  const showQuickReplies = messages.length <= 2 && !loading;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backIcon, { color: theme.text }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.primary }]}>Gia sư AI</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={[styles.headerSub, { color: theme.textMuted }]}>Sẵn sàng hỗ trợ bạn</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.menuBtn}>
          <Text style={[styles.menuIcon, { color: theme.text }]}>⋮</Text>
        </TouchableOpacity>
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
          {/* Date divider */}
          <View style={styles.dateDivider}>
            <View style={[styles.dateLine, { backgroundColor: theme.border }]} />
            <Text style={[styles.dateText, { color: theme.textMuted }]}>HÔM NAY</Text>
            <View style={[styles.dateLine, { backgroundColor: theme.border }]} />
          </View>

          {messages.map((msg, i) => (
            <View key={i}>
              {msg.role === 'assistant' && (
                <Text style={[styles.senderLabel, { color: theme.textMuted }]}>Gia sư AI</Text>
              )}
              {msg.role === 'user' && (
                <Text style={[styles.senderLabelUser, { color: theme.textMuted }]}>Bạn</Text>
              )}
              <View style={[styles.msgRow, msg.role === 'user' && styles.msgRowUser]}>
                <View style={[
                  styles.bubble,
                  msg.role === 'user'
                    ? [styles.userBubble, { backgroundColor: theme.chatUserBubble }]
                    : [styles.aiBubble, { backgroundColor: theme.chatAiBubble }]
                ]}>
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
            </View>
          ))}

          {loading && (
            <View>
              <Text style={[styles.senderLabel, { color: theme.textMuted }]}>Gia sư AI</Text>
              <View style={[styles.msgRow]}>
                <View style={[styles.aiBubble, { backgroundColor: theme.chatAiBubble }]}>
                  <View style={styles.typingRow}>
                    <ActivityIndicator size="small" color={theme.primary} />
                    <Text style={[styles.typingText, { color: theme.textSecondary }]}>Đang suy nghĩ...</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Quick Reply Buttons */}
          {showQuickReplies && (
            <View style={styles.quickReplies}>
              <TouchableOpacity
                style={[styles.quickReplyBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => sendQuickMessage('Chụp ảnh bài tập')}
              >
                <Text style={[styles.quickReplyText, { color: theme.text }]}>📷 Chụp ảnh bài tập</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickReplyBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => sendQuickMessage('Nhập đề bài')}
              >
                <Text style={[styles.quickReplyText, { color: theme.text }]}>📝 Nhập đề bài</Text>
              </TouchableOpacity>
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
        <View style={[styles.inputBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
          <TouchableOpacity onPress={showImageOptions} style={[styles.addBtn, { backgroundColor: theme.surfaceAlt }]} disabled={loading}>
            <Text style={styles.addBtnIcon}>+</Text>
          </TouchableOpacity>
          <TextInput
            style={[styles.chatInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
            placeholder="Hỏi tôi bất cứ điều gì..."
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
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('VoiceChat')}
            style={[styles.voiceBtn, { backgroundColor: theme.primary + '20' }]}
            disabled={loading}
          >
            <Text style={styles.voiceBtnIcon}>🎙️</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14, borderBottomWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  backBtn: { padding: 6 },
  backIcon: { fontSize: 22, fontWeight: '600' },
  headerCenter: { alignItems: 'center', flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  statusDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#2ED573' },
  headerSub: { fontSize: 12 },
  menuBtn: { padding: 6 },
  menuIcon: { fontSize: 22, fontWeight: '800' },

  chatArea: { flex: 1 },

  dateDivider: { flexDirection: 'row', alignItems: 'center', marginVertical: 12, gap: 10 },
  dateLine: { flex: 1, height: 1 },
  dateText: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },

  senderLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4, marginTop: 8 },
  senderLabelUser: { fontSize: 11, fontWeight: '600', marginBottom: 4, marginTop: 8, textAlign: 'right' },

  msgRow: { flexDirection: 'row', marginBottom: 6, alignItems: 'flex-start' },
  msgRowUser: { justifyContent: 'flex-end' },

  bubble: { maxWidth: '82%', borderRadius: 20, padding: 14 },
  userBubble: { borderBottomRightRadius: 6, marginLeft: 'auto' },
  aiBubble: { borderBottomLeftRadius: 6 },
  userText: { fontSize: 15, lineHeight: 22 },

  chatImage: { width: 200, height: 150, borderRadius: 14, marginBottom: 8 },

  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typingText: { fontSize: 13 },

  quickReplies: { flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap' },
  quickReplyBtn: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1,
  },
  quickReplyText: { fontSize: 13, fontWeight: '600' },

  previewBar: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 1, gap: 12,
  },
  previewImage: { width: 50, height: 50, borderRadius: 12 },
  previewInfo: { flex: 1 },
  previewLabel: { fontSize: 13, fontWeight: '600' },
  previewHint: { fontSize: 11, marginTop: 2 },
  removeBtn: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  removeText: { fontWeight: '800', fontSize: 14 },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12,
    paddingVertical: 10, borderTopWidth: 1,
  },
  addBtn: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center', marginRight: 8,
  },
  addBtnIcon: { fontSize: 22, fontWeight: '300', color: '#888' },
  chatInput: {
    flex: 1, borderRadius: 20, paddingHorizontal: 16,
    paddingVertical: 10, fontSize: 14, maxHeight: 100, borderWidth: 1,
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center', marginLeft: 8,
  },
  sendIcon: { fontSize: 16, color: '#FFF' },
  voiceBtn: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center', marginLeft: 6,
  },
  voiceBtnIcon: { fontSize: 16 },
});
