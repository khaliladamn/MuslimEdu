import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import StudentListScreen from '../screens/students/StudentListScreen';
import OrphanReportScreen from '../screens/orphan/OrphanReportScreen';
import AdminOrphanOverviewScreen from '../screens/orphan/AdminOrphanOverviewScreen';
import AdminChildReportDetailScreen from '../screens/orphan/AdminChildReportDetailScreen';
import MainTabs from './MainTabs';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, isLoading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Android already shows its own native splash (your app icon on white)
  // automatically before any JS runs - we don't need to recreate that here.
  // Once the saved-session check finishes, just fade the real app in.
  useEffect(() => {
    if (!isLoading) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }).start();
    }
  }, [isLoading, fadeAnim]);

  if (isLoading) {
    // Plain white - matches Android's native splash background, so the
    // handoff from native splash to this is invisible instead of a flash.
    return <View style={styles.blank} />;
  }

  return (
    <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
      <StatusBar hidden />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
          {user ? (
            <>
              <Stack.Screen name="MainTabs" component={MainTabs} options={{ animation: 'fade' }} />
              <Stack.Screen name="StudentsList" component={StudentListScreen} options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="OrphanReport" component={OrphanReportScreen} options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="AdminOrphanOverview" component={AdminOrphanOverviewScreen} options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="AdminChildReportDetail" component={AdminChildReportDetailScreen} options={{ animation: 'slide_from_right' }} />
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
