import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert, StatusBar, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ChevronLeft, Info } from 'lucide-react-native';
import TimePickerField from '../components/TimePickerField';
import { attendanceService } from '../services/api.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';

const RegularizeScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const prefillDate = route.params?.prefillDate || 'Select Date';

  const [checkInTime, setCheckInTime] = useState('09:00 AM');
  const [checkOutTime, setCheckOutTime] = useState('06:00 PM');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      Alert.alert('Error', 'Please provide a reason.');
      return;
    }
    if (prefillDate === 'Select Date') {
      Alert.alert('Error', 'No date selected.');
      return;
    }

    setLoading(true);
    try {
      const savedUser = await AsyncStorage.getItem('userData');
      if (!savedUser) return;
      const user = JSON.parse(savedUser);

      const baseDate = new Date(prefillDate);

      const [inH, inM] = checkInTime.split(':');
      const isPM = checkInTime.includes('PM');
      const finalInH = isPM ? (parseInt(inH) % 12) + 12 : parseInt(inH) % 12;

      const checkInDate = new Date(baseDate);
      checkInDate.setHours(finalInH, parseInt(inM), 0);

      const [outH, outM] = checkOutTime.split(':');
      const isOutPM = checkOutTime.includes('PM');
      const finalOutH = isOutPM ? (parseInt(outH) % 12) + 12 : parseInt(outH) % 12;

      const checkOutDate = new Date(baseDate);
      checkOutDate.setHours(finalOutH, parseInt(outM), 0);

      await attendanceService.regularize({
        userId: user.id,
        date: baseDate,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        reason
      });

      Alert.alert('Success', 'Regularization request submitted.');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance Regularize</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoBox}>
          <Info size={20} color={colors.warning} />
          <Text style={styles.infoText}>
            Use this form to correct missing check-ins or late marks.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Date</Text>
          <View style={styles.readOnlyInput}>
            <Text style={styles.readOnlyText}>{prefillDate}</Text>
          </View>
        </View>

        <View style={styles.timeRow}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <TimePickerField
              label="Check In Time"
              value={checkInTime}
              onTimeChange={setCheckInTime}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <TimePickerField
              label="Check Out Time"
              value={checkOutTime}
              onTimeChange={setCheckOutTime}
            />
          </View>
        </View>


        <View style={styles.section}>
          <Text style={styles.label}>Reason for Regularization</Text>
          <TextInput
            style={styles.textArea}
            placeholder="e.g. Forgot to check in, Technical issue..."
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={4}
            value={reason}
            onChangeText={setReason}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>Submit Request</Text>
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 171, 0, 0.1)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 171, 0, 0.2)',
  },
  infoText: {
    marginLeft: 12,
    color: colors.warning,
    fontSize: 13,
    flex: 1,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  readOnlyInput: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  readOnlyText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  timeRow: {
    flexDirection: 'row',
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    height: 56,
  },
  textInput: {
    flex: 1,
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
  submitButton: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 10,
    ...colors.shadow,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
  },
});

export default RegularizeScreen;
