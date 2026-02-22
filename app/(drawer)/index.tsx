import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { AppText, Button } from '@/ui/components';
import { useAuthStore } from '@/ui/stores/authStore';
import { useServices } from '@/context/ServicesContext';
import { useResponsive } from '@/ui/hooks/useResponsive';
import { theme } from '@/ui/theme';

export default function HomeScreen() {
  const { user, setAuth, clearAuth } = useAuthStore();
  const { authService } = useServices();
  useResponsive(); // disponible para layout responsive (isSmall, isMedium, isLarge)
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await authService.loginWithGoogle();
      if (result) {
        setAuth(result.user, result.accessToken);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    clearAuth();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <AppText variant="title">Hola mundo</AppText>
        <View style={styles.spacer} />
        {user ? (
          <View style={styles.userBlock}>
            {user.picture && (
              <Image source={{ uri: user.picture }} style={styles.profilePic} />
            )}
            <AppText variant="subtitle">¡Bienvenido!</AppText>
            <AppText variant="body">Nombre: {user.name ?? 'No disponible'}</AppText>
            <AppText variant="caption">Email: {user.email}</AppText>
            <View style={styles.buttonRow}>
              <Button title="Cerrar sesión" onPress={handleLogout} variant="secondary" />
            </View>
          </View>
        ) : (
          <View style={styles.authBlock}>
            <AppText variant="body">Inicia sesión con tu cuenta de Google.</AppText>
            <Button
              title="Iniciar sesión con Google"
              onPress={handleLogin}
              loading={loading}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  content: {
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  spacer: {
    height: theme.spacing.xl,
  },
  userBlock: {
    gap: theme.spacing.sm,
  },
  authBlock: {
    gap: theme.spacing.md,
  },
  buttonRow: {
    marginTop: theme.spacing.md,
  },
  profilePic: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: theme.spacing.sm,
  },
});
