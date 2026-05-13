import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, Platform, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import api from '../services/api.service';
import { ChevronLeft, Save, Clock, Target } from 'lucide-react-native';

const WorkingHoursConfigScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    windowStart: '08:00 AM',
    windowEnd: '08:00 PM',
    requiredHours: '9',
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await api.get('/config/working-hours');
      if (response.data) {
        setConfig({
          windowStart: response.data.windowStart || '08:00 AM',
          windowEnd: response.data.windowEnd || '08:00 PM',
          requiredHours: response.data.requiredHours.toString(),
        });
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/config/working-hours', {
        ...config,
        requiredHours: parseInt(config.requiredHours),
      });
      Alert.alert('Success', 'Configuration updated successfully');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
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
        <Text style={styles.headerTitle}>Work Settings</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveButton}>
          {saving ? <ActivityIndicator size="small" color={colors.primary} /> : <Save size={24} color={colors.primary} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Flexible Working Window</Text>
          <Text style={styles.sectionSubtitle}>Define the time range within which employees can work.</Text>

          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <Clock size={20} color={colors.textLight} style={styles.inputIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Window Start</Text>
                <TextInput
                  style={styles.input}
                  value={config.windowStart}
                  onChangeText={(text) => setConfig({ ...config, windowStart: text })}
                  placeholder="08:00 AM"
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Clock size={20} color={colors.textLight} style={styles.inputIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Window End</Text>
                <TextInput
                  style={styles.input}
                  value={config.windowEnd}
                  onChangeText={(text) => setConfig({ ...config, windowEnd: text })}
                  placeholder="08:00 PM"
                />
              </View>
            </View>
          </View>
        </View>


        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Required Hours</Text>
          <Text style={styles.sectionSubtitle}>Standard working hours expected per day.</Text>

          <View style={styles.inputWrapperFull}>
            <Target size={20} color={colors.textLight} style={styles.inputIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Hours Required</Text>
              <TextInput
                style={styles.input}
                value={config.requiredHours}
                onChangeText={(text) => setConfig({ ...config, requiredHours: text })}
                keyboardType="numeric"
                placeholder="9"
              />
            </View>
          </View>
        </View>


        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Note</Text>
          <Text style={styles.infoText}>
            Flexible hours allow employees to check in anytime within the window. The system will automatically calculate their status based on total time spent.
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  saveButton: {
    padding: 5,
  },
  scrollContent: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 16,
    fontWeight: '500',
  },
  inputGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputWrapper: {
    flex: 0.48,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  inputWrapperFull: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textLight,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  input: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    padding: 0,
  },
  infoCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    padding: 24,
    borderRadius: 24,
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

export default WorkingHoursConfigScreen;
