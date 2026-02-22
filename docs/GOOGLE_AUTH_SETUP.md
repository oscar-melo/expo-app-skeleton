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
   - **URIs de redirección autorizados**: Debes añadir `http://localhost:8081/auth`.
   - Copia el **ID de cliente** generado.

2. **Para Android:**
   - **Tipo de aplicación**: **Android**.
   - **Nombre**: p. ej. `Skeleton App Android`.
   - **Nombre del paquete**: Debe coincidir **exactamente** con el valor de `PACKAGE_NAME` definido en `app.config.ts` (p. ej. `com.skeletonapp`).
   - **Certificado SHA-1**: Obtenlo corriendo `eas credentials` y seleccionando Android.
   - **Configuración avanzada (Importante)**: Asegúrate de que la opción **"Habilitar el esquema de URI personalizado"** (o similar según la versión de la consola) esté activa. Esto permite que Google acepte redirecciones que no sean `https`.

3. **Para iOS:**
   - **Tipo de aplicación**: **iOS**.
   - **Nombre del paquete (Bundle ID)**: Debe coincidir con `PACKAGE_NAME` en `app.config.ts`.

---

## 4. Poner los Client IDs en la app

En la raíz del proyecto crea un archivo `.env` (si no existe) con:

```bash
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=EL_ID_WEB_QUE_COPIASTE.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=EL_ID_ANDROID_AQUI.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=EL_ID_IOS_AQUI.apps.googleusercontent.com
```

Nota: La app utiliza el **Implicit Flow** en Web y **Auth Code con PKCE** en Móvil. **NO** necesitas un Client Secret.

---

## 5. Configuración de Redirección (Redirect URI)

### Para Web
La URI es generada por Expo y suele ser:
`http://localhost:8081/auth` (debes registrarla en el cliente Web en Google Console).

### Para Móvil (Android/iOS)
Google exige un formato estrictamente ligado a tu nombre de paquete. La aplicación utiliza:
`com.tu.paquete:/oauth2redirect/google` (donde `com.tu.paquete` es tu `PACKAGE_NAME`).

**IMPORTANTE:** No necesitas registrar este "Path" manualmente en la consola de Google para los clientes de Android/iOS; Google lo infiere del nombre del paquete, pero **DEBES** configurar el `scheme` correctamente en tu `app.config.ts` para que el celular sepa abrir la app.

---

## 6. Ejecución y Pruebas

Para probar el flujo completo en desarrollo:

1. **Lanza el servidor de Expo (Web):**
   ```bash
   npm run start:no-coop
   ```
2. **Prueba el inicio de sesión:**
   Presiona `w` para abrir en el navegador. Haz clic en "Iniciar sesión con Google". Si configuraste la URI `http://localhost:8081/auth` correctamente en Google Console, el login debería ser exitoso.

3. **Prueba el inicio de sesión (Móvil):**
   Asegúrate de haber seguido los pasos del punto 8 para generar un **Development Build**. Una vez instalado en el celular, inicia el servidor con:
   ```bash
   npm run start:no-coop -- --dev-client
   ```

---

## 7. Solución de Problemas (Troubleshooting)

- **Redirect URI no válido**: La URI que aparece en el error de Google debe coincidir **exactamente** con una de las URIs autorizadas en Google Console.
- **Acceso denegado / 403**: Si el proyecto está en modo "Externo" y en estado de "Prueba", debes añadir tu correo en la sección **Usuarios de prueba** de la pantalla de consentimiento.
- **Variable no cargada**: Si cambias el `.env`, reinicia el servidor de Expo borrando la caché: `npm run start:no-coop -- -c`.

---

## 8. Consideraciones para Móviles (Android / iOS)

Google bloquea por seguridad las redirecciones a direcciones IP locales (ej. `exp://192.168.x.x`). Por esta razón, **Google Auth no se puede probar directamente en la aplicación de Expo Go**.

Para probar el login en un dispositivo móvil real o emulador:
1. Instala el cliente de desarrollo: `npx expo install expo-dev-client`.
2. Compila una versión de desarrollo usando EAS Build (ej. `eas build --profile development --platform android`).
3. Instala el APK compilado en tu teléfono.
4. Conecta la app a tu servidor local iniciando de esta manera: `npm run start:no-coop -- --dev-client`.

Al hacerlo en un Development Build, el cliente OAuth de Google detectará correctamente tu configuración oficial en lugar de la bolsa genérica de Expo Go.
