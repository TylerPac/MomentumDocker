import { Stack } from 'expo-router';

export default function RootLayout() {
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
