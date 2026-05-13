import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert, StatusBar, Platform, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ChevronLeft, Calendar, Info, Activity, Coffee, Home } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { leaveService } from '../services/api.service';

const ApplyLeaveScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [leaveType, setLeaveType] = useState('ANNUAL');
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!reason) {
      Alert.alert('Error', 'Please provide a reason for leave.');
      return;
    }

    setLoading(true);
    try {
      const savedUser = await AsyncStorage.getItem('userData');
      if (!savedUser) return;
      const user = JSON.parse(savedUser);

      await leaveService.applyLeave({
        userId: user.id,
        type: leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
      });

      Alert.alert('Success', 'Leave application submitted successfully. ');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to apply leave:', error);
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const TypeButton = ({ type, label, icon: Icon }) => (
    <TouchableOpacity
      style={[styles.typeButton, leaveType === type && styles.typeButtonActive]}
      onPress={() => setLeaveType(type)}
    >
      <Icon
        size={20}
        color={leaveType === type ? colors.white : colors.primary}
        style={styles.buttonIcon}
      />
      <Text style={[styles.typeButtonText, leaveType === type && styles.typeButtonTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Apply Leave</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.label}>Leave Type</Text>
          <View style={styles.typeGrid}>
            <TypeButton type="ANNUAL" label="Annual" icon={Calendar} />
            <TypeButton type="SICK" label="Sick" icon={Activity} />
            <TypeButton type="CASUAL" label="Casual" icon={Coffee} />
            <TypeButton type="WFH" label="WFH" icon={Home} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>From Date (YYYY-MM-DD)</Text>
          <View style={styles.dateInput}>
            <Calendar size={18} color={colors.textLight} />
            <TextInput
              style={styles.dateInputText}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="2026-05-11"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>To Date (YYYY-MM-DD)</Text>
          <View style={styles.dateInput}>
            <Calendar size={18} color={colors.textLight} />
            <TextInput
              style={styles.dateInputText}
              value={endDate}
              onChangeText={setEndDate}
              placeholder="2026-05-12"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Reason</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Enter reason for leave..."
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={4}
            value={reason}
            onChangeText={setReason}
          />
        </View>

        <View style={styles.infoBox}>
          <Info size={16} color={colors.primary} />
          <Text style={styles.infoText}>You have 12 days of annual leave remaining for this year.</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && { opacity: 0.7 }]}
          onPress={handleApply}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>Submit Application</Text>
          )}
        </TouchableOpacity>
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
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  typeButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    marginHorizontal: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: '46%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...colors.shadow,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
  },
  buttonIcon: {
    marginRight: 10,
  },
  typeButtonText: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 14,
  },
  typeButtonTextActive: {
    color: colors.white,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateInputText: {
    marginLeft: 12,
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  textArea: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 15,
    textAlignVertical: 'top',
    height: 120,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 82, 204, 0.05)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  infoText: {
    marginLeft: 12,
    color: colors.primary,
    fontSize: 13,
    flex: 1,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 18,
    alignItems: 'center',
    ...colors.shadow,
    shadowColor: colors.primary,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
  },
});

export default ApplyLeaveScreen;
