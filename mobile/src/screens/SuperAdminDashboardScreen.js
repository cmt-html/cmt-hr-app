import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, FlatList, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import api from '../services/api.service';
import { ChevronLeft, Building2, CheckCircle2, XCircle, Ban, Users, BarChart3, Clock, Plus } from 'lucide-react-native';

const SuperAdminDashboardScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, orgsRes] = await Promise.all([
        api.get('/super/stats'),
        api.get('/super/organizations')
      ]);
      setStats(statsRes.data);
      setOrganizations(orgsRes.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch platform data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleUpdateStatus = async (orgId, newStatus) => {
    try {
      await api.put(`/super/organizations/${orgId}/status`, { status: newStatus });
      Alert.alert('Success', `Organization ${newStatus.toLowerCase()} successfully`);
      fetchData(); // Refresh list
    } catch (error) {
      Alert.alert('Update Failed', error.response?.data?.message || 'Something went wrong');
    }
  };

  const renderOrgItem = ({ item }) => (
    <View style={styles.orgCard}>
      <View style={styles.orgHeader}>
        <View style={styles.orgInfo}>
          <Text style={styles.orgName}>{item.name}</Text>
          <Text style={styles.orgEmail}>{item.email}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.orgStats}>
        <View style={styles.statMini}>
          <Users size={14} color={colors.textLight} />
          <Text style={styles.statMiniText}>{item._count.users} Users</Text>
        </View>
        <View style={styles.statMini}>
          <Clock size={14} color={colors.textLight} />
          <Text style={styles.statMiniText}>Joined {new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        {item.status === 'PENDING' && (
          <>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: colors.success + '15' }]} 
              onPress={() => handleUpdateStatus(item.id, 'APPROVED')}
            >
              <CheckCircle2 size={18} color={colors.success} />
              <Text style={[styles.actionBtnText, { color: colors.success }]}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: colors.error + '15' }]}
              onPress={() => handleUpdateStatus(item.id, 'REJECTED')}
            >
              <XCircle size={18} color={colors.error} />
              <Text style={[styles.actionBtnText, { color: colors.error }]}>Reject</Text>
            </TouchableOpacity>
          </>
        )}
        {item.status === 'APPROVED' && (
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.warning + '15' }]}
            onPress={() => handleUpdateStatus(item.id, 'DISABLED')}
          >
            <Ban size={18} color={colors.warning} />
            <Text style={[styles.actionBtnText, { color: colors.warning }]}>Disable</Text>
          </TouchableOpacity>
        )}
        {item.status === 'DISABLED' && (
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.success + '15' }]}
            onPress={() => handleUpdateStatus(item.id, 'APPROVED')}
          >
            <CheckCircle2 size={18} color={colors.success} />
            <Text style={[styles.actionBtnText, { color: colors.success }]}>Enable</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return colors.success;
      case 'PENDING': return colors.warning;
      case 'REJECTED': return colors.error;
      case 'DISABLED': return '#64748b';
      default: return colors.textLight;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Platform Admin</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('RegisterOrganization')} 
          style={styles.addButton}
        >
          <Plus size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={organizations}
        keyExtractor={(item) => item.id}
        renderItem={renderOrgItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={styles.dashboardHeader}>
            <Text style={styles.welcomeTitle}>Super Admin</Text>
            <Text style={styles.welcomeSubtitle}>Monitor all organizations from here</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Building2 size={24} color={colors.primary} />
                <Text style={styles.statVal}>{stats?.totalOrgs || 0}</Text>
                <Text style={styles.statLabel}>Total Orgs</Text>
              </View>
              <View style={styles.statCard}>
                <BarChart3 size={24} color={colors.success} />
                <Text style={styles.statVal}>${stats?.totalRevenue || 0}</Text>
                <Text style={styles.statLabel}>MRR</Text>
              </View>
              <View style={styles.statCard}>
                <Clock size={24} color={colors.warning} />
                <Text style={styles.statVal}>{stats?.trialOrgs || 0}</Text>
                <Text style={styles.statLabel}>In Trial</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Registered Organizations</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Building2 size={48} color={colors.textLight} />
            <Text style={styles.emptyText}>No organizations found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...colors.shadow,
  },
  addButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  listContent: {
    padding: 20,
  },
  dashboardHeader: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: colors.textLight,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 20,
    width: '31%',
    alignItems: 'center',
    ...colors.shadow,
  },
  statVal: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  orgCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    ...colors.shadow,
  },
  orgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orgName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  orgEmail: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  orgStats: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  statMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statMiniText: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 12,
    color: colors.textLight,
    fontSize: 15,
  },
});

export default SuperAdminDashboardScreen;
