import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ChevronLeft, Calendar } from 'lucide-react-native';

const HolidaysScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const holidays = [
    { id: '1', name: 'New Year Day', date: '01 Jan', day: 'Wednesday' },
    { id: '2', name: 'Republic Day', date: '26 Jan', day: 'Sunday' },
    { id: '3', name: 'Holi', date: '14 Mar', day: 'Friday' },
    { id: '4', name: 'Good Friday', date: '18 Apr', day: 'Friday' },
    { id: '5', name: 'Eid-ul-Fitr', date: '15 May', day: 'Friday' },
    { id: '6', name: 'Independence Day', date: '15 Aug', day: 'Friday' },
    { id: '7', name: 'Gandhi Jayanti', date: '02 Oct', day: 'Thursday' },
    { id: '8', name: 'Diwali', date: '20 Oct', day: 'Monday' },
    { id: '9', name: 'Christmas', date: '25 Dec', day: 'Thursday' },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.holidayCard}>
      <View style={styles.dateBox}>
        <Text style={styles.dateText}>{item.date.split(' ')[0]}</Text>
        <Text style={styles.monthText}>{item.date.split(' ')[1]}</Text>
      </View>
      <View style={styles.holidayInfo}>
        <Text style={styles.holidayName}>{item.name}</Text>
        <Text style={styles.holidayDay}>{item.day}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Holidays 2026</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={holidays}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  listContent: {
    padding: 24,
  },
  holidayCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    alignItems: 'center',
    ...colors.shadow,
  },
  dateBox: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
  },
  monthText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  holidayInfo: {
    flex: 1,
  },
  holidayName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
  },
  holidayDay: {
    fontSize: 13,
    color: colors.textLight,
    fontWeight: '600',
  },
});

export default HolidaysScreen;
