import { AuthService } from '../auth.service';
import { IAuthRepository } from '@/model/ports';

describe('AuthService', () => {
    let authService: AuthService;
    let mockRepository: jest.Mocked<IAuthRepository>;

    beforeEach(() => {
        mockRepository = {
            loginWithGoogle: jest.fn(),
            logout: jest.fn(),
        };
        authService = new AuthService(mockRepository);
    });

    it('llama a loginWithGoogle en el repositorio al iniciar sesión', async () => {
        const mockResult = { user: { id: '1' } as any, accessToken: 'abc' };
        mockRepository.loginWithGoogle.mockResolvedValue(mockResult);

        const result = await authService.loginWithGoogle();

        expect(mockRepository.loginWithGoogle).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockResult);
    });

    it('llama a logout en el repositorio si está definido', async () => {
        await authService.logout();
        expect(mockRepository.logout).toHaveBeenCalledTimes(1);
    });

    it('no falla si logout no está definido en el repositorio', async () => {
        const repoWithoutLogout = { loginWithGoogle: jest.fn() };
        const service = new AuthService(repoWithoutLogout as any);

        await expect(service.logout()).resolves.not.toThrow();
    });
});
