import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 18 }}>Momentum Mobile — Minimal App</Text>
      </View>
    </SafeAreaProvider>
  );
}
