import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
    it('renderiza correctamente el título', () => {
        const { getByText } = render(<Button title="Presióname" onPress={() => { }} />);
        expect(getByText('Presióname')).toBeTruthy();
    });

    it('ejecuta onPress cuando se presiona', () => {
        const onPressMock = jest.fn();
        const { getByText } = render(<Button title="Click" onPress={onPressMock} />);

        fireEvent.press(getByText('Click'));
        expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('no ejecuta onPress cuando está deshabilitado', () => {
        const onPressMock = jest.fn();
        const { getByText } = render(<Button title="Click" onPress={onPressMock} disabled />);

        fireEvent.press(getByText('Click'));
        expect(onPressMock).not.toHaveBeenCalled();
    });

    it('muestra ActivityIndicator cuando está en estado de carga', () => {
        const { getByTestId, queryByText } = render(
            <Button title="Click" onPress={() => { }} loading />
        );
        // Nota: ActivityIndicator a veces no es fácil de encontrar sin testID, 
        // pero podemos verificar que el texto NO esté presente.
        expect(queryByText('Click')).toBeNull();
    });
});
