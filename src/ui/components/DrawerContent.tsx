import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
  DrawerItem,
} from '@react-navigation/drawer';
import { useRouter, usePathname } from 'expo-router';
import { AppText, SearchInput } from '@/ui/components';
import { theme } from '@/ui/theme';
import { MENU_FOOTER_TEXT } from '@/config/menuFooter';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MENU_GROUPS = [
  {
    title: 'Principal',
    items: [
      { label: 'Hola mundo', route: '/' },
    ],
  },
] as const;

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  const [expandedGroup, setExpandedGroup] = useState<number>(0);

  const toggleGroup = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedGroup((i) => (i === index ? -1 : index));
  };

  const filteredGroups = MENU_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) =>
        !search.trim() ||
        item.label.toLowerCase().includes(search.trim().toLowerCase())
    ),
  })).filter((g) => g.items.length > 0);

  return (
    <DrawerContentScrollView {...props} style={styles.scroll}>
      <View style={styles.header}>
        <AppText variant="title">Menú</AppText>
      </View>
      <SearchInput
        placeholder="Buscar..."
        value={search}
        onChangeText={setSearch}
      />
      <View style={styles.groups}>
        {filteredGroups.map((group, groupIndex) => {
          const isExpanded = expandedGroup === groupIndex;
          return (
            <View key={group.title} style={styles.group}>
              <TouchableOpacity
                style={styles.groupHeader}
                onPress={() => toggleGroup(groupIndex)}
                activeOpacity={0.7}
              >
                <AppText variant="subtitle">{group.title}</AppText>
                <AppText variant="caption">{isExpanded ? '▼' : '▶'}</AppText>
              </TouchableOpacity>
              {isExpanded &&
                group.items.map((item) => {
                  const isActive = pathname === item.route;
                  return (
                    <DrawerItem
                      key={item.route}
                      label={item.label}
                      onPress={() => {
                        router.push(item.route as '/');
                        props.navigation.closeDrawer();
                      }}
                      style={[styles.item, isActive && styles.itemActive]}
                      labelStyle={[styles.itemLabel, isActive && styles.itemLabelActive]}
                    />
                  );
                })}
            </View>
          );
        })}
      </View>
      <View style={styles.footer}>
        <AppText variant="caption">{MENU_FOOTER_TEXT}</AppText>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  header: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  groups: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
  },
  group: {
    marginBottom: theme.spacing.xs,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  item: {
    marginHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  itemActive: {
    backgroundColor: theme.colors.menuItemActive,
  },
  itemLabel: {
    color: theme.colors.menuItemText,
    fontSize: theme.fontSize.sm,
  },
  itemLabelActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});
