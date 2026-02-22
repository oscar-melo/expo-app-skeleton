# Guía de Pruebas Unitarias

Este proyecto utiliza **Jest** y **React Native Testing Library (RNTL)** para asegurar la calidad y estabilidad del código.

## Herramientas principales

- **Jest**: Motor de ejecución de pruebas y aserciones.
- **React Native Testing Library**: Utilidades para renderizar componentes y simular interacciones de usuario de forma realista.
- **jest-expo**: Preajustes específicos para el ecosistema Expo.

## Estructura de Archivos

Las pruebas unitarias deben ubicarse en una carpeta `__tests__` adyacente al archivo que se está probando, con el sufijo `.test.ts` o `.test.tsx`.

Ejemplo:
```
src/ui/components/
  ├── Button.tsx
  └── __tests__/
      └── Button.test.tsx
```

## Comandos Útiles

- `npm test`: Ejecuta todas las pruebas y genera un reporte de cobertura.
- `npm run test:watch`: Ejecuta las pruebas en modo interactivo (ideal durante el desarrollo).

## Estándares por Capa Arquitectónica

Para que las pruebas tengan sentido y sean mantenibles, seguimos estos estándares:

### 1. Capa de UI (Componentes y Hooks de UI)
- **Objetivo**: Verificar que el componente renderice lo esperado y reaccione a eventos.
- **Herramientas**: `render`, `fireEvent`, `screen`.
- **Regla**: No probar lógica de negocio aquí. Mockea los hooks de servicios o stores si es necesario.

### 2. Capa de Servicios (`src/services`)
- **Objetivo**: Validar la lógica de negocio y la orquestación.
- **Estrategia**: **Mockea siempre el repositorio**. No queremos llamadas reales a APIs.
- **Ejemplo**: Si `AuthService` llama a `authRepository.login()`, verifica que se llame con los parámetros correctos y maneja la promesa devuelta.

### 3. Capa de Repositorios (`src/repositories`)
- **Objetivo**: Validar la construcción de peticiones y el formateo de respuestas.
- **Estrategia**: **Mockea la capa de transporte** (`fetch`, módulos de Expo como `AuthSession`).
- **Foco**: Asegurar que las URLs de las APIs sean correctas y que el mapeo de la respuesta cruda al modelo de la app sea preciso.

### 4. Capa de Estado (Stores/Zustand)
- **Objetivo**: Verificar mutaciones de estado.
- **Estrategia**: Usar `renderHook` y `act` para disparar acciones y verificar el estado resultante.

## Ejemplo de Mock de Servicio en un Componente

```tsx
jest.mock('@/ui/stores/authStore', () => ({
  useAuthStore: () => ({
    user: { name: 'Test User' },
    clearAuth: jest.fn(),
  }),
}));
```

## Ejemplo de Mock de Repositorio en un Servicio

```tsx
const mockRepo = { loginWithGoogle: jest.fn() };
const service = new AuthService(mockRepo);
```

## Obligaciones del Desarrollador / Agente

Para cualquier modificación del código:
1. **Verificación Total**: Ejecutar `npm test` y confirmar que el 100% de las pruebas pasan.
2. **No Regresión de Cobertura**: El reporte de cobertura generado por Jest debe mostrar porcentajes iguales o superiores a los previos al cambio.
3. **Nuevas Funcionalidades**: Cada nuevo servicio, repositorio o componente debe incluir su archivo `__tests__` siguiendo los estándares de esta guía.
