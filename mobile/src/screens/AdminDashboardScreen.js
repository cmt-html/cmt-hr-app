import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, Platform, ScrollView, Share, Alert } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import api from '../services/api.service';
import { ChevronLeft, UserPlus, FileText, ChevronRight, LayoutGrid, Download, Clock } from 'lucide-react-native';

const AdminDashboardScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

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
        // In a real device, we could save this as a .csv file using expo-file-system
        // For now, we share the content
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
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Control</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Admin Dashboard</Text>
          <Text style={styles.welcomeSubtitle}>Manage your workforce dynamically</Text>
        </View>

        {menuItems.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.menuCard}
            onPress={item.onPress}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
              <item.icon size={24} color={item.color} />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
        ))}


        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Quick Tip</Text>
          <Text style={styles.infoText}>
            For bulk uploads, ensure your Excel sheet follows the standard template to avoid registration errors.
          </Text>
        </View>
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
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
  },
  scrollContent: {
    padding: 24,
  },
  welcomeSection: {
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: colors.textLight,
    fontWeight: '600',
  },
  menuCard: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    ...colors.shadow,
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
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: colors.textLight,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    padding: 24,
    borderRadius: 24,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    fontWeight: '500',
  },
});

export default AdminDashboardScreen;
