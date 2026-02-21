import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { ServicesProvider } from '@/context/ServicesContext';

export default function RootLayout() {
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
