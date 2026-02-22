import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CustomDrawerContent } from '../DrawerContent';

// Mocks necesarios para el entorno de navegación y router
jest.mock('expo-router', () => ({
    useRouter: () => ({ push: jest.fn() }),
    usePathname: () => '/',
}));

// Mock de SafeAreaContext
jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock de Navigation Theme completo para evitar errores en DrawerItem
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useTheme: () => ({
        dark: false,
        colors: {
            primary: 'rgb(0, 122, 255)',
            background: 'rgb(242, 242, 242)',
            card: 'rgb(255, 255, 255)',
            text: 'rgb(28, 28, 30)',
            border: 'rgb(199, 199, 204)',
            notification: 'rgb(255, 59, 48)',
        },
        fonts: {
            regular: { fontFamily: 'System', fontWeight: '400' },
            medium: { fontFamily: 'System', fontWeight: '500' },
            bold: { fontFamily: 'System', fontWeight: '700' },
            heavy: { fontFamily: 'System', fontWeight: '800' },
        },
    }),
}));

// Mock de LayoutAnimation
jest.mock('react-native/Libraries/LayoutAnimation/LayoutAnimation', () => ({
    ...jest.requireActual('react-native/Libraries/LayoutAnimation/LayoutAnimation'),
    configureNext: jest.fn(),
}));

const mockProps: any = {
    navigation: { closeDrawer: jest.fn() },
    state: { routes: [], index: 0 },
    descriptors: {},
};

describe('CustomDrawerContent', () => {
    it('renderiza correctamente el encabezado y el pie de página', () => {
        const { getByText } = render(<CustomDrawerContent {...mockProps} />);
        expect(getByText('Menú')).toBeTruthy();
    });

    it('filtra los items del menú al escribir en el buscador', () => {
        const { getByPlaceholderText, queryByText, getByText } = render(
            <CustomDrawerContent {...mockProps} />
        );

        // El item 'Hola mundo' existe inicialmente
        expect(getByText('Hola mundo')).toBeTruthy();

        // Filtramos por algo que NO existe
        fireEvent.changeText(getByPlaceholderText('Buscar...'), 'Inexistente');
        expect(queryByText('Hola mundo')).toBeNull();
    });

    it('permite expandir/colapsar grupos de menú', () => {
        const { getByText, queryByText } = render(
            <CustomDrawerContent {...mockProps} />
        );

        // Por defecto el grupo 0 está expandido
        expect(getByText('Hola mundo')).toBeTruthy();

        // Al presionar el encabezado del grupo (Principal), se debería colapsar
        fireEvent.press(getByText('Principal'));
        expect(queryByText('Hola mundo')).toBeNull();
    });
});
