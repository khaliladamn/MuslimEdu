import React, { useEffect, useRef, useState } from 'react';
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
import AnimatedSplash from '../components/AnimatedSplash';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, isLoading } = useAuth();

  // The animated splash stays mounted (covering everything) until its own
  // crossfade completes and calls onFinish. The nav tree is always mounted
  // underneath, so by the time the splash fades out the destination screen
  // is already laid out: zero white flash, no flicker, true crossfade.
  const [splashDone, setSplashDone] = useState(false);
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isLoading) {
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading, contentOpacity]);

  return (
    <View style={styles.flex}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Real content, always mounted so it's ready under the splash */}
      <Animated.View style={[styles.flex, { opacity: contentOpacity }]}>
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

      {/* Animated splash on top. Fades itself out once auth check is done. */}
      {!splashDone && (
        <AnimatedSplash
          ready={!isLoading}
          onFinish={() => setSplashDone(true)}
          logo={require('../assets/images/app-icon.png')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFFFFF' },
});
