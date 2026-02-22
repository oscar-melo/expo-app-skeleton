import { Redirect } from 'expo-router';

/**
 * Esta ruta existe únicamente para capturar la redirección de Google OAuth en Android/iOS
 * y evitar el error de "Unmatched Route". Expo Auth Session interceptará los parámetros,
 * y nosotros simplemente redirigimos al usuario de vuelta al inicio.
 */
export default function GoogleOAuthRedirect() {
    return <Redirect href="/" />;
}
