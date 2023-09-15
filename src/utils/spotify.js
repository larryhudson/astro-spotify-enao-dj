export async function getAuthToken({ code }) {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI } =
    import.meta.env;
  const formData = new FormData();
  formData.append("grant_type", "authorization_code");
  formData.append("code", code);
  formData.append("redirect_uri", SPOTIFY_REDIRECT_URI);

  const encodedData = new URLSearchParams(formData).toString();

  const spotifyTokenUrl = `https://accounts.spotify.com/api/token`;
  const authCode = new Buffer.from(
    SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET
  ).toString("base64");
  const spotifyResponse = await fetch(spotifyTokenUrl, {
    headers: {
      Authorization: `Basic ${authCode}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
    body: encodedData,
  }).then((response) => response.json());

  return spotifyResponse.access_token;
}

async function fetchFromSpotify({ endpoint, queryParams, authToken }) {
  const fullSpotifyUrl = new URL(`https://api.spotify.com/v1/${endpoint}`);

  if (queryParams) {
    const queryKeys = Object.keys(queryParams);
    for (const key of queryKeys) {
      fullSpotifyUrl.searchParams.set(key, queryParams[key]);
    }
  }

  console.log({ fullSpotifyUrl });

  const spotifyResponse = await fetch(fullSpotifyUrl.toString(), {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!spotifyResponse.ok) {
    const errorData = await spotifyResponse.json();
    console.log({ errorData });
    throw new Error(spotifyResponse.statusText);
  }
  try {
    const spotifyData = await spotifyResponse.json();
    return spotifyData;
  } catch (e) {
    const spotifyText = await spotifyResponse.text();
    console.log(spotifyText);
    console.log({ e });
    throw e;
  }
}

export async function getArtistTopTracks(authToken, artistId) {
  console.log("Fetching top tracks for arist with ID", artistId);
  console.log("with auth token", authToken);
  const spotifyUrl = `artists/${artistId}/top-tracks`;
  const data = await fetchFromSpotify({
    endpoint: spotifyUrl,
    queryParams: {
      market: "AU",
    },
    authToken,
  });

  console.log("this is the data");
  console.log(data);

  return data.tracks;
}

export async function getCurrentUserProfile(authToken) {
  // TODO: maybe we should save that somewhere? cache it?
  const userProfile = await fetchFromSpotify({
    endpoint: "me",
    authToken,
  });

  return userProfile;
}

export async function getTopArtists(authToken, timeRange, offset) {
  const topArtistsData = await fetchFromSpotify({
    endpoint: "me/top/artists",
    queryParams: {
      limit: 50,
      offset: offset || 0,
      time_range: timeRange || "long_term",
    },
    authToken,
  });

  return topArtistsData.items;
}

export async function getTopTracks(authToken, timeRange, offset) {
  const topTracksData = await fetchFromSpotify({
    endpoint: "me/top/tracks",
    queryParams: {
      limit: 50,
      offset: offset || 0,
      time_range: timeRange || "long_term",
    },
    authToken,
  });

  return topTracksData.items;
}

export async function get99TopArtists(authToken, timeRange) {
  const promises = [
    getTopArtists(authToken, timeRange),
    getTopArtists(authToken, timeRange, 49).then((items) => items.slice(1)),
  ];

  const [page1, page2] = await Promise.all(promises);

  return [...page1, ...page2];
}

export async function get99TopTracks(authToken, timeRange) {
  const promises = [
    getTopTracks(authToken, timeRange),
    getTopTracks(authToken, timeRange, 49).then((items) => items.slice(1)),
  ];

  const [page1, page2] = await Promise.all(promises);

  return [...page1, ...page2];
}

export async function getRecentTracks(authToken) {
  const recentTracksData = await fetchFromSpotify({
    endpoint: "me/player/recently-played",
    queryParams: {
      limit: 50,
    },
    authToken,
  });

  return recentTracksData.items;
}
