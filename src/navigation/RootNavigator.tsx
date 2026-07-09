import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, StatusBar, Image } from 'react-native';
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
  const splashFade = useRef(new Animated.Value(1)).current;

  // Once the app has finished checking for a saved session, cross-fade
  // from the branded splash straight into the real screen - no spinner,
  // and the branded icon (rather than blank white) makes the brief wait
  // feel intentional instead of a flash.
  useEffect(() => {
    if (!isLoading) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.timing(splashFade, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [isLoading, fadeAnim, splashFade]);

  return (
    <View style={styles.flex}>
      <StatusBar hidden />

      {!isLoading && (
        <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
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
      )}

      {/* Branded splash - sits on top, fades out once ready instead of a blank white gap */}
      <Animated.View
        pointerEvents="none"
        style={[styles.splash, { opacity: splashFade }]}
      >
        <Image source={require('../assets/images/app-icon.png')} style={styles.splashIcon} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashIcon: { width: 84, height: 84, borderRadius: 20 },
});
