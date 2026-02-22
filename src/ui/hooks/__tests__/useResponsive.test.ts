import { renderHook } from '@testing-library/react-native';
import { useResponsive } from '../useResponsive';
import { useWindowDimensions } from 'react-native';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
    default: jest.fn(),
}));

describe('useResponsive', () => {
    const mockDimensions = useWindowDimensions as jest.Mock;

    it('identifica correctamente pantallas pequeñas (móvil)', () => {
        mockDimensions.mockReturnValue({ width: 375, height: 667 });
        const { result } = renderHook(() => useResponsive());

        expect(result.current.isSmall).toBe(true);
        expect(result.current.isMedium).toBe(false);
        expect(result.current.isLarge).toBe(false);
    });

    it('identifica correctamente pantallas medianas (tablet)', () => {
        mockDimensions.mockReturnValue({ width: 768, height: 1024 });
        const { result } = renderHook(() => useResponsive());

        expect(result.current.isSmall).toBe(false);
        expect(result.current.isMedium).toBe(true);
        expect(result.current.isLarge).toBe(false);
    });

    it('identifica correctamente pantallas grandes (desktop)', () => {
        mockDimensions.mockReturnValue({ width: 1200, height: 800 });
        const { result } = renderHook(() => useResponsive());

        expect(result.current.isSmall).toBe(false);
        expect(result.current.isMedium).toBe(false);
        expect(result.current.isLarge).toBe(true);
    });
});
