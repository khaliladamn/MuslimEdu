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

const BRAND_GREEN = '#0F9D58';
const Stack = createNativeStackNavigator();

// Branded hold screen shown while the saved-session check runs. Uses the
// brand green (not white) so there's no white flash on launch, and fades
// smoothly into the first real screen once loading finishes. No Expo /
// external splash dependency: it's a plain React Native view.
function BrandSplash() {
  return (
    <View style={styles.splash}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_GREEN} />
      <Image
        source={require('../assets/images/app-icon.png')}
        style={styles.splashLogo}
        resizeMode="contain"
      />
    </View>
  );
}

export default function RootNavigator() {
  const { user, isLoading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fade the real UI in once the session check finishes, so the branded
  // hold screen dissolves into the first screen with no hard cut or flash.
  useEffect(() => {
    if (!isLoading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading, fadeAnim]);

  if (isLoading) {
    return <BrandSplash />;
  }

  return (
    <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
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
  flex: { flex: 1, backgroundColor: '#FFFFFF' },
  splash: { flex: 1, backgroundColor: BRAND_GREEN, alignItems: 'center', justifyContent: 'center' },
  splashLogo: { width: 96, height: 96 },
});
