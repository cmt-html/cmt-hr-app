import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  StatusBar, 
  Platform, 
  ScrollView, 
  Share, 
  Alert,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import api from '../services/api.service';
import { 
  ChevronLeft, 
  UserPlus, 
  FileText, 
  ChevronRight, 
  LayoutGrid, 
  Download, 
  Clock,
  Settings,
  ShieldCheck,
  CreditCard
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const AdminDashboardScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const styles = getStyles(colors, isDarkMode);

  const handleDownloadReport = async () => {
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const response = await api.get('/attendance/report', {
        params: { month, year },
        responseType: 'text'
      });

      if (response.data) {
        await Share.share({
          message: response.data,
          title: `Attendance_Report_${month}_${year}`,
        });
      }
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'Unable to generate report at this time.';
      Alert.alert('Export Failed', message);
    }
  };

  const menuItems = [
    {
      id: '1',
      title: 'Add Individual Employee',
      subtitle: 'Register a single user manually',
      icon: UserPlus,
      onPress: () => navigation.navigate('AddEmployee'),
      color: colors.primary,
    },
    {
      id: '2',
      title: 'Bulk Upload (Excel)',
      subtitle: 'Upload multiple users at once',
      icon: FileText,
      onPress: () => navigation.navigate('BulkUpload'),
      color: colors.success,
    },
    {
      id: 'report',
      title: 'Monthly Attendance Report',
      subtitle: 'View and export monthly records',
      icon: Download,
      onPress: () => navigation.navigate('AttendanceReport'),
      color: '#8B5CF6',
    },
    {
      id: 'config',
      title: 'Working Hours',
      subtitle: 'Configure flexible timings',
      icon: Clock,
      onPress: () => navigation.navigate('WorkingHoursConfig'),
      color: '#EC4899',
    },
    {
      id: '3',
      title: 'Manage Roles',
      subtitle: 'Update employee access levels',
      icon: LayoutGrid,
      onPress: () => navigation.navigate('Directory'),
      color: colors.warning,
    },
    {
      id: 'billing',
      title: 'Billing & Subscription',
      subtitle: 'Manage plans and payments',
      icon: CreditCard,
      onPress: () => navigation.navigate('Subscription'),
      color: '#10B981',
    }
  ];

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
            <Text style={styles.headerTitle}>Management</Text>
            <TouchableOpacity style={styles.headerActionBtn}>
              <Settings size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </SafeAreaView>
          
          <View style={styles.heroSection}>
            <View style={styles.badge}>
              <ShieldCheck size={14} color="#FFFFFF" />
              <Text style={styles.badgeText}>Admin Console</Text>
            </View>
            <Text style={styles.heroTitle}>Organization Hub</Text>
            <Text style={styles.heroSubtitle}>Control and monitor your workforce</Text>
          </View>
        </LinearGradient>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>CORE ACTIONS</Text>
        </View>

        {menuItems.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.menuCard}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
              <item.icon size={22} color={item.color} strokeWidth={2.5} />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <View style={styles.chevronBox}>
              <ChevronRight size={18} color={colors.textLight} />
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.infoCard}>
          <View style={styles.infoIconBox}>
            <FileText size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Quick Tip</Text>
            <Text style={styles.infoText}>
              For bulk uploads, ensure your Excel sheet follows the standard template to avoid registration errors.
            </Text>
          </View>
        </View>
        
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
  scrollContent: {
    padding: 24,
    paddingTop: 32,
  },
  sectionLabel: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionLabelText: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.textLight,
    letterSpacing: 1.5,
  },
  menuCard: {
    backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
    padding: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    ...colors.premiumShadow,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
  },
  menuSubtitle: {
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
  infoCard: {
    backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
    padding: 20,
    borderRadius: 24,
    marginTop: 16,
    flexDirection: 'row',
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
    fontWeight: '500',
  },
});

export default AdminDashboardScreen;

