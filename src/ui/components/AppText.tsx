import React from 'react';
import { Text, StyleSheet, TextProps } from 'react-native';
import { theme } from '@/ui/theme';

type Variant = 'title' | 'subtitle' | 'body' | 'caption';

interface AppTextProps extends TextProps {
  variant?: Variant;
  children: React.ReactNode;
}

export function AppText({ variant = 'body', style, children, ...rest }: AppTextProps) {
  return (
    <Text style={[styles.base, styles[variant], style]} {...rest}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: theme.colors.text,
  },
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  body: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  caption: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});
