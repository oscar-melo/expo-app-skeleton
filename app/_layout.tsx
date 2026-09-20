import React, { useEffect } from 'react';
import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { ServicesProvider } from '@/context/ServicesContext';
import { NotificationListenerService } from '@/services/notificationListener.service';

export default function RootLayout() {
  useEffect(() => {
    NotificationListenerService.getInstance().startListening();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <ServicesProvider>
        <Slot />
      </ServicesProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
