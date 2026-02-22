import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import type { AuthResult } from '@/model/types';
import type { IAuthRepository } from '@/model/ports';
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID, GOOGLE_ANDROID_CLIENT_ID } from '@/config/env';
import { Platform } from 'react-native';
import * as Application from 'expo-application';

WebBrowser.maybeCompleteAuthSession();

/**
 * Implementación del puerto IAuthRepository usando Google OAuth 2
 * vía expo-auth-session (redirect). Funciona en web y móvil.
 */
export class AuthRepository implements IAuthRepository {
  private discovery: AuthSession.DiscoveryDocument | null = null;

  /**
   * Pre-carga la configuración de Google (discovery).
   * Llamar esto al inicio de la app evita el "Popup Blocked" en Web,
   * ya que elimina un await antes de promptAsync().
   */
  async prefetchDiscovery(): Promise<void> {
    try {
      this.discovery = await AuthSession.fetchDiscoveryAsync('https://accounts.google.com');
    } catch (e) {
      console.error('[Auth] Error pre-fetching discovery:', e);
    }
  }

  async loginWithGoogle(): Promise<AuthResult | null> {
    const clientId = Platform.select({
      ios: GOOGLE_IOS_CLIENT_ID,
      android: GOOGLE_ANDROID_CLIENT_ID,
      default: GOOGLE_WEB_CLIENT_ID,
    });

    if (!clientId) {
      console.warn(`No Google Client ID set for platform: ${Platform.OS}`);
      return null;
    }

    const nativeScheme = Application.applicationId ?? 'com.skeletonapp';
    const redirectUri = AuthSession.makeRedirectUri({
      preferLocalhost: true,
      ...Platform.select({
        android: {
          native: `${nativeScheme}:/oauth2redirect/google`
        },
        ios: {
          native: `${nativeScheme}:/oauth2redirect/google`
        },
        default: {
          scheme: 'skeletonapp',
          path: 'auth'
        },
      }),
    });

    if (__DEV__) {
      console.log('[Auth] Redirect URI:', redirectUri);
    }

    // 1️⃣ Aseguramos discovery (si no se pre-cargó, lo hacemos ahora)
    const discovery = this.discovery || await AuthSession.fetchDiscoveryAsync('https://accounts.google.com');

    // 2️⃣ Creamos el objeto de request (operación síncrona/ligera)
    const isWeb = Platform.OS === 'web';
    const request = new AuthSession.AuthRequest({
      clientId,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      usePKCE: !isWeb,
      responseType: isWeb ? AuthSession.ResponseType.Token : AuthSession.ResponseType.Code,
    });

    // 3️⃣ Start auth flow
    // CRITICAL: promptAsync() debe ejecutarse lo más cerca posible del clic del usuario en Web.
    const result = await request.promptAsync(discovery);

    if (result.type !== 'success') {
      return null;
    }

    let access_token = '';
    let id_token = '';

    if (isWeb) {
      access_token = result.params.access_token;
      id_token = result.params.id_token;
    } else {
      try {
        const tokenResult = await AuthSession.exchangeCodeAsync({
          code: result.params.code,
          clientId,
          redirectUri,
          extraParams: request.codeVerifier ? { code_verifier: request.codeVerifier } : undefined,
        }, discovery);

        access_token = tokenResult.accessToken;
        id_token = tokenResult.idToken ?? '';
      } catch (e) {
        console.error('Error exchanging code for token:', e);
        return null;
      }
    }

    if (!access_token) return null;

    const user = await this.fetchUserInfo(access_token);
    if (!user) return null;

    return {
      user,
      accessToken: access_token,
      idToken: id_token,
    };
  }

  private async fetchUserInfo(accessToken: string): Promise<AuthResult['user'] | null> {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { id: string; email: string; name?: string; picture?: string };
    return {
      id: data.id,
      email: data.email,
      name: data.name ?? null,
      picture: data.picture ?? null,
    };
  }
}
