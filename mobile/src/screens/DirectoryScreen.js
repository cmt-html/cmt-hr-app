import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  StatusBar, 
  Platform, 
  Linking,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Search, Phone, Mail, ChevronLeft, ChevronRight, Users } from 'lucide-react-native';
import api from '../services/api.service';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const DirectoryScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const styles = getStyles(colors, isDarkMode);
  const [employees, setEmployees] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
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
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <View style={[styles.avatarBox, item.role === 'MANAGER' && { backgroundColor: 'rgba(11, 74, 236, 0.08)' }]}>
        <Text style={[styles.avatarText, item.role === 'MANAGER' && { color: colors.primary }]}>
          {item.firstName.charAt(0)}{item.lastName.charAt(0)}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.role}>{item.designation}</Text>
        
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.contactBtn}
            onPress={() => item.phone && Linking.openURL(`tel:${item.phone.replace(/\s/g, '')}`)}
          >
            <Phone size={14} color={colors.primary} />
            <Text style={styles.contactBtnText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.contactBtn}
            onPress={() => Linking.openURL(`mailto:${item.email}`)}
          >
            <Mail size={14} color={colors.primary} />
            <Text style={styles.contactBtnText}>Email</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.chevronBox}>
        <ChevronRight size={18} color={colors.textLight} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Immersive Header */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={colors.primaryGradient}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <SafeAreaView edges={['top']} style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ChevronLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>People Directory</Text>
            <View style={{ width: 44 }} />
          </SafeAreaView>
          
          <View style={styles.searchBoxWrapper}>
            <View style={styles.searchBox}>
              <Search size={20} color="rgba(255,255,255,0.6)" />
              <TextInput 
                style={styles.searchInput} 
                placeholder="Find a colleague..." 
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                selectionColor="#FFFFFF"
              />
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.listWrapper}>
        <View style={styles.sectionHeader}>
          <Users size={16} color={colors.primary} />
          <Text style={styles.sectionTitle}>ALL CONTACTS ({filteredEmployees.length})</Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading directory...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredEmployees}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onRefresh={fetchEmployees}
            refreshing={loading}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No results matching "{searchQuery}"</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

const getStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerWrapper: {
    zIndex: 10,
  },
  headerGradient: {
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  searchBoxWrapper: {
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    borderRadius: 18,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  listWrapper: {
    flex: 1,
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.textLight,
    letterSpacing: 1.5,
  },
  listContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
    padding: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    ...colors.premiumShadow,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1,
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
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(11, 74, 236, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  contactBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  chevronBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: isDarkMode ? '#334155' : '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default DirectoryScreen;

