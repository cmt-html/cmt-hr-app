import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, StatusBar, Platform, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { sendLocalNotification } from '../utils/notifications';
import api, { attendanceService, leaveService } from '../services/api.service';
import { Calendar, Clock, UserCheck, Briefcase, ChevronRight, Bell, AlertCircle, BarChart3 } from 'lucide-react-native';


const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const { isDarkMode, colors } = useTheme();
  const styles = getStyles(colors, isDarkMode);
  const [userData, setUserData] = React.useState(null);
  const [isCheckedIn, setIsCheckedIn] = React.useState(false);
  const [seconds, setSeconds] = React.useState(0);
  const [totalTodaySeconds, setTotalTodaySeconds] = React.useState(0);
  const [isLoadingLocation, setIsLoadingLocation] = React.useState(false);
  const [leaveBalance, setLeaveBalance] = React.useState(0);
  const [attendanceCount, setAttendanceCount] = React.useState('0/0');
  const [refreshing, setRefreshing] = React.useState(false);
  const [config, setConfig] = React.useState(null);
  const timerRef = React.useRef(null);

  const syncWithBackend = async (userId) => {
    try {
      const history = await attendanceService.getHistory(userId);
      const activeSession = history.find(r => !r.checkOut);
      const latest = history[0];
      
      // Attendance Stats
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthlyRecords = history.filter(r => new Date(r.date) >= monthStart);
      const presentDays = monthlyRecords.filter(r => r.status === 'PRESENT').length;
      const totalWorkingDays = 22; // Hardcoded target for now
      setAttendanceCount(`${presentDays}/${totalWorkingDays}`);

      // Config Stats
      const configData = await api.get('/config/working-hours');
      setConfig(configData.data);

      // Leave Stats
      const leaveStats = await leaveService.getStats(userId);
      setLeaveBalance(leaveStats.available.ANNUAL);

      if (activeSession) {
        // Active session found on backend
        const startTime = new Date(activeSession.checkIn).getTime();
        const currentTime = Date.now();
        const elapsed = Math.floor((currentTime - startTime) / 1000);
        
        setIsCheckedIn(true);
        setSeconds(elapsed);
        
        // Update local persistence
        await AsyncStorage.setItem('@check_in_status', 'true');
        await AsyncStorage.setItem('@check_in_time', startTime.toString());
      } else {
        setIsCheckedIn(false);
        // Calculate total seconds for today from history
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        
        const todayRecords = history.filter(r => new Date(r.date) >= startOfToday);
        let total = 0;
        todayRecords.forEach(r => {
          if (r.checkIn && r.checkOut) {
            total += Math.floor((new Date(r.checkOut).getTime() - new Date(r.checkIn).getTime()) / 1000);
          }
        });
        
        setTotalTodaySeconds(total);
        setSeconds(total);
        await AsyncStorage.setItem('@total_seconds_today', total.toString());
      }
    } catch (error) {
      console.error('Failed to sync attendance:', error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    if (userData) {
      setRefreshing(true);
      await syncWithBackend(userData.id);
      setRefreshing(false);
    }
  }, [userData]);

  useFocusEffect(
    React.useCallback(() => {
      const init = async () => {
        const savedUser = await AsyncStorage.getItem('userData');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          setUserData(user);
          await syncWithBackend(user.id);
        }
      };
      init();
    }, [])
  );

  React.useEffect(() => {
    if (isCheckedIn) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isCheckedIn]);

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const handleCheckIn = async () => {
    if (isLoadingLocation || !userData) return;
    
    setIsLoadingLocation(true);
    try {
      console.log('--- Attendance Process Started ---');
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn('Location permission denied.');
      }

      console.log('Fetching position...');
      let location = await Location.getLastKnownPositionAsync({});
      if (!location) {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeout: 5000,
        });
      }

      const locationStr = location ? `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}` : 'Remote';
      let addressStr = locationStr;

      if (location) {
        try {
          const reverseGeocodedAddress = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          });
          
          if (reverseGeocodedAddress.length > 0) {
            const addr = reverseGeocodedAddress[0];
            addressStr = `${addr.name || ''}, ${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''}`.replace(/^, |, $/g, '').replace(/, , /g, ', ');
          }
        } catch (addrError) {
          console.warn('Reverse geocoding failed:', addrError);
        }
      }

      if (isCheckedIn) {
        // Backend Check-out
        await attendanceService.checkOut(userData.id);

        const savedTime = await AsyncStorage.getItem('@check_in_time');
        const startTime = parseInt(savedTime, 10);
        const sessionDuration = Math.floor((Date.now() - startTime) / 1000);
        const newTotal = totalTodaySeconds + sessionDuration;

        await AsyncStorage.setItem('@total_seconds_today', newTotal.toString());
        await AsyncStorage.removeItem('@check_in_status');
        await AsyncStorage.removeItem('@check_in_time');
        
        setTotalTodaySeconds(newTotal);
        setSeconds(newTotal);
        setIsCheckedIn(false);
        sendLocalNotification('Checked Out', 'Your session has been saved successfully.');
      } else {
        // Backend Check-in
        await attendanceService.checkIn(userData.id, addressStr);

        const startTime = Date.now().toString();
        await AsyncStorage.setItem('@check_in_status', 'true');
        await AsyncStorage.setItem('@check_in_time', startTime);
        await AsyncStorage.setItem('@last_session_date', new Date().toDateString());
        
        setIsCheckedIn(true);
        sendLocalNotification('Checked In', 'Your attendance timer has started.');
      }

    } catch (error) {
      console.error('Check-in failed:', error);
      const errorMessage = error.response?.data?.message || 'Attendance update failed. Please check your connection.';
      Alert.alert('Attendance Error', errorMessage);
    } finally {
      setIsLoadingLocation(false);
      console.log('--- Attendance Process Finished ---');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{userData ? `${userData.firstName} ${userData.lastName}` : 'User'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.notificationBtn}>
              <Bell size={22} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.profileImage}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={styles.profileInitial}>
                {userData ? getInitials(userData.firstName, userData.lastName) : '??'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency Contact Reminder */}
        {!userData?.emergencyContact && (
          <TouchableOpacity 
            style={styles.reminderCard}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.reminderIconBox}>
              <AlertCircle size={24} color={colors.error} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.reminderTitle}>Emergency Contact Missing</Text>
              <Text style={styles.reminderSubtitle}>Please update your profile for safety.</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
        )}

        {/* Role-Based Admin Action */}
        {(userData?.role === 'HR' || userData?.role === 'ADMIN') && (
          <TouchableOpacity 
            style={styles.adminBanner}
            onPress={() => navigation.navigate('AdminDashboard')}
          >
            <View style={styles.adminIconBox}>
              <Briefcase size={20} color={colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.adminTitle}>Admin Control Center</Text>
              <Text style={styles.adminSubtitle}>Manage employees and registrations</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
        )}

        {/* Platform Admin Action */}
        {userData?.role === 'SUPER_ADMIN' && (
          <TouchableOpacity 
            style={[styles.adminBanner, { borderColor: colors.primary + '30' }]}
            onPress={() => navigation.navigate('SuperAdminDashboard')}
          >
            <View style={[styles.adminIconBox, { backgroundColor: colors.primary }]}>
              <BarChart3 size={20} color={colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.adminTitle}>Platform Administration</Text>
              <Text style={styles.adminSubtitle}>Manage organizations and platform health</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
        )}

        {/* Manager-Specific Team Approvals */}

        {userData?.role === 'MANAGER' && (
          <TouchableOpacity 
            style={[styles.adminBanner, { borderColor: isDarkMode ? 'rgba(54, 179, 126, 0.2)' : '#ECFDF5' }]}
            onPress={() => navigation.navigate('Leaves', { mode: 'manager' })}
          >
            <View style={[styles.adminIconBox, { backgroundColor: colors.success }]}>
              <UserCheck size={20} color={colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.adminTitle}>Team Approvals</Text>
              <Text style={styles.adminSubtitle}>Review pending leave requests</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
        )}


        {/* Check-in Card */}
        <LinearGradient
          colors={isCheckedIn ? colors.successGradient : colors.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.checkInCard}
        >
          <View style={styles.checkInInfo}>
            <View style={styles.iconCircle}>
              <Clock size={24} color={colors.white} />
            </View>
            <View>
              <Text style={styles.checkInLabel}>
                {isCheckedIn ? 'ACTIVE SESSION' : totalTodaySeconds > 0 ? 'SESSION PAUSED' : 'NOT CHECKED IN'}
              </Text>
              <Text style={styles.timerText}>
                {isCheckedIn || totalTodaySeconds > 0 ? formatTime(seconds) : (config?.windowStart || '08:00 AM')}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.checkInButton, isLoadingLocation && { opacity: 0.8 }]}
            onPress={handleCheckIn}
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? (
              <ActivityIndicator color={isCheckedIn ? colors.success : colors.primary} size="small" />
            ) : (
              <Text style={[styles.checkInButtonText, { color: isCheckedIn ? colors.success : colors.primary }]}>
                {isCheckedIn ? 'CHECK-OUT' : totalTodaySeconds > 0 ? 'RESUME' : 'CHECK-IN'}
              </Text>
            )}
          </TouchableOpacity>
        </LinearGradient>


        {/* Regularization Link */}
        <TouchableOpacity 
          style={styles.regularizeLink}
          onPress={() => navigation.navigate('Regularize')}
        >
          <Text style={styles.regularizeText}>Forgot to check in? <Text style={styles.regularizeAction}>Regularize Now</Text></Text>
        </TouchableOpacity>

        {/* Summary Stats */}
        <View style={styles.statsGrid}>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('Leaves')}
          >
            <View style={[styles.iconBox, { backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.1)' : '#EEF2FF' }]}>
              <Calendar size={20} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{leaveBalance}</Text>
            <Text style={styles.statLabel}>Leave Balance</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('Attendance')}
          >
            <View style={[styles.iconBox, { backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5' }]}>
              <UserCheck size={20} color={colors.success} />
            </View>
            <Text style={styles.statValue}>{attendanceCount}</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Holidays</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Holidays')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.listCard}
          onPress={() => navigation.navigate('Holidays')}
        >
          <View style={styles.listItem}>
            <View style={styles.dateBox}>
              <Text style={styles.dateDay}>15</Text>
              <Text style={styles.dateMonth}>MAY</Text>
            </View>
            <View style={styles.listItemContent}>
              <Text style={styles.holidayName}>Eid-ul-Fitr</Text>
              <Text style={styles.holidayDay}>Friday</Text>
            </View>
            <ChevronRight size={18} color={colors.textLight} />
          </View>
        </TouchableOpacity>

        {/* Recent Activity */}
        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={() => navigation.navigate('Activity')}
        >
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.activityCard}
          onPress={() => navigation.navigate('Activity')}
        >
          <View style={styles.activityItem}>
            <View style={[styles.activityDot, { backgroundColor: colors.success }]} />
            <Text style={styles.activityText}>Checked in at {config?.windowStart || '08:00 AM'} today</Text>
          </View>
          <View style={styles.activityDivider} />
          <View style={styles.activityItem}>
            <View style={[styles.activityDot, { backgroundColor: colors.primary }]} />
            <Text style={styles.activityText}>Leave approved by Admin (12 May)</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBtn: {
    marginRight: 16,
    padding: 10,
    backgroundColor: colors.surface,
    borderRadius: 14,
    ...colors.shadow,
  },
  greeting: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '600',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...colors.shadow,
  },
  profileInitial: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
  adminBanner: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    ...colors.shadow,
    borderWidth: 1,
    borderColor: isDarkMode ? '#334155' : '#E5E7EB',
  },
  adminIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  adminTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  adminSubtitle: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600',
  },
  reminderCard: {
    backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2',
    padding: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2',
  },
  reminderIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  reminderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.error,
  },
  reminderSubtitle: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600',
  },
  checkInCard: {
    padding: 24,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    ...colors.shadow,
  },
  checkInInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  checkInLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  timerText: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '900',
  },
  checkInButton: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    ...colors.shadow,
  },
  checkInButtonText: {
    fontWeight: '800',
    fontSize: 13,
  },
  regularizeLink: {
    marginBottom: 32,
    alignItems: 'center',
    backgroundColor: isDarkMode ? '#1E293B' : '#FFFBEB',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: isDarkMode ? '#334155' : '#FEF3C7',
  },
  regularizeText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  regularizeAction: {
    color: colors.primary,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: colors.surface,
    width: (width - 64) / 2,
    padding: 20,
    borderRadius: 22,
    ...colors.shadow,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  viewAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '800',
  },
  listCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 20,
    marginBottom: 32,
    ...colors.shadow,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateBox: {
    backgroundColor: isDarkMode ? '#1E3A8A' : '#F0F7FF',
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dateDay: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary,
  },
  dateMonth: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  listItemContent: {
    flex: 1,
  },
  holidayName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  holidayDay: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600',
  },
  activityCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 20,
    ...colors.shadow,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 14,
  },
  activityText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  activityDivider: {
    height: 1,
    backgroundColor: isDarkMode ? '#334155' : '#F3F4F6',
    marginVertical: 4,
  },
});

export default DashboardScreen;
