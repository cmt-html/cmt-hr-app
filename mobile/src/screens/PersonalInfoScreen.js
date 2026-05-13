import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Platform, TextInput, ActivityIndicator, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useTheme } from '../theme/ThemeContext';
import { ChevronLeft, User, Mail, Phone, Briefcase, Calendar, Shield, Heart, Save } from 'lucide-react-native';
import { API_URL } from '../services/api.service';

const PersonalInfoScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const styles = getStyles(colors, isDarkMode);

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Editable fields
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
    if (!emergencyName || !emergencyPhone) {
      Alert.alert('Missing Info', 'Please provide both Name and Phone for your emergency contact.');
      return;
    }

    setSaving(true);
    try {
      const response = await axios.put(`${API_URL}/profile/${userData.id}`, {
        emergencyContactName: emergencyName,
        emergencyContact: emergencyPhone
      });

      // Update local storage
      const updatedUser = { ...userData, ...response.data };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      setUserData(updatedUser);

      
      Alert.alert('Success', 'Your emergency contact has been updated.');
    } catch (error) {
      Alert.alert('Error', 'Failed to save changes. Please try again.');
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Info</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color={colors.primary} /> : <Save size={24} color={colors.primary} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Basic Details (Read-only) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Details</Text>
          <View style={styles.card}>
            <InfoItem label="Full Name" value={`${userData?.firstName} ${userData?.lastName}`} icon={User} colors={colors} />
            <View style={styles.divider} />
            <InfoItem label="Employee ID" value={userData?.employeeId} icon={Shield} colors={colors} />
            <View style={styles.divider} />
            <InfoItem label="Designation" value={userData?.designation} icon={Briefcase} colors={colors} />
            <View style={styles.divider} />
            <InfoItem label="Department" value={userData?.department} icon={Briefcase} colors={colors} />
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.card}>
            <InfoItem label="Work Email" value={userData?.email} icon={Mail} colors={colors} type="email" />
          </View>
        </View>

        {/* Emergency Contact (Editable) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.inputGroup} 
              onPress={() => emergencyPhone && Linking.openURL(`tel:${emergencyPhone}`)}
            >
              <Text style={styles.inputLabel}>Contact Person Name</Text>
              <TextInput 
                style={styles.textInput}
                value={emergencyName}
                onChangeText={setEmergencyName}
                placeholder="e.g. Jane Doe"
                placeholderTextColor={colors.textLight}
              />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity 
              style={styles.inputGroup}
              onPress={() => emergencyPhone && Linking.openURL(`tel:${emergencyPhone}`)}
            >
              <Text style={styles.inputLabel}>Phone Number (Click to Call)</Text>
              <TextInput 
                style={styles.textInput}
                value={emergencyPhone}
                onChangeText={setEmergencyPhone}
                placeholder="+91 XXXXX XXXXX"
                placeholderTextColor={colors.textLight}
                keyboardType="phone-pad"
              />
            </TouchableOpacity>
          </View>
        </View>


        <TouchableOpacity 
          style={[styles.saveBtn, saving && { opacity: 0.7 }]} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerNote}>To change basic details, please contact HR department.</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoItem = ({ label, value, icon: Icon, colors, type }) => {
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
    >
      <View style={styles.iconBox}>
        <Icon size={18} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, type && { color: colors.primary, textDecorationLine: 'underline' }]}>
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 5,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    ...colors.shadow,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  inputGroup: {
    paddingVertical: 8,
  },
  inputLabel: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '800',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  textInput: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    padding: 0,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.5,
    marginVertical: 4,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 10,
    ...colors.shadow,
  },
  saveBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textLight,
    marginTop: 24,
    marginBottom: 40,
    fontStyle: 'italic',
  },
});

export default PersonalInfoScreen;
