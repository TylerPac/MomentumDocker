import { useEffect } from 'react';
import { Redirect, router } from 'expo-router';

export default function Index() {
  useEffect(() => {
    // Fallback navigation
    const timer = setTimeout(() => {
      console.log('Attempting navigation to /sign-in');
      router.replace('/sign-in');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return <Redirect href="/sign-in" />;
}
