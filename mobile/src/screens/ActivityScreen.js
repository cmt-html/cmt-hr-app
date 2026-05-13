import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ChevronLeft, Clock, UserCheck, Calendar } from 'lucide-react-native';

const ActivityScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const activities = [
    { id: '1', type: 'CHECKIN', title: 'Checked in today', time: '09:15 AM', date: '06 May 2026' },
    { id: '2', type: 'LEAVE', title: 'Leave request approved', time: 'Yesterday', date: '05 May 2026' },
    { id: '3', type: 'CHECKOUT', title: 'Checked out yesterday', time: '06:05 PM', date: '05 May 2026' },
    { id: '4', type: 'CHECKIN', title: 'Checked in yesterday', time: '09:00 AM', date: '05 May 2026' },
    { id: '5', type: 'REGULARIZE', title: 'Regularization request submitted', time: '2 days ago', date: '04 May 2026' },
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'CHECKIN': return <Clock size={20} color={colors.success} />;
      case 'CHECKOUT': return <Clock size={20} color={colors.primary} />;
      case 'LEAVE': return <Calendar size={20} color={colors.secondary} />;
      default: return <UserCheck size={20} color={colors.warning} />;
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.activityCard}>
      <View style={styles.iconContainer}>
        {getIcon(item.type)}
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.time}>{item.time} • {item.date}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recent Activity</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={activities}
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
  activityCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    alignItems: 'center',
    ...colors.shadow,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  time: {
    fontSize: 13,
    color: colors.textLight,
    fontWeight: '600',
  },
});

export default ActivityScreen;
