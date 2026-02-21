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
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=tu-client-id.apps.googleusercontent.com
   ```
4. Añade en Google Cloud las URIs de redirección que te muestre la app en consola (ver [`docs/GOOGLE_AUTH_SETUP.md`](docs/GOOGLE_AUTH_SETUP.md) para la guía completa).

---

## Ejecución

```bash
npm run web        # Navegador
npm run android    # Emulador / dispositivo Android
npm run ios        # Simulador / dispositivo iOS
```

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
