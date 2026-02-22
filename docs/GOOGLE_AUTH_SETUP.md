# Prueba de autenticación con Google

Guía para probar el login con Google en local.

---

## 1. Crear proyecto y credenciales en Google Cloud

1. Entra en [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un proyecto nuevo (o elige uno existente): **Proyecto** → **Nuevo proyecto** → nombre p. ej. `expo-skeleton-dev`.
3. Activa la API necesaria:
   - Menú **APIs y servicios** → **Biblioteca**.
   - Busca **Google+ API** o **Google Identity**; en proyectos nuevos suele bastar con configurar la **Pantalla de consentimiento de OAuth** (paso siguiente).

---

## 2. Pantalla de consentimiento de OAuth

Puedes llegar desde **APIs y servicios** → **Pantalla de consentimiento de OAuth**, o desde **Google Auth Platform** en el menú. Si entras y solo ves “Descripción general” con métricas y gráficos, **esa no es la pantalla de configuración**. Usa el **menú de la izquierda** para ir a donde se rellena todo:

1. **Información de la marca** (en el menú izquierdo)
   - Ahí rellenas: **Nombre de la aplicación** (p. ej. `Skeleton App Dev`), **Correo de asistencia** (tu email). Dominios autorizados en desarrollo puedes dejarlos vacíos o poner `localhost`.
   - Guarda los cambios.

2. **Público** (en el menú izquierdo)
   - Si te pide tipo de usuario, elige **Externo** para probar con tu cuenta de Google.
   - Si la app es “Externa”, entra en **Usuarios de prueba** y añade tu cuenta de Gmail para poder iniciar sesión en pruebas.

3. **Acceso a los datos** (o la opción donde aparezcan “Ámbitos” / “Scopes”)
   - Añade o verifica que existan los ámbitos: `userinfo.email`, `userinfo.profile`, `openid` (o los que aparezcan como email, profile, openid).
   - Guarda.

Cuando hayas completado Información de la marca, Público y ámbitos, la pantalla de consentimiento quedará lista para usar con tu Client ID.

---

## 3. Crear credenciales OAuth 2.0

Para soportar todas las plataformas, deberás crear diferentes "IDs de cliente":

1. **Para Web:**
   - **APIs y servicios** → **Credenciales** → **Crear credenciales** → **ID de cliente de OAuth**.
   - **Tipo de aplicación**: **Aplicación web**.
   - **Nombre**: p. ej. `Skeleton App Web`.
   - Copia el **ID de cliente** generado.

2. **Para Android (Opcional):**
   - **Tipo de aplicación**: **Android**.
   - Te pedirá el Nombre del paquete (ej. `com.tudominio.skeletonapp`) y el certificado SHA-1 (puedes obtenerlo corriendo `eas credentials` en tu terminal).

3. **Para iOS (Opcional):**
   - **Tipo de aplicación**: **iOS**.
   - Te pedirá el Bundle ID (ej. `com.tudominio.skeletonapp`).

---

## 4. Poner los Client IDs en la app

En la raíz del proyecto crea un archivo `.env` (si no existe) con:

```bash
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=EL_ID_WEB_QUE_COPIASTE.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=EL_ID_ANDROID_AQUI
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=EL_ID_IOS_AQUI
```

Nota: La app utiliza el **Implicit Flow**, por lo que **NO** necesitas un Client Secret.
El archivo `.env` ya está en `.gitignore`, no se sube al repositorio.

---

## 5. Obtener la redirect URI que usa la app (Para Web)

*Nota: Para evitar el error de `Cross-Origin-Opener-Policy` en tu navegador local, usa el comando `start:no-coop`.*

1. En la terminal, desde la raíz del proyecto:
   ```bash
   npm run start:no-coop
   ```
2. Presiona `w` para abrir en web (p. ej. `http://localhost:8081`).
3. Abre la **consola del navegador** (F12 → pestaña *Console*).
4. Pulsa en la app **“Iniciar sesión con Google”**.
5. En la consola debería salir un mensaje como:
   ```text
   [Auth] Redirect URI para Google Cloud Console: https://...
   ```
   o `http://localhost:8081/...` según el entorno. **Copia esa URI tal cual.**

---

## 6. Añadir la redirect URI en Google Cloud

1. Vuelve a **Google Cloud Console** → **Credenciales** → tu cliente OAuth 2.0 → **Editar**.
2. En **URIs de redirección autorizados** → **Añadir URI**.
3. Pega la URI que copiaste del log (la que empieza por `http://localhost...` o `https://...`).
4. Guarda.

---

## 7. Probar de nuevo

1. Recarga la app en el navegador (o reinicia `expo start --web` si cambiaste algo de env).
2. Pulsa otra vez **“Iniciar sesión con Google”**.
3. Deberías ir a la pantalla de Google, elegir cuenta y volver a la app con nombre y correo mostrados.

---

## Si algo falla

- **Redirect URI no válido**: la URI que aparece en la consola debe coincidir **exactamente** con una de las URIs autorizadas en Google (incluido `http` vs `https` y el puerto).
- **Acceso denegado / 403**: en modo “Externo”, añade tu cuenta en **Usuarios de prueba** en la pantalla de consentimiento.
- **Variable no cargada**: reinicia el servidor de Expo borrando la caché después de crear o cambiar el `.env` usandó `npm run start:no-coop -- -c`.

---

## 8. Consideraciones para Móviles (Android / iOS)

Google bloquea por seguridad las redirecciones a direcciones IP locales (ej. `exp://192.168.x.x`). Por esta razón, **Google Auth no se puede probar directamente en la aplicación de Expo Go**.

Para probar el login en un dispositivo móvil real o emulador:
1. Instala el cliente de desarrollo: `npx expo install expo-dev-client`.
2. Compila una versión de desarrollo usando EAS Build (ej. `eas build --profile development --platform android`).
3. Instala el APK compilado en tu teléfono.
4. Conecta la app a tu servidor local iniciando de esta manera: `npm run start:no-coop -- --dev-client`.

Al hacerlo en un Development Build, el cliente OAuth de Google detectará correctamente tu configuración oficial en lugar de la bolsa genérica de Expo Go.
