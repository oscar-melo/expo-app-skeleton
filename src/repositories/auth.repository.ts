import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import type { AuthResult } from '@/model/types';
import type { IAuthRepository } from '@/model/ports';
import { GOOGLE_WEB_CLIENT_ID } from '@/config/env';

WebBrowser.maybeCompleteAuthSession();

/**
 * Implementación del puerto IAuthRepository usando Google OAuth 2
 * vía expo-auth-session (redirect). Funciona en web y móvil.
 */
export class AuthRepository implements IAuthRepository {
  async loginWithGoogle(): Promise<AuthResult | null> {
    const clientId = GOOGLE_WEB_CLIENT_ID;
    if (!clientId) {
      console.warn('GOOGLE_WEB_CLIENT_ID not set; auth will not work.');
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

    const request = new AuthSession.AuthRequest({
      clientId,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      usePKCE: true,
      responseType: AuthSession.ResponseType.Code,
    });

    await request.makeAuthUrlAsync();
    const result = await AuthSession.startAsync({ authUrl: request.url });

    if (result.type !== 'success') {
      return null;
    }

    const { code } = result.params;
    if (!code) return null;

    const codeVerifier = request.codeVerifier ?? undefined;
    const tokenResult = await this.exchangeCodeForTokens(code, clientId, redirectUri, codeVerifier);
    if (!tokenResult) return null;

    const user = await this.fetchUserInfo(tokenResult.access_token);
    if (!user) return null;

    return {
      user,
      accessToken: tokenResult.access_token,
      idToken: tokenResult.id_token,
    };
  }

  private async exchangeCodeForTokens(
    code: string,
    clientId: string,
    redirectUri: string,
    codeVerifier?: string
  ): Promise<{ access_token: string; id_token?: string } | null> {
    const params: Record<string, string> = {
      code,
      client_id: clientId,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    };
    if (codeVerifier) params.code_verifier = codeVerifier;
    const body = new URLSearchParams(params);
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token: string; id_token?: string };
    return { access_token: data.access_token, id_token: data.id_token };
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
