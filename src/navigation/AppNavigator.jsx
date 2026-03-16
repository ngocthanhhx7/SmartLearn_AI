import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LearningScreen from '../screens/LearningScreen';
import QuizScreen from '../screens/QuizScreen';
import ChatScreen from '../screens/ChatScreen';
import ReminderScreen from '../screens/ReminderScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import MoreScreen from '../screens/MoreScreen';
import StopwatchScreen from '../screens/StopwatchScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';

import CreateRoadmapScreen from '../screens/CreateRoadmapScreen';
import PreviewRoadmapScreen from '../screens/PreviewRoadmapScreen';
import MyRoadmapsScreen from '../screens/MyRoadmapsScreen';
import RoadmapDetailScreen from '../screens/RoadmapDetailScreen';

const Stack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const tabConfig = {
  'Trang chủ': '🏠',
  'Học tập': '📚',
  'Kiểm tra': '❓',
  'Hỏi AI': '💬',
  'Thêm': '⚙️',
};

function MoreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MoreMenu" component={MoreScreen} />
      <Stack.Screen name="Reminders" component={ReminderScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="Stopwatch" component={StopwatchScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>
            {tabConfig[route.name]}
          </Text>
        ),
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Trang chủ" component={DashboardScreen} />
      <Tab.Screen name="Học tập" component={LearningScreen} />
      <Tab.Screen name="Kiểm tra" component={QuizScreen} />
      <Tab.Screen name="Hỏi AI" component={ChatScreen} />
      <Tab.Screen name="Thêm" component={MoreStack} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AuthenticatedStack() {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="MainTabs" component={MainTabs} />
      <AppStack.Screen name="CreateRoadmap" component={CreateRoadmapScreen} />
      <AppStack.Screen name="PreviewRoadmap" component={PreviewRoadmapScreen} />
      <AppStack.Screen name="MyRoadmaps" component={MyRoadmapsScreen} />
      <AppStack.Screen name="RoadmapDetail" component={RoadmapDetailScreen} />
    </AppStack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AuthenticatedStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
