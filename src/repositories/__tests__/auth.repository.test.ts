import { AuthRepository } from '../auth.repository';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';

// Mockeamos el config/env para proveer Client IDs válidos en el test
jest.mock('@/config/env', () => ({
    GOOGLE_WEB_CLIENT_ID: 'web-id',
    GOOGLE_IOS_CLIENT_ID: 'ios-id',
    GOOGLE_ANDROID_CLIENT_ID: 'android-id',
}));

jest.mock('expo-auth-session');
jest.mock('expo-web-browser');
jest.mock('expo-application', () => ({
    applicationId: 'test.app.id',
}));

describe('AuthRepository', () => {
    let repository: AuthRepository;

    beforeEach(() => {
        repository = new AuthRepository();
        jest.clearAllMocks();
        // Default mock para fetchDiscoveryAsync
        (AuthSession.fetchDiscoveryAsync as jest.Mock).mockResolvedValue({
            authorizationEndpoint: 'https://auth.com',
        });
    });

    it('realiza el flujo completo de autenticación con éxito en Web', async () => {
        // Forzamos Web
        Platform.OS = 'web';
        Platform.select = jest.fn((obj: any) => obj.default);

        const mockAuthResult = {
            type: 'success',
            params: { access_token: 'fake-access-token', id_token: 'fake-id-token' },
        };

        (AuthSession.AuthRequest as unknown as jest.Mock).mockImplementation(() => ({
            makeAuthUrlAsync: jest.fn(),
            promptAsync: jest.fn().mockResolvedValue(mockAuthResult),
        }));

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({
                id: '123',
                email: 'user@test.com',
                name: 'Test User',
            }),
        });

        const result = await repository.loginWithGoogle();

        expect(result).not.toBeNull();
        expect(result?.user.id).toBe('123');
        expect(result?.accessToken).toBe('fake-access-token');
    });

    it('devuelve null si el flujo es cancelado por el usuario', async () => {
        (AuthSession.AuthRequest as unknown as jest.Mock).mockImplementation(() => ({
            makeAuthUrlAsync: jest.fn(),
            promptAsync: jest.fn().mockResolvedValue({ type: 'cancel' }),
        }));

        const result = await repository.loginWithGoogle();
        expect(result).toBeNull();
    });
});
