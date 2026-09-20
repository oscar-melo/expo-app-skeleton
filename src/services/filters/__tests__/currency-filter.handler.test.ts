import { CurrencyFilterHandler } from '../currency-filter.handler';

describe('CurrencyFilterHandler', () => {
    let handler: CurrencyFilterHandler;
    let mockRepo: any;

    beforeEach(() => {
        mockRepo = {
            saveNotification: jest.fn().mockResolvedValue(undefined)
        };
        handler = new CurrencyFilterHandler();
        (handler as any).repo = mockRepo;
    });

    const testCases = [
        {
            text: 'Compra por $500.000 en Tienda X',
            expected: '500.000'
        },
        {
            text: 'Transferencia recibida por $ 31,921',
            expected: '31,921'
        },
        {
            text: 'Pago de factura: $6,950.00',
            expected: '6,950.00'
        },
        {
            text: 'Retiro de cajero COP 200.000',
            expected: '200.000'
        },
        {
            text: 'Bancolombia: Transferiste $9,000.00 por QR',
            expected: '9,000.00'
        },
        {
            text: 'Bancolombia: Transferiste $1,000.00 desde tu cuenta',
            expected: '1,000.00'
        },
        {
            text: 'Compra sin formato: $9000.00',
            expected: '9000.00'
        },
        {
            text: 'Mensaje sin valor monetario',
            expected: null
        }
    ];

    test.each(testCases)('should detect currency in: "$text"', async ({ text, expected }) => {
        const notification = { text, app: 'com.test', title: 'Test' };
        const record = { fuente: 'App', origen: 'Test', contenido: text };

        await handler.handle(notification, record);

        if (expected) {
            expect(mockRepo.saveNotification).toHaveBeenCalledWith(
                expect.objectContaining({
                    monto: expected,
                    contenido: text
                }),
                'filtered'
            );
        } else {
            expect(mockRepo.saveNotification).not.toHaveBeenCalled();
        }
    });
});
