import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { theme } from '@/ui/theme';

interface SearchInputProps extends Omit<TextInputProps, 'placeholder'> {
  placeholder?: string;
}

export function SearchInput({ placeholder = 'Buscar...', style, ...rest }: SearchInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        style={[styles.input, style]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.searchBackground,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
});
