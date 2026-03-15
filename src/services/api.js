import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.2.18:5000/api'; // Host IP for physical device
const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);
export const getProfile = () => api.get('/auth/profile');

// AI
export const generateLearningPlan = (topic) => api.post('/ai/learning-plan', { topic });
export const chatWithAI = (message, history) => api.post('/ai/chat', { message, history });
export const chatWithImage = (message, imageBase64, mimeType) =>
  api.post('/ai/chat-image', { message, imageBase64, mimeType });
export const generateQuiz = (topic) => api.post('/ai/generate-quiz', { topic });
export const analyzePerformance = (studyData, quizData) =>
  api.post('/ai/analyze-performance', { studyData, quizData });

// Study
export const createStudySession = (data) => api.post('/study/session', data);
// Roadmaps
export const generateRoadmap = (topic) => api.post('/ai/generate-roadmap', { topic });
export const saveRoadmap = (data) => api.post('/roadmap/save', data);
export const getUserRoadmaps = () => api.get('/roadmap/user');
export const getRoadmapById = (id) => api.get(`/roadmap/${id}`);

// Analytics
export const getAnalytics = () => api.get('/analytics');

export default api;
