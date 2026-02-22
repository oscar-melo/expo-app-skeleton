import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import type { AuthResult } from '@/model/types';
import type { IAuthRepository } from '@/model/ports';
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID, GOOGLE_ANDROID_CLIENT_ID } from '@/config/env';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

/**
 * Implementación del puerto IAuthRepository usando Google OAuth 2
 * vía expo-auth-session (redirect). Funciona en web y móvil.
 */
export class AuthRepository implements IAuthRepository {
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

    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'skeletonapp',
      path: 'auth',
    });

    // En desarrollo: revisa la consola para copiar esta URI a "URIs de redirección autorizados" en Google Cloud.
    if (__DEV__) {
      console.log('[Auth] Redirect URI para Google Cloud Console:', redirectUri);
    }

    // 1️⃣ Get Google's OAuth endpoints
    const discovery = await AuthSession.fetchDiscoveryAsync(
      'https://accounts.google.com'
    );

    // 2️⃣ Create request
    const request = new AuthSession.AuthRequest({
      clientId,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      usePKCE: false, // Explicitly disable PKCE for Implicit Flow
      responseType: AuthSession.ResponseType.Token, // 🔹 Cambiado a Token (Implicit Flow)
    });

    // 3️⃣ Generate URL using discovery
    await request.makeAuthUrlAsync(discovery);

    // 4️⃣ Start auth flow
    const result = await request.promptAsync(discovery);

    if (result.type !== 'success') {
      return null;
    }

    const { access_token } = result.params;
    if (!access_token) return null;

    const user = await this.fetchUserInfo(access_token);
    if (!user) return null;

    return {
      user,
      accessToken: access_token,
      // En el flujo implícito estándar, el id_token suele venir también si se pide, 
      // pero el access_token es el principal que usamos para la API de userinfo.
      idToken: result.params.id_token,
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
