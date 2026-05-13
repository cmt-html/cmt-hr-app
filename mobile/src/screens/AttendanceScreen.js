import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Platform, Dimensions } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ChevronLeft, ChevronRight, Clock, MapPin, AlertCircle, CheckCircle2, XCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { attendanceService } from '../services/api.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';

const { width } = Dimensions.get('window');

const LocationDisplay = ({ location, colors }) => {
  const [address, setAddress] = React.useState(location);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const resolveAddress = async () => {
      // Check if location is in "lat, long" format
      const coordsRegex = /^-?\d+\.\d+,\s*-?\d+\.\d+$/;
      if (coordsRegex.test(location)) {
        setLoading(true);
        try {
          const [lat, lon] = location.split(',').map(s => parseFloat(s.trim()));
          const reverseGeocodedAddress = await Location.reverseGeocodeAsync({
            latitude: lat,
            longitude: lon
          });
          
          if (reverseGeocodedAddress.length > 0) {
            const addr = reverseGeocodedAddress[0];
            const formatted = `${addr.name || ''}, ${addr.street || ''}, ${addr.city || ''}`.replace(/^, |, $/g, '').replace(/, , /g, ', ');
            setAddress(formatted || location);
          }
        } catch (e) {
          console.warn('Failed to resolve address on details:', e);
        } finally {
          setLoading(false);
        }
      } else {
        setAddress(location);
      }
    };
    resolveAddress();
  }, [location]);

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ alignSelf: 'flex-start' }} />
      ) : (
        <Text style={{ fontSize: 15, fontWeight: '900', color: colors.text }}>{address}</Text>
      )}
    </View>
  );
};

const AttendanceScreen = ({ navigation, route }) => {
  const { colors, isDarkMode } = useTheme();
  const styles = getStyles(colors, isDarkMode);
  const targetUserId = route.params?.userId;
  const targetUserName = route.params?.userName;

  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch data
  React.useEffect(() => {
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
        
        // Map history to attendanceData format
        const mappedData = {};
        history.forEach(record => {
          const recDate = new Date(record.date);
          const dateKey = recDate.toISOString().split('T')[0];
          mappedData[dateKey] = {
            status: record.status,
            month: recDate.getMonth(),
            checkIn: record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
            checkOut: record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
            location: record.location || 'Office'
          };
        });
        
        setAttendanceData(mappedData);
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [targetUserId]);

  // Calendar Logic
  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const totalDays = daysInMonth(month, year);
    const firstDay = firstDayOfMonth(month, year);
    
    const days = [];
    // Fill leading empty days
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, dateStr: null });
    }
    // Fill actual days
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      days.push({ day: i, dateStr });
    }
    return days;
  }, [currentDate]);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + offset));
    setCurrentDate(new Date(newDate));
  };

  const selectedData = attendanceData[selectedDate] || { status: 'NO_DATA', checkIn: '-', checkOut: '-', location: '-' };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{targetUserName ? `${targetUserName}'s History` : 'Attendance History'}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={{ height: 300, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: 10, color: colors.textLight }}>Loading records...</Text>
          </View>
        ) : (
          <>
            {/* Monthly Summary Stats */}
            <View style={styles.summaryGrid}>
              <LinearGradient 
                colors={isDarkMode ? ['#059669', '#10B981'] : ['#ECFDF5', '#D1FAE5']} 
                style={styles.summaryBox}
              >
                <Text style={[styles.summaryValue, { color: isDarkMode ? '#ECFDF5' : '#047857' }]}>
                  {Object.values(attendanceData).filter(r => r.status === 'PRESENT' && r.month === currentDate.getMonth()).length || 0}
                </Text>
                <Text style={[styles.summaryLabel, { color: isDarkMode ? '#D1FAE5' : '#065F46' }]}>Present</Text>
              </LinearGradient>

              <LinearGradient 
                colors={isDarkMode ? ['#D97706', '#F59E0B'] : ['#FFFBEB', '#FEF3C7']} 
                style={styles.summaryBox}
              >
                <Text style={[styles.summaryValue, { color: isDarkMode ? '#FFFBEB' : '#B45309' }]}>
                  {Object.values(attendanceData).filter(r => r.status === 'LATE' && r.month === currentDate.getMonth()).length || 0}
                </Text>
                <Text style={[styles.summaryLabel, { color: isDarkMode ? '#FEF3C7' : '#92400E' }]}>Late</Text>
              </LinearGradient>

              <LinearGradient 
                colors={isDarkMode ? ['#DC2626', '#EF4444'] : ['#FEF2F2', '#FEE2E2']} 
                style={styles.summaryBox}
              >
                <Text style={[styles.summaryValue, { color: isDarkMode ? '#FEF2F2' : '#B91C1C' }]}>
                  {Object.values(attendanceData).filter(r => r.status === 'ABSENT' && r.month === currentDate.getMonth()).length || 0}
                </Text>
                <Text style={[styles.summaryLabel, { color: isDarkMode ? '#FEE2E2' : '#991B1B' }]}>Absent</Text>
              </LinearGradient>
            </View>
            {/* Calendar Section */}
            <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Text style={styles.monthYearText}>{monthName} {year}</Text>
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
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <Text key={i} style={styles.weekDayText}>{d}</Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {calendarDays.map((item, index) => {
              const isSelected = item.dateStr === selectedDate;
              const status = attendanceData[item.dateStr]?.status;
              
              return (
                <TouchableOpacity 
                  key={index}
                  style={[
                    styles.dayItem,
                    isSelected && styles.selectedDayItem
                  ]}
                  onPress={() => item.dateStr && setSelectedDate(item.dateStr)}
                  disabled={!item.day}
                >
                  {item.day && (
                    <>
                      <Text style={[
                        styles.dayText,
                        isSelected && { color: colors.white }
                      ]}>
                        {item.day}
                      </Text>
                      {status && (
                        <View style={[
                          styles.statusDot,
                          { backgroundColor: status === 'PRESENT' ? colors.success : status === 'LATE' ? colors.warning : colors.error }
                        ]} />
                      )}
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
            <Text style={styles.legendText}>Present</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.statusDot, { backgroundColor: colors.warning }]} />
            <Text style={styles.legendText}>Late</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.statusDot, { backgroundColor: colors.error }]} />
            <Text style={styles.legendText}>Absent</Text>
          </View>
        </View>

        {/* Selected Date Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>Day Details</Text>
            <Text style={styles.selectedDateLabel}>{new Date(selectedDate).toDateString()}</Text>
          </View>

          {selectedData.status === 'NO_DATA' ? (
            <View style={styles.noDataCard}>
              <AlertCircle size={24} color={colors.textLight} />
              <Text style={styles.noDataText}>No records found for this date.</Text>
              <TouchableOpacity 
                style={styles.regularizeBtn}
                onPress={() => navigation.navigate('Regularize', { prefillDate: selectedDate })}
              >
                <Text style={styles.regularizeBtnText}>REGULARIZE NOW</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.dataCard}>
              <View style={styles.statusRow}>
                <View style={[styles.badge, { backgroundColor: selectedData.status === 'PRESENT' ? colors.success + '20' : colors.warning + '20' }]}>
                  {selectedData.status === 'PRESENT' ? <CheckCircle2 size={14} color={colors.success} /> : <XCircle size={14} color={colors.warning} />}
                  <Text style={[styles.badgeText, { color: selectedData.status === 'PRESENT' ? colors.success : colors.warning }]}>
                    {selectedData.status}
                  </Text>
                </View>
                {selectedData.status !== 'PRESENT' && (
                  <TouchableOpacity onPress={() => navigation.navigate('Regularize', { prefillDate: selectedDate })}>
                    <Text style={styles.inlineRegularize}>Regularize?</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Clock size={18} color={colors.primary} />
                  <View style={styles.infoTexts}>
                    <Text style={styles.infoLabel}>CHECK-IN</Text>
                    <Text style={styles.infoValue}>{selectedData.checkIn}</Text>
                  </View>
                </View>
                <View style={styles.infoItem}>
                  <Clock size={18} color={colors.primary} />
                  <View style={styles.infoTexts}>
                    <Text style={styles.infoLabel}>CHECK-OUT</Text>
                    <Text style={styles.infoValue}>{selectedData.checkOut}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.locationContainer}>
                <MapPin size={18} color={colors.primary} />
                <View style={styles.infoTexts}>
                  <Text style={styles.infoLabel}>LOCATION</Text>
                  <LocationDisplay location={selectedData.location} colors={colors} />
                </View>
              </View>
            </View>
          )}
        </View>

          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    ...colors.shadow,
    zIndex: 100,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
  },
  scrollContent: {
    padding: 24,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  summaryBox: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  calendarCard: {
    backgroundColor: colors.surface,
    borderRadius: 30,
    padding: 24,
    ...colors.shadow,
    marginBottom: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  monthYearText: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
  },
  monthNav: {
    flexDirection: 'row',
    gap: 12,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: isDarkMode ? '#334155' : '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  weekDayText: {
    width: (width - 96) / 7,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '800',
    color: colors.textLight,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayItem: {
    width: (width - 96) / 7,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 12,
  },
  selectedDayItem: {
    backgroundColor: colors.primary,
    ...colors.shadow,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 4,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 32,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textLight,
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  detailsTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
  },
  selectedDateLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  noDataCard: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...colors.shadow,
  },
  noDataText: {
    fontSize: 16,
    color: colors.textLight,
    fontWeight: '600',
    marginVertical: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  dataCard: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 24,
    ...colors.shadow,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inlineRegularize: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
    padding: 12,
    borderRadius: 16,
  },
  infoTexts: {
    gap: 2,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textLight,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.text,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
    padding: 12,
    borderRadius: 16,
  },
  regularizeBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 18,
    ...colors.shadow,
    shadowColor: colors.primary,
  },
  regularizeBtnText: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 14,
  },
});

export default AttendanceScreen;
