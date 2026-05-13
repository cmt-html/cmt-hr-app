import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Switch, StatusBar, Platform, Dimensions, Image, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { User, Mail, Phone, Briefcase, Settings, LogOut, ChevronRight, Bell, Moon, Sun, Shield, Camera, ChevronLeft, Calendar, UserCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_URL } from '../services/api.service';

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
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <LinearGradient
          colors={colors.primaryGradient}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <ChevronLeft size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitleText}>My Profile</Text>
            <View style={{ width: 40 }} />
          </View>
          
          <View style={styles.profileInfo}>
            <View style={styles.avatarWrapper}>
              <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} disabled={uploading}>
                <View style={styles.avatarInner}>
                  {uploading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : userData?.profilePicture ? (
                    <Image 
                      source={{ uri: userData.profilePicture }} 
                      style={styles.avatarImage} 
                    />
                  ) : (
                    <Text style={styles.avatarText}>
                      {userData ? getInitials(userData.firstName, userData.lastName) : '??'}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editAvatar} onPress={pickImage} disabled={uploading}>
                <Camera size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>
              {userData ? `${userData.firstName} ${userData.lastName}` : 'User'}
            </Text>
            <Text style={styles.userRole}>
              {userData?.designation || 'Position'} • {userData?.department || 'Department'}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Employee ID</Text>
              <Text style={styles.statValue}>{userData?.employeeId || 'N/A'}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Role</Text>
              <Text style={styles.statValue}>{userData?.role || 'User'}</Text>
            </View>
          </View>

          {/* Role-Based Admin Shortcut */}
          {(userData?.role === 'HR' || userData?.role === 'ADMIN') && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Admin Controls</Text>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigation.navigate('AdminDashboard')}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                  <Shield size={20} color={colors.primary} />
                </View>
                <Text style={styles.menuText}>Go to Admin Dashboard</Text>
                <ChevronRight size={18} color={colors.textLight} />
              </TouchableOpacity>
            </View>
          )}

          {/* Information Group */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PersonalInfo')}>
              <View style={styles.menuIconContainer}>
                <User size={20} color={colors.primary} />
              </View>
              <Text style={styles.menuText}>View My Information</Text>
              <ChevronRight size={18} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Directory')}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#E8F5E9' }]}>
                <Briefcase size={20} color={colors.success} />
              </View>
              <Text style={styles.menuText}>Employee Directory</Text>
              <ChevronRight size={18} color={colors.textLight} />
            </TouchableOpacity>
          </View>

          {/* App Settings Group */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Preferences</Text>

            <View style={styles.menuItem}>
              <View style={[styles.menuIconContainer, { backgroundColor: isDarkMode ? '#2D3748' : '#F3E5F5' }]}>
                {isDarkMode ? <Moon size={20} color="#A78BFA" /> : <Sun size={20} color="#9C27B0" />}
              </View>
              <Text style={styles.menuText}>Dark Mode</Text>
              <Switch 
                value={isDarkMode} 
                onValueChange={toggleTheme}
                trackColor={{ true: colors.primary }} 
              />
            </View>

            <View style={styles.menuItem}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#FFF3E0' }]}>
                <Bell size={20} color={colors.warning} />
              </View>
              <Text style={styles.menuText}>Notifications</Text>
              <Switch value={true} trackColor={{ true: colors.primary }} />
            </View>
          </View>

          {/* Logout Section */}
          <View style={[styles.section, { marginBottom: 40 }]}>
            <TouchableOpacity 
              style={[styles.menuItem, { borderBottomWidth: 0 }]}
              onPress={handleLogout}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: '#FFEBEE' }]}>
                <LogOut size={20} color={colors.error} />
              </View>
              <Text style={[styles.menuText, { color: colors.error }]}>Log Out</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.versionText}>Version 1.0.0 (CloudMojo Tech)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  profileInfo: {
    alignItems: 'center',
    overflow: 'visible',
  },
  avatarWrapper: {
    width: 110,
    height: 110,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.white,
  },
  editAvatar: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: colors.white,
    width: 32,
    height: 32,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...colors.shadow,
    zIndex: 20,
    elevation: 5,
  },
  userName: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.white,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  content: {
    padding: 24,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 24,
    marginBottom: 32,
    marginTop: -45,
    ...colors.shadow,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: colors.border,
    alignSelf: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    paddingLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    ...colors.shadow,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 82, 204, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600',
  },
});

export default ProfileScreen;
