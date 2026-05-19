import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  StatusBar, 
  Platform,
  Dimensions,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  MoreHorizontal, 
  Bell, 
  Rss, 
  Info, 
  Plus, 
  X, 
  Send 
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { announcementService } from '../services/api.service';

const { width, height } = Dimensions.get('window');

const FeedsScreen = () => {
  const { colors, isDarkMode } = useTheme();
  const styles = getStyles(colors, isDarkMode);

  // State Management
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);

  // Comment Modal state
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');

  // Create Announcement Modal state
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState('GENERAL');

  const loadUserDataAndFeeds = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) setLoading(true);
    try {
      // 1. Get logged user details
      const savedUser = await AsyncStorage.getItem('userData');
      if (savedUser) {
        setUserData(JSON.parse(savedUser));
      }

      // 2. Fetch announcements from API
      const data = await announcementService.getAnnouncements();
      setAnnouncements(data || []);
    } catch (err) {
      console.error('Failed to load mobile feeds', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUserDataAndFeeds();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadUserDataAndFeeds(false);
  };

  const handleLike = async (announcementId) => {
    try {
      const userId = userData?.id || 'user_mock';
      await announcementService.likeAnnouncement(announcementId, userId);
      // Refresh only notice lists quietly
      const data = await announcementService.getAnnouncements();
      setAnnouncements(data || []);
      
      // If comment modal is open for this announcement, update its comments details
      if (selectedAnnouncement && selectedAnnouncement.id === announcementId) {
        const updated = data.find(a => a.id === announcementId);
        setSelectedAnnouncement(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };


  const handleCommentSubmit = async () => {
    if (!newCommentText.trim() || !selectedAnnouncement) return;
    try {
      const userName = userData ? `${userData.firstName} ${userData.lastName}` : 'System User';
      const userId = userData ? userData.id : 'user_mock';

      await announcementService.commentAnnouncement(
        selectedAnnouncement.id,
        newCommentText,
        userName,
        userId
      );
      
      setNewCommentText('');
      
      // Refresh notices
      const data = await announcementService.getAnnouncements();
      setAnnouncements(data || []);
      
      // Update active comments popup view
      const updated = data.find(a => a.id === selectedAnnouncement.id);
      setSelectedAnnouncement(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      alert('Please enter both title and content.');
      return;
    }

    try {
      const authorName = userData ? `${userData.firstName} ${userData.lastName}` : 'System Admin';
      const authorId = userData ? userData.id : 'user_mock';

      await announcementService.createAnnouncement({
        title: newTitle,
        content: newContent,
        type: newType,
        authorName,
        authorId
      });

      setCreateModalVisible(false);
      setNewTitle('');
      setNewContent('');
      setNewType('GENERAL');
      loadUserDataAndFeeds();
    } catch (err) {
      console.error(err);
      alert('Failed to publish notice.');
    }
  };

  const isUserLiked = (likesArray) => {
    if (!likesArray || !userData) return false;
    return likesArray.includes(userData.id);
  };

  const renderItem = ({ item }) => {
    const userHasLiked = isUserLiked(item.likes);
    const authorInitial = item.authorName ? item.authorName.charAt(0) : (item.author ? item.author.charAt(0) : 'C');
    const authorDisplayName = item.authorName || item.author || 'Corporate Notice';
    
    // Parse Date formatted strings safely
    let formattedDate = 'Recent';
    if (item.createdAt || item.date) {
      const dateVal = new Date(item.createdAt || item.date);
      if (!isNaN(dateVal.getTime())) {
        formattedDate = dateVal.toLocaleDateString([], { month: 'short', day: 'numeric' });
      } else {
        formattedDate = item.date || 'Recent';
      }
    }

    return (
      <View style={styles.feedCard}>
        <View style={styles.feedHeader}>
          <View style={styles.authorSection}>
            <View style={styles.authorAvatar}>
              <Text style={styles.avatarText}>{authorInitial}</Text>
            </View>
            <View>
              <Text style={styles.authorName}>{authorDisplayName}</Text>
              <Text style={styles.feedDate}>{formattedDate}</Text>
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
            {/* Heart Like Trigger */}
            <TouchableOpacity 
              onPress={() => handleLike(item.id)}
              style={styles.actionButton}
            >
              <Heart 
                size={18} 
                color={userHasLiked ? '#EF4444' : colors.textLight} 
                fill={userHasLiked ? '#EF4444' : 'transparent'}
                strokeWidth={2} 
              />
              <Text style={[styles.actionText, userHasLiked && { color: '#EF4444' }]}>
                {item.likes ? item.likes.length : 0}
              </Text>
            </TouchableOpacity>

            {/* Comment Drawer Trigger */}
            <TouchableOpacity 
              onPress={() => {
                setSelectedAnnouncement(item);
                setCommentModalVisible(true);
              }}
              style={styles.actionButton}
            >
              <MessageSquare size={18} color={colors.textLight} strokeWidth={2} />
              <Text style={styles.actionText}>
                {item.comments ? item.comments.length : 0}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            onPress={() => alert('Announcements links share complete.')}
            style={styles.shareButton}
          >
            <Share2 size={18} color={colors.textLight} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const isPrivilegedUser = () => {
    if (!userData) return false;
    return ['MANAGER', 'HR', 'ORG_ADMIN'].includes(userData.role);
  };

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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.actionText, { marginTop: 12 }]}>Loading feeds...</Text>
        </View>
      ) : (
        <FlatList
          data={announcements}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Rss size={36} color={colors.textLight} />
              <Text style={styles.emptyText}>Notice board feed is clean and empty.</Text>
            </View>
          }
        />
      )}

      {/* Floating Plus button for managers/HR to publish notices */}
      {isPrivilegedUser() && (
        <TouchableOpacity
          onPress={() => setCreateModalVisible(true)}
          style={[styles.fab, { backgroundColor: colors.primary }]}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* ==========================================
                COMMENTS DRAWER SHEET MODAL
         ========================================== */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={commentModalVisible}
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContentContainer}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notice Feed Comments</Text>
              <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.commentsScrollView}>
              {(!selectedAnnouncement?.comments || selectedAnnouncement.comments.length === 0) ? (
                <Text style={styles.emptyCommentsText}>No remarks posted yet. Be the first to reply!</Text>
              ) : (
                selectedAnnouncement.comments.map((comment, idx) => (
                  <View key={idx} style={styles.commentItem}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentAuthor}>{comment.userName}</Text>
                      <Text style={styles.commentTime}>
                        {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Recent'}
                      </Text>
                    </View>
                    <Text style={styles.commentText}>{comment.comment}</Text>
                  </View>
                ))
              )}
            </ScrollView>

            <View style={styles.commentInputRow}>
              <TextInput
                placeholder="Type your reply notice comment..."
                placeholderTextColor={colors.textLight}
                value={newCommentText}
                onChangeText={setNewCommentText}
                style={styles.commentInput}
              />
              <TouchableOpacity 
                onPress={handleCommentSubmit}
                style={[styles.sendBtn, { backgroundColor: colors.primary }]}
              >
                <Send size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ==========================================
                CREATE ANNOUNCEMENT MODAL
         ========================================== */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={createModalVisible}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.createModalContent, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Broadcast Notice</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Announcement Title"
              placeholderTextColor={colors.textLight}
              value={newTitle}
              onChangeText={setNewTitle}
              style={[styles.createInput, { borderColor: colors.border }]}
            />

            <TextInput
              placeholder="Notice Content details..."
              placeholderTextColor={colors.textLight}
              value={newContent}
              onChangeText={setNewContent}
              multiline={true}
              numberOfLines={4}
              style={[styles.createTextArea, { borderColor: colors.border }]}
            />

            <View style={styles.typeSelectorRow}>
              <Text style={styles.typeSelectorLabel}>Category Type:</Text>
              <View style={styles.typeButtons}>
                {['GENERAL', 'POLICY', 'EVENT'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setNewType(t)}
                    style={[
                      styles.typeSelectorBtn,
                      newType === t && { backgroundColor: colors.primary }
                    ]}
                  >
                    <Text style={[
                      styles.typeSelectorBtnText,
                      newType === t && { color: '#FFFFFF' }
                    ]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              onPress={handleCreateAnnouncement}
              style={[styles.publishBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.publishBtnText}>Publish Notice Feed</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </View>
  );
};

const getStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderColor: '#4F46E5', // Indigo default primary
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
    paddingBottom: 80,
  },
  feedCard: {
    backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
    marginBottom: 20,
    borderRadius: 32,
    padding: 16,
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
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
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
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContentContainer: {
    backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: height * 0.75,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
    paddingBottom: 16,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  commentsScrollView: {
    marginBottom: 16,
  },
  emptyCommentsText: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: 13,
    marginVertical: 40,
    fontStyle: 'italic',
  },
  commentItem: {
    marginBottom: 16,
    backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC',
    padding: 12,
    borderRadius: 16,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentAuthor: {
    fontWeight: '800',
    fontSize: 12,
    color: colors.text,
  },
  commentTime: {
    fontSize: 10,
    color: colors.textLight,
  },
  commentText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
    paddingTop: 12,
  },
  commentInput: {
    flex: 1,
    backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.text,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createModalContent: {
    margin: 20,
    marginTop: height * 0.15,
    borderRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  createInput: {
    backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
    marginBottom: 16,
  },
  createTextArea: {
    backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  typeSelectorRow: {
    marginBottom: 20,
  },
  typeSelectorLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textLight,
    marginBottom: 8,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeSelectorBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: isDarkMode ? '#0F172A' : '#F1F5F9',
  },
  typeSelectorBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.text,
  },
  publishBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  publishBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  }
});

export default FeedsScreen;
