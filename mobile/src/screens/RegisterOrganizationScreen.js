import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import api from '../services/api.service';
import { Mail, Lock, Building, User, Phone, MapPin, ChevronRight, ChevronLeft } from 'lucide-react-native';

const RegisterOrganizationScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
  const [formData, setFormData] = useState({
    orgName: '',
    slug: '',
    adminEmail: '',
    phone: '',
    address: '',
    adminFirstName: '',
    adminLastName: '',
    adminPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const { orgName, slug, adminEmail, adminFirstName, adminLastName, adminPassword } = formData;
    if (!orgName || !slug || !adminEmail || !adminFirstName || !adminLastName || !adminPassword) {
      Alert.alert('Required Fields', 'Please fill in all mandatory fields.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      Alert.alert(
        'Success', 
        'Registration successful! You can now log in to your dashboard.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.primaryGradient}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Register Organization</Text>
          <View style={{ width: 24 }} />
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionTitle}>Organization Details</Text>
            
            <View style={styles.inputContainer}>
              <Building size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Organization Name"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={formData.orgName}
                onChangeText={(text) => setFormData({...formData, orgName: text})}
              />
            </View>

            <View style={styles.inputContainer}>
              <MapPin size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Organization Slug (e.g., cloudmojo)"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={formData.slug}
                onChangeText={(text) => setFormData({...formData, slug: text.toLowerCase().replace(/\s/g, '')})}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Mail size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Admin Email"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={formData.adminEmail}
                onChangeText={(text) => setFormData({...formData, adminEmail: text})}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <MapPin size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Address"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={formData.address}
                onChangeText={(text) => setFormData({...formData, address: text})}
              />
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Admin Account</Text>

            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                <User size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={formData.adminFirstName}
                  onChangeText={(text) => setFormData({...formData, adminFirstName: text})}
                />
              </View>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={formData.adminLastName}
                  onChangeText={(text) => setFormData({...formData, adminLastName: text})}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Admin Password"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={formData.adminPassword}
                onChangeText={(text) => setFormData({...formData, adminPassword: text})}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={[styles.registerBtn, loading && { opacity: 0.8 }]} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <Text style={styles.registerBtnText}>SUBMIT REGISTRATION</Text>
                  <View style={styles.arrowIcon}>
                    <ChevronRight size={20} color={colors.primary} />
                  </View>
                </>
              )}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 18,
    marginBottom: 16,
    paddingHorizontal: 20,
    height: 60,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  inputIcon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
  },
  registerBtn: {
    backgroundColor: '#FFFFFF',
    height: 64,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    ...colors.shadow,
  },
  registerBtnText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  arrowIcon: {
    position: 'absolute',
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 82, 204, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RegisterOrganizationScreen;
