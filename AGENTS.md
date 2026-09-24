# Contexto para agentes

## Proyecto

Aplicación Expo 54 / React Native 0.81.5 con Expo Router, TypeScript, Zustand y Android `NotificationListenerService`.
Captura notificaciones, filtra transacciones y guarda registros localmente.

## Arquitectura obligatoria

```text
UI -> Services -> Ports <- Repositories
```

- La UI nunca importa ni instancia repositorios.
- Los servicios dependen de interfaces de `src/model/ports`, nunca de implementaciones concretas.
- Los repositorios contienen persistencia e integraciones externas.
- `src/context/ServicesContext.tsx` es el composition root de la UI.
- El listener headless construye su propia composición en `src/services/notificationListener.service.ts` porque puede ejecutarse fuera del árbol React.
- Los tipos y contratos compartidos viven en `src/model/types` y `src/model/ports`.
- No ampliar patrones antiguos que contradigan estas reglas.

## Zonas principales

- `app/`: rutas y pantallas Expo Router.
- `src/services/`: casos de uso, filtros y servicios de aplicación.
- `src/repositories/`: implementaciones de persistencia e integraciones.
- `src/context/ServicesContext.tsx`: servicios disponibles para la UI.
- `src/ui/components/`: componentes compartidos.
- `src/ui/theme/theme.ts`: colores, espaciado y tipografía.
- `src/ui/stores/`: estado global Zustand.
- `patches/`: parches persistentes de dependencias npm.

## Archivos críticos

- `app/_layout.tsx`: arranque global y activación del listener.
- `src/services/notificationListener.service.ts`: permisos, headless task y composición del listener.
- `src/services/notifications.service.ts`: operaciones de notificaciones para la UI.
- `src/services/settings.service.ts`: operaciones de configuración para la UI.
- `src/repositories/notifications.repository.ts`: persistencia de registros.
- `src/repositories/settings.repository.ts`: persistencia de configuración.
- `patches/react-native-notification-listener+5.0.2.patch`: elimina extracción nativa de iconos/imágenes.

## Reglas de implementación

- Usar `theme` y `StyleSheet.create`; evitar estilos inline nuevos.
- Para una integración nueva: definir puerto, implementar repositorio, crear servicio, registrar en el composition root y consumir desde UI.
- Añadir o actualizar tests cuando cambie el comportamiento.
- Mantener cambios pequeños y no modificar OAuth si la tarea no lo requiere.
- No editar permanentemente `node_modules`; el parche debe vivir en `patches/`.
- Después de instalar dependencias ejecutar `npm run postinstall`.

## Validación

```bash
npm test -- --runInBand
npm run postinstall
./android/gradlew -p android app:assembleRelease
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

Logs del listener:

```bash
adb logcat -d -t 1000 | grep -E "RNAndroidNotificationListener|NotificationListener|FATAL EXCEPTION"
```

El listener requiere activar `Ajustes > Notificaciones > Acceso a notificaciones > skeleton-app`.

## Documentación condicional

Consultar documentación solo cuando la tarea lo necesite:

| Tarea | Documento |
|---|---|
| Nueva pantalla, ruta o elemento del drawer | `docs/AGENT_GUIDE.md` |
| Nuevo componente, integración o cambio de estilos | `docs/AGENT_GUIDE.md` |
| Cambio en autenticación Google | `docs/GOOGLE_AUTH_SETUP.md` y, si afecta arquitectura, `docs/AGENT_GUIDE.md` |
| Cambio local en una pantalla, servicio, filtro o test existente | No requiere leer documentación completa |

No asumir que toda tarea necesita crear una pantalla, puerto, servicio o repositorio nuevos. Primero localizar el punto de decisión y reutilizar las abstracciones existentes.
