# Guía para agentes de IA — Cómo extender la app

> Antes de implementar cualquier cambio, lee este documento completo.
> Para contexto general del proyecto (estructura de capas, archivos clave, convenciones) lee [`AGENTS.md`](../AGENTS.md) en la raíz.

---

## 1. Cómo agregar una nueva pantalla al menú

**Archivos involucrados:**
- `src/ui/components/DrawerContent.tsx` — define el menú
- `app/(drawer)/_layout.tsx` — registra las pantallas en el drawer
- `app/(drawer)/nueva-pantalla.tsx` — la pantalla nueva

**Pasos:**

1. Crear el archivo de la pantalla en `app/(drawer)/`, por ejemplo `app/(drawer)/ajustes.tsx`:
   ```tsx
   import { View } from 'react-native';
   import { AppText } from '@/ui/components';

   export default function AjustesScreen() {
     return (
       <View>
         <AppText>Ajustes</AppText>
       </View>
     );
   }
   ```

2. En `DrawerContent.tsx`, añadir el ítem al grupo deseado en `MENU_GROUPS`:
   ```ts
   { label: 'Ajustes', route: '/ajustes' }
   ```

3. En `app/(drawer)/_layout.tsx`, registrar la pantalla:
   ```tsx
   <Drawer.Screen name="ajustes" options={{ drawerLabel: 'Ajustes' }} />
   ```

**Nota:** el acordeón y el buscador del menú ya funcionan automáticamente; no necesitan cambios.

---

## 2. Cómo agregar una nueva integración

Sigue este flujo: **puerto → repositorio → servicio → composition root → UI**

### Paso 1 — Definir el puerto (interfaz)

En `src/model/ports/`, crear `mi-repo.repository.port.ts`:

```ts
import type { MiDTO } from '../types/mi-dto';

export interface IMiRepository {
  obtenerDatos(): Promise<MiDTO[]>;
}
```

Los tipos de retorno van en `src/model/types/`.

### Paso 2 — Implementar el repositorio

En `src/repositories/`, crear `mi.repository.ts`:

```ts
import type { IMiRepository } from '@/model/ports/mi-repo.repository.port';
import type { MiDTO } from '@/model/types/mi-dto';

export class MiRepository implements IMiRepository {
  async obtenerDatos(): Promise<MiDTO[]> {
    // llamada a API, base de datos, etc.
    return [];
  }
}
```

### Paso 3 — Crear el servicio

En `src/services/`, crear `mi.service.ts`:

```ts
import type { IMiRepository } from '@/model/ports/mi-repo.repository.port';

export class MiService {
  constructor(private readonly miRepo: IMiRepository) {}

  async obtenerDatos() {
    return this.miRepo.obtenerDatos();
  }
}
```

**Importante:** el servicio solo importa el puerto (interfaz), nunca la implementación concreta.

### Paso 4 — Registrar en el composition root

En `src/context/ServicesContext.tsx`:

```tsx
import { MiRepository } from '@/repositories/mi.repository';
import { MiService } from '@/services/mi.service';
import type { MiService as IMiService } from '@/services/mi.service';

const miRepository = new MiRepository();
const miService = new MiService(miRepository);

interface Services {
  authService: IAuthService;
  miService: IMiService;   // ← añadir
}

// Dentro de ServicesProvider:
const value = useMemo<Services>(() => ({
  authService,
  miService,               // ← añadir
}), []);
```

### Paso 5 — Usar en la UI

```tsx
import { useServices } from '@/context/ServicesContext';

export default function MiPantalla() {
  const { miService } = useServices();
  // miService.obtenerDatos()
}
```

---

## 3. Framework UI y cómo agregar componentes

- **Stack base:** React Native + Expo. Navegación con Expo Router (file-based) + Drawer de `@react-navigation/drawer`.
- **Tema global:** `src/ui/theme/theme.ts` — colores, espaciado, tipografía, bordes. Cambiar aquí se propaga a toda la app.
- **Componentes base existentes:** `Button`, `AppText`, `SearchInput` en `src/ui/components/`. Se exportan desde `src/ui/components/index.ts`.

**Para añadir un nuevo componente:**

1. Crear el archivo en `src/ui/components/MiComponente.tsx`:
   ```tsx
   import { StyleSheet, View } from 'react-native';
   import { theme } from '@/ui/theme';

   export function MiComponente() {
     return <View style={styles.container} />;
   }

   const styles = StyleSheet.create({
     container: {
       backgroundColor: theme.colors.surface,
       padding: theme.spacing.md,
       borderRadius: theme.borderRadius.md,
     },
   });
   ```

2. Exportarlo en `src/ui/components/index.ts`.

Para controles nativos (date picker, etc.), usar una librería compatible con Expo y envolverla en un componente que use el tema.

---

## 4. Cómo funciona la autenticación y cómo conectar un backend

**Flujo actual:**
```
UI → authService.loginWithGoogle()
   → AuthRepository (implementa IAuthRepository)
   → Google OAuth (redirect + código → token + usuario)
   → guarda en useAuthStore (Zustand)
```

**Acceder al usuario autenticado:**
```ts
import { useAuthStore } from '@/ui/stores/authStore';
const { user, accessToken } = useAuthStore();
```

**Para añadir validación en backend propio:**
1. Definir un puerto en `model/ports/` para el cliente del backend (ej. `IAuthBackendClient`).
2. Implementar un repositorio que llame a tu API para validar token, obtener roles, etc.
3. Crear un servicio que use ese puerto; leer el token actual desde `useAuthStore().accessToken` o inyectarlo según diseño.

Para configurar Google OAuth en local, ver [`docs/GOOGLE_AUTH_SETUP.md`](GOOGLE_AUTH_SETUP.md).

---

## 5. Cómo cambiar los estilos

- **Tema global:** editar `src/ui/theme/theme.ts`. Ahí están `colors`, `spacing`, `fontSize`, `borderRadius`. Cualquier componente que importe `theme` desde `@/ui/theme` reflejará los cambios.
- **Componente específico:** editar su archivo en `src/ui/components/` y ajustar el `StyleSheet`.
- **Override en un uso concreto:** pasar `style` o `textStyle` como prop a `Button` o `AppText` para sobreescribir estilos sin tocar el componente original.

---

## 6. Calidad y Pruebas

Como agente de IA, tienes la **obligación** de mantener la estabilidad del proyecto:

1. **Ejecutar pruebas**: Antes de dar por terminada una tarea, ejecuta `npm test` para asegurar que no hay regresiones.
2. **Mantener la cobertura**: Si añades nueva lógica, añade sus pruebas correspondientes. La cobertura total del proyecto debe mantenerse o mejorar.
3. **Pruebas en UI**: Si cambias componentes visuales, verifica que los tests de renderizado y eventos sigan pasando.

---

## 7. Limitaciones y recomendaciones (web vs móvil)

| Aspecto | Web | Móvil |
|---|---|---|
| Drawer | Se abre con hamburger (clic) | Se abre con gesto de arrastre |
| Áreas táctiles | No crítico | Mínimo ~44pt de altura |
| Teclado | No afecta | Puede cubrir inputs → usar `KeyboardAvoidingView` |
| Dimensiones | Ventana redimensionable | Fija por dispositivo |

**Herramienta disponible:** `useResponsive` en `src/ui/hooks/useResponsive.ts` con breakpoints en 600 y 900px para adaptar layout según tamaño de pantalla.

**Reglas generales:**
- Evitar anchos fijos; usar `maxWidth`, `width: '100%'` y padding del tema.
- Probar toda nueva pantalla en web (`npm run web`) y en dispositivo/emulador.
- Si una funcionalidad usa APIs nativas (push, SMS, cámara, etc.), documentar que no estará en web o implementar un fallback.
