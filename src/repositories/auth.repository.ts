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
      preferLocalhost: true,
      ...Platform.select({
        android: {
          scheme: 'com.skeletonapp',
          path: 'oauth2redirect/google'
        },
        ios: {
          scheme: 'com.skeletonapp',
          path: 'oauth2redirect/google'
        },
        default: {
          scheme: 'skeletonapp',
          path: 'auth'
        },
      }),
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
    const isWeb = Platform.OS === 'web';
    const request = new AuthSession.AuthRequest({
      clientId,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      usePKCE: !isWeb, // Los clientes nativos obligan a usar PKCE
      responseType: isWeb ? AuthSession.ResponseType.Token : AuthSession.ResponseType.Code,
    });

    // 3️⃣ Generate URL using discovery
    await request.makeAuthUrlAsync(discovery);

    // 4️⃣ Start auth flow
    const result = await request.promptAsync(discovery);

    if (result.type !== 'success') {
      return null;
    }

    let access_token = '';
    let id_token = '';

    if (isWeb) {
      // En Web usamos Implicit Flow, el token viene directamente
      access_token = result.params.access_token;
      id_token = result.params.id_token;
    } else {
      // En Móvil usamos Auth Code Flow. Google no pide Client Secret para apps nativas.
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
