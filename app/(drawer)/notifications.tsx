import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { AppText } from '@/ui/components';
import { theme } from '@/ui/theme';
import { useServices } from '@/context/ServicesContext';
import { NotificationRecord } from '@/model/types/notification';
import { CurrencyFilterHandler } from '@/services/filters/currency-filter.handler';

const TRANSACTION_TYPES = ['Ingreso', 'Egreso'] as const;
const CATEGORIES_BY_TYPE = {
    ingreso: ['Salario', 'Ingreso extra', 'Transferencia', 'Otro'],
    egreso: ['Servicios', 'Compras', 'Transporte', 'Ocio', 'Deuda', 'Transferencia', 'Otro'],
} as const;

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryPickerItem, setCategoryPickerItem] = useState<NotificationRecord | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const { notificationsService } = useServices();

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationsService.getNotifications('filtered');
            setNotifications(data);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateField = async (id: string, field: keyof NotificationRecord, value: string) => {
        await notificationsService.updateNotification(id, { [field]: value }, 'filtered');
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
        const categories = item.tipoTransaccion
            ? CATEGORIES_BY_TYPE[item.tipoTransaccion]
            : [];

        if (categories.length === 0) {
            Alert.alert('Categoría', 'Selecciona primero el tipo de transacción', [
                { text: 'Cancelar', style: 'cancel' },
            ]);
            return;
        }

        setCategoryPickerItem(item);
    };

    const selectCategory = async (category: string) => {
        if (!categoryPickerItem) return;

        const itemId = categoryPickerItem.id;
        setCategoryPickerItem(null);
        await handleUpdateField(itemId, 'categoria', category);
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(previous => {
            const next = new Set(previous);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleDelete = (ids: string[]) => {
        if (ids.length === 0) return;

        Alert.alert('Eliminar registros', '¿Estás seguro de que deseas eliminar los registros seleccionados?', [
            { text: 'No', style: 'cancel' },
            {
                text: 'Sí',
                style: 'destructive',
                onPress: async () => {
                    await notificationsService.deleteFilteredNotifications(ids);
                    setNotifications(previous => previous.filter(notification => !ids.includes(notification.id)));
                    setSelectedIds(new Set());
                    setIsSelectionMode(false);
                },
            },
        ]);
    };

    const clearAll = async () => {
        Alert.alert('Limpiar registros', '¿Estás seguro de que deseas borrar todos los registros filtrados?', [
            { text: 'No', style: 'cancel' },
            {
                text: 'Sí',
                onPress: async () => {
                    await notificationsService.clearFilteredNotifications();
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

    const renderItem = ({ item }: { item: NotificationRecord }) => {
        const isSelected = selectedIds.has(item.id);
        return (
            <TouchableOpacity
                onLongPress={() => { setIsSelectionMode(true); toggleSelection(item.id); }}
                onPress={() => isSelectionMode ? toggleSelection(item.id) : null}
                style={[styles.recordCard, isSelected && { borderWidth: 2, borderColor: theme.colors.primary }]}
            >
                <View style={styles.table}>
                    <View style={styles.row}>
                        <View style={styles.col}>
                            <AppText variant="caption" style={styles.label}>Fuente</AppText>
                            <AppText style={styles.value}>{item.fuente}</AppText>
                        </View>
                        {!isSelectionMode && (
                            <TouchableOpacity onPress={() => handleDelete([item.id])}>
                                <AppText style={{ fontSize: 20 }}>🗑️</AppText>
                            </TouchableOpacity>
                        )}
                        {isSelectionMode && (
                            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]} />
                        )}
                    </View>



                    <View style={styles.row}>
                        <View style={styles.col}>
                            <AppText variant="caption" style={styles.label}>Valor</AppText>
                            <AppText style={styles.amount}>
                                {getMontoDisplay(item)}
                            </AppText>
                        </View>
                    </View>









                    <View style={styles.divider} />
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
                    <AppText style={styles.detailText} numberOfLines={2}>
                        {item.origen}: {item.contenido}
                    </AppText>
                </View>
            </TouchableOpacity>
        );
    };
































    return (
        <View style={styles.container}>
            <Stack.Screen options={{

                title: isSelectionMode ? `${selectedIds.size} seleccionados` : 'Registros Filtrados',
                headerRight: () => (



                    isSelectionMode ? (
                        <TouchableOpacity onPress={() => handleDelete(Array.from(selectedIds))} style={{ marginRight: 15 }}>
                            <AppText style={{ color: 'red', fontWeight: '600' }}>Eliminar ({selectedIds.size})</AppText>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={clearAll} style={{ marginRight: 15 }}>
                            <AppText style={{ color: theme.colors.primary, fontWeight: '600' }}>Limpiar</AppText>
                        </TouchableOpacity>
                    )
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

            <Modal
                visible={categoryPickerItem !== null}
                transparent
                animationType="fade"
                onRequestClose={() => setCategoryPickerItem(null)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.categoryModal}>
                        <AppText variant="subtitle">Categoría</AppText>
                        <AppText variant="caption" style={styles.modalDescription}>
                            Selecciona una categoría
                        </AppText>
                        <ScrollView style={styles.categoryList}>
                            {categoryPickerItem && CATEGORIES_BY_TYPE[categoryPickerItem.tipoTransaccion!].map(category => (
                                <TouchableOpacity
                                    key={category}
                                    style={styles.categoryOption}
                                    onPress={() => selectCategory(category)}
                                >
                                    <AppText>{category}</AppText>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setCategoryPickerItem(null)}
                        >
                            <AppText style={styles.cancelButtonText}>Cancelar</AppText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        ...theme.shadows?.sm,
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
    },
    modalBackdrop: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        padding: 24,
    },
    categoryModal: {
        maxHeight: '80%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
    },
    modalDescription: {
        marginTop: 4,
        marginBottom: 12,
    },
    categoryList: {
        flexGrow: 0,
    },
    categoryOption: {
        minHeight: 44,
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    cancelButton: {
        minHeight: 44,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        borderRadius: 6,
        backgroundColor: '#e2e8f0',
    },
    cancelButtonText: {
        color: theme.colors.primary,
        fontWeight: '700',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#cbd5e1',
    },
    checkboxSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
});
