import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  StatusBar, 
  Platform,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { ChevronLeft, Calendar as CalendarIcon, PartyPopper } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const HolidaysScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const styles = getStyles(colors, isDarkMode);

  const holidays = [
    { id: '1', name: 'New Year Day', date: '01 Jan', day: 'Wednesday' },
    { id: '2', name: 'Republic Day', date: '26 Jan', day: 'Sunday' },
    { id: '3', name: 'Holi', date: '14 Mar', day: 'Friday' },
    { id: '4', name: 'Good Friday', date: '18 Apr', day: 'Friday' },
    { id: '5', name: 'Eid-ul-Fitr', date: '15 May', day: 'Friday' },
    { id: '6', name: 'Independence Day', date: '15 Aug', day: 'Friday' },
    { id: '7', name: 'Gandhi Jayanti', date: '02 Oct', day: 'Thursday' },
    { id: '8', name: 'Diwali', date: '20 Oct', day: 'Monday' },
    { id: '9', name: 'Christmas', date: '25 Dec', day: 'Thursday' },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.holidayCard}>
      <View style={styles.dateBox}>
        <Text style={styles.dateText}>{item.date.split(' ')[0]}</Text>
        <Text style={styles.monthText}>{item.date.split(' ')[1]}</Text>
      </View>
      <View style={styles.holidayInfo}>
        <Text style={styles.holidayName}>{item.name}</Text>
        <Text style={styles.holidayDay}>{item.day}</Text>
      </View>
      <View style={styles.iconBox}>
        <PartyPopper size={18} color={colors.primary} strokeWidth={1.5} />
      </View>
    </View>
  );

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
            <Text style={styles.headerTitle}>Holiday Calendar</Text>
            <View style={{ width: 44 }} />
          </SafeAreaView>
          
          <View style={styles.heroSection}>
            <View style={styles.badge}>
              <CalendarIcon size={14} color="#FFFFFF" />
              <Text style={styles.badgeText}>Academic Year 2026</Text>
            </View>
            <Text style={styles.heroTitle}>Annual Holidays</Text>
            <Text style={styles.heroSubtitle}>Plan your vacations and time-off</Text>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.listWrapper}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>UPCOMING EVENTS</Text>
        </View>

        <FlatList
          data={holidays}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const getStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerWrapper: {
    zIndex: 10,
  },
  headerGradient: {
    paddingBottom: 40,
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
  heroSection: {
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginBottom: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
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
  },
  listWrapper: {
    flex: 1,
    padding: 24,
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
  listContent: {
    paddingBottom: 40,
  },
  holidayCard: {
    flexDirection: 'row',
    backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
    padding: 12,
    borderRadius: 24,
    marginBottom: 16,
    alignItems: 'center',
    ...colors.premiumShadow,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
  },
  dateBox: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(11, 74, 236, 0.05)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
  },
  monthText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  holidayInfo: {
    flex: 1,
  },
  holidayName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
  },
  holidayDay: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HolidaysScreen;

