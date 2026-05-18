import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  StatusBar, 
  Platform,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { MessageSquare, Heart, Share2, MoreHorizontal, Bell, Rss, Info } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const FeedsScreen = () => {
  const { colors, isDarkMode } = useTheme();
  const styles = getStyles(colors, isDarkMode);
  
  const [announcements, setAnnouncements] = useState([
    {
      id: '1',
      title: 'New Office Policy',
      content: 'Please be informed that the office hours have been updated to 9:00 AM - 6:00 PM starting next Monday.',
      author: 'HR Department',
      date: '2 hours ago',
      type: 'POLICY',
      likes: 12,
      comments: 5,
    },
    {
      id: '2',
      title: 'Happy Birthday Mike!',
      content: 'Wishing a very happy birthday to our Senior Developer, Mike Ross! 🎂',
      author: 'Admin',
      date: '5 hours ago',
      type: 'CELEBRATION',
      likes: 45,
      comments: 12,
    },
    {
      id: '3',
      title: 'Company Outing',
      content: 'Join us for a team building event this Friday at the Beach Resort.',
      author: 'Team Lead',
      date: 'Yesterday',
      type: 'EVENT',
      likes: 30,
      comments: 8,
    }
  ]);

  const renderItem = ({ item }) => (
    <View style={styles.feedCard}>
      <View style={styles.feedHeader}>
        <View style={styles.authorSection}>
          <View style={styles.authorAvatar}>
            <Text style={styles.avatarText}>{item.author.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.authorName}>{item.author}</Text>
            <Text style={styles.feedDate}>{item.date}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreBtn}>
          <MoreHorizontal size={20} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      <View style={styles.feedContent}>
        <View style={styles.titleRow}>
          <Text style={styles.feedTitle}>{item.title}</Text>
          {item.type === 'POLICY' && (
            <View style={styles.policyBadge}>
              <Info size={10} color={colors.primary} />
            </View>
          )}
        </View>
        <Text style={styles.feedText}>{item.content}</Text>
        
        <View style={styles.typeTagWrapper}>
          <View style={[styles.typeTag, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}>
            <Text style={[styles.typeTagText, { color: colors.primary }]}>#{item.type}</Text>
          </View>
        </View>
      </View>

      <View style={styles.feedDivider} />

      <View style={styles.feedActions}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Heart size={18} color={colors.textLight} strokeWidth={2} />
            <Text style={styles.actionText}>{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MessageSquare size={18} color={colors.textLight} strokeWidth={2} />
            <Text style={styles.actionText}>{item.comments}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.shareButton}>
          <Share2 size={18} color={colors.textLight} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
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
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <Rss size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.headerTitle}>Organizational Feeds</Text>
            </View>
            <TouchableOpacity style={styles.notificationBtn}>
              <Bell size={22} color="#FFFFFF" />
              <View style={styles.dot} />
            </TouchableOpacity>
          </SafeAreaView>
          
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>What's Happening?</Text>
            <Text style={styles.heroSubtitle}>Latest announcements and team updates</Text>
          </View>
        </LinearGradient>
      </View>

      <FlatList
        data={announcements}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginBottom: 24,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  heroSection: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    marginTop: 4,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  feedCard: {
    backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
    marginBottom: 20,
    borderRadius: 32,
    padding: 16,
    ...colors.premiumShadow,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: isDarkMode ? '#0F172A' : '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontWeight: '900',
    color: colors.primary,
    fontSize: 18,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  feedDate: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600',
  },
  moreBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedContent: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  policyBadge: {
    width: 16,
    height: 16,
    borderRadius: 100,
    backgroundColor: 'rgba(11, 74, 236, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    fontWeight: '500',
    opacity: 0.8,
  },
  typeTagWrapper: {
    marginTop: 12,
  },
  typeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
  },
  typeTagText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  feedDivider: {
    height: 1,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
    marginBottom: 12,
  },
  feedActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '700',
  },
  shareButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default FeedsScreen;

