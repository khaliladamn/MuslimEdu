import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import StudentListScreen from '../screens/students/StudentListScreen';
import { getDashboardForRole } from './roleScreens';

const Stack = createNativeStackNavigator();

function SplashScreen() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#0F9D58" />
    </View>
  );
}

// Wraps whatever dashboard component matches the logged-in user's role.
// Kept as its own component (rather than inline) so React Navigation
// can render it as a normal screen.
function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return null;
  return getDashboardForRole(user.role);
}

export default function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Dashboard" component={DashboardRouter} />
            <Stack.Screen name="StudentsList" component={StudentListScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});
