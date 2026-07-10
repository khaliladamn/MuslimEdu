import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton, SkeletonCircle } from './Skeleton';

/**
 * Shown for the brief moment RootNavigator is checking Keychain / validating
 * a stored token, before it knows whether to render Login or a role
 * dashboard. Kept role-agnostic on purpose - a generic header + card shape
 * feels responsive without pretending to know content we don't have yet.
 */
export default function AppLaunchSkeleton() {
  return (
    <View style={styles.flex}>
      <View style={styles.headerRow}>
        <View>
          <Skeleton width={120} height={12} style={styles.mb8} />
          <Skeleton width={180} height={22} />
        </View>
        <SkeletonCircle size={54} />
      </View>

      <Skeleton width="100%" height={140} borderRadius={20} style={styles.mb16} />
      <Skeleton width="100%" height={90} borderRadius={20} style={styles.mb16} />

      <View style={styles.row}>
        <Skeleton width="31%" height={100} borderRadius={16} />
        <Skeleton width="31%" height={100} borderRadius={16} />
        <Skeleton width="31%" height={100} borderRadius={16} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 60 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  mb8: { marginBottom: 8 },
  mb16: { marginBottom: 16 },
});
