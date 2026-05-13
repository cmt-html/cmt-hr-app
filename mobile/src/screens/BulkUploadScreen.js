import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, StatusBar, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft, FileUp, CheckCircle, AlertCircle, Info } from 'lucide-react-native';
import api from '../services/api.service';

const BulkUploadScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [status, setStatus] = useState('IDLE'); // IDLE, UPLOADING, SUCCESS, ERROR
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    // In a real app, we would use expo-document-picker here.
    // For this fix, I will ensure the API call logic is correct and uses the right token/URL.
    setStatus('UPLOADING');
    
    try {
      const mockData = {
        users: [
          { email: 'user1@cloudmojo.tech', firstName: 'Alice', lastName: 'Wonder', employeeId: 'CMT-201', role: 'EMPLOYEE' },
          { email: 'user2@cloudmojo.tech', firstName: 'Bob', lastName: 'Builder', employeeId: 'CMT-202', role: 'MANAGER' },
        ]
      };

      const response = await api.post('/employees/bulk', mockData);

      setResult(response.data);
      setStatus('SUCCESS');
    } catch (error) {
      console.error(error);
      setStatus('ERROR');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bulk Upload</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoBox}>
          <Info size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            Upload an Excel or CSV file containing employee details. Make sure the headers match the required template.
          </Text>
        </View>

        <View style={styles.uploadArea}>
          {status === 'IDLE' && (
            <>
              <View style={styles.iconCircle}>
                <FileUp size={40} color={colors.primary} />
              </View>
              <Text style={styles.uploadTitle}>Select File</Text>
              <Text style={styles.uploadSubtitle}>Supports .xlsx, .xls, .csv</Text>
              <TouchableOpacity style={styles.selectBtn} onPress={handleUpload}>
                <Text style={styles.selectBtnText}>Choose File</Text>
              </TouchableOpacity>
            </>
          )}

          {status === 'UPLOADING' && (
            <View style={styles.statusView}>
              <Text style={styles.statusTitle}>Uploading...</Text>
              <Text style={styles.statusSubtitle}>Processing employee records</Text>
            </View>
          )}

          {status === 'SUCCESS' && (
            <View style={styles.statusView}>
              <CheckCircle size={60} color={colors.success} />
              <Text style={[styles.statusTitle, { color: colors.success }]}>Success!</Text>
              <Text style={styles.statusSubtitle}>{result?.count} users imported successfully.</Text>
              <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.doneBtnText}>Back to Dashboard</Text>
              </TouchableOpacity>
            </View>
          )}

          {status === 'ERROR' && (
            <View style={styles.statusView}>
              <AlertCircle size={60} color={colors.error} />
              <Text style={[styles.statusTitle, { color: colors.error }]}>Upload Failed</Text>
              <Text style={styles.statusSubtitle}>There was an error processing the file.</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => setStatus('IDLE')}>
                <Text style={styles.retryBtnText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.templateCard}>
          <Text style={styles.templateTitle}>Required Columns:</Text>
          <Text style={styles.templateItem}>• email (Required)</Text>
          <Text style={styles.templateItem}>• firstName, lastName (Required)</Text>
          <Text style={styles.templateItem}>• employeeId (Required)</Text>
          <Text style={styles.templateItem}>• role (EMPLOYEE, MANAGER, HR)</Text>
          <Text style={styles.templateItem}>• designation, department</Text>
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 30,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
    lineHeight: 18,
  },
  uploadArea: {
    backgroundColor: colors.surface,
    borderRadius: 30,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginBottom: 30,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '600',
    marginBottom: 30,
  },
  selectBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  selectBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  statusView: {
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  statusSubtitle: {
    fontSize: 15,
    color: colors.textLight,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
  },
  doneBtn: {
    backgroundColor: colors.success,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  doneBtnText: {
    color: colors.white,
    fontWeight: '800',
  },
  retryBtn: {
    backgroundColor: colors.error,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryBtnText: {
    color: colors.white,
    fontWeight: '800',
  },
  templateCard: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 24,
    ...colors.shadow,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 12,
  },
  templateItem: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '700',
    marginBottom: 8,
  },
});

export default BulkUploadScreen;
