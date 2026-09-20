import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Switch, TextInput, Platform } from 'react-native';
import { AppText } from '@/ui/components/AppText';
import { Button } from '@/ui/components/Button';
import { SettingsRepository, NotificationSettings } from '@/repositories/settings.repository';
import { theme } from '@/ui/theme';

export const SettingsScreen = () => {
    const [settings, setSettings] = useState<NotificationSettings>({
        notificationRegex: '',
        selectedApps: [],
        knownApps: [],
    });

    const [loading, setLoading] = useState(true);
    const [savedMessage, setSavedMessage] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        const repo = SettingsRepository.getInstance();
        const data = await repo.getSettings();
        setSettings(data);
        setLoading(false);
    };

    const handleSave = async () => {
        const repo = SettingsRepository.getInstance();
        await repo.saveSettings(settings);
        setSavedMessage('Configuración guardada exitosamente');
        setTimeout(() => setSavedMessage(''), 3000);
    };

    const toggleAppSelection = (appId: string) => {
        setSettings((prev) => {
            const isSelected = prev.selectedApps.includes(appId);
            const newSelected = isSelected
                ? prev.selectedApps.filter((app) => app !== appId)
                : [...prev.selectedApps, appId];
            return { ...prev, selectedApps: newSelected };
        });
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <AppText>Cargando configuración...</AppText>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <AppText variant="subtitle" style={styles.sectionTitle}>
                    Filtro por Expresión Regular
                </AppText>
                <AppText variant="body" style={styles.description}>
                    Define una expresión regular para filtrar el contenido de las notificaciones.
                    Ejemplo: Bancolombia|pago|\$
                </AppText>
                <TextInput
                    style={styles.input}
                    value={settings.notificationRegex}
                    onChangeText={(text) => setSettings({ ...settings, notificationRegex: text })}
                    placeholder="Ejemplo: Bancolombia|pago|\$"
                    placeholderTextColor="#999"
                />
            </View>

            <View style={styles.section}>
                <AppText variant="subtitle" style={styles.sectionTitle}>
                    Detección de Moneda (Fijo)
                </AppText>
                <AppText variant="body" style={styles.description}>
                    Este patrón se aplica automáticamente para extraer valores monetarios de los mensajes filtrados.
                </AppText>
                <View style={[styles.input, styles.readOnlyInput]}>
                    <AppText style={styles.codeText}>{`(?:\$|COP|USD)\\s?(\\d+(?:[.,]\\d{3})*(?:[.,]\\d{2})?)`}</AppText>
                </View>
                <AppText variant="caption" style={styles.infoText}>
                    Nota: Solo los mensajes con valores identificables aparecerán en el listado de Registros.
                </AppText>
            </View>

            <View style={styles.section}>
                <AppText variant="subtitle" style={styles.sectionTitle}>
                    Filtro por Aplicaciones (Opcional)
                </AppText>
                <AppText variant="body" style={styles.description}>
                    Selecciona de las aplicaciones conocidas cuáles deseas escuchar. Si ninguna está seleccionada, se escucharán todas.
                </AppText>

                {settings.knownApps.length === 0 ? (
                    <AppText style={styles.emptyText}>
                        Aún no se han detectado aplicaciones enviando notificaciones.
                    </AppText>
                ) : (
                    settings.knownApps.map((appId) => (
                        <View key={appId} style={styles.appRow}>
                            <AppText style={styles.appName}>{appId}</AppText>
                            <Switch
                                value={settings.selectedApps.includes(appId)}
                                onValueChange={() => toggleAppSelection(appId)}
                                trackColor={{ false: '#767577', true: theme.colors.primary }}
                                thumbColor={settings.selectedApps.includes(appId) ? '#f4f3f4' : '#f4f3f4'}
                            />
                        </View>
                    ))
                )}
            </View>

            <Button title="Guardar Configuración" onPress={handleSave} style={styles.saveButton} />

            {savedMessage ? (
                <AppText style={styles.successMessage}>{savedMessage}</AppText>
            ) : null}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.md,
    },
    section: {
        marginBottom: theme.spacing.xl,
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
    },
    sectionTitle: {
        fontSize: theme.fontSize.lg,
        marginBottom: theme.spacing.sm,
        color: theme.colors.text,
    },
    description: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.md,
    },
    input: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.sm,
        padding: theme.spacing.sm,
        color: theme.colors.text,
    },
    appRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    appName: {
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
        flex: 1,
    },
    emptyText: {
        fontStyle: 'italic',
        color: theme.colors.textSecondary,
    },
    saveButton: {
        marginBottom: theme.spacing.sm,
    },
    successMessage: {
        color: theme.colors.error,
        textAlign: 'center',
        marginTop: theme.spacing.sm,
    },
    readOnlyInput: {
        backgroundColor: '#f1f5f9',
        borderColor: '#cbd5e1',
    },
    codeText: {
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontSize: theme.fontSize.xs,
        color: theme.colors.primary,
    },
    infoText: {
        marginTop: theme.spacing.xs,
        fontStyle: 'italic',
    },
});
