import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, ActivityIndicator, View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
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
import VoiceChatScreen from '../screens/VoiceChatScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

const Stack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ name, focused, color, size = 22 }) {
  const paths = {
    home: {
      default: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      filled: 'M10.707 2.293a1 1 0 00-1.414 0l-7 7A1 1 0 003 11h1v7a2 2 0 002 2h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a2 2 0 002-2v-7h1a1 1 0 00.707-1.707l-7-7z',
    },
    book: {
      default: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      filled: 'M12 4.5C10.668 3.56 9.103 3 7.5 3 5.388 3 3.504 3.956 2.25 5.47V18.53C3.504 17.016 5.388 16 7.5 16c1.603 0 3.168.56 4.5 1.5V4.5zm0 0C13.332 3.56 14.897 3 16.5 3c2.112 0 3.996.956 5.25 2.47V18.53C20.496 17.016 18.612 16 16.5 16c-1.603 0-3.168.56-4.5 1.5V4.5z',
    },
    quiz: {
      default: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
      filled: 'M9 2a2 2 0 00-2 2H6a3 3 0 00-3 3v12a3 3 0 003 3h12a3 3 0 003-3V7a3 3 0 00-3-3h-1a2 2 0 00-2-2H9zm0 2h6v1a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zm-1 8a1 1 0 110-2 1 1 0 010 2zm0 4a1 1 0 110-2 1 1 0 010 2zm3-4h4a1 1 0 110 2h-4a1 1 0 110-2zm0 4h4a1 1 0 110 2h-4a1 1 0 110-2z',
    },
    chat: {
      default: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      filled: 'M12 3C6.477 3 2 6.582 2 12c0 1.75.58 3.37 1.573 4.747L2.07 20.94a.75.75 0 00.96.96l4.193-1.503C8.663 21.38 10.27 21 12 21c5.523 0 10-3.582 10-9s-4.477-9-10-9zm-3 10.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm3 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm3 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z',
    },
    more: {
      default: 'M4 6h16M4 12h16M4 18h16',
      filled: 'M3 5.5A1.5 1.5 0 014.5 4h15a1.5 1.5 0 010 3h-15A1.5 1.5 0 013 5.5zm0 6A1.5 1.5 0 014.5 10h15a1.5 1.5 0 010 3h-15A1.5 1.5 0 013 11.5zm0 6A1.5 1.5 0 014.5 16h15a1.5 1.5 0 010 3h-15A1.5 1.5 0 013 17.5z',
    },
  };

  const icon = paths[name];
  if (!icon) return null;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {focused ? (
        <Path d={icon.filled} fill={color} />
      ) : (
        <Path d={icon.default} stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      )}
    </Svg>
  );
}

const TAB_ICONS = {
  'Trang chủ': 'home',
  'Học tập': 'book',
  'Kiểm tra': 'quiz',
  'Hỏi AI': 'chat',
  'Thêm': 'more',
};

function CustomTabBar({ state, descriptors, navigation }) {
  const { theme } = useTheme();

  return (
    <View style={[tabStyles.container, {
      backgroundColor: theme.tabBarBg,
      borderTopColor: theme.border,
    }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        };

        const onLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={tabStyles.tab}
            activeOpacity={0.7}
          >
            <View style={[
              tabStyles.iconWrap,
              isFocused && [tabStyles.iconWrapActive, { backgroundColor: theme.primaryLight }],
            ]}>
              <TabIcon
                name={TAB_ICONS[route.name]}
                focused={isFocused}
                color={isFocused ? theme.primary : theme.textMuted}
                size={isFocused ? 21 : 20}
              />
            </View>
            <Text style={[
              tabStyles.label,
              { color: isFocused ? theme.primary : theme.textMuted },
              isFocused && tabStyles.labelActive,
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 12,
  },
  tab: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3,
  },
  iconWrap: {
    width: 40, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrapActive: {
    width: 52, height: 32, borderRadius: 16,
  },
  label: {
    fontSize: 11, fontWeight: '500',
  },
  labelActive: {
    fontWeight: '700',
  },
});

function MoreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MoreMenu" component={MoreScreen} />
      <Stack.Screen name="Reminders" component={ReminderScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="Stopwatch" component={StopwatchScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
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
      <AppStack.Screen name="VoiceChat" component={VoiceChatScreen} />
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
