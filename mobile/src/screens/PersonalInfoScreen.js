import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar, 
  Platform, 
  TextInput, 
  ActivityIndicator, 
  Alert, 
  Linking,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { ChevronLeft, User, Mail, Briefcase, Shield, Save, Phone, MapPin, BadgeCheck } from 'lucide-react-native';
import api from '../services/api.service';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const PersonalInfoScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const styles = getStyles(colors, isDarkMode);

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Editable fields
  const [phone, setPhone] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('userData');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setUserData(user);
        setPhone(user.phone || '');
        setEmergencyName(user.emergencyContactName || '');
        setEmergencyPhone(user.emergencyContact || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userData?.id) {
      Alert.alert('Error', 'Could not load your profile. Please sign in again.');
      return;
    }
    if (!emergencyName || !emergencyPhone) {
      Alert.alert('Missing Info', 'Please provide both Name and Phone for your emergency contact.');
      return;
    }

    setSaving(true);
    try {
      const response = await api.put(`/profile/${userData.id}`, {
        phone,
        emergencyContactName: emergencyName,
        emergencyContact: emergencyPhone
      });

      const updatedUser = { ...userData, ...response.data };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      setUserData(updatedUser);
      
      Alert.alert('Success', 'Your profile details have been updated.');
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.message || 'Failed to save changes';
      Alert.alert('Update Failed', msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
            <Text style={styles.headerTitle}>User Profile</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveActionBtn}>
              {saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Save size={22} color="#FFFFFF" />}
            </TouchableOpacity>
          </SafeAreaView>
          
          <View style={styles.heroSection}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>
                {userData?.firstName?.[0]}{userData?.lastName?.[0]}
              </Text>
              <View style={styles.verifiedBadge}>
                <BadgeCheck size={14} color="#FFFFFF" fill={colors.success} />
              </View>
            </View>
            <Text style={styles.heroTitle}>{userData?.firstName} {userData?.lastName}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{userData?.designation}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CORE IDENTITY</Text>
        </View>

        <View style={styles.premiumCard}>
          <InfoItem label="Employee ID" value={userData?.employeeId} icon={Shield} colors={colors} styles={styles} />
          <View style={styles.divider} />
          <InfoItem label="Department" value={userData?.department} icon={Briefcase} colors={colors} styles={styles} />
          <View style={styles.divider} />
          <InfoItem label="Work Email" value={userData?.email} icon={Mail} colors={colors} type="email" styles={styles} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>EDITABLE DETAILS</Text>
        </View>

        <View style={styles.premiumCard}>
          <View style={styles.inputGroup}>
            <View style={styles.inputIconBox}>
              <Phone size={16} color={colors.primary} />
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Personal Phone</Text>
              <TextInput 
                style={styles.textInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="+91 XXXXX XXXXX"
                placeholderTextColor={colors.textLight}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>EMERGENCY CONTACT</Text>
        </View>

        <View style={styles.premiumCard}>
          <View style={styles.inputGroup}>
            <View style={styles.inputIconBox}>
              <User size={16} color={colors.primary} />
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Contact Person Name</Text>
              <TextInput 
                style={styles.textInput}
                value={emergencyName}
                onChangeText={setEmergencyName}
                placeholder="e.g. Jane Doe"
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.inputGroup}>
            <View style={styles.inputIconBox}>
              <Phone size={16} color={colors.primary} />
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput 
                style={styles.textInput}
                value={emergencyPhone}
                onChangeText={setEmergencyPhone}
                placeholder="+91 XXXXX XXXXX"
                placeholderTextColor={colors.textLight}
                keyboardType="phone-pad"
              />
            </View>
            {emergencyPhone ? (
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${emergencyPhone}`)} style={styles.callBtn}>
                <Phone size={14} color="#FFFFFF" fill="#FFFFFF" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.saveBtn, saving && { opacity: 0.7 }]} 
          onPress={handleSave}
          disabled={saving}
        >
          <LinearGradient
            colors={colors.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveBtnGradient}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>Update Profile</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.footerInfo}>
          <Text style={styles.footerNote}>To modify official data (Name, ID, Dept), please raise a request with HR department.</Text>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const InfoItem = ({ label, value, icon: Icon, colors, type, styles }) => {
  const handlePress = () => {
    if (!value || value === 'N/A') return;
    if (type === 'email') Linking.openURL(`mailto:${value}`);
    if (type === 'phone') Linking.openURL(`tel:${value.replace(/\s/g, '')}`);
  };

  return (
    <TouchableOpacity 
      style={styles.infoItem} 
      onPress={handlePress}
      disabled={!type}
      activeOpacity={0.7}
    >
      <View style={styles.iconBox}>
        <Icon size={18} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, type && { color: colors.primary }]}>
          {value || 'N/A'}
        </Text>
      </View>
    </TouchableOpacity>
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
  saveActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSection: {
    alignItems: 'center',
  },
  avatarLarge: {
    width: 90,
    height: 90,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarLargeText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    padding: 2,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 100,
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 24,
  },
  sectionHeader: {
    marginBottom: 16,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.textLight,
    letterSpacing: 1.5,
  },
  premiumCard: {
    backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
    borderRadius: 32,
    padding: 16,
    marginBottom: 24,
    ...colors.premiumShadow,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(11, 74, 236, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    color: colors.textLight,
    fontWeight: '800',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
    marginVertical: 4,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  inputIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(11, 74, 236, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  inputContent: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '900',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    padding: 0,
  },
  callBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtn: {
    marginTop: 8,
    ...colors.premiumShadow,
  },
  saveBtnGradient: {
    padding: 18,
    borderRadius: 20,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  footerInfo: {
    marginTop: 24,
    paddingHorizontal: 12,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textLight,
    lineHeight: 18,
    fontWeight: '500',
  },
});

export default PersonalInfoScreen;

