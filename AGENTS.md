# AGENTS.md — Contexto para agentes de IA

> Este archivo es leído automáticamente por agentes de IA modernos (Antigravity, Claude, Codex, etc.).
> Contiene el contexto clave del proyecto para que puedas trabajar sin recorrer todo el código.

---

## Qué es este proyecto

**Expo App Skeleton** — esqueleto de app con Expo (React Native) para móvil (iOS/Android) y web responsive.
Usa **arquitectura limpia** con inversión de dependencias. El objetivo es servir de punto de partida para nuevas apps: clonar, renombrar y construir encima.

Stack: Expo 52 · React Native 0.76 · Expo Router (file-based) · Drawer navigation · Zustand · TypeScript

---

## Estructura de capas (Clean Architecture)

```
src/
├── model/
│   ├── ports/        → Interfaces (IAuthRepository, etc.) — la capa de dominio
│   └── types/        → DTOs compartidos (AuthResult, User, etc.)
├── services/         → Casos de uso; reciben puertos por inyección, nunca implementaciones concretas
├── repositories/     → Implementan los puertos; integraciones externas (Google OAuth, APIs, etc.)
├── context/
│   └── ServicesContext.tsx  → Composition root: instancia repos y servicios, expone useServices()
├── ui/
│   ├── components/   → Componentes base (Button, AppText, SearchInput, DrawerContent) + index.ts
│   ├── theme/        → theme.ts — colores, espaciado, tipografía, bordes (fuente única de verdad)
│   ├── hooks/        → useResponsive.ts (breakpoints 600/900px)
│   └── stores/       → Zustand stores (useAuthStore)
├── config/           → env.ts (variables de entorno), menuFooter.ts
└── shared/utils/     → Utilidades compartidas

app/                  → Expo Router entry points
├── _layout.tsx       → Root layout: GestureHandlerRootView + ServicesProvider
└── (drawer)/
    ├── _layout.tsx   → Drawer layout con CustomDrawerContent y screenOptions del tema
    └── index.tsx     → Pantalla principal (única pantalla de ejemplo)
```

---

## Regla de oro de dependencias

```
UI → useServices() → Services → [Port interface] ← Repositories (implementación concreta)
```

- La UI **nunca** importa repositorios directamente.
- Los servicios **nunca** importan implementaciones concretas, solo interfaces de `model/ports/`.
- Añadir un nuevo flujo = puerto → repositorio → servicio → registrar en `ServicesContext.tsx` → usar en UI.

---

## Archivos clave que debes conocer

| Archivo | Para qué sirve |
|---|---|
| `src/context/ServicesContext.tsx` | Composition root — aquí se conectan repos y servicios |
| `src/ui/theme/theme.ts` | Tema global — cambiar aquí afecta toda la app |
| `src/ui/components/DrawerContent.tsx` | Menú lateral con `MENU_GROUPS`, buscador y acordeón |
| `app/(drawer)/_layout.tsx` | Registrar nuevas pantallas en el drawer |
| `src/config/env.ts` | Variables de entorno tipadas |
| `src/model/ports/auth.repository.port.ts` | Ejemplo de cómo definir un puerto |

---

## Documentación de referencia

Antes de implementar cualquier cambio, leer:

1. **[`docs/AGENT_GUIDE.md`](docs/AGENT_GUIDE.md)** — cómo extender menú, integraciones, componentes, auth y estilos.
2. **[`docs/GOOGLE_AUTH_SETUP.md`](docs/GOOGLE_AUTH_SETUP.md)** — configurar Google OAuth en local.

---

## Convenciones del proyecto

- **Estilos**: siempre usar `theme` de `@/ui/theme` + `StyleSheet.create`. No inline styles ad-hoc.
- **Nuevos componentes**: crear en `src/ui/components/` y exportar desde `src/ui/components/index.ts`.
- **Variables de entorno**: prefijo `EXPO_PUBLIC_` para que estén disponibles en cliente. Definirlas en `.env` (ya en `.gitignore`) y tipadas en `src/config/env.ts`.
- **Path alias**: `@/` apunta a `src/` (configurado en `tsconfig.json` y `babel.config.js`).
- **Garantía de Calidad**: siempre que se cambie algo del código, se debe asegurar que las pruebas pasan (`npm test`) y que la cobertura es al menos similar o mejor a la anterior.
- **Estado global**: Zustand. No pasar props profundas; usar stores en `src/ui/stores/`.
