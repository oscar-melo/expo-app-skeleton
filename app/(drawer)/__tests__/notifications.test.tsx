import React from 'react';
import { render } from '@testing-library/react-native';
import NotificationsScreen from '../notifications';
import { NotificationsRepository } from '@/repositories/notifications.repository';

// Mock dependencies
jest.mock('@/repositories/notifications.repository');
jest.mock('expo-router', () => ({
    Stack: {
        Screen: jest.fn(() => null),
    },
}));

describe('NotificationsScreen UI Rendering', () => {
    const mockRecordWithMonto = {
        id: '1',
        fuente: 'SMS',
        origen: 'Bancolombia',
        contenido: 'Transferiste $9,000.00 por QR',
        fecha: '8/3/2026',
        hora: '4:10 p.m.',
        monto: '9,000.00',
    };

    const mockRecordWithoutMonto = {
        id: '2',
        fuente: 'SMS',
        origen: 'Bancolombia',
        contenido: 'Transferiste $1,000.00 desde tu cuenta',
        fecha: '8/3/2026',
        hora: '3:56 p.m.',
        // monto: undefined (simulando registro antiguo o error en guardado)
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the stored amount correctly', async () => {
        (NotificationsRepository as jest.Mock).mockImplementation(() => ({
            getNotifications: jest.fn().mockResolvedValue([mockRecordWithMonto]),
        }));

        const { findByText } = render(<NotificationsScreen />);

        const amountDisplay = await findByText('$ 9,000.00 COP');
        expect(amountDisplay).toBeTruthy();
    });

    it('should extract and render the amount dynamically if missing in the record', async () => {
        (NotificationsRepository as jest.Mock).mockImplementation(() => ({
            getNotifications: jest.fn().mockResolvedValue([mockRecordWithoutMonto]),
        }));

        const { findByText } = render(<NotificationsScreen />);

        // El test debe encontrar el valor extraído dinámicamente del contenido
        const amountDisplay = await findByText('$ 1,000.00 COP');
        expect(amountDisplay).toBeTruthy();
    });

    it('should render N/A if amount is missing and cannot be extracted', async () => {
        (NotificationsRepository as jest.Mock).mockImplementation(() => ({
            getNotifications: jest.fn().mockResolvedValue([{
                id: '3',
                fuente: 'App',
                origen: 'Other',
                contenido: 'Mensaje sin dinero',
                fecha: '8/3/2026',
                hora: '12:00 p.m.'
            }]),
        }));

        const { findByText } = render(<NotificationsScreen />);

        const naDisplay = await findByText('N/A');
        expect(naDisplay).toBeTruthy();
    });
});
