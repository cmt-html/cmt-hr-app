import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Platform, ActivityIndicator, Share, Alert } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ChevronLeft, Download, Filter, Calendar, User, Clock, AlertCircle, X, Check } from 'lucide-react-native';
import { attendanceService } from '../services/api.service';
import api from '../services/api.service';
import * as Location from 'expo-location';

const MonthPickerModal = ({ visible, onClose, onSelect, selectedMonth, selectedYear, colors, isDarkMode }) => {
  if (!visible) return null;

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = [2024, 2025, 2026];

  const styles = StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
      zIndex: 1000,
    },
    modal: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      padding: 24,
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: '900',
      color: colors.text,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.textLight,
      marginTop: 20,
      marginBottom: 12,
      textTransform: 'uppercase',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    item: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: '30%',
      alignItems: 'center',
    },
    itemActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    itemText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    itemTextActive: {
      color: colors.white,
    },
    applyBtn: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 16,
      alignItems: 'center',
      marginTop: 30,
      marginBottom: 20,
    },
    applyBtnText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: '900',
    }
  });

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>Filter Records</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Select Year</Text>
          <View style={styles.grid}>
            {years.map(y => (
              <TouchableOpacity
                key={y}
                style={[styles.item, selectedYear === y && styles.itemActive]}
                onPress={() => onSelect(selectedMonth, y)}
              >
                <Text style={[styles.itemText, selectedYear === y && styles.itemTextActive]}>{y}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Select Month</Text>
          <View style={styles.grid}>
            {months.map((m, i) => (
              <TouchableOpacity
                key={m}
                style={[styles.item, selectedMonth === i + 1 && styles.itemActive]}
                onPress={() => onSelect(i + 1, selectedYear)}
              >
                <Text style={[styles.itemText, selectedMonth === i + 1 && styles.itemTextActive]}>{m.slice(0, 3)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.applyBtn} onPress={onClose}>
            <Text style={styles.applyBtnText}>Apply Filter</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

const LocationDisplay = ({ location, colors }) => {
  const [address, setAddress] = React.useState(location || 'Office');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const resolveAddress = async () => {
      if (!location) return;
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
          console.warn('Failed to resolve address: ', e);
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
    <Text style={{ fontSize: 12, color: colors.textLight, fontWeight: '600' }} numberOfLines={1}>
      {loading ? 'Resolving...' : address}
    </Text>
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

const AttendanceReportScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const styles = getStyles(colors, isDarkMode);
  
  const safeLocalTime = (dateStr) => {
    const d = parseSafeDate(dateStr);
    if (!d) return '-';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const safeLocalDate = (dateStr) => {
    const d = parseSafeDate(dateStr);
    if (!d) return '-';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [selectedMonth, selectedYear]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await attendanceService.getReportData(selectedMonth, selectedYear);
      setReportData(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await api.get('/attendance/report', {
        params: { month: selectedMonth, year: selectedYear },
        responseType: 'text'
      });

      if (response.data) {
        await Share.share({
          message: response.data,
          title: `Attendance_Report_${selectedMonth}_${selectedYear}`,
        });
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Export Failed', 'Unable to generate CSV report.');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'LATE':
        return { bg: isDarkMode ? 'rgba(245, 158, 11, 0.2)' : '#FFF7ED', text: '#F59E0B', label: 'Late' };
      case 'HALF_DAY':
        return { bg: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2', text: '#EF4444', label: 'Half Day' };
      case 'ABSENT':
        return { bg: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2', text: '#EF4444', label: 'Absent' };
      default:
        return { bg: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5', text: '#10B981', label: 'Present' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance Report</Text>
        <TouchableOpacity onPress={handleDownloadCSV} disabled={loading}>
          <Download size={22} color={loading ? colors.textLight : colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterBar}>
        <View style={styles.monthDisplay}>
          <Calendar size={18} color={colors.primary} />
          <Text style={styles.monthText}>
            {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilter(true)}>
          <Filter size={18} color={colors.text} />
          <Text style={styles.filterBtnText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading report data...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {reportData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <AlertCircle size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>No records found for this period.</Text>
            </View>
          ) : (
            reportData.map((record, index) => {
              const status = getStatusStyle(record.detailedStatus || record.status);
              const u = record.user || {};
              return (
                <TouchableOpacity
                  key={record.id || index}
                  style={styles.reportCard}
                  onPress={() => navigation.navigate('Attendance', {
                    userId: record.userId,
                    userName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Employee',
                  })}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.userInfo}>
                      <View style={styles.userIcon}>
                        <User size={16} color={colors.primary} />
                      </View>
                      <View>
                        <Text style={styles.userName}>{u.firstName || '—'} {u.lastName || ''}</Text>
                        <Text style={styles.deptText}>{u.department || '—'} • {u.employeeId || '—'}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                      <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.cardDetails}>
                    <View style={styles.detailItem}>
                      <Clock size={14} color={colors.textLight} />
                      <Text style={styles.detailLabel}>Check-in:</Text>
                      <Text style={styles.detailValue}>
                        {safeLocalTime(record.checkIn)}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Clock size={14} color={colors.textLight} />
                      <Text style={styles.detailLabel}>Check-out:</Text>
                      <Text style={styles.detailValue}>
                        {safeLocalTime(record.checkOut)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.dateText}>
                      {safeLocalDate(record.date || record.checkIn)}
                    </Text>
                    <View style={{ flex: 1, marginLeft: 10, alignItems: 'flex-end' }}>
                      <LocationDisplay location={(record.location || '').split(' | ')[0] || 'Office'} colors={colors} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}

      <MonthPickerModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onSelect={(m, y) => {
          setSelectedMonth(m);
          setSelectedYear(y);
        }}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        colors={colors}
        isDarkMode={isDarkMode}
      />
    </SafeAreaView>
  );
};

const getStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  monthDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: colors.textLight,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    color: colors.textLight,
    fontWeight: '600',
  },
  reportCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    ...colors.shadow,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  deptText: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '800',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  locationText: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600',
  },
});

export default AttendanceReportScreen;
