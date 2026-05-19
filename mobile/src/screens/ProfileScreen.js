import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Switch, 
  StatusBar, 
  Platform, 
  Dimensions, 
  Image, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { 
  User, 
  Briefcase, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Bell, 
  Moon, 
  Sun, 
  Camera, 
  ChevronLeft, 
  HelpCircle,
  Smartphone,
  ShieldCheck
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_URL } from '../services/api.service';
import CloudMojoLogo from '../components/CloudMojoLogo';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const [userData, setUserData] = React.useState(null);
  const [uploading, setUploading] = React.useState(false);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const savedUser = await AsyncStorage.getItem('userData');
    if (savedUser) {
      setUserData(JSON.parse(savedUser));
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to change your profile picture.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].base64);
    }
  };

  const uploadImage = async (base64) => {
    if (!userData) return;
    setUploading(true);
    try {
      const response = await axios.put(`${API_URL}/profile/${userData.id}`, {
        profilePicture: `data:image/jpeg;base64,${base64}`
      });

      const updatedUser = { ...userData, ...response.data };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      setUserData(updatedUser);
      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.replace('Login');
          }
        },
      ]
    );
  };

  const styles = getStyles(colors, isDarkMode);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Immersive Header */}
        <View style={styles.headerWrapper}>
          <LinearGradient
            colors={colors.primaryGradient}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <SafeAreaView edges={['top']} style={styles.headerTop}>
              <TouchableOpacity 
                style={styles.backBtn}
                onPress={() => navigation.goBack()}
              >
                <ChevronLeft size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Account Settings</Text>
              <View style={{ width: 44 }} />
            </SafeAreaView>
            
            <View style={styles.profileSection}>
              <View style={styles.avatarWrapper}>
                <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} activeOpacity={0.9}>
                  <View style={styles.avatarInner}>
                    {uploading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : userData?.profilePicture ? (
                      <Image source={{ uri: userData.profilePicture }} style={styles.avatarImage} />
                    ) : (
                      <Text style={styles.avatarText}>
                        {userData ? getInitials(userData.firstName, userData.lastName) : '??'}
                      </Text>
                    )}
                  </View>
                  <View style={styles.editBadge}>
                    <Camera size={14} color={colors.primary} />
                  </View>
                </TouchableOpacity>
              </View>

              <Text style={styles.userName}>
                {userData ? `${userData.firstName} ${userData.lastName}` : 'User'}
              </Text>
              <View style={styles.roleBadge}>
                <ShieldCheck size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.roleBadgeText}>{userData?.designation || 'Member'}</Text>
              </View>
            </View>
          </LinearGradient>
          
          {/* Floating Stats Row */}
          <View style={styles.statsFloating}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Employee ID</Text>
              <Text style={styles.statVal}>{userData?.employeeId || 'N/A'}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Department</Text>
              <Text style={styles.statVal} numberOfLines={1}>{userData?.department || 'N/A'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuContent}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PROFESSIONAL</Text>
          </View>
          
          <View style={styles.premiumCard}>
            <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate('PersonalInfo')}>
              <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}>
                <User size={20} color="#6366F1" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>Personal Information</Text>
                <Text style={styles.rowSub}>Basic details and contacts</Text>
              </View>
              <ChevronRight size={18} color="#CBD5E1" />
            </TouchableOpacity>

            <View style={styles.rowLine} />

            <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate('Directory')}>
              <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
                <Briefcase size={20} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>Team Directory</Text>
                <Text style={styles.rowSub}>Connect with colleagues</Text>
              </View>
              <ChevronRight size={18} color="#CBD5E1" />
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PREFERENCES</Text>
          </View>

          <View style={styles.premiumCard}>
            <View style={styles.menuRow}>
              <View style={[styles.iconBox, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}>
                {isDarkMode ? <Moon size={20} color="#818CF8" /> : <Sun size={20} color="#F59E0B" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>Dark Mode</Text>
                <Text style={styles.rowSub}>{isDarkMode ? 'Immersive theme active' : 'Classic theme active'}</Text>
              </View>
              <Switch 
                value={isDarkMode} 
                onValueChange={toggleTheme}
                trackColor={{ true: colors.primary, false: '#E2E8F0' }} 
              />
            </View>

            <View style={styles.rowLine} />

            <View style={styles.menuRow}>
              <View style={[styles.iconBox, { backgroundColor: '#FFF7ED' }]}>
                <Bell size={20} color="#F97316" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>Push Notifications</Text>
                <Text style={styles.rowSub}>Daily attendance reminders</Text>
              </View>
              <Switch value={true} trackColor={{ true: colors.primary }} />
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>SUPPORT</Text>
          </View>

          <View style={styles.premiumCard}>
            <TouchableOpacity style={styles.menuRow}>
              <View style={[styles.iconBox, { backgroundColor: '#F0F9FF' }]}>
                <Smartphone size={20} color="#0EA5E9" />
              </View>
              <Text style={[styles.rowTitle, { flex: 1 }]}>About CloudMojo HR</Text>
              <ChevronRight size={18} color="#CBD5E1" />
            </TouchableOpacity>
            
            <View style={styles.rowLine} />

            <TouchableOpacity style={styles.menuRow}>
              <View style={[styles.iconBox, { backgroundColor: '#F1F5F9' }]}>
                <HelpCircle size={20} color="#64748B" />
              </View>
              <Text style={[styles.rowTitle, { flex: 1 }]}>Help & Feedback</Text>
              <ChevronRight size={18} color="#CBD5E1" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <View style={styles.logoutIconBox}>
              <LogOut size={20} color="#EF4444" />
            </View>
            <Text style={styles.logoutText}>Sign Out Account</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <CloudMojoLogo size={56} />
            <Text style={styles.version}>v1.2.4</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const getStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  headerWrapper: {
    marginBottom: 40,
    zIndex: 10,
  },
  headerGradient: {
    paddingBottom: 80,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginBottom: 32,
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
  profileSection: {
    alignItems: 'center',
  },
  avatarWrapper: {
    marginBottom: 16,
    position: 'relative',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarInner: {
    flex: 1,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  editBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...colors.premiumShadow,
  },
  userName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    marginTop: 8,
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  statsFloating: {
    position: 'absolute',
    bottom: -30,
    left: 20,
    right: 20,
    backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
    borderRadius: 24,
    flexDirection: 'row',
    padding: 20,
    ...colors.premiumShadow,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
    alignSelf: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: colors.textLight,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statVal: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  menuContent: {
    paddingHorizontal: 24,
  },
  sectionHeader: {
    marginBottom: 16,
    paddingHorizontal: 4,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.textLight,
    letterSpacing: 1.5,
  },
  premiumCard: {
    backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    ...colors.premiumShadow,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  rowSub: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '500',
    marginTop: 2,
  },
  rowLine: {
    height: 1,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
    marginHorizontal: 16,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2',
    padding: 16,
    borderRadius: 24,
    marginTop: 40,
    gap: 16,
    ...colors.premiumShadow,
  },
  logoutIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#EF4444',
  },
  footer: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  version: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600',
  }
});

export default ProfileScreen;


