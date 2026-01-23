import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { authRegister } from '@/api/auth';
import { saveAuthToken } from '@/storage/authToken';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit() {
    if (!firstName.trim() || !lastName.trim() || !username.trim() || !email.trim() || !password) {
      Alert.alert('Missing info', 'Fill out all fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authRegister({
        username: username.trim(),
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
      });
      await saveAuthToken(result.accessToken);
      router.replace('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed.';
      Alert.alert('Registration failed', message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>

      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="First name"
        placeholderTextColor="#8b92a6"
        value={firstName}
        onChangeText={setFirstName}
        style={styles.input}
      />
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Last name"
        placeholderTextColor="#8b92a6"
        value={lastName}
        onChangeText={setLastName}
        style={styles.input}
      />
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Username"
        placeholderTextColor="#8b92a6"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Email"
        placeholderTextColor="#8b92a6"
        value={email}
        onChangeText={setEmail}
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
        <Text style={styles.buttonText}>{isSubmitting ? 'Creating…' : 'Create account'}</Text>
      </Pressable>

      <Pressable onPress={() => router.back()}>
        <Text style={styles.link}>Back to sign in</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#0b0f19',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
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
});
