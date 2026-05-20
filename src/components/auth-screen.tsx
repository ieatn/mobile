import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GroupedSection } from '@/components/grouped-section';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useSpringPalette } from '@/hooks/use-spring-palette';
import { signInWithGoogle } from '@/lib/auth-oauth';
import { supabase } from '@/lib/supabase';

type Mode = 'sign-in' | 'sign-up';

export function AuthScreen() {
  const router = useRouter();
  const palette = useSpringPalette();
  const { session, user, signOut } = useAuth();

  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fieldStyle = [styles.field, { backgroundColor: palette.fill, color: palette.text }];

  const handleEmailAuth = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Enter email and password.');
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);

    if (mode === 'sign-up') {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setBusy(false);
        return;
      }

      if (data.session) {
        router.replace('/');
        setBusy(false);
        return;
      }

      setMessage('Check your email to confirm, then sign in.');
      setMode('sign-in');
      setBusy(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (signInError) {
      setError(signInError.message);
    } else {
      router.replace('/');
    }

    setBusy(false);
  };

  const handleGoogle = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      await signInWithGoogle();
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
    }

    setBusy(false);
  };

  if (session) {
    return (
      <Screen>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText type="largeTitle" style={styles.pageTitle}>
            Account
          </ThemedText>
          <GroupedSection>
            <View style={[styles.cell, styles.bordered, { borderBottomColor: palette.separator }]}>
              <ThemedText type="small" themeColor="textSecondary">
                Signed in as
              </ThemedText>
              <ThemedText type="default" style={styles.email}>
                {user?.email ?? 'User'}
              </ThemedText>
            </View>
            <Pressable
              style={[styles.cell, styles.bordered, { borderBottomColor: palette.separator }]}
              onPress={() => router.replace('/')}>
              <ThemedText type="default">Go to home</ThemedText>
            </Pressable>
            <Pressable style={styles.cell} onPress={signOut}>
              <ThemedText type="default" style={{ color: palette.error }}>
                Sign out
              </ThemedText>
            </Pressable>
          </GroupedSection>
        </SafeAreaView>
      </Screen>
    );
  }

  return (
    <Screen>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <ThemedText type="largeTitle" style={styles.pageTitle}>
              {mode === 'sign-in' ? 'Sign in' : 'Sign up'}
            </ThemedText>

            <View style={[styles.segmented, { backgroundColor: palette.peachDeep }]}>
              <Pressable
                style={[styles.segment, mode === 'sign-in' && { backgroundColor: palette.card }]}
                onPress={() => {
                  setMode('sign-in');
                  setError(null);
                  setMessage(null);
                }}
                disabled={busy}>
                <ThemedText type="smallBold">Sign in</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.segment, mode === 'sign-up' && { backgroundColor: palette.card }]}
                onPress={() => {
                  setMode('sign-up');
                  setError(null);
                  setMessage(null);
                }}
                disabled={busy}>
                <ThemedText type="smallBold">Sign up</ThemedText>
              </Pressable>
            </View>

            <GroupedSection>
              <Pressable
                style={[styles.cell, styles.bordered, { borderBottomColor: palette.separator }]}
                onPress={handleGoogle}
                disabled={busy}>
                <ThemedText type="default" style={styles.centered}>
                  Continue with Google
                </ThemedText>
              </Pressable>
              <View style={[styles.cell, styles.bordered, { borderBottomColor: palette.separator }]}>
                <TextInput
                  style={fieldStyle}
                  placeholder="Email"
                  placeholderTextColor={palette.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  value={email}
                  onChangeText={setEmail}
                  editable={!busy}
                />
              </View>
              <View style={styles.cell}>
                <TextInput
                  style={fieldStyle}
                  placeholder="Password"
                  placeholderTextColor={palette.textMuted}
                  secureTextEntry
                  textContentType={mode === 'sign-up' ? 'newPassword' : 'password'}
                  value={password}
                  onChangeText={setPassword}
                  editable={!busy}
                />
              </View>
            </GroupedSection>

            {error ? (
              <ThemedText type="small" style={[styles.feedback, { color: palette.error }]}>
                {error}
              </ThemedText>
            ) : null}
            {message ? (
              <ThemedText type="small" style={[styles.feedback, { color: palette.success }]}>
                {message}
              </ThemedText>
            ) : null}

            <Pressable
              style={[styles.primaryBtn, { backgroundColor: palette.cherry }, busy && styles.disabled]}
              onPress={handleEmailAuth}
              disabled={busy}>
              {busy ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText type="default" style={styles.primaryLabel}>
                  {mode === 'sign-in' ? 'Sign in' : 'Create account'}
                </ThemedText>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  scroll: {
    paddingBottom: Spacing.six,
  },
  pageTitle: {
    marginBottom: Spacing.three,
  },
  segmented: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 2,
    marginBottom: Spacing.three,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
    borderRadius: 8,
  },
  cell: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  bordered: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  field: {
    fontSize: 17,
    lineHeight: 22,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  centered: {
    textAlign: 'center',
  },
  email: {
    marginTop: 4,
  },
  feedback: {
    marginBottom: Spacing.two,
    paddingHorizontal: 4,
  },
  primaryBtn: {
    minHeight: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
  primaryLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});
