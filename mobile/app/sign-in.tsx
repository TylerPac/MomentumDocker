import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { authLogin } from '@/api/auth';
import { saveAuthToken } from '@/storage/authToken';

export default function SignInScreen() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit() {
    if (!emailOrUsername.trim() || !password) {
      Alert.alert('Missing info', 'Enter your username/email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authLogin({ username: emailOrUsername.trim(), password });
      await saveAuthToken(result.accessToken);
      router.replace('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign-in failed.';
      Alert.alert('Sign-in failed', message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Momentum</Text>
      <Text style={styles.subtitle}>Sign in</Text>

      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Username or email"
        placeholderTextColor="#8b92a6"
        value={emailOrUsername}
        onChangeText={setEmailOrUsername}
        style={styles.input}
      />
      <TextInput
        autoCapitalize="none"
        secureTextEntry
        placeholder="Password"
        placeholderTextColor="#8b92a6"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <Pressable style={[styles.button, isSubmitting && styles.buttonDisabled]} onPress={onSubmit} disabled={isSubmitting}>
        <Text style={styles.buttonText}>{isSubmitting ? 'Signing in…' : 'Sign in'}</Text>
      </Pressable>

      <Pressable onPress={() => router.push('/register')}>
        <Text style={styles.link}>Create an account</Text>
      </Pressable>

      <Text style={styles.hint}>
        Dev tip: set your API base URL in app.json → expo.extra.apiBaseUrl.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#c7cbe0',
    marginBottom: 10,
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#222a3f',
    backgroundColor: '#11162a',
    color: '#ffffff',
  },
  button: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#4f7cff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    color: '#9fb4ff',
    marginTop: 8,
    fontWeight: '600',
  },
  hint: {
    marginTop: 14,
    color: '#8b92a6',
    fontSize: 12,
  },
});
