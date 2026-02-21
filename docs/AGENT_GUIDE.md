# Guía para agentes de IA

Este documento explica cómo extender el esqueleto de la aplicación: menú, integraciones, componentes UI, autenticación, estilos y limitaciones web vs móvil.

---

## 7.1 Cómo agregar un nuevo ítem de menú

- **Ubicación**: el contenido del menú lateral se define en `src/ui/components/DrawerContent.tsx`.
- **Estructura**: la constante `MENU_GROUPS` es un array de grupos; cada grupo tiene `title` y `items`. Cada ítem tiene `label` (texto visible) y `route` (ruta de Expo Router, p. ej. `'/'` o `'/otra-pantalla'`).
- **Pasos**:
  1. Añadir una nueva pantalla en `app/(drawer)/` si hace falta (p. ej. `app/(drawer)/otra.tsx`).
  2. En `DrawerContent.tsx`, añadir el ítem al grupo deseado en `MENU_GROUPS`, por ejemplo:
     ```ts
     { label: 'Mi nueva pantalla', route: '/otra' }
     ```
  3. En `app/(drawer)/_layout.tsx`, registrar la nueva pantalla en el `Drawer` con `<Drawer.Screen name="otra" options={{ drawerLabel: 'Mi nueva pantalla' }} />`.
- El **acordeón** ya está implementado: cada grupo es colapsable; el estado `expandedGroup` controla qué grupo está abierto. El **buscador** filtra ítems por `label`.

---

## 7.2 Cómo agregar una nueva integración (repositorio, servicio, UI)

Sigue la arquitectura limpia: **puerto → implementación → servicio → composition root → UI**.

1. **Definir el puerto** en `src/model/ports/`: crear un archivo p. ej. `mi-repo.repository.port.ts` con una interfaz (ej. `IMiRepository` con los métodos que la capa de aplicación necesita). Los tipos de retorno deben usar DTOs en `src/model/types/`.

2. **Implementar el repositorio** en `src/repositories/`: crear p. ej. `mi.repository.ts` que implemente la interfaz y haga las llamadas a la API externa, BD, etc.

3. **Crear el servicio** en `src/services/`: p. ej. `mi.service.ts` que reciba el puerto por constructor (`constructor(private readonly miRepo: IMiRepository)`) y exponga métodos que la UI llamará. No importar la implementación concreta, solo el puerto.

4. **Registrar en el composition root**: en `src/context/ServicesContext.tsx`, instanciar el repositorio concreto, crear el servicio inyectándolo y añadirlo al objeto `Services` y al tipo de contexto para que `useServices()` lo exponga.

5. **UI**: en pantallas o componentes, usar `useServices()` y llamar a `miService.miMetodo()`. Si hace falta estado global (lista, detalle), usar Zustand u otro store y actualizarlo desde el servicio.

---

## 7.3 Framework UI y cómo agregar componentes

- **Stack**: React Native + Expo. Navegación con **Expo Router** (file-based) y **Drawer** de `@react-navigation/drawer`.
- **Sistema de diseño**: tema centralizado en `src/ui/theme/theme.ts` (colores, espaciado, tipografía, bordes). Los componentes base en `src/ui/components/` consumen este tema.
- **Componentes base existentes**: `Button`, `AppText`, `SearchInput` en `src/ui/components/`. Se exportan desde `src/ui/components/index.ts`.
- **Añadir nuevos componentes** (p. ej. date picker, selector):
  - Crear el componente en `src/ui/components/`, usando `theme` desde `@/ui/theme` y `StyleSheet` para estilos.
  - Exportarlo en `src/ui/components/index.ts`.
  - Para date pickers o controles nativos, usar una librería compatible con Expo (ej. `@react-native-community/datetimepicker`) y envolverla en un componente que use el tema (colores, espaciado) para mantener consistencia.

---

## 7.4 Cómo funciona la autenticación y conexión con un servicio externo

- **Flujo actual**: la UI llama a `authService.loginWithGoogle()`. El servicio usa el puerto `IAuthRepository`; la implementación (`AuthRepository`) hace el redirect a Google OAuth, intercambia el código por token y obtiene datos de usuario. El resultado (usuario + token) se guarda en el store de Zustand (`useAuthStore`) y se muestra en pantalla (nombre/correo).
- **Dónde se lee el usuario**: `useAuthStore()` devuelve `user` y `accessToken`. Las pantallas que necesiten usuario autenticado deben usar este store.
- **Conectar un servicio externo para autorización**: el esqueleto no implementa backend. Para autorización (roles, permisos, validación de token en servidor):
  - Definir un puerto en `model/ports/` para el cliente del backend (ej. `IAuthBackendClient`).
  - Implementar un repositorio que llame a tu API (REST, etc.) para validar token, obtener roles, etc.
  - Crear un servicio que use ese puerto y que la UI llame para “comprobar permisos” o “sincronizar sesión”. El token actual puede enviarse desde `useAuthStore().accessToken` o inyectarse en el repositorio según diseño.

---

## 7.5 Cómo cambiar los estilos

- **Tema global**: editar `src/ui/theme/theme.ts`. Ahí se definen `colors`, `spacing`, `fontSize`, `borderRadius`. Cualquier componente que importe `theme` desde `@/ui/theme` reflejará los cambios.
- **Componentes**: cada componente en `src/ui/components/` usa `StyleSheet.create` con valores del tema. Para cambiar solo un componente, editar su archivo y ajustar estilos o usar la prop `style` cuando esté soportada.
- **Extender sin tocar el tema**: se puede pasar `style` o `textStyle` a componentes como `Button` o `AppText` para sobreescribir o añadir estilos en un uso concreto.

---

## 7.6 Limitaciones y recomendaciones (web vs móvil)

- **Diferencias a tener en cuenta**:
  - **Web**: el drawer suele abrirse por clic (hamburger); en móvil es típico el gesto de arrastre. Probar ambos.
  - **Áreas táctiles**: en móvil los botones y enlaces deben tener altura mínima ~44pt para que sean fáciles de tocar.
  - **Teclado**: en móvil el teclado puede cubrir inputs; considerar `KeyboardAvoidingView` o scroll cuando haya formularios.
  - **Dimensiones**: usar `useWindowDimensions` o el hook `useResponsive` en `src/ui/hooks/useResponsive.ts` (breakpoints en 600 y 900px) para adaptar layout a pantalla grande (web/tablet) vs móvil.
- **Recomendaciones**:
  - Probar nuevas pantallas y componentes tanto en navegador (Expo web) como en dispositivo o emulador (Expo Go) para evitar que algo se vea bien en uno y mal en el otro.
  - Evitar anchos fijos que rompan en móvil; usar `maxWidth`, `width: '100%'` y padding del tema.
  - Si una funcionalidad depende de APIs nativas (push, SMS, etc.), documentar que no estará disponible en web o implementar un fallback.
