import {
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    useFonts,
} from '@expo-google-fonts/fredoka';
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
import { FontAwesome5 } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
WebBrowser.maybeCompleteAuthSession();
import Animated, {
    FadeInDown,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const COLORS = {
  charcoal: '#262626', // Darkest
  ash: '#4D4D4D',      // Medium Dark
  silver: '#B3B3B3',   // Medium Light
  cloud: '#E6E6E6',    // Very Light Gray
  paper: '#FFFFFF',    // Pure White
  ink: '#1A1A1A',      // Contrast Ink
};

export default function RetroGrayscaleAuth() {
  const [mode, setMode] = useState<'signup' | 'login' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const transition = useSharedValue(0);
  const logoBounce = useSharedValue(0);

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

  // Very subtle bounce for a professional "old" feel
  useEffect(() => {
    logoBounce.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 2500 }),
        withTiming(0, { duration: 2500 })
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

  if (!fontsLoaded) return null;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      
      {/* SIGN UP SIDE (DARK GRAY) */}
      <Animated.View style={[styles.side, { backgroundColor: COLORS.ash }, leftStyle]}>
        {mode === 'signup' ? (
          <Animated.View entering={FadeInDown.delay(200)} style={styles.formCard}>
            <Pressable onPress={reset} style={styles.backBtn}><Text style={styles.backIcon}>✕</Text></Pressable>
            <Text style={styles.title}>Join.</Text>
            <Text style={styles.subtitle}>Create a new account</Text>
            
            <TextInput placeholder="Name" placeholderTextColor={COLORS.silver} style={styles.input} />
            <TextInput placeholder="Email" placeholderTextColor={COLORS.silver} style={styles.input} />
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Password"
                placeholderTextColor={COLORS.silver}
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
            <Text style={[styles.verticalLabel, styles.shadowText, { color: COLORS.paper }]}>SIGN UP</Text>
          </Pressable>
        )}
      </Animated.View>

      {/* LOGIN SIDE (LIGHT GRAY) */}
      <Animated.View style={[styles.side, { backgroundColor: COLORS.cloud, borderLeftWidth: 2, borderColor: COLORS.ink }, rightStyle]}>
        {mode === 'login' ? (
          <Animated.View entering={FadeInDown.delay(200)} style={styles.formCard}>
            <Pressable onPress={reset} style={styles.backBtn}><Text style={styles.backIcon}>✕</Text></Pressable>
            <Text style={styles.title}>Hello.</Text>
            <Text style={styles.subtitle}>Welcome back!</Text>
            
            <TextInput placeholder="Email" placeholderTextColor={COLORS.silver} style={styles.input} />
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Password"
                placeholderTextColor={COLORS.silver}
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
            </Pressable>          </Animated.View>
        ) : mode === null && (
          <Pressable onPress={() => handlePress('login')} style={styles.centered}>
            <Text style={[styles.verticalLabel, styles.shadowText, { color: COLORS.ink }]}>LOG IN</Text>
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
    backgroundColor: COLORS.ink,
    flexDirection: 'row',
  },
  side: {
    height: '100%',
    overflow: 'hidden',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verticalLabel: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 64,
    transform: [{ rotate: '-90deg' }],
    letterSpacing: -1,
  },
  shadowText: {
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 6, height: 6 },
    textShadowRadius: 1,
  },
  formCard: {
    flex: 1,
    margin: 20,
    borderRadius: 30,
    backgroundColor: COLORS.paper,
    borderWidth: 3,
    borderColor: COLORS.ink,
    paddingHorizontal: 25,
    paddingTop: SCREEN_HEIGHT * 0.15,
    // Vintage Hard Shadow
    shadowColor: COLORS.ink,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  backBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.ink,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.cloud,
  },
  backIcon: { fontSize: 16, fontFamily: 'Fredoka_700Bold', color: COLORS.ink },
  title: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 52,
    color: COLORS.ink,
    letterSpacing: -2,
  },
  subtitle: {
    fontFamily: 'Fredoka_400Regular',
    fontSize: 16,
    color: COLORS.ash,
    marginBottom: 40,
    marginTop: -5,
  },
  input: {
    height: 60,
    borderRadius: 16,
    paddingHorizontal: 15,
    fontSize: 16,
    fontFamily: 'Fredoka_500Medium',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.cloud,
  },
  primaryBtn: {
    backgroundColor: COLORS.paper,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 3,
    borderColor: COLORS.ink,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  primaryBtnText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
    color: COLORS.ink,
  },
  secondaryBtn: {
    backgroundColor: COLORS.paper,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 2,
    borderColor: COLORS.ink,
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
    borderColor: COLORS.ink,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.paper,
  },
  eyeIcon: {
    fontSize: 22,
  },
  googleOrText: {
    textAlign: 'center',
    fontFamily: 'Fredoka_700Bold',
    fontSize: 14,
    color: COLORS.ash,
    marginTop: 14,
    marginBottom: 8,
  },
  googleBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.paper,
    borderWidth: 3,
    borderColor: COLORS.ink,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: COLORS.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  googleBtnText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 28,
    color: COLORS.ink,
  },
  logoWrapper: {
    position: 'absolute',
    alignSelf: 'center',
    left: SCREEN_WIDTH / 2 - 60,
    top: SCREEN_HEIGHT * 0.15, // Positioned slightly top but centered
    alignItems: 'center',
    zIndex: 10,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 67, // "Squircle" doodle shape
    backgroundColor: COLORS.paper,
    borderWidth: 4,
    borderColor: COLORS.ink,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.ink,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  logoImage: {
    width: 70,
    height: 70,
  },
  logoBadge: {
    backgroundColor: COLORS.ink,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: -15,
    transform: [{ rotate: '-2deg' }],
  },
  logoName: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
    color: COLORS.paper,
  },
});