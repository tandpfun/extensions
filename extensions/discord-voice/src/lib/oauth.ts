import { OAuth } from "@raycast/api";
import fetch from "node-fetch";

export const clientId = "994284054641913936";
export const scopes = ["identify", "guilds", "rpc", "rpc.voice.write", "rpc.voice.read"];
export const apiURL = "https://discord.com/api/v10";

const oauthClient = new OAuth.PKCEClient({
  redirectMethod: OAuth.RedirectMethod.Web,
  providerName: "Discord",
  providerIcon: "discord.png",
  providerId: "discord",
  description: "Connect your Discord account...",
});

// Authorization
export async function authorize(): Promise<void> {
  const tokenSet = await oauthClient.getTokens();
  if (tokenSet?.accessToken) {
    if (tokenSet.refreshToken && tokenSet.isExpired()) {
      await oauthClient.setTokens(await refreshTokens(tokenSet.refreshToken));
    }
    return;
  }

  const authRequest = await oauthClient.authorizationRequest({
    endpoint: "https://discord.com/oauth2/authorize",
    clientId: clientId,
    scope: scopes.join(" "),
  });
  const { authorizationCode } = await oauthClient.authorize(authRequest);
  await oauthClient.setTokens(await fetchTokens(authRequest, authorizationCode));
}

export async function fetchTokens(
  authRequest: OAuth.AuthorizationRequest,
  authCode: string
): Promise<OAuth.TokenResponse> {
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("code", authCode);
  params.append("code_verifier", authRequest.codeVerifier);
  params.append("grant_type", "authorization_code");
  params.append("redirect_uri", authRequest.redirectURI);

  const response = await fetch(apiURL + "/oauth2/token", { method: "POST", body: params });
  if (!response.ok) {
    console.error("fetch tokens error:", await response.text());
    throw new Error(response.statusText);
  }
  return (await response.json()) as OAuth.TokenResponse;
}

export async function getOAuthTokens(): Promise<OAuth.TokenSet | undefined> {
  return await oauthClient.getTokens();
}

export async function resetOAuthTokens(): Promise<void> {
  await oauthClient.removeTokens();
}

async function refreshTokens(refreshToken: string): Promise<OAuth.TokenResponse> {
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("refresh_token", refreshToken);
  params.append("grant_type", "refresh_token");

  const response = await fetch(apiURL + "/api/oauth2/token", { method: "POST", body: params });
  if (!response.ok) {
    console.error("refresh tokens error:", await response.text());
    throw new Error(response.statusText);
  }

  const tokenResponse = (await response.json()) as OAuth.TokenResponse;
  tokenResponse.refresh_token = tokenResponse.refresh_token ?? refreshToken;
  return tokenResponse;
}
