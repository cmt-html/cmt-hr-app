import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, TextInput, StatusBar, Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { Search, Phone, Mail, ChevronLeft, ChevronRight } from 'lucide-react-native';
import api from '../services/api.service';

const DirectoryScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [employees, setEmployees] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      if (Array.isArray(response.data)) {
        setEmployees(response.data);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = Array.isArray(employees) ? employees.filter(emp => 
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.designation?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <View style={[styles.avatar, item.role === 'MANAGER' && { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
        <Text style={[styles.avatarText, item.role === 'MANAGER' && { color: colors.primary }]}>
          {item.firstName.charAt(0)}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.role}>{item.designation} • {item.role}</Text>
        <View style={styles.contactRow}>
          <TouchableOpacity 
            style={styles.contactIcon}
            onPress={() => item.phone && Linking.openURL(`tel:${item.phone.replace(/\s/g, '')}`)}
          >
            <Phone size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.contactIcon}
            onPress={() => Linking.openURL(`mailto:${item.email}`)}
          >
            <Mail size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

      </View>
      <ChevronRight size={20} color={colors.textLight} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Employee Directory</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={colors.textLight} />
        <TextInput 
          style={styles.searchInput} 
          placeholder="Search employees..." 
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredEmployees}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchEmployees}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    margin: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    height: 56,
    ...colors.shadow,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    ...colors.shadow,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 82, 204, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
  },
  role: {
    fontSize: 13,
    color: colors.textLight,
    fontWeight: '600',
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
  },
  contactIcon: {
    marginRight: 16,
    backgroundColor: 'rgba(0, 82, 204, 0.05)',
    padding: 8,
    borderRadius: 10,
  },
});

export default DirectoryScreen;
