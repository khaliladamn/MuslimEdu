import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import StudentListScreen from '../screens/students/StudentListScreen';
import OrphanReportScreen from '../screens/orphan/OrphanReportScreen';
import { getDashboardForRole } from './roleScreens';

const Stack = createNativeStackNavigator();

// Wraps whatever dashboard component matches the logged-in user's role.
function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return null;
  return getDashboardForRole(user.role);
}

export default function RootNavigator() {
  const { user, isLoading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Once the app has finished checking for a saved session, fade the whole
  // app in smoothly instead of showing a spinner.
  useEffect(() => {
    if (!isLoading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading, fadeAnim]);

  if (isLoading) {
    // Blank, matching background - no spinner. The fade-in above handles
    // the transition once ready, so this is only visible for a brief instant.
    return <View style={styles.blank} />;
  }

  return (
    <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
      <StatusBar hidden />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
          {user ? (
            <>
              <Stack.Screen name="Dashboard" component={DashboardRouter} options={{ animation: 'fade' }} />
              <Stack.Screen name="StudentsList" component={StudentListScreen} options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="OrphanReport" component={OrphanReportScreen} options={{ animation: 'slide_from_right' }} />
            </>
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  blank: { flex: 1, backgroundColor: '#FFFFFF' },
});
