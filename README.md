# Skeleton App

Esqueleto de aplicación móvil (Android/iOS) y web con **Expo + React Native**, arquitectura limpia, menú lateral con acordeón y autenticación con Google.

> **¿Eres un agente de IA?** Lee [`AGENTS.md`](AGENTS.md) — tiene el contexto y la estructura del proyecto resumidos para ti.

---

## Stack

- **Expo 52** + React Native 0.76
- **Expo Router** (file-based routing) + Drawer navigation
- **Zustand** para estado global
- **TypeScript** — path alias `@/` apunta a `src/`
- Arquitectura limpia: ports → services → repositories → UI

---

## Requisitos

- Node.js 18+
- npm o yarn

---

## Instalación

```bash
npm install
```

---

## Configuración (autenticación Google)

La app funciona sin configurar Google Auth, pero el botón de login no completará el flujo. Para habilitarlo:

1. Crea un proyecto en [Google Cloud Console](https://console.cloud.google.com/) y configura la pantalla de consentimiento OAuth.
2. Crea credenciales OAuth 2.0 (tipo **Aplicación web**) y copia el **Client ID**.
3. Crea un archivo `.env` en la raíz:
   ```
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=tu-client-id-web.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=tu-client-id-android (Solo para móvil nativo)
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=tu-client-id-ios (Solo para móvil nativo)
   ```
4. Añade en Google Cloud las URIs de redirección que te muestre la app en consola al probar en web. (Ver [`docs/GOOGLE_AUTH_SETUP.md`](docs/GOOGLE_AUTH_SETUP.md) para la guía completa detallada, incluyendo soporte móvil).

---

## Ejecución

### 🌐 Web (la más rápida para empezar)

```bash
npm run start:no-coop
```

Abre automáticamente `http://localhost:8081` en el navegador. No requiere nada extra.

---

### 📱 Móvil con Expo Go (recomendado — sin emulador)

La opción más rápida para ver la app en tu celular real.

1. Instala **Expo Go** en tu teléfono:
   - [iOS — App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Android — Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Arranca el servidor:
   ```bash
   npx expo start
   ```

3. Escanea el QR que aparece en la terminal:
   - **iOS**: usa la app de **Cámara** del sistema.
   - **Android**: usa la app de **Expo Go** directamente (botón "Scan QR code").

4. La app se abrirá en tu celular en segundos. Los cambios que hagas en el código se reflejan al instante (hot reload).

> **Nota:** asegúrate de que el celular y el computador estén en la **misma red Wi-Fi**.

---

### 🤖 Android — Emulador (sin celular físico)

Requiere instalar **Android Studio** primero:

1. Descarga e instala [Android Studio](https://developer.android.com/studio).
2. Abre Android Studio → **Device Manager** (icono de teléfono en la barra lateral derecha) → **Create Virtual Device**.
3. Elige un modelo (ej. Pixel 8) y una imagen del sistema (ej. API 35) → **Finish**.
4. Inicia el emulador con el botón ▶.
5. Con el emulador abierto, corre:
   ```bash
   npm run android
   ```

---

### 🍎 iOS — Simulador (solo en Mac)

Requiere instalar **Xcode** primero:

1. Instala [Xcode](https://apps.apple.com/app/xcode/id497799835) desde la App Store (es grande, ~15 GB).
2. Abre Xcode → **Settings** → **Platforms** → descarga un simulador de iOS (ej. iPhone 16, iOS 18).
3. Con Xcode instalado, corre:
   ```bash
   npm run ios
   ```
   Esto abrirá el simulador automáticamente.

---

## Estructura del proyecto

```
skeleton_app/
├── app/                        → Expo Router entry points
│   ├── _layout.tsx             → Root layout (providers globales)
│   └── (drawer)/
│       ├── _layout.tsx         → Drawer layout + registro de pantallas
│       └── index.tsx           → Pantalla de ejemplo (Hola mundo)
├── src/
│   ├── model/
│   │   ├── ports/              → Interfaces de dominio (IAuthRepository, etc.)
│   │   └── types/              → DTOs compartidos (AuthResult, User, etc.)
│   ├── services/               → Casos de uso (AuthService, etc.)
│   ├── repositories/           → Implementaciones concretas (Google OAuth, APIs)
│   ├── context/
│   │   └── ServicesContext.tsx → Composition root + useServices()
│   ├── ui/
│   │   ├── components/         → Button, AppText, SearchInput, DrawerContent
│   │   ├── theme/              → theme.ts — fuente única de colores y estilos
│   │   ├── hooks/              → useResponsive (breakpoints 600/900px)
│   │   └── stores/             → Zustand stores (useAuthStore)
│   ├── config/                 → env.ts, menuFooter.ts
│   └── shared/utils/           → Utilidades compartidas
├── docs/
│   ├── AGENT_GUIDE.md          → Cómo extender la app (menú, integraciones, estilos)
│   └── GOOGLE_AUTH_SETUP.md    → Configurar Google OAuth en local
├── AGENTS.md                   → Contexto del proyecto para agentes de IA
├── .env.example                → Variables de entorno de ejemplo
└── .cursor/rules/              → Reglas de contexto para Cursor IDE
```

---

## Cómo extender la app

Consulta [`docs/AGENT_GUIDE.md`](docs/AGENT_GUIDE.md) para instrucciones paso a paso sobre:

- Añadir una nueva pantalla al menú
- Agregar una nueva integración (API, BD, etc.)
- Crear nuevos componentes UI
- Cambiar el tema visual (colores, tipografía, espaciado)
- Consideraciones web vs móvil

---

## Licencia

GPL-3.0. Ver [LICENSE](LICENSE).
