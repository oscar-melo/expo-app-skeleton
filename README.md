# Skeleton App

Esqueleto de aplicación móvil (Android/iOS) y web con Expo, arquitectura limpia (modelo, servicios, repositorios), menú lateral con acordeón y autenticación Google.

## Requisitos

- Node.js 18+
- npm o yarn

## Instalación

```bash
npm install
```

## Configuración (autenticación Google)

1. Crea un proyecto en [Google Cloud Console](https://console.cloud.google.com/) y configura la pantalla de consentimiento OAuth.
2. Crea credenciales OAuth 2.0 (tipo "Aplicación web" o "Cliente de escritorio") y obtén el **Client ID**.
3. Crea un archivo `.env` en la raíz (o usa variables de entorno) con:

```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=tu-client-id.apps.googleusercontent.com
```

4. En la consola de Google, añade las URIs de redirección autorizadas que te indique la app (p. ej. `https://auth.expo.io/@tu-usuario/skeleton-app` para Expo, o `http://localhost:8081` para web en desarrollo).

Sin `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` la app funciona pero el botón "Iniciar sesión con Google" no completará el flujo.

## Ejecución

- **Web**: `npm run web` o `npx expo start --web`
- **Android**: `npm run android` o `npx expo start --android`
- **iOS**: `npm run ios` o `npx expo start --ios`

## Estructura y arquitectura

- `src/model/` – Puertos (interfaces) y tipos. Los servicios dependen de estos puertos.
- `src/services/` – Casos de uso; reciben repositorios por inyección.
- `src/repositories/` – Implementaciones de los puertos; integraciones externas (Google, APIs, etc.).
- `src/ui/` – Componentes, tema, hooks y stores (Zustand).
- `src/shared/` – Utilidades compartidas.
- `src/context/ServicesContext.tsx` – Punto de composición (inyección de dependencias).
- `docs/AGENT_GUIDE.md` – Guía para agentes de IA (cómo extender menú, integraciones, estilos, etc.).

## Licencia

GPL-3.0. Ver [LICENSE](LICENSE).
