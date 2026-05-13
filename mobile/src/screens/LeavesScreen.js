import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, StatusBar, Platform, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { leaveService } from '../services/api.service';
import { Calendar, Plus, ChevronRight, Briefcase, ChevronLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const StatBox = ({ label, value, type, navigation, styles }) => (
  <TouchableOpacity 
    style={styles.statBox}
    onPress={() => navigation.navigate('LeaveDetails', { type })}
  >
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </TouchableOpacity>
);

const LeavesScreen = ({ navigation, route }) => {
  const { colors, isDarkMode } = useTheme();
  const styles = getStyles(colors);
  const isManagerMode = route.params?.mode === 'manager';
  
  const [requests, setRequests] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [userData, setUserData] = React.useState(null);
  const [userHistory, setUserHistory] = React.useState([]);
  const [leaveStats, setLeaveStats] = React.useState({ 
    taken: { total: 0 }, 
    pending: { total: 0 }, 
    available: { ANNUAL: 15 } 
  });

  React.useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const savedUser = await AsyncStorage.getItem('userData');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          setUserData(user);
          if (isManagerMode) {
            await fetchRequests(user.id);
          } else {
            await fetchUserLeaveData(user.id);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [isManagerMode]);

  const fetchUserLeaveData = async (userId) => {
    try {
      const stats = await leaveService.getStats(userId);
      if (stats) setLeaveStats(stats);
      
      const history = await leaveService.getHistory(userId);
      if (history) setUserHistory(history);
    } catch (error) {
      console.error('Failed to fetch leave data:', error);
    }
  };

  const fetchRequests = async (managerId) => {
    try {
      const data = await leaveService.getRequests(managerId);
      setRequests(data.filter(r => r.status === 'PENDING'));
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };

  const handleStatusUpdate = async (leaveId, status) => {
    try {
      await leaveService.approveLeave(leaveId, status);
      if (userData) await fetchRequests(userData.id);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {isManagerMode && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15 }}>
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>{isManagerMode ? 'Team Approvals' : 'Leaves & WFH'}</Text>
        </View>
        {!isManagerMode && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('ApplyLeave')}
          >
            <Plus size={24} color={colors.white} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {!isManagerMode && (
              <View style={styles.summaryGrid}>
                <StatBox label="Taken" value={leaveStats?.taken?.total || 0} type="taken" navigation={navigation} styles={styles} />
                <StatBox label="Pending" value={leaveStats?.pending?.total || 0} type="pending" navigation={navigation} styles={styles} />
                <StatBox label="Available" value={leaveStats?.available?.ANNUAL || 0} type="available" navigation={navigation} styles={styles} />
              </View>
            )}

        {isManagerMode ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pending Approvals ({requests.length})</Text>
            </View>
            
            {requests.map((item) => (
              <View key={item.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <View style={styles.avatarMini}>
                    <Text style={styles.avatarMiniText}>{item.user.firstName?.[0]}{item.user.lastName?.[0]}</Text>
                  </View>
                  <View style={styles.requestInfo}>
                    <Text style={styles.employeeName}>{item.user.firstName} {item.user.lastName}</Text>
                    <Text style={styles.requestType}>{item.type.replace('_', ' ')} Request</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: colors.warning + '15' }]}>
                    <Text style={[styles.statusText, { color: colors.warning }]}>PENDING</Text>
                  </View>
                </View>

                <View style={styles.reasonContainer}>
                  <Text style={styles.reasonLabel}>Reason:</Text>
                  <Text style={styles.reasonText}>{item.reason || 'No reason provided'}</Text>
                </View>

                <View style={styles.dateRangeBox}>
                  <Calendar size={14} color={colors.textLight} />
                  <Text style={styles.dateRangeText}>
                    {new Date(item.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - {new Date(item.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </Text>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: colors.error + '10' }]}
                    onPress={() => handleStatusUpdate(item.id, 'REJECTED')}
                  >
                    <Text style={[styles.actionBtnText, { color: colors.error }]}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: colors.success }]}
                    onPress={() => handleStatusUpdate(item.id, 'APPROVED')}
                  >
                    <Text style={[styles.actionBtnText, { color: colors.white }]}>Approve</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {requests.length === 0 && !loading && (
              <View style={styles.noDataCard}>
                <Text style={styles.noDataText}>No pending requests to review.</Text>
              </View>
            )}
          </>
        ) : (
          <>
            <TouchableOpacity 
              style={styles.wfhCard}
              onPress={() => navigation.navigate('ApplyLeave', { type: 'WFH' })}
            >
              <View style={styles.wfhIconBox}>
                <Briefcase size={24} color={colors.primary} />
              </View>
              <View style={styles.wfhContent}>
                <Text style={styles.wfhTitle}>Work From Home</Text>
                <Text style={styles.wfhSubtitle}>Apply for remote work session</Text>
              </View>
              <ChevronRight size={20} color={colors.textLight} />
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Recent Requests</Text>
            
            {userHistory.map((item, index) => {
              const startDate = new Date(item.startDate);
              const endDate = new Date(item.endDate);
              const diffTime = Math.abs(endDate - startDate);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
              
              const statusColor = item.status === 'APPROVED' ? colors.success : item.status === 'REJECTED' ? colors.error : colors.warning;
              const statusBg = item.status === 'APPROVED' ? 'rgba(54, 179, 126, 0.15)' : item.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)';

              return (
                <View key={item.id || index} style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <View style={styles.requestInfo}>
                      <Text style={styles.requestType}>{item.type.replace('_', ' ')}</Text>
                      <Text style={styles.requestDate}>
                        {startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - {endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} ({diffDays} {diffDays === 1 ? 'Day' : 'Days'})
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                      <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
            
            {userHistory.length === 0 && !loading && (
              <View style={styles.noDataCard}>
                <Text style={styles.noDataText}>No recent leave requests found.</Text>
              </View>
            )}
          </>
        )}
          </>
        )}
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...colors.shadow,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statBox: {
    backgroundColor: colors.surface,
    width: (width - 64) / 3,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    ...colors.shadow,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  wfhCard: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    ...colors.shadow,
  },
  wfhIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 82, 204, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  wfhContent: {
    flex: 1,
  },
  wfhTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
  },
  wfhSubtitle: {
    fontSize: 13,
    color: colors.textLight,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 16,
  },
  requestCard: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    ...colors.shadow,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  requestInfo: {
    flex: 1,
  },
  requestType: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 13,
    color: colors.textLight,
    fontWeight: '600',
  },
  employeeName: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
  },
  avatarMini: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 82, 204, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarMiniText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.primary,
  },
  reasonContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
  },
  reasonLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textLight,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  dateRangeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  dateRangeText: {
    fontSize: 13,
    color: colors.textLight,
    fontWeight: '700',
  },
  noDataCard: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LeavesScreen;
