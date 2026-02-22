import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ServicesProvider, useServices } from '../ServicesContext';
import { Text } from 'react-native';

const TestComponent = () => {
    const { authService } = useServices();
    return <Text>{authService ? 'Servicios Cargados' : 'Error'}</Text>;
};

describe('ServicesContext', () => {
    it('provee los servicios correctamente a través del Provider', () => {
        render(
            <ServicesProvider>
                <TestComponent />
            </ServicesProvider>
        );

        expect(screen.getByText('Servicios Cargados')).toBeTruthy();
    });

    it('lanza error si useServices se usa fuera de un Provider', () => {
        // Silenciamos el error de consola esperado para este test
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        expect(() => render(<TestComponent />)).toThrow(
            'useServices must be used within ServicesProvider'
        );

        consoleSpy.mockRestore();
    });
});
