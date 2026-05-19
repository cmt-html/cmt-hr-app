import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar, 
  Dimensions, 
  RefreshControl,
  ActivityIndicator,
  Animated,
  Easing,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { 
  Bell, 
  UserCheck, 
  Calendar, 
  Briefcase, 
  Clock, 
  ArrowUpRight, 
  Zap, 
  ChevronRight, 
  Sparkles,
  CreditCard
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { attendanceService, leaveService } from '../services/api.service';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

const parseSafeDate = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  
  // Try standard parsing
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const year = d.getFullYear();
    if (year >= 1900 && year <= 2100) {
      return d;
    }
  }
  
  // Try regex parsing for YYYY-MM-DD
  const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    const parsed = new Date(year, month, day);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  
  return null;
};

const DashboardScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  
  const [userData, setUserData] = useState(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [timer, setTimer] = useState(0);
  const [hasCheckedOutToday, setHasCheckedOutToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState(0);
  const [presentDays, setPresentDays] = useState(0);
  const [pulseAnim] = useState(new Animated.Value(1));

  useFocusEffect(
    React.useCallback(() => {
      const init = async () => {
        try {
          const savedUser = await AsyncStorage.getItem('userData');
          if (savedUser) {
            const user = JSON.parse(savedUser);
            setUserData(user);
            await syncWithBackend(user.id);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      init();
    }, [])
  );

  useEffect(() => {
    let interval;
    if (isCheckedIn && !isOnBreak) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn, isOnBreak]);

  // Real-time synchronization polling (syncs status with web app every 5 seconds)
  useEffect(() => {
    let pollInterval = null;
    if (userData?.id) {
      pollInterval = setInterval(() => {
        syncWithBackend(userData.id);
      }, 5000);
    }
    return () => clearInterval(pollInterval);
  }, [userData?.id]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease)
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease)
        })
      ])
    ).start();
  }, []);

  const syncWithBackend = async (userId) => {
    try {
      const history = await attendanceService.getHistory(userId);
      if (history && history.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = history.find(r => {
          const rawDate = r.date || r.checkIn || r.createdAt;
          if (!rawDate) return false;
          const rawDateStr = typeof rawDate === 'string' ? rawDate : (rawDate instanceof Date ? rawDate.toISOString() : String(rawDate));
          return rawDateStr.startsWith(today);
        });
        
        if (todayRecord && !todayRecord.checkOut) {
          // ── Calculate elapsed seconds from the stored checkIn timestamp ──
          const parsedCheckIn = parseSafeDate(todayRecord.checkIn);
          const start = parsedCheckIn ? parsedCheckIn.getTime() : NaN;
          const elapsedSeconds = !isNaN(start)
            ? Math.floor((new Date().getTime() - start) / 1000)
            : 0;

          // Set timer FIRST so the interval never starts from 0
          setTimer(elapsedSeconds);
          setIsCheckedIn(true);
          setHasCheckedOutToday(false);
        } else if (todayRecord && todayRecord.checkOut) {
          setIsCheckedIn(false);
          setHasCheckedOutToday(true);
          
          const checkOutTime = parseSafeDate(todayRecord.checkOut);
          const checkInTime = parseSafeDate(todayRecord.checkIn);
          if (checkOutTime && checkInTime) {
            const timeSinceCheckOut = Math.floor((new Date().getTime() - checkOutTime.getTime()) / 1000);
            if (timeSinceCheckOut < 7200) {
              const elapsedSeconds = Math.floor((checkOutTime.getTime() - checkInTime.getTime()) / 1000);
              setTimer(elapsedSeconds);
            } else {
              setTimer(0);
            }
          } else {
            setTimer(0);
          }
        } else {
          setIsCheckedIn(false);
          setHasCheckedOutToday(false);
          setTimer(0);
        }
        setPresentDays(history.filter(r => r.status === 'PRESENT').length);
      } else {
        setIsCheckedIn(false);
        setHasCheckedOutToday(false);
        setTimer(0);
      }

      const leaveStats = await leaveService.getStats(userId);
      if (leaveStats) setLeaveBalance(leaveStats.available?.ANNUAL || 0);
    } catch (error) {
      console.error('Sync Error:', error);
    }
  };


  const handleCheckIn = async () => {
    try {
      let locationStr = 'Remote Office';
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const lastLoc = await Location.getLastKnownPositionAsync();
          if (lastLoc) {
            locationStr = `${lastLoc.coords.latitude}, ${lastLoc.coords.longitude}`;
          } else {
            const locPromise = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 2000));
            const loc = await Promise.race([locPromise, timeoutPromise]);
            if (loc) {
              locationStr = `${loc.coords.latitude}, ${loc.coords.longitude}`;
            }
          }
        }
      } catch (locErr) {
        console.warn('Error fetching device location:', locErr);
      }

      if (!isCheckedIn) {
        await attendanceService.checkIn(userData.id, locationStr);
        setIsCheckedIn(true);
        await syncWithBackend(userData.id);
      } else {
        const res = await attendanceService.checkOut(userData.id, locationStr);
        setIsCheckedIn(false);
        setIsOnBreak(false);
        
        if (res?.attendance?.checkIn && res?.attendance?.checkOut) {
          const checkInTime = parseSafeDate(res.attendance.checkIn);
          const checkOutTime = parseSafeDate(res.attendance.checkOut);
          if (checkInTime && checkOutTime) {
            const elapsed = Math.floor((checkOutTime.getTime() - checkInTime.getTime()) / 1000);
            setTimer(elapsed);
          }
        } else {
          setTimer(0);
        }
        
        await syncWithBackend(userData.id);
      }
    } catch (e) {
      const errMsg = e.response?.data?.message || '';
      if (errMsg.includes('No active check-in session') || errMsg.includes('already exists')) {
        await syncWithBackend(userData.id);
      } else {
        Alert.alert('Attendance Sync', errMsg || 'Attendance action failed');
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (userData) await syncWithBackend(userData.id);
    setRefreshing(false);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Premium Header Background */}
      <View style={styles.headerBackground}>
        <LinearGradient
          colors={['#1E1B4B', '#312E81', '#4338CA']}
          style={styles.gradientHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <SafeAreaView edges={['top']} style={styles.topNav}>
            <View>
              <Text style={styles.greetingText}>{getGreeting()},</Text>
              <Text style={styles.userName}>{userData?.firstName || 'User'}</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconCircle}>
                <Bell size={22} color="#FFF" />
                <View style={styles.notifBadge} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.avatarCircle}
                onPress={() => navigation.navigate('Profile')}
              >
                <Text style={styles.avatarText}>
                  {(userData?.firstName?.[0] || 'U')}{(userData?.lastName?.[0] || '')}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Glass Attendance Card */}
          <View style={styles.attendanceContainer}>
            <View style={styles.glassCard}>
              <View style={styles.cardHeader}>
                <View style={styles.statusBox}>
                  <Animated.View style={[
                    styles.statusIndicator, 
                    { backgroundColor: isCheckedIn ? '#10B981' : '#F59E0B' },
                    { transform: [{ scale: pulseAnim }] }
                  ]} />
                  <Text style={styles.statusText}>
                    {isCheckedIn ? (isOnBreak ? 'ON BREAK' : 'WORKING LIVE') : 'OFFLINE'}
                  </Text>
                </View>
                <Text style={styles.dateText}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                </Text>
              </View>

              <View style={styles.cardBody}>
                <View>
                  <Text style={styles.timerLabel}>SESSION TIME</Text>
                  <Text style={styles.timerText}>{formatTime(timer)}</Text>
                </View>
                <TouchableOpacity 
                  style={[
                    styles.actionBtn, 
                    { backgroundColor: isCheckedIn ? '#FFFFFF' : (hasCheckedOutToday ? '#10B981' : '#4F46E5') }
                  ]}
                  onPress={handleCheckIn}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.actionBtnText, { color: isCheckedIn ? '#4F46E5' : '#FFFFFF' }]}>
                    {isCheckedIn ? 'Check-Out' : (hasCheckedOutToday ? 'Resume Check-In' : 'Check-In')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={{ height: 300 }} />

        {/* Manager Console Section */}
        {['MANAGER', 'HR', 'ORG_ADMIN'].includes(userData?.role) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>MANAGER CONSOLE</Text>
            </View>
            <TouchableOpacity 
              style={styles.managerCard}
              onPress={() => navigation.navigate('Leaves', { mode: 'manager' })}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(79, 70, 229, 0.1)', 'rgba(79, 70, 229, 0.02)']}
                style={styles.managerIconBox}
              >
                <UserCheck size={24} color="#4F46E5" strokeWidth={2.5} />
              </LinearGradient>
              <View style={styles.managerContent}>
                <Text style={styles.managerTitle}>Review Team Leaves</Text>
                <Text style={styles.managerSubtitle}>Manage pending employee requests</Text>
              </View>
              <View style={styles.chevronBox}>
                <ChevronRight size={20} color="#94A3B8" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
          </View>
          <View style={styles.quickGrid}>
            <QuickAction icon={Calendar} label="Leaves" color="#4F46E5" onPress={() => navigation.navigate('Leaves')} />
            <QuickAction icon={Briefcase} label="Directory" color="#10B981" onPress={() => navigation.navigate('Directory')} />
            <QuickAction icon={Clock} label="History" color="#F59E0B" onPress={() => navigation.navigate('Attendance')} />
            <QuickAction icon={CreditCard} label="Billing" color="#8B5CF6" onPress={() => navigation.navigate('Subscription')} />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Attendance')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityCard}>
            <ActivityItem 
              icon={ArrowUpRight} 
              title="Clocked In" 
              time="09:15 AM" 
              desc="Started session from Home Office"
              color="#10B981"
            />
            <View style={styles.itemDivider} />
            <ActivityItem 
              icon={Zap} 
              title="Punch In" 
              time="Yesterday" 
              desc="Successfully completed 8h 30m"
              color="#4F46E5"
            />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const QuickAction = ({ icon: Icon, label, color, onPress }) => (
  <TouchableOpacity style={styles.quickItem} onPress={onPress}>
    <View style={[styles.quickIconBox, { backgroundColor: color + '15' }]}>
      <Icon size={24} color={color} strokeWidth={2.5} />
    </View>
    <Text style={styles.quickLabel}>{label}</Text>
  </TouchableOpacity>
);

const ActivityItem = ({ icon: Icon, title, time, desc, color }) => (
  <View style={styles.activityItem}>
    <View style={[styles.activityIconBox, { backgroundColor: color + '10' }]}>
      <Icon size={18} color={color} />
    </View>
    <View style={styles.activityContent}>
      <View style={styles.activityTop}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activityTime}>{time}</Text>
      </View>
      <Text style={styles.activityDesc}>{desc}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBackground: {
    height: 300,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  gradientHeader: {
    flex: 1,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingHorizontal: 24,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
  },
  greetingText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  userName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#312E81',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '800',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  attendanceContainer: {
    marginTop: 30,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    gap: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '700',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  timerText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -1,
  },
  actionBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '900',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 1.5,
  },
  seeAll: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '800',
  },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickItem: {
    alignItems: 'center',
    gap: 8,
  },
  quickIconBox: {
    width: 64,
    height: 64,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  managerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  managerIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  managerContent: {
    flex: 1,
  },
  managerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  managerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  chevronBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  activityItem: {
    flexDirection: 'row',
    gap: 16,
  },
  activityIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  activityTime: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
  },
  activityDesc: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    lineHeight: 18,
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
    marginLeft: 58,
  },
});

export default DashboardScreen;
