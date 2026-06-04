import {
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    useFonts,
} from '@expo-google-fonts/fredoka';
import { FontAwesome5 } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import Animated, {
    Easing,
    FadeInDown,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
WebBrowser.maybeCompleteAuthSession();

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const COLORS = {
  grape: '#080808',
  peach: '#2F2F2F',
  lavender: '#5C5C5C',
  mint: '#151515',
  cream: '#0E0E0E',
  ink: '#F3F3F3',
  coral: '#AFAFAF',
  bubble: '#252525',
  paper: '#131313',
  ash: '#D8D8D8',
  cloud: '#292929',
  silver: '#9E9E9E',
};

export default function RetroGrayscaleAuth() {
  const [mode, setMode] = useState<'signup' | 'login' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const transition = useSharedValue(0);
  const logoBounce = useSharedValue(0);
  const labelFloat = useSharedValue(0);

  const [fontsLoaded] = useFonts({
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });

  const GOOGLE_CLIENT_ID = Platform.select({
    ios: 'YOUR_IOS_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
    android: 'YOUR_ANDROID_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
    web: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
    default: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  }) as string;

  const signInWithGoogle = async (context: 'signup' | 'login') => {
    if (GOOGLE_CLIENT_ID.startsWith('YOUR_')) {
      Alert.alert(
        'Google Sign-In',
        'Set your Google OAuth client ID in app/auth.tsx before using Google login.'
      );
      return;
    }

    setGoogleLoading(true);

    try {
      const redirectUri = AuthSession.makeRedirectUri({ scheme: 'biever' });
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth` +
        `?client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=token` +
        `&scope=${encodeURIComponent('openid profile email')}`;

      const result = await AuthSession.startAsync({ authUrl });

      if (result.type === 'success') {
        Alert.alert('Google Sign-In', `Signed in with Google for ${context}.`);
        console.log('Google auth result:', result);
      } else if (result.type === 'dismiss' || result.type === 'cancel') {
        console.log('Google auth cancelled or dismissed', result);
      } else {
        console.warn('Google auth result', result);
      }
    } catch (error) {
      console.error('Google auth error', error);
      Alert.alert('Google Sign-In Error', 'Unable to complete Google authentication.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Gentle bounce for a smooth, cute floating logo
  useEffect(() => {
    logoBounce.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
    labelFloat.value = withRepeat(
      withSequence(
        withTiming(-2, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
  }, []);

  const handlePress = (target: 'signup' | 'login') => {
    setMode(target);
    transition.value = withSpring(target === 'signup' ? -1 : 1, { 
      damping: 18, 
      stiffness: 90 
    });
  };

  const reset = () => {
    setMode(null);
    transition.value = withSpring(0, { damping: 18 });
  };

  const leftStyle = useAnimatedStyle(() => ({
    width: interpolate(transition.value, [-1, 0, 1], [SCREEN_WIDTH, SCREEN_WIDTH / 2, 0]),
  }));

  const rightStyle = useAnimatedStyle(() => ({
    width: interpolate(transition.value, [-1, 0, 1], [0, SCREEN_WIDTH / 2, SCREEN_WIDTH]),
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(transition.value, [-1, 0, 1], [0.6, 1, 0.6]) },
      { translateY: interpolate(
          transition.value, 
          [-1, 0, 1], 
          [-SCREEN_HEIGHT * 0.28, logoBounce.value, -SCREEN_HEIGHT * 0.28]
        ) 
      },
    ],
  }));

  const animatedLabelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: labelFloat.value }],
  }));

  if (!fontsLoaded) return null;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.cartoonBubbleTop} />
      <View style={styles.cartoonBubbleBottom} />
      {/* SIGN UP SIDE (DARK GRAY) */}
      <Animated.View style={[styles.side, { backgroundColor: COLORS.paper, borderRightWidth: 2, borderColor: COLORS.coral, borderStyle: 'solid' }, leftStyle]}>
        {mode === 'signup' ? (
          <Animated.View entering={FadeInDown.delay(200)} style={styles.formCard}>
            <Pressable onPress={reset} style={styles.backBtn}><Text style={styles.backIcon}>✕</Text></Pressable>
            <Text style={styles.title}>Join.</Text>
            <Text style={styles.subtitle}>Create a new account</Text>
            
            <TextInput placeholder="Name" placeholderTextColor={COLORS.ink} style={styles.input} />
            <TextInput placeholder="Email" placeholderTextColor={COLORS.ink} style={styles.input} />
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Password"
                placeholderTextColor={COLORS.ink}
                secureTextEntry={!showPassword}
                style={[styles.input, styles.passwordInput]}
              />
              <Pressable style={styles.eyeBtn} onPress={() => setShowPassword((prev) => !prev)}>
                <FontAwesome5
                  name={showPassword ? 'eye-slash' : 'eye'}
                  size={22}
                  color={COLORS.ink}
                  solid
                />
              </Pressable>
            </View>
            <Pressable style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>SIGN UP</Text>
            </Pressable>
            <Text style={styles.googleOrText}>or</Text>
            <Pressable style={styles.googleBtn} onPress={() => signInWithGoogle('signup')}>
              <Text style={styles.googleBtnText}>G</Text>
            </Pressable>
          </Animated.View>
        ) : mode === null && (
          <Pressable onPress={() => handlePress('signup')} style={styles.centered}>
            <Animated.View style={animatedLabelStyle}>
              <Text style={[styles.verticalLabel, styles.shadowText, { color: COLORS.ink }]}>SIGN UP</Text>
            </Animated.View>
          </Pressable>
        )}
      </Animated.View>

      {/* LOGIN SIDE (LIGHT GRAY) */}
      <Animated.View style={[styles.side, { backgroundColor: COLORS.cloud, borderLeftWidth: 2, borderColor: COLORS.coral, borderStyle: 'solid' }, rightStyle]}>
        {mode === 'login' ? (
          <Animated.View entering={FadeInDown.delay(200)} style={styles.formCard}>
            <Pressable onPress={reset} style={styles.backBtn}><Text style={styles.backIcon}>✕</Text></Pressable>
            <Text style={styles.title}>Hello.</Text>
            <Text style={styles.subtitle}>Welcome back!</Text>
            
            <TextInput placeholder="Email" placeholderTextColor={COLORS.ink} style={styles.input} />
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Password"
                placeholderTextColor={COLORS.ink}
                secureTextEntry={!showPassword}
                style={[styles.input, styles.passwordInput]}
              />
              <Pressable style={styles.eyeBtn} onPress={() => setShowPassword((prev) => !prev)}>
                <FontAwesome5
                  name={showPassword ? 'eye-slash' : 'eye'}
                  size={22}
                  color={COLORS.ink}
                  solid
                />
              </Pressable>
            </View>
            
            <Pressable style={[styles.primaryBtn, { backgroundColor: COLORS.ink }]}>
              <Text style={[styles.primaryBtnText, { color: COLORS.paper }]}>LOG IN</Text>
            </Pressable>
            <Text style={styles.googleOrText}>or</Text>
            <Pressable style={styles.googleBtn} onPress={() => signInWithGoogle('login')}>
              <Text style={[styles.googleBtnText, { color: COLORS.ink }]}>G</Text>
            </Pressable>
          </Animated.View>
        ) : mode === null && (
          <Pressable onPress={() => handlePress('login')} style={styles.centered}>
            <Animated.View style={animatedLabelStyle}>
              <Text style={[styles.verticalLabel, styles.shadowText, { color: COLORS.ink }]}>LOG IN</Text>
            </Animated.View>
          </Pressable>
        )}
      </Animated.View>

      {/* CENTER LOGO (HIGHER POSITION) */}
      {mode === null && (
        <Animated.View style={[styles.logoWrapper, logoStyle]} pointerEvents="none">
          <View style={styles.logoCircle}>
            <Image
              source={require('../assets/images/clothing-hanger.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.logoBadge}>
            <Text style={styles.logoName}>urCloset</Text>
          </View>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grape,
    flexDirection: 'row',
  },
  side: {
    height: '100%',
    overflow: 'hidden',
    borderRadius: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verticalLabel: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 56,
    transform: [{ rotate: '-90deg' }],
    letterSpacing: -1,
  },
  shadowText: {
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 10,
  },
  formCard: {
    flex: 1,
    margin: 20,
    borderRadius: 44,
    backgroundColor: COLORS.paper,
    borderWidth: 3,
    borderColor: COLORS.coral,
    borderStyle: 'solid',
    paddingHorizontal: 25,
    paddingTop: SCREEN_HEIGHT * 0.15,
    shadowColor: COLORS.coral,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 28,
    elevation: 20,
  },
  backBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 54,
    height: 54,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.ash,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bubble,
    shadowColor: COLORS.ash,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  backIcon: { fontSize: 16, fontFamily: 'Fredoka_700Bold', color: COLORS.ash },
  title: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 60,
    color: COLORS.ink,
    letterSpacing: -2,
    textShadowColor: 'rgba(255,255,255,0.16)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  subtitle: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 18,
    color: COLORS.ash,
    marginBottom: 34,
    marginTop: 2,
  },
  input: {
    height: 60,
    borderRadius: 24,
    paddingHorizontal: 18,
    fontSize: 16,
    fontFamily: 'Fredoka_500Medium',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: COLORS.ash,
    backgroundColor: COLORS.bubble,
    color: COLORS.ink,
  },
  primaryBtn: {
    backgroundColor: COLORS.coral,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 0,
    shadowColor: COLORS.ash,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 16,
  },
  primaryBtnText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 20,
    color: COLORS.paper,
  },
  secondaryBtn: {
    backgroundColor: COLORS.cloud,
    height: 56,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 2,
    borderColor: COLORS.ash,
    shadowColor: COLORS.ash,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
  secondaryBtnText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 16,
    color: COLORS.ink,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    marginBottom: 0,
  },
  eyeBtn: {
    marginLeft: 10,
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.ash,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bubble,
  },
  eyeIcon: {
    fontSize: 22,
  },
  googleOrText: {
    textAlign: 'center',
    fontFamily: 'Fredoka_700Bold',
    fontSize: 14,
    color: COLORS.ink,
    marginTop: 14,
    marginBottom: 8,
  },
  googleBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.paper,
    borderWidth: 3,
    borderColor: COLORS.ash,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: COLORS.ash,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 10,
  },
  googleBtnText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 28,
    color: COLORS.ash,
  },
  cartoonBubbleTop: {
    position: 'absolute',
    top: -40,
    left: -20,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.ash,
    opacity: 0.45,
  },
  cartoonBubbleBottom: {
    position: 'absolute',
    bottom: -50,
    right: -30,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.peach,
    opacity: 0.35,
  },
  logoWrapper: {
    position: 'absolute',
    alignSelf: 'center',
    left: SCREEN_WIDTH / 2 - 70,
    top: SCREEN_HEIGHT * 0.12,
    alignItems: 'center',
    zIndex: 10,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 80,
    backgroundColor: COLORS.paper,
    borderWidth: 5,
    borderColor: COLORS.coral,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.coral,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.36,
    shadowRadius: 20,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  logoBadge: {
    backgroundColor: COLORS.coral,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 18,
    marginTop: -18,
    transform: [{ rotate: '-5deg' }],
    shadowColor: COLORS.coral,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  logoName: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 20,
    color: COLORS.paper,
  },
});