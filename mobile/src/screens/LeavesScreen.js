import React, { useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar, 
  Platform, 
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { leaveService } from '../services/api.service';
import { Calendar, Plus, ChevronRight, Briefcase, ChevronLeft, Clock, Info } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { staggerEntrance, makeEntranceValues, makePressScale } from '../utils/animations';

const { width } = Dimensions.get('window');

const StatBox = ({ label, value, type, navigation, colors, isDarkMode, styles, animValues }) => {
  const { scale, pressIn, pressOut } = React.useRef(makePressScale(0.93)).current;
  return (
    <Animated.View
      style={[
        {
          flex: 1,
          opacity: animValues ? animValues.opacity : 1,
          transform: [
            { translateY: animValues ? animValues.translateY : 0 },
            { scale },
          ],
        },
      ]}
    >
      <TouchableOpacity 
        style={[
          styles.statBox, 
          { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }
        ]}
        onPress={() => navigation.navigate('LeaveDetails', { type })}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={1}
      >
        <Text style={[styles.statValue, { color: colors.primary }]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const LeavesScreen = ({ navigation, route }) => {
  const { colors, isDarkMode } = useTheme();
  const styles = getStyles(colors, isDarkMode);
  const isManagerMode = route.params?.mode === 'manager';

  // ── Entrance animation values ────────────────────────────────────────────────
  const stat1 = useRef(makeEntranceValues(30)).current;
  const stat2 = useRef(makeEntranceValues(30)).current;
  const stat3 = useRef(makeEntranceValues(30)).current;
  const headerAnim = useRef(makeEntranceValues(35)).current;

  const safeLocalDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };
  
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
    init();
    // Staggered entrance for stat boxes and header
    staggerEntrance([headerAnim, stat1, stat2, stat3], 80, 400);
  }, [isManagerMode]);

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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Immersive Header */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={colors.primaryGradient}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <SafeAreaView edges={['top']} style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ChevronLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{isManagerMode ? 'Team Approvals' : 'Attendance Hub'}</Text>
            {!isManagerMode && (
              <TouchableOpacity 
                style={styles.addBtn}
                onPress={() => navigation.navigate('ApplyLeave')}
              >
                <Plus size={22} color={colors.primary} strokeWidth={3} />
              </TouchableOpacity>
            )}
            {isManagerMode && <View style={{ width: 44 }} />}
          </SafeAreaView>
          
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>{isManagerMode ? 'Request Center' : 'Leave Management'}</Text>
            <Text style={styles.heroSubtitle}>
              {isManagerMode ? 'Manage your team\'s time-off' : 'Track and plan your work sessions'}
            </Text>
          </View>
        </LinearGradient>
        
        {!isManagerMode && (
          <View style={styles.summaryFloating}>
            <StatBox label="Taken" value={leaveStats?.taken?.total || 0} type="taken" navigation={navigation} colors={colors} isDarkMode={isDarkMode} styles={styles} animValues={stat1} />
            <StatBox label="Pending" value={leaveStats?.pending?.total || 0} type="pending" navigation={navigation} colors={colors} isDarkMode={isDarkMode} styles={styles} animValues={stat2} />
            <StatBox label="Available" value={leaveStats?.available?.ANNUAL || 0} type="available" navigation={navigation} colors={colors} isDarkMode={isDarkMode} styles={styles} animValues={stat3} />
          </View>
        )}
      </View>


      <ScrollView contentContainerStyle={[styles.scrollContent, !isManagerMode && { paddingTop: 40 }]} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Fetching records...</Text>
          </View>
        ) : (
          <>
            {isManagerMode ? (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>PENDING APPROVALS ({requests.length})</Text>
                </View>
                
                {requests.map((item, index) => (
                  <AnimatedListItem key={item.id} index={index}>
                    <View style={styles.requestCard}>
                    <View style={styles.requestHeader}>
                      <View style={styles.avatarMini}>
                        <Text style={styles.avatarMiniText}>
                          {(item.user?.firstName?.[0] || '?')}{(item.user?.lastName?.[0] || '?')}
                        </Text>
                      </View>
                      <View style={styles.requestInfo}>
                        <Text style={styles.employeeName}>
                          {item.user?.firstName || 'Unknown'} {item.user?.lastName || ''}
                        </Text>
                        <Text style={styles.requestType}>{(item.type || '').replace('_', ' ')} Request</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: '#FFFBEB' }]}>
                        <Text style={[styles.statusText, { color: '#92400E' }]}>PENDING</Text>
                      </View>
                    </View>

                    <View style={styles.reasonContainer}>
                      <Text style={styles.reasonLabel}>Reason:</Text>
                      <Text style={styles.reasonText}>{item.reason || 'No reason provided'}</Text>
                    </View>

                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Calendar size={14} color={colors.primary} />
                        <Text style={styles.metaText}>
                          {safeLocalDate(item.startDate)} - {safeLocalDate(item.endDate)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.actionRow}>
                      <TouchableOpacity 
                        style={[styles.actionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.08)' }]}
                        onPress={() => handleStatusUpdate(item.id, 'REJECTED')}
                      >
                        <Text style={[styles.actionBtnText, { color: colors.error }]}>Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                        onPress={() => handleStatusUpdate(item.id, 'APPROVED')}
                      >
                        <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>Approve Request</Text>
                      </TouchableOpacity>
                    </View>
                    </View>
                  </AnimatedListItem>
                ))}
                {requests.length === 0 && (
                  <View style={styles.noDataCard}>
                    <Info size={32} color={colors.textLight} strokeWidth={1.5} />
                    <Text style={styles.noDataText}>No pending requests to review.</Text>
                  </View>
                )}
              </>
            ) : (
              <>
                <TouchableOpacity 
                  style={styles.wfhCard}
                  onPress={() => navigation.navigate('ApplyLeave', { type: 'WFH' })}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['rgba(11, 74, 236, 0.08)', 'rgba(11, 74, 236, 0.02)']}
                    style={styles.wfhIconBox}
                  >
                    <Briefcase size={22} color={colors.primary} />
                  </LinearGradient>
                  <View style={styles.wfhContent}>
                    <Text style={styles.wfhTitle}>Work From Home</Text>
                    <Text style={styles.wfhSubtitle}>Apply for remote work session</Text>
                  </View>
                  <View style={styles.chevronBox}>
                    <ChevronRight size={18} color={colors.textLight} />
                  </View>
                </TouchableOpacity>

                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
                </View>
                
                {userHistory.map((item, index) => {
                  const startDate = new Date(item.startDate);
                  const endDate = new Date(item.endDate);
                  
                  const isStartDateValid = !isNaN(startDate.getTime());
                  const isEndDateValid = !isNaN(endDate.getTime());
                  
                  let diffDays = '-';
                  if (isStartDateValid && isEndDateValid) {
                    const diffTime = Math.abs(endDate - startDate);
                    diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                  }
                  
                  const statusColor = item.status === 'APPROVED' ? colors.success : item.status === 'REJECTED' ? colors.error : colors.warning;
                  const statusBg = item.status === 'APPROVED' ? '#ECFDF5' : item.status === 'REJECTED' ? '#FEF2F2' : '#FFFBEB';
                  const labelColor = item.status === 'APPROVED' ? '#065F46' : item.status === 'REJECTED' ? '#991B1B' : '#92400E';

                  return (
                    <AnimatedListItem key={item.id || index} index={index}>
                      <View style={styles.historyCard}>
                        <View style={styles.historyTop}>
                          <View style={styles.historyInfo}>
                            <Text style={styles.historyType}>{(item.type || 'LEAVE').replace('_', ' ')}</Text>
                            <View style={styles.historyMeta}>
                              <Clock size={12} color={colors.textLight} />
                              <Text style={styles.historyDate}>
                                {safeLocalDate(item.startDate)} - {safeLocalDate(item.endDate)}
                              </Text>
                              <Text style={styles.historyDuration}>• {diffDays} {diffDays === '1' || diffDays === 1 ? 'Day' : 'Days'}</Text>
                            </View>
                          </View>
                          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                            <Text style={[styles.statusText, { color: labelColor }]}>{item.status}</Text>
                          </View>
                        </View>
                      </View>
                    </AnimatedListItem>
                  );
                })}
                
                {userHistory.length === 0 && (
                  <View style={styles.noDataCard}>
                    <Info size={32} color={colors.textLight} strokeWidth={1.5} />
                    <Text style={styles.noDataText}>No recent leave requests found.</Text>
                  </View>
                )}
              </>
            )}
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const getStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerWrapper: {
    marginBottom: 20,
    zIndex: 10,
  },
  headerGradient: {
    paddingBottom: 60,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginBottom: 24,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...colors.premiumShadow,
  },
  heroSection: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  summaryFloating: {
    position: 'absolute',
    bottom: -30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    ...colors.premiumShadow,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textLight,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 24,
  },
  loadingBox: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
  },
  sectionHeader: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.textLight,
    letterSpacing: 1.5,
  },
  wfhCard: {
    backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
    padding: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    ...colors.premiumShadow,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
  },
  wfhIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
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
  chevronBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: isDarkMode ? '#334155' : '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyCard: {
    backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
    padding: 16,
    borderRadius: 24,
    marginBottom: 12,
    ...colors.premiumShadow,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
  },
  historyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyInfo: {
    flex: 1,
  },
  historyType: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyDate: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600',
  },
  historyDuration: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  requestCard: {
    backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
    padding: 20,
    borderRadius: 32,
    marginBottom: 16,
    ...colors.premiumShadow,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarMini: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(11, 74, 236, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarMiniText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
  },
  requestInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
  },
  requestType: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  reasonContainer: {
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
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
    fontWeight: '500',
  },
  metaRow: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '800',
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
    marginTop: 12,
    textAlign: 'center',
  },
});


/**
 * Animated list item that fades + slides up on mount,
 * based on its index for a stagger effect.
 */
const AnimatedListItem = ({ children, index = 0 }) => {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(24)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        delay: index * 70,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 350,
        delay: index * 70,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
};

export default LeavesScreen;

