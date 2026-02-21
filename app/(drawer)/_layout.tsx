import { Drawer } from 'expo-router/drawer';
import { CustomDrawerContent } from '@/ui/components/DrawerContent';
import { theme } from '@/ui/theme';

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        headerTitle: 'Skeleton App',
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700', fontSize: theme.fontSize.lg },
        drawerStyle: { backgroundColor: theme.colors.surface },
        drawerContent: (props) => <CustomDrawerContent {...props} />,
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'Hola mundo',
          title: 'Skeleton App',
        }}
      />
    </Drawer>
  );
}
