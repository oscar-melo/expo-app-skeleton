import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { AppText } from '@/ui/components';
import { theme } from '@/ui/theme';
import { NotificationsRepository } from '@/repositories/notifications.repository';
import { NotificationRecord } from '@/model/ports';

export default function AllEventsScreen() {
    const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        setLoading(true);
        const repo = new NotificationsRepository();
        const data = await repo.getNotifications('all');
        setNotifications(data);
        setLoading(false);
    };

    if (Platform.OS === 'web') {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ title: 'Todos los eventos' }} />
                <View style={styles.centered}>
                    <AppText variant="subtitle">No disponible en Web</AppText>
                    <AppText variant="caption">Las notificaciones solo se capturan en la versión móvil (Android).</AppText>
                </View>
            </View>
        );
    }

    const renderItem = ({ item }: { item: NotificationRecord }) => (
        <View style={styles.recordCard}>
            <View style={styles.recordHeader}>
                <AppText style={styles.source}>{item.fuente}</AppText>
                <AppText variant="caption">{item.fecha} {item.hora}</AppText>
            </View>
            <AppText style={styles.origin}>{item.origen}</AppText>
            <AppText style={styles.content}>{item.contenido}</AppText>
        </View>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Todos los eventos' }} />
            {notifications.length === 0 && !loading ? (
                <View style={styles.centered}>
                    <AppText variant="subtitle">No hay eventos</AppText>
                    <AppText variant="caption">Aún no se ha capturado ningún evento.</AppText>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    refreshing={loading}
                    onRefresh={loadNotifications}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
    },
    listContent: {
        padding: theme.spacing.md,
    },
    recordCard: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderBottomColor: theme.colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    recordHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
    },
    source: {
        fontWeight: '700',
        color: theme.colors.primary,
        fontSize: theme.fontSize.xs,
        textTransform: 'uppercase',
    },
    origin: {
        fontWeight: '600',
        marginBottom: theme.spacing.xs,
    },
    content: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.text,
    },
});
