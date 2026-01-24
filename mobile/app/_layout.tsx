import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Alert } from 'react-native';

export default function RootLayout() {
  useEffect(() => {
    // Global error handler
    const errorHandler = (error: any) => {
      console.error('Global error:', error);
      Alert.alert('Error', error?.message || String(error));
    };

    // @ts-ignore
    if (typeof ErrorUtils !== 'undefined') {
      // @ts-ignore
      ErrorUtils.setGlobalHandler(errorHandler);
    }
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0b0f19' },
        headerTintColor: '#ffffff',
        contentStyle: { backgroundColor: '#0b0f19' },
      }}
    />
  );
}
