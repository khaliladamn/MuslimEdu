import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const EMERALD = '#0F9D58';
const INK = '#1C1C1E';
const SUBTLE = '#8E8E93';

interface DashboardShellProps {
  title: string;
  children?: React.ReactNode;
}

/**
 * Shared wrapper for every role's dashboard: shows the user's name, role,
 * a logout button, and renders whatever content that role's screen provides.
 * Keeps every dashboard visually consistent while letting each role's
 * actual content differ.
 */
export default function DashboardShell({ title, children }: DashboardShellProps) {
  const { user, logout } = useAuth();

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi, {user?.name}</Text>
          <Text style={styles.roleLabel}>{title}</Text>
        </View>
        <TouchableOpacity onPress={logout} hitSlop={10}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  greeting: { fontSize: 20, fontWeight: '600', color: INK },
  roleLabel: { fontSize: 14, color: SUBTLE, marginTop: 2, textTransform: 'capitalize' },
  logoutText: { color: '#D70015', fontSize: 14, fontWeight: '600' },
  content: { padding: 20, flexGrow: 1 },
});

export { EMERALD, INK, SUBTLE };
