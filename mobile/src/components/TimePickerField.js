import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, FlatList, Dimensions, Platform } from 'react-native';
import { Clock, ChevronDown } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

const { height } = Dimensions.get('window');

const TimePickerField = ({ label, value, onTimeChange }) => {
  const { colors, isDarkMode } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  
  // Extract initial values from HH:MM AM/PM string
  const [hour, setHour] = useState(value ? value.split(':')[0] : '09');
  const [minute, setMinute] = useState(value ? value.split(':')[1].split(' ')[0] : '00');
  const [period, setPeriod] = useState(value ? value.split(' ')[1] : 'AM');

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

  const handleConfirm = () => {
    const formattedTime = `${hour}:${minute} ${period}`;
    onTimeChange(formattedTime);
    setModalVisible(false);
  };

  const styles = getStyles(colors, isDarkMode);

  const PickerColumn = ({ data, selectedValue, onSelect, label }) => (
    <View style={styles.column}>
      <Text style={styles.columnLabel}>{label}</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
        snapToInterval={50}
        decelerationRate="fast"
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.pickerItem, selectedValue === item && styles.selectedItem]}
            onPress={() => onSelect(item)}
          >
            <Text style={[styles.itemText, selectedValue === item && styles.selectedItemText]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity 
        style={styles.inputBox}
        onPress={() => setModalVisible(true)}
      >
        <Clock size={18} color={colors.primary} />
        <Text style={styles.inputText}>{value || 'Select Time'}</Text>
        <ChevronDown size={18} color={colors.textLight} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time</Text>
              <Text style={styles.modalSubtitle}>{hour}:{minute} {period}</Text>
            </View>

            <View style={styles.pickerContainer}>
              <PickerColumn 
                label="HOUR" 
                data={hours} 
                selectedValue={hour} 
                onSelect={setHour} 
              />
              <PickerColumn 
                label="MIN" 
                data={minutes} 
                selectedValue={minute} 
                onSelect={setMinute} 
              />
              
              <View style={styles.column}>
                <Text style={styles.columnLabel}>AM/PM</Text>
                <TouchableOpacity 
                  style={[styles.periodBtn, period === 'AM' && styles.selectedPeriod]}
                  onPress={() => setPeriod('AM')}
                >
                  <Text style={[styles.periodText, period === 'AM' && styles.selectedItemText]}>AM</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.periodBtn, period === 'PM' && styles.selectedPeriod]}
                  onPress={() => setPeriod('PM')}
                >
                  <Text style={[styles.periodText, period === 'PM' && styles.selectedItemText]}>PM</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmBtn} 
                onPress={handleConfirm}
              >
                <Text style={styles.confirmText}>Confirm Time</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textLight,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    height: 60,
    ...colors.shadow,
  },
  inputText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    minHeight: 450,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.primary,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 200,
    marginBottom: 30,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  columnLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.textLight,
    marginBottom: 10,
  },
  pickerItem: {
    height: 50,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 5,
  },
  selectedItem: {
    backgroundColor: colors.primary,
  },
  itemText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  selectedItemText: {
    color: colors.white,
  },
  periodBtn: {
    width: 70,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
  },
  selectedPeriod: {
    backgroundColor: colors.primary,
  },
  periodText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  cancelBtn: {
    flex: 1,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textLight,
  },
  confirmBtn: {
    flex: 2,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: colors.primary,
    ...colors.shadow,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.white,
  },
});

export default TimePickerField;
