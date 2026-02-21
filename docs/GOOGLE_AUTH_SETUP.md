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

1. **APIs y servicios** → **Credenciales** → **Crear credenciales** → **ID de cliente de OAuth**.
2. **Tipo de aplicación**: **Aplicación web** (para probar en navegador con `expo start --web`).
3. **Nombre**: p. ej. `Skeleton App Web`.
4. En **URIs de redirección autorizados** no añadas nada todavía; lo haremos después del paso 5.
5. Crear. Copia el **ID de cliente** (termina en `.apps.googleusercontent.com`).

---

## 4. Poner el Client ID en la app

En la raíz del proyecto crea un archivo `.env` (si no existe) con:

```bash
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=EL_ID_QUE_COPIASTE.apps.googleusercontent.com
```

Sustituye `EL_ID_QUE_COPIASTE` por tu ID de cliente.  
El archivo `.env` ya está en `.gitignore`, no se sube al repo.

---

## 5. Obtener la redirect URI que usa la app

1. En la terminal, desde la raíz del proyecto:
   ```bash
   npx expo start --web
   ```
2. Abre la app en el navegador (p. ej. `http://localhost:8081`).
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
- **Variable no cargada**: reinicia el servidor de Expo después de crear o cambiar `.env` (`Ctrl+C` y `npx expo start --web` otra vez).

Para **móvil** (Expo Go o development build) la redirect URI es distinta (por ejemplo con esquema `skeletonapp://auth`). Puedes añadir esa URI también en Google cuando vayas a probar en dispositivo.
