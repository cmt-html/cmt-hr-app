import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ChevronLeft, Info, PieChart } from 'lucide-react-native';

const LeaveDetailsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const stats = {
    taken: { total: 4, ANNUAL: 2, SICK: 1, CASUAL: 1, WFH: 1 },
    pending: { total: 1, ANNUAL: 1, SICK: 0, CASUAL: 0, WFH: 0 },
    available: { ANNUAL: 13, SICK: 9 }
  };

  const StatRow = ({ label, value, subLabel }) => (
    <View style={styles.statRow}>
      <View>
        <Text style={styles.statLabel}>{label}</Text>
        {subLabel && <Text style={styles.statSubLabel}>{subLabel}</Text>}
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leave Statistics</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryCard}>
          <PieChart size={40} color={colors.primary} />
          <View style={styles.summaryTextSection}>
            <Text style={styles.totalTakenText}>{stats.taken.total} Days Taken</Text>
            <Text style={styles.yearText}>Year 2026</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Breakdown by Type</Text>
          <View style={styles.card}>
            <StatRow label="Annual Leave" value={stats.taken.ANNUAL} subLabel={`${stats.available.ANNUAL} remaining`} />
            <View style={styles.divider} />
            <StatRow label="Sick Leave" value={stats.taken.SICK} subLabel={`${stats.available.SICK} remaining`} />
            <View style={styles.divider} />
            <StatRow label="Casual Leave" value={stats.taken.CASUAL} />
            <View style={styles.divider} />
            <StatRow label="Work From Home" value={stats.taken.WFH} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pending Requests</Text>
          <View style={[styles.card, { borderColor: colors.warning }]}>
            <StatRow label="Annual Leave (Pending)" value={stats.pending.ANNUAL} />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Info size={16} color={colors.primary} />
          <Text style={styles.infoText}>
            Statistics are updated in real-time as your manager approves or rejects requests.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    padding: 24,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...colors.shadow,
    zIndex: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
  },
  scrollContent: {
    padding: 24,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: 28,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 30,
    ...colors.shadow,
  },
  summaryTextSection: {
    marginLeft: 20,
  },
  totalTakenText: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.text,
  },
  yearText: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '700',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.textLight,
    textTransform: 'uppercase',
    marginBottom: 14,
    marginLeft: 5,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    ...colors.shadow,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  statSubLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.5,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 82, 204, 0.05)',
    borderRadius: 16,
    marginTop: 10,
  },
  infoText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 12,
    flex: 1,
    fontWeight: '600',
    lineHeight: 18,
  },
});

export default LeaveDetailsScreen;
