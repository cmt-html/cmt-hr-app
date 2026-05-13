import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, Image, StatusBar, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { MessageSquare, Heart, Share2, MoreHorizontal, Bell } from 'lucide-react-native';

const FeedsScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
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
        <TouchableOpacity>
          <MoreHorizontal size={20} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      <View style={styles.feedContent}>
        <Text style={styles.feedTitle}>{item.title}</Text>
        <Text style={styles.feedText}>{item.content}</Text>
        {item.type === 'POLICY' && (
          <View style={[styles.typeTag, { backgroundColor: 'rgba(0, 82, 204, 0.1)' }]}>
            <Text style={[styles.typeTagText, { color: colors.primary }]}>POLICY UPDATE</Text>
          </View>
        )}
      </View>

      <View style={styles.feedDivider} />

      <View style={styles.feedActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Heart size={18} color={colors.textLight} />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MessageSquare size={18} color={colors.textLight} />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Share2 size={18} color={colors.textLight} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feeds</Text>
        <TouchableOpacity style={styles.notificationBtn}>
          <Bell size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={announcements}
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
  },
  notificationBtn: {
    padding: 5,
  },
  listContent: {
    paddingVertical: 20,
  },
  feedCard: {
    backgroundColor: colors.surface,
    marginBottom: 16,
    borderRadius: 24,
    marginHorizontal: 16,
    padding: 20,
    ...colors.shadow,
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
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontWeight: '800',
    color: colors.primary,
    fontSize: 16,
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
  feedContent: {
    marginBottom: 16,
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 8,
  },
  feedText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 12,
    fontWeight: '500',
  },
  typeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  typeTagText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  feedDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 12,
    opacity: 0.5,
  },
  feedActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 28,
  },
  actionText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 8,
    fontWeight: '700',
  },
});

export default FeedsScreen;
