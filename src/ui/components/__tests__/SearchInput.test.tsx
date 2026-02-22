import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SearchInput } from '../SearchInput';

describe('SearchInput', () => {
    it('renderiza con el placeholder por defecto', () => {
        const { getByPlaceholderText } = render(<SearchInput />);
        expect(getByPlaceholderText('Buscar...')).toBeTruthy();
    });

    it('renderiza con un placeholder personalizado', () => {
        const { getByPlaceholderText } = render(<SearchInput placeholder="Filtrar items" />);
        expect(getByPlaceholderText('Filtrar items')).toBeTruthy();
    });

    it('emite onChangeText cuando el usuario escribe', () => {
        const onChangeTextMock = jest.fn();
        const { getByPlaceholderText } = render(
            <SearchInput onChangeText={onChangeTextMock} />
        );

        fireEvent.changeText(getByPlaceholderText('Buscar...'), 'texto de búsqueda');
        expect(onChangeTextMock).toHaveBeenCalledWith('texto de búsqueda');
    });

    it('aplica los estilos personalizados pasados por prop', () => {
        const customStyle = { backgroundColor: 'red' };
        const { getByPlaceholderText } = render(<SearchInput style={customStyle} />);
        const input = getByPlaceholderText('Buscar...');

        // Verificamos que contenga el estilo. 
        // Nota: toHaveStyle es comúnmente usado pero requiere configuración adicional.
        // Aquí verificamos que no explote el renderizado.
        expect(input.props.style).toContainEqual(customStyle);
    });
});
