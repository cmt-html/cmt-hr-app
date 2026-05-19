import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar, 
  ActivityIndicator,
  Alert,
  Linking,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { saasService } from '../services/api.service';
import { Check, Shield, Zap, Star, ChevronLeft, CreditCard } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const PlanCard = ({ plan, isSelected, onSelect, colors, isDarkMode }) => {
  const isPremium = plan.name === 'Enterprise' || plan.name === 'Pro';
  
  return (
    <TouchableOpacity 
      style={[
        styles.planCard, 
        isSelected && { borderColor: colors.primary, borderWidth: 2.5 },
        { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }
      ]}
      onPress={() => onSelect(plan)}
      activeOpacity={0.9}
    >
      {isPremium && (
        <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.popularText}>POPULAR</Text>
        </View>
      )}
      
      <View style={styles.planHeader}>
        <View style={[styles.iconCircle, { backgroundColor: isSelected ? colors.primary : colors.background }]}>
          {plan.name === 'Starter' ? <Zap size={20} color={isSelected ? '#FFF' : colors.primary} /> :
           plan.name === 'Pro' ? <Shield size={20} color={isSelected ? '#FFF' : colors.primary} /> :
           <Star size={20} color={isSelected ? '#FFF' : colors.primary} />}
        </View>
        <View>
          <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
          <Text style={styles.planPrice}>
            <Text style={[styles.currency, { color: colors.text }]}>₹</Text>
            <Text style={[styles.amount, { color: colors.text }]}>{plan.price?.monthly || 0}</Text>
            <Text style={styles.period}>/month</Text>
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.featureList}>
        {(plan.features || []).map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <View style={[styles.checkCircle, { backgroundColor: colors.primary + '15' }]}>
              <Check size={12} color={colors.primary} strokeWidth={3} />
            </View>
            <Text style={[styles.featureText, { color: colors.text }]}>{feature}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

const SubscriptionScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const [plans, setPlans] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedPlan, setSelectedPlan] = React.useState(null);
  const [processing, setProcessing] = React.useState(false);

  React.useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await saasService.getPlans();
      setPlans(data);
      if (data.length > 1) setSelectedPlan(data[1]); // Default to Pro
      else if (data.length > 0) setSelectedPlan(data[0]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedPlan) return;
    
    try {
      setProcessing(true);
      const session = await saasService.createCheckout(selectedPlan.id);
      
      if (session.shortUrl) {
        // Open Razorpay Payment Link
        await Linking.openURL(session.shortUrl);
        Alert.alert(
          "Payment Initiated", 
          "We've opened the payment gateway in your browser. Once completed, your account will be upgraded automatically.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', 'Could not initiate payment session');
      }
    } catch (error) {
      Alert.alert('Payment Error', error.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={colors.primaryGradient}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.navBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ChevronLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.navTitle}>Upgrade Plan</Text>
            <View style={{ width: 44 }} />
          </View>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Choose Your Plan</Text>
            <Text style={styles.headerSubtitle}>Scale your HR management with premium features</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {plans.map(plan => (
          <PlanCard 
            key={plan.id} 
            plan={plan} 
            isSelected={selectedPlan?.id === plan.id}
            onSelect={setSelectedPlan}
            colors={colors}
            isDarkMode={isDarkMode}
          />
        ))}

        <View style={styles.infoBox}>
          <CreditCard size={20} color={colors.textLight} />
          <Text style={[styles.infoText, { color: colors.textLight }]}>
            Secure payment powered by Razorpay. All transactions are encrypted.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
        <TouchableOpacity 
          style={[styles.payBtn, { backgroundColor: colors.primary }]}
          onPress={handleCheckout}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.payBtnText}>Subscribe Now</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : (StatusBar.currentHeight || 0),
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 30,
  },
  planCard: {
    borderRadius: 32,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  popularBadge: {
    position: 'absolute',
    top: 15,
    right: -30,
    paddingHorizontal: 40,
    paddingVertical: 5,
    transform: [{ rotate: '45deg' }],
  },
  popularText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planName: {
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  planPrice: {
    marginTop: 2,
  },
  currency: {
    fontSize: 18,
    fontWeight: '800',
  },
  amount: {
    fontSize: 28,
    fontWeight: '900',
  },
  period: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 20,
    opacity: 0.5,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 10,
    marginTop: 10,
    marginBottom: 100,
  },
  infoText: {
    fontSize: 12,
    flex: 1,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  payBtn: {
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  payBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
});

export default SubscriptionScreen;
