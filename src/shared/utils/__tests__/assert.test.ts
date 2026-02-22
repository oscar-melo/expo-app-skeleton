import { assert } from '../assert';

describe('assert', () => {
    it('no lanza error si la condición es verdadera', () => {
        expect(() => assert(true, 'mensaje')).not.toThrow();
    });

    it('lanza error con el mensaje proporcionado si la condición es falsa', () => {
        const message = 'Error crítico';
        expect(() => assert(false, message)).toThrow(message);
    });
});
