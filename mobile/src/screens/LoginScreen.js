import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { authService } from '../services/api.service';
import { Mail, Lock, ChevronRight, Sparkles } from 'lucide-react-native';
import CloudMojoLogo from '../components/CloudMojoLogo';
import { staggerEntrance, makeEntranceValues, makePressScale } from '../utils/animations';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const LOGO_W = Math.min(SCREEN_W - 56, 200);
const TITLE_SIZE = SCREEN_W < 360 ? 28 : SCREEN_W < 400 ? 32 : 34;

const LoginScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // ── Entrance animation values ──────────────────────────────────────────────
  const logoAnim   = useRef(makeEntranceValues(40)).current;
  const pillAnim   = useRef(makeEntranceValues(30)).current;
  const titleAnim  = useRef(makeEntranceValues(30)).current;
  const subAnim    = useRef(makeEntranceValues(25)).current;
  const cardAnim   = useRef(makeEntranceValues(40)).current;
  const footerAnim = useRef(makeEntranceValues(20)).current;

  // ── Orb parallax float ────────────────────────────────────────────────────
  const floatAnim = useRef(new Animated.Value(0)).current;

  // ── Button press scale ────────────────────────────────────────────────────
  const { scale: btnScale, pressIn: btnPressIn, pressOut: btnPressOut } = useRef(makePressScale(0.96)).current;

  // ── Input focus scale ─────────────────────────────────────────────────────
  const emailScale    = useRef(new Animated.Value(1)).current;
  const passwordScale = useRef(new Animated.Value(1)).current;

  const styles = getStyles(colors, TITLE_SIZE);

  useEffect(() => {
    // Staggered entrance
    staggerEntrance(
      [logoAnim, pillAnim, titleAnim, subAnim, cardAnim, footerAnim],
      100,
      480
    );

    // Orb float loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    ).start();
  }, []);

  const handleFocus = (field) => {
    setFocusedField(field);
    const scaleVal = field === 'email' ? emailScale : passwordScale;
    Animated.spring(scaleVal, {
      toValue: 1.02,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

  const handleBlur = (field) => {
    setFocusedField(null);
    const scaleVal = field === 'email' ? emailScale : passwordScale;
    Animated.spring(scaleVal, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter your work email and password.');
      return;
    }
    setLoading(true);
    try {
      await authService.login(email.trim(), password);
      navigation.replace('Main');
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'Cannot connect to server';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const orbTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={colors.authBackgroundGradient}
        locations={[0, 0.42, 1]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.75, y: 1 }}
      />

      {/* Animated floating orbs */}
      <Animated.View
        style={[styles.orb, styles.orbTop, { transform: [{ translateY: orbTranslateY }] }]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.orbBottom,
          {
            transform: [
              {
                translateY: floatAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 14],
                }),
              },
            ],
          },
        ]}
      />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Hero */}
            <View style={styles.hero}>
              <Animated.View
                style={[
                  styles.logoWrap,
                  {
                    opacity: logoAnim.opacity,
                    transform: [{ translateY: logoAnim.translateY }],
                  },
                ]}
              >
                <CloudMojoLogo size={LOGO_W * 0.4} />
              </Animated.View>

              <Animated.View
                style={[
                  styles.pillRow,
                  {
                    opacity: pillAnim.opacity,
                    transform: [{ translateY: pillAnim.translateY }],
                  },
                ]}
              >
                <Sparkles size={14} color={colors.secondary} />
                <Text style={styles.pillText}>AI-Powered HR Suite</Text>
              </Animated.View>

              <Animated.Text
                style={[
                  styles.title,
                  {
                    opacity: titleAnim.opacity,
                    transform: [{ translateY: titleAnim.translateY }],
                  },
                ]}
              >
                Welcome back
              </Animated.Text>

              <Animated.Text
                style={[
                  styles.subtitle,
                  {
                    opacity: subAnim.opacity,
                    transform: [{ translateY: subAnim.translateY }],
                  },
                ]}
              >
                The intelligent way to manage your modern workforce.
              </Animated.Text>
            </View>

            {/* Card */}
            <Animated.View
              style={[
                styles.card,
                {
                  backgroundColor: colors.authGlass,
                  borderColor: colors.authGlassBorder,
                  opacity: cardAnim.opacity,
                  transform: [{ translateY: cardAnim.translateY }],
                },
              ]}
            >
              <Text style={styles.cardTitle}>Secure Login</Text>

              {/* Email input with focus scale */}
              <Animated.View style={{ transform: [{ scale: emailScale }] }}>
                <View
                  style={[
                    styles.inputWrap,
                    focusedField === 'email' && styles.inputWrapFocused,
                  ]}
                >
                  <Mail
                    size={20}
                    color={
                      focusedField === 'email'
                        ? colors.secondary
                        : 'rgba(255,255,255,0.45)'
                    }
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Work email"
                    placeholderTextColor="rgba(255,255,255,0.38)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => handleFocus('email')}
                    onBlur={() => handleBlur('email')}
                  />
                </View>
              </Animated.View>

              {/* Password input with focus scale */}
              <Animated.View style={{ transform: [{ scale: passwordScale }] }}>
                <View
                  style={[
                    styles.inputWrap,
                    focusedField === 'password' && styles.inputWrapFocused,
                  ]}
                >
                  <Lock
                    size={20}
                    color={
                      focusedField === 'password'
                        ? colors.secondary
                        : 'rgba(255,255,255,0.45)'
                    }
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="rgba(255,255,255,0.38)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    onFocus={() => handleFocus('password')}
                    onBlur={() => handleBlur('password')}
                  />
                </View>
              </Animated.View>

              <TouchableOpacity style={styles.forgotBtn} activeOpacity={0.7}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              {/* Animated press-scale login button */}
              <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                <TouchableOpacity
                  style={styles.primaryBtnOuter}
                  onPress={handleLogin}
                  onPressIn={btnPressIn}
                  onPressOut={btnPressOut}
                  disabled={loading}
                  activeOpacity={1}
                >
                  <LinearGradient
                    colors={colors.primaryGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                      styles.primaryBtnGradient,
                      loading && { opacity: 0.92 },
                    ]}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Text style={styles.primaryBtnText}>Continue</Text>
                        <ChevronRight
                          size={20}
                          color="#FFFFFF"
                          style={styles.primaryBtnChevron}
                        />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity
                style={styles.registerLink}
                onPress={() => navigation.navigate('RegisterOrganization')}
                activeOpacity={0.8}
              >
                <Text style={styles.registerLinkText}>
                  New here?{' '}
                  <Text style={styles.registerAction}>Create organization</Text>
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Footer */}
            <Animated.Text
              style={[
                styles.footer,
                {
                  opacity: footerAnim.opacity,
                  transform: [{ translateY: footerAnim.translateY }],
                },
              ]}
            >
              Trusted by 500+ Enterprises
            </Animated.Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const getStyles = (colors, titleSize) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    safe: {
      flex: 1,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      minHeight: SCREEN_H * 0.88,
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 28,
      justifyContent: 'center',
    },
    orb: {
      position: 'absolute',
      borderRadius: 999,
    },
    orbTop: {
      width: SCREEN_W * 1.1,
      height: SCREEN_W * 1.1,
      top: -SCREEN_W * 0.55,
      right: -SCREEN_W * 0.35,
      backgroundColor: colors.authOrbSecondary,
      opacity: 0.35,
    },
    orbBottom: {
      width: SCREEN_W * 0.85,
      height: SCREEN_W * 0.85,
      bottom: -SCREEN_W * 0.35,
      left: -SCREEN_W * 0.25,
      backgroundColor: colors.authOrb,
      opacity: 0.5,
    },
    hero: {
      alignItems: 'center',
      marginBottom: 28,
    },
    logoWrap: {
      marginBottom: 20,
    },
    pillRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.07)',
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 100,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.12)',
      marginBottom: 20,
    },
    pillText: {
      marginLeft: 8,
      color: colors.secondary,
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
    },
    title: {
      fontSize: titleSize,
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: 10,
      letterSpacing: -0.8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      lineHeight: 24,
      color: 'rgba(255,255,255,0.5)',
      fontWeight: '500',
      textAlign: 'center',
      maxWidth: 300,
      paddingHorizontal: 8,
    },
    card: {
      borderRadius: 20,
      borderWidth: 1,
      paddingHorizontal: 20,
      paddingTop: 22,
      paddingBottom: 22,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 16 },
          shadowOpacity: 0.25,
          shadowRadius: 24,
        },
        android: { elevation: 10 },
      }),
    },
    cardTitle: {
      fontSize: 12,
      fontWeight: '900',
      color: 'rgba(255,255,255,0.4)',
      letterSpacing: 2,
      textTransform: 'uppercase',
      marginBottom: 22,
      textAlign: 'center',
    },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'transparent',
      borderRadius: 14,
      marginBottom: 12,
      paddingHorizontal: 16,
      height: 52,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.18)',
    },
    inputWrapFocused: {
      borderColor: `${colors.secondary}CC`,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '500',
    },
    forgotBtn: {
      alignSelf: 'flex-end',
      marginBottom: 18,
      marginTop: 2,
    },
    forgotText: {
      color: colors.secondary,
      fontSize: 13,
      fontWeight: '600',
    },
    primaryBtnOuter: {
      borderRadius: 14,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 16,
        },
        android: { elevation: 6 },
      }),
    },
    primaryBtnGradient: {
      height: 52,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    primaryBtnText: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    primaryBtnChevron: {
      marginLeft: 6,
    },
    registerLink: {
      marginTop: 20,
      alignItems: 'center',
    },
    registerLinkText: {
      color: 'rgba(255,255,255,0.45)',
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'center',
    },
    registerAction: {
      color: '#FFFFFF',
      fontWeight: '900',
    },
    footer: {
      marginTop: 28,
      textAlign: 'center',
      color: 'rgba(255,255,255,0.2)',
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 2,
      textTransform: 'uppercase',
    },
  });

export default LoginScreen;
