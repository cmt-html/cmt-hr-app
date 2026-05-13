import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, ScrollView, StatusBar, Platform, KeyboardAvoidingView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft, User, Mail, Shield, Briefcase, Calendar, Save } from 'lucide-react-native';
import api from '../services/api.service';

const InputField = ({ label, value, onChangeText, icon: Icon, placeholder, styles, colors, ...props }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <Icon size={20} color={colors.textLight} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        {...props}
      />
    </View>
  </View>
);

const AddEmployeeScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    employeeId: '',
    role: 'EMPLOYEE',
    designation: '',
    department: '',
    dateOfJoining: new Date().toISOString().split('T')[0],
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.email || !form.firstName || !form.employeeId) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/employees', form);
      
      alert('Employee added successfully!');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'Failed to connect to server';
      alert('Error: ' + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Employee</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            <Save size={24} color={loading ? colors.textLight : colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <InputField 
            label="First Name" 
            value={form.firstName} 
            onChangeText={(text) => setForm({...form, firstName: text})}
            icon={User}
            placeholder="e.g. John"
            styles={styles}
            colors={colors}
          />
          <InputField 
            label="Last Name" 
            value={form.lastName} 
            onChangeText={(text) => setForm({...form, lastName: text})}
            icon={User}
            placeholder="e.g. Doe"
            styles={styles}
            colors={colors}
          />
          <InputField 
            label="Email Address" 
            value={form.email} 
            onChangeText={(text) => setForm({...form, email: text})}
            icon={Mail}
            placeholder="e.g. john@cloudmojo.tech"
            keyboardType="email-address"
            styles={styles}
            colors={colors}
          />
          <InputField 
            label="Employee ID" 
            value={form.employeeId} 
            onChangeText={(text) => setForm({...form, employeeId: text})}
            icon={Shield}
            placeholder="e.g. CMT-101"
            styles={styles}
            colors={colors}
          />
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Role</Text>
            <View style={styles.roleGrid}>
              {['EMPLOYEE', 'MANAGER', 'HR', 'ADMIN'].map((r) => (
                <TouchableOpacity 
                  key={r}
                  style={[styles.roleBtn, form.role === r && styles.roleBtnActive]}
                  onPress={() => setForm({...form, role: r})}
                >
                  <Text style={[styles.roleBtnText, form.role === r && styles.roleBtnTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <InputField 
            label="Designation" 
            value={form.designation} 
            onChangeText={(text) => setForm({...form, designation: text})}
            icon={Briefcase}
            placeholder="e.g. Senior Software Engineer"
            styles={styles}
            colors={colors}
          />
          <InputField 
            label="Department" 
            value={form.department} 
            onChangeText={(text) => setForm({...form, department: text})}
            icon={Briefcase}
            placeholder="e.g. Engineering"
            styles={styles}
            colors={colors}
          />
          <InputField 
            label="Joining Date" 
            value={form.dateOfJoining} 
            onChangeText={(text) => setForm({...form, dateOfJoining: text})}
            icon={Calendar}
            placeholder="YYYY-MM-DD"
            styles={styles}
            colors={colors}
          />

          <TouchableOpacity 
            style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitBtnText}>{loading ? 'Creating...' : 'Create Employee'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    height: 56,
    paddingHorizontal: 16,
    ...colors.shadow,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textLight,
  },
  roleBtnTextActive: {
    color: colors.white,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    ...colors.shadow,
  },
  submitBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
  },
});

export default AddEmployeeScreen;
