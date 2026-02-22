import React from 'react';
import { render } from '@testing-library/react-native';
import { AppText } from '../AppText';

describe('AppText', () => {
    it('renderiza el contenido correctamente', () => {
        const { getByText } = render(<AppText>Hola Mundo</AppText>);
        expect(getByText('Hola Mundo')).toBeTruthy();
    });

    it('aplica estilos según la variante (title)', () => {
        const { getByText } = render(<AppText variant="title">Título</AppText>);
        const text = getByText('Título');
        // Verificamos que los estilos definidos para 'title' se apliquen
        expect(text.props.style).toContainEqual(expect.objectContaining({ fontWeight: '700' }));
    });

    it('permite sobrescribir estilos con la prop style', () => {
        const customStyle = { color: 'red' };
        const { getByText } = render(<AppText style={customStyle}>Color</AppText>);
        const text = getByText('Color');
        expect(text.props.style).toContainEqual(customStyle);
    });
});
