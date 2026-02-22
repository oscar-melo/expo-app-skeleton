import { act, renderHook } from '@testing-library/react-native';
import { useAuthStore } from '../authStore';

describe('authStore', () => {
    beforeEach(() => {
        act(() => {
            useAuthStore.getState().clearAuth();
        });
    });

    it('inicia con valores nulos', () => {
        const { result } = renderHook(() => useAuthStore());
        expect(result.current.user).toBeNull();
        expect(result.current.accessToken).toBeNull();
    });

    it('actualiza el estado con setAuth', () => {
        const { result } = renderHook(() => useAuthStore());
        const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
        const mockToken = 'fake-token';

        act(() => {
            result.current.setAuth(mockUser as any, mockToken);
        });

        expect(result.current.user).toEqual(mockUser);
        expect(result.current.accessToken).toBe(mockToken);
    });

    it('limpia el estado con clearAuth', () => {
        const { result } = renderHook(() => useAuthStore());

        act(() => {
            result.current.setAuth({} as any, 'token');
            result.current.clearAuth();
        });

        expect(result.current.user).toBeNull();
        expect(result.current.accessToken).toBeNull();
    });
});
