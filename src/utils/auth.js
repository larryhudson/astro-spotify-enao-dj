import { getCurrentUserProfile } from "@src/utils/spotify";

export async function getSpotifyUserIdFromAuthToken(authToken) {
  const userProfile = await getCurrentUserProfile(authToken);

  return userProfile.id;
}

export function getSpotifyAuthUrl() {
  const authUrl = new URL(`https://accounts.spotify.com/authorize`);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", import.meta.env.SPOTIFY_CLIENT_ID);

  // list of scopes here: https://developer.spotify.com/documentation/web-api/concepts/scopes
  const scopes = [
    "playlist-read-private",
    "playlist-read-collaborative",
    "user-top-read",
    "user-read-recently-played",
    "user-library-read",
    "user-read-playback-state",
    "user-modify-playback-state", // for adding items to queue
  ];
  authUrl.searchParams.set("scope", scopes.join(" "));
  authUrl.searchParams.set(
    "redirect_uri",
    import.meta.env.SPOTIFY_REDIRECT_URI
  );

  return authUrl;
}

export function getAuthTokenFromAstro(Astro) {
  const cookie = Astro.cookies.get("spotify-auth-token");
  if (!cookie) return null;
  return cookie.value;
}
