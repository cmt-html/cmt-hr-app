import React, { useState, useMemo, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar, 
  Platform, 
  Dimensions, 
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { staggerEntrance, makeEntranceValues } from '../utils/animations';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Calendar as CalendarIcon,
  Filter
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { attendanceService } from '../services/api.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const LocationDisplay = ({ location, colors }) => {
  const [address, setAddress] = React.useState(location);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    const resolveAddress = async () => {
      if (!location) {
        if (isMounted) setAddress('-');
        return;
      }
      const coordsRegex = /^-?\d+\.\d+,\s*-?\d+\.\d+$/;
      if (coordsRegex.test(location)) {
        if (isMounted) {
          setLoading(true);
          setAddress(location); // set fallback immediately
        }
        try {
          const [lat, lon] = location.split(',').map(s => parseFloat(s.trim()));
          
          // Timeout promise
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Geocode timeout')), 3000)
          );
          
          const geocodePromise = Location.reverseGeocodeAsync({
            latitude: lat,
            longitude: lon
          });
          
          const reverseGeocodedAddress = await Promise.race([geocodePromise, timeoutPromise]);
          
          if (isMounted && reverseGeocodedAddress && reverseGeocodedAddress.length > 0) {
            const addr = reverseGeocodedAddress[0];
            const formatted = `${addr.name || ''}, ${addr.street || ''}, ${addr.city || ''}`.replace(/^, |, $/g, '').replace(/, , /g, ', ').replace(/^,\s*/, '').replace(/,\s*$/, '');
            setAddress(formatted || location);
          }
        } catch (e) {
          console.warn('Failed to resolve address on details:', e);
          if (isMounted) setAddress(location);
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        if (isMounted) setAddress(location);
      }
    };
    resolveAddress();
    return () => { isMounted = false; };
  }, [location]);

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      {loading ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={{ fontSize: 12, color: colors.textLight }}>Locating...</Text>
        </View>
      ) : (
        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{address}</Text>
      )}
    </View>
  );
};

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

const AttendanceScreen = ({ navigation, route }) => {
  const { colors, isDarkMode } = useTheme();
  const styles = getStyles(colors, isDarkMode);
  const targetUserId = route.params?.userId;
  const targetUserName = route.params?.userName;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);

  // ── Entrance animation for header stats ───────────────────────────────────
  const statsAnim  = useRef(makeEntranceValues(30)).current;
  const calAnim    = useRef(makeEntranceValues(30)).current;

  // ── Detail panel slide-in ──────────────────────────────────────────────
  const detailOpacity  = useRef(new Animated.Value(1)).current;
  const detailTranslateX = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    fetchHistory();
    staggerEntrance([statsAnim, calAnim], 120, 420);
  }, [targetUserId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      let userIdToFetch;
      
      if (targetUserId) {
        userIdToFetch = targetUserId;
      } else {
        const savedUser = await AsyncStorage.getItem('userData');
        if (!savedUser) return;
        const user = JSON.parse(savedUser);
        userIdToFetch = user.id;
      }

      const history = await attendanceService.getHistory(userIdToFetch);
      
      const mappedData = {};
      history.forEach(record => {
        const rawDate = record.date || record.checkIn || record.createdAt;
        if (!rawDate) return;
        
        const recDate = parseSafeDate(rawDate);
        if (!recDate) return;

        let dateKey;
        try {
          dateKey = recDate.toISOString().split('T')[0];
        } catch (isoErr) {
          console.warn('Failed to convert rawDate to ISO string:', rawDate, isoErr);
          return;
        }
        
        const safeLocalTime = (dateStr) => {
          const d = parseSafeDate(dateStr);
          if (!d) return '-';
          return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        };

        const [checkInLoc, checkOutLoc] = (record.location || 'Office').split(' | ');

        mappedData[dateKey] = {
          status: record.status,
          month: recDate.getMonth(),
          checkIn: safeLocalTime(record.checkIn),
          checkOut: safeLocalTime(record.checkOut),
          location: checkInLoc || 'Office',
          checkOutLocation: checkOutLoc || record.checkOutLocation || null
        };
      });
      
      setAttendanceData(mappedData);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const totalDays = daysInMonth(month, year);
    const firstDay = firstDayOfMonth(month, year);
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, dateStr: null });
    }
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      days.push({ day: i, dateStr });
    }
    return days;
  }, [currentDate]);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const changeMonth = (offset) => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + offset);
      return next;
    });
  };

  // Animate detail panel whenever the selected date changes
  const handleSelectDate = (dateStr) => {
    if (!dateStr) return;
    // Slide out left quickly, then swap data and slide in from right
    Animated.timing(detailOpacity, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setSelectedDate(dateStr);
      detailTranslateX.setValue(40);
      Animated.parallel([
        Animated.timing(detailOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(detailTranslateX, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]).start();
    });
  };

  const selectedData = attendanceData[selectedDate] || { status: 'NO_DATA', checkIn: '-', checkOut: '-', location: '-' };

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
            <Text style={styles.headerTitle}>{targetUserName ? 'Team Record' : 'My Records'}</Text>
            <TouchableOpacity style={styles.headerActionBtn}>
              <Filter size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </SafeAreaView>
          
          <View style={styles.heroSection}>
            <Text style={styles.heroUser}>{targetUserName || 'Monthly Summary'}</Text>
            <Text style={styles.heroSubtitle}>{monthName} {year} Overview</Text>
          </View>
        </LinearGradient>
        
        {/* Floating Summary Stats */}
        <Animated.View
          style={[
            styles.summaryFloating,
            { opacity: statsAnim.opacity, transform: [{ translateY: statsAnim.translateY }] },
          ]}
        >
          <View style={styles.summaryItem}>
            <View style={[styles.statDot, { backgroundColor: colors.success }]} />
            <Text style={styles.statVal}>
              {Object.values(attendanceData).filter(r => r.status === 'PRESENT' && r.month === currentDate.getMonth()).length || 0}
            </Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <View style={[styles.statDot, { backgroundColor: colors.warning }]} />
            <Text style={styles.statVal}>
              {Object.values(attendanceData).filter(r => r.status === 'LATE' && r.month === currentDate.getMonth()).length || 0}
            </Text>
            <Text style={styles.statLabel}>Late</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <View style={[styles.statDot, { backgroundColor: colors.error }]} />
            <Text style={styles.statVal}>
              {Object.values(attendanceData).filter(r => r.status === 'ABSENT' && r.month === currentDate.getMonth()).length || 0}
            </Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
        </Animated.View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Synchronizing records...</Text>
          </View>
        ) : (
          <>
            {/* Calendar Card */}
            <Animated.View
              style={[
                styles.calendarCard,
                { opacity: calAnim.opacity, transform: [{ translateY: calAnim.translateY }] },
              ]}
            >
              <View style={styles.calendarHeader}>
                <View style={styles.monthLabel}>
                  <CalendarIcon size={18} color={colors.primary} />
                  <Text style={styles.monthLabelText}>{monthName} {year}</Text>
                </View>
                <View style={styles.monthNav}>
                  <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navBtn}>
                    <ChevronLeft size={20} color={colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navBtn}>
                    <ChevronRight size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.weekDaysRow}>
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d, i) => (
                  <Text key={i} style={styles.weekDayText}>{d}</Text>
                ))}
              </View>

              <View style={styles.daysGrid}>
                {calendarDays.map((item, index) => {
                  const isSelected = item.dateStr === selectedDate;
                  const status = attendanceData[item.dateStr]?.status;
                  
                  return (
                    <AnimatedDayItem
                      key={index}
                      item={item}
                      isSelected={isSelected}
                      status={status}
                      colors={colors}
                      styles={styles}
                      onPress={handleSelectDate}
                    />
                  );
                })}
              </View>
            </Animated.View>

            {/* Selected Date Details */}
            <Animated.View
              style={{
                opacity: detailOpacity,
                transform: [{ translateX: detailTranslateX }],
              }}
            >
              <View style={styles.detailsHeader}>
                <Text style={styles.detailsTitle}>Day Activity</Text>
                <View style={styles.dateBadge}>
                  <Text style={styles.dateBadgeText}>
                    {(() => {
                      const d = parseSafeDate(selectedDate);
                      return d ? d.toDateString() : '-';
                    })()}
                  </Text>
                </View>
              </View>

              {selectedData.status === 'NO_DATA' ? (
                <View style={styles.noDataCard}>
                  <AlertCircle size={32} color={colors.textLight} strokeWidth={1.5} />
                  <Text style={styles.noDataText}>No records found for this date.</Text>
                  <TouchableOpacity 
                    style={styles.regularizeBtn}
                    onPress={() => navigation.navigate('Regularize', { prefillDate: selectedDate })}
                  >
                    <Text style={styles.regularizeBtnText}>Apply Regularization</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.dataCard}>
                  <View style={styles.statusRow}>
                    <View style={[styles.badge, { backgroundColor: selectedData.status === 'PRESENT' ? '#ECFDF5' : '#FFFBEB' }]}>
                      <View style={[styles.badgeDot, { backgroundColor: selectedData.status === 'PRESENT' ? colors.success : colors.warning }]} />
                      <Text style={[styles.badgeText, { color: selectedData.status === 'PRESENT' ? '#065F46' : '#92400E' }]}>
                        {selectedData.status}
                      </Text>
                    </View>
                    {selectedData.status !== 'PRESENT' && (
                      <TouchableOpacity onPress={() => navigation.navigate('Regularize', { prefillDate: selectedDate })}>
                        <Text style={styles.inlineAction}>Update Details?</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoCol}>
                      <View style={styles.infoIconBox}>
                        <Clock size={16} color={colors.primary} />
                      </View>
                      <View>
                        <Text style={styles.infoLabel}>IN TIME</Text>
                        <Text style={styles.infoValue}>{selectedData.checkIn}</Text>
                      </View>
                    </View>
                    <View style={styles.infoCol}>
                      <View style={styles.infoIconBox}>
                        <Clock size={16} color={colors.primary} />
                      </View>
                      <View>
                        <Text style={styles.infoLabel}>OUT TIME</Text>
                        <Text style={styles.infoValue}>{selectedData.checkOut}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.locationBox}>
                    <View style={styles.infoIconBox}>
                      <MapPin size={16} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.infoLabel}>CHECK-IN LOCATION</Text>
                      <LocationDisplay location={selectedData.location} colors={colors} />
                    </View>
                  </View>

                  {selectedData.checkOutLocation ? (
                    <View style={[styles.locationBox, { marginTop: 12 }]}>
                      <View style={styles.infoIconBox}>
                        <MapPin size={16} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.infoLabel}>CHECK-OUT LOCATION</Text>
                        <LocationDisplay location={selectedData.checkOutLocation} colors={colors} />
                      </View>
                    </View>
                  ) : null}
                </View>
              )}
            </Animated.View>
          </>
        )}
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
    marginBottom: 40,
    zIndex: 10,
  },
  headerGradient: {
    paddingBottom: 70,
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
  headerActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSection: {
    alignItems: 'center',
  },
  heroUser: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    marginTop: 4,
  },
  summaryFloating: {
    position: 'absolute',
    bottom: -30,
    left: 20,
    right: 20,
    backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
    borderRadius: 24,
    flexDirection: 'row',
    padding: 16,
    ...colors.premiumShadow,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#F1F5F9',
    alignSelf: 'center',
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 6,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textLight,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  loadingBox: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
  },
  calendarCard: {
    backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
    borderRadius: 32,
    padding: 20,
    ...colors.shadow,
    marginBottom: 32,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthLabelText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  monthNav: {
    flexDirection: 'row',
    gap: 8,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: isDarkMode ? '#334155' : '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  weekDayText: {
    width: (width - 88) / 7,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '800',
    color: colors.textLight,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayItem: {
    width: (width - 88) / 7,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderRadius: 14,
    position: 'relative',
  },
  selectedDayItem: {
    backgroundColor: colors.primary,
    ...colors.shadow,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
  },
  dateBadge: {
    backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  dateBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  noDataCard: {
    backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    ...colors.shadow,
  },
  noDataText: {
    fontSize: 15,
    color: colors.textLight,
    fontWeight: '600',
    marginVertical: 16,
    textAlign: 'center',
  },
  regularizeBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    ...colors.shadow,
  },
  regularizeBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  dataCard: {
    backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
    borderRadius: 32,
    padding: 24,
    ...colors.shadow,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  inlineAction: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  infoCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
    padding: 12,
    borderRadius: 16,
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(11, 74, 236, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
    padding: 12,
    borderRadius: 16,
  },
});

/**
 * Individual calendar day with spring scale press animation.
 */
const AnimatedDayItem = ({ item, isSelected, status, colors, styles, onPress }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!item.day) return;
    Animated.spring(scaleAnim, {
      toValue: 0.82,
      useNativeDriver: true,
      speed: 60,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 12,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.dayItem, isSelected && styles.selectedDayItem]}
        onPress={() => onPress(item.dateStr)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!item.day}
        activeOpacity={1}
      >
        {item.day && (
          <>
            <Text style={[styles.dayText, isSelected && { color: '#FFFFFF' }]}>
              {item.day}
            </Text>
            {status && (
              <View
                style={[
                  styles.statusIndicator,
                  {
                    backgroundColor:
                      status === 'PRESENT'
                        ? colors.success
                        : status === 'LATE'
                        ? colors.warning
                        : colors.error,
                  },
                  isSelected && { borderColor: '#FFFFFF', borderWidth: 1 },
                ]}
              />
            )}
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AttendanceScreen;

