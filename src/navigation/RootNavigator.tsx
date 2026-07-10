import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import StudentListScreen from '../screens/students/StudentListScreen';
import OrphanReportScreen from '../screens/orphan/OrphanReportScreen';
import AdminOrphanOverviewScreen from '../screens/orphan/AdminOrphanOverviewScreen';
import AdminChildReportDetailScreen from '../screens/orphan/AdminChildReportDetailScreen';
import MainTabs from './MainTabs';

// Keep the native splash on screen while we check for a stored session.
// This removes the white loading/skeleton flash: the branded splash stays
// visible right up until the real first screen is mounted, so the user
// never sees a blank white frame in between.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* no-op: safe to ignore if the splash was already hidden */
});

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, isLoading } = useAuth();

  // Hide the native splash only once the session check is done AND the
  // navigation tree below has laid out its first screen. onLayout guarantees
  // there's real content painted underneath before the splash disappears.
  const onLayoutRootView = useCallback(async () => {
    if (!isLoading) {
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [isLoading]);

  // Belt-and-suspenders: also hide when loading flips false, in case the
  // layout callback already fired while we were still loading.
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isLoading]);

  // While the saved-session check runs, render nothing. The native splash is
  // still up (we prevented auto-hide above), so this is a seamless hold with
  // zero white flash rather than a spinner or skeleton screen.
  if (isLoading) {
    return null;
  }

  return (
    <View style={styles.flex} onLayout={onLayoutRootView}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFFFFF' },
});
