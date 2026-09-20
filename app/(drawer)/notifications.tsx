import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, Platform, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { AppText } from '@/ui/components';
import { theme } from '@/ui/theme';
import { NotificationsRepository } from '@/repositories/notifications.repository';
import { NotificationRecord } from '@/model/types/notification';
import { CurrencyFilterHandler } from '@/services/filters/currency-filter.handler';

const TRANSACTION_TYPES = ['Ingreso', 'Egreso'] as const;
const CATEGORIES = [
    'Alimentos', 'Snacks', 'Impuestos', 'Deudas', 'Salario',
    'Rendimientos', 'Mercado', 'Viajes', 'Otros'
];

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const repo = useMemo(() => new NotificationsRepository(), []);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const data = await repo.getNotifications('filtered');
            setNotifications(data);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateField = async (id: string, field: keyof NotificationRecord, value: string) => {
        await repo.updateNotification(id, { [field]: value }, 'filtered');
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, [field]: value } : n)
        );
    };

    const showTypePicker = (item: NotificationRecord) => {
        Alert.alert(
            'Tipo de Transacción',
            'Selecciona el tipo',
            TRANSACTION_TYPES.map(type => ({
                text: type,
                onPress: () => handleUpdateField(item.id, 'tipoTransaccion', type.toLowerCase() as any)
            })).concat([{ text: 'Cancelar', style: 'cancel' } as any])
        );
    };

    const showCategoryPicker = (item: NotificationRecord) => {
        Alert.alert(
            'Categoría',
            'Selecciona una categoría',
            CATEGORIES.map(cat => ({
                text: cat,
                onPress: () => handleUpdateField(item.id, 'categoria', cat)
            })).concat([{ text: 'Cancelar', style: 'cancel' } as any])
        );
    };

    const clearAll = async () => {
        Alert.alert('Limpiar registros', '¿Estás seguro de que deseas borrar todos los registros filtrados?', [
            { text: 'No', style: 'cancel' },
            {
                text: 'Sí',
                onPress: async () => {
                    await repo.clearNotifications('filtered');
                    setNotifications([]);
                }
            }
        ]);
    };

    /**
     * Extrae el monto del registro de forma dinámica si no está guardado.
     * Esto asegura que registros antiguos o mal procesados muestren su valor.
     */
    const getMontoDisplay = (item: NotificationRecord) => {
        if (item.monto) {
            return `$ ${item.monto} COP`;
        }

        // Intenta extraer del contenido si el campo monto está vacío
        const fullText = `${item.origen} ${item.contenido}`;
        const match = fullText.match(CurrencyFilterHandler.CURRENCY_REGEX);

        if (match && match[1]) {
            return `$ ${match[1]} COP`;
        }

        return 'N/A';
    };

    if (Platform.OS === 'web') {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ title: 'Registros Filtrados' }} />
                <View style={styles.centered}>
                    <AppText variant="subtitle">No disponible en Web</AppText>
                    <AppText variant="caption">Las notificaciones solo se capturan en la versión móvil (Android).</AppText>
                </View>
            </View>
        );
    }

    const renderItem = ({ item }: { item: NotificationRecord }) => (
        <View style={styles.recordCard}>
            <View style={styles.table}>
                {/* Fila 1: Fuente y Fecha */}
                <View style={styles.row}>
                    <View style={styles.col}>
                        <AppText variant="caption" style={styles.label}>Fuente</AppText>
                        <AppText style={styles.value}>{item.fuente}</AppText>
                    </View>
                    <View style={[styles.col, { alignItems: 'flex-end' }]}>
                        <AppText variant="caption" style={styles.label}>Fecha y Hora</AppText>
                        <AppText style={styles.smallValue}>{item.fecha}, {item.hora}</AppText>
                    </View>
                </View>

                {/* Fila 2: Valor (Dinámico) */}
                <View style={styles.row}>
                    <View style={styles.col}>
                        <AppText variant="caption" style={styles.label}>Valor</AppText>
                        <AppText style={styles.amount}>
                            {getMontoDisplay(item)}
                        </AppText>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Fila 3: Clasificación y Categoría */}
                <View style={styles.row}>
                    <TouchableOpacity style={styles.col} onPress={() => showTypePicker(item)}>
                        <AppText variant="caption" style={styles.label}>Clasificación</AppText>
                        <View style={styles.selector}>
                            <AppText style={[styles.selectorText, !item.tipoTransaccion && styles.placeholder]}>
                                {item.tipoTransaccion ? item.tipoTransaccion.toUpperCase() : 'Seleccione'}
                            </AppText>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.col} onPress={() => showCategoryPicker(item)}>
                        <AppText variant="caption" style={styles.label}>Categoría</AppText>
                        <View style={styles.selector}>
                            <AppText style={[styles.selectorText, !item.categoria && styles.placeholder]}>
                                {item.categoria || 'Seleccione'}
                            </AppText>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Descripción completa */}
                <AppText style={styles.detailText} numberOfLines={2}>
                    {item.origen}: {item.contenido}
                </AppText>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                title: 'Registros Filtrados',
                headerRight: () => (
                    <TouchableOpacity onPress={clearAll} style={{ marginRight: 15 }}>
                        <AppText style={{ color: theme.colors.primary, fontWeight: '600' }}>Limpiar</AppText>
                    </TouchableOpacity>
                )
            }} />

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : notifications.length === 0 ? (
                <View style={styles.centered}>
                    <AppText variant="subtitle">No hay registros filtrados</AppText>
                    <AppText variant="caption">Solo las notificaciones con valores monetarios aparecerán aquí.</AppText>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    onRefresh={loadNotifications}
                    refreshing={loading}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f5f9',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    list: {
        padding: 16,
    },
    recordCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        ...theme.shadows?.small,
        elevation: 2,
    },
    table: {
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    col: {
        flex: 1,
    },
    label: {
        color: '#475569',
        fontSize: 10,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    value: {
        fontWeight: '700',
        fontSize: 16,
    },
    smallValue: {
        fontSize: 12,
    },
    amount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    divider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 12,
    },
    selector: {
        backgroundColor: '#f8fafc',
        borderRadius: 6,
        padding: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginTop: 4,
        marginRight: 8,
    },
    selectorText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    placeholder: {
        color: '#94a3b8',
        fontWeight: 'normal',
    },
    detailText: {
        fontSize: 12,
        color: '#475569',
        marginTop: 12,
        fontStyle: 'italic',
    }
});
