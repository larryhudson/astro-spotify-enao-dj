import {
  get99TopArtists,
  get99TopTracks,
  getArtistTopTracks,
} from "./utils/spotify";
import pMap from "p-map";
// brackets are batches of songs that the DJ comes up with.
// each of these has a 'func' function that takes in the user's auth token and returns:
// - a list of song objects, with track name, artists, song ID,
// - a description of the bracket that will be passed into an AI prompt
// each bracket also has 'conditions' function. when we're picking a bracket, we will only pick if the conditions are met.

function getRandomItemFromArray(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

// function get multiple unique random items from array
function getRandomItemsFromArray(array, numItems) {
  if (numItems > array.length) {
    throw new Error("Array does not have enough items");
  }

  const randomItems = [];
  while (randomItems.length < numItems) {
    const randomItem = getRandomItemFromArray(array);
    // TODO: include won't work if the array contains objects
    if (!randomItems.includes(randomItem)) {
      randomItems.push(randomItem);
    }
  }
  return randomItems;
}

// things to keep in mind:
// - we want to keep track of history so we're not playing the same songs over and over again.
export const brackets = [
  {
    name: "Artists you haven't listened to in a while",
    active: true,
    func: async (authToken) => {
      // fetch user's top artists for "long term" and "short term"
      // TODO: implement Spotify API for this

      const longTermArtists = await get99TopArtists(authToken, "long_term");
      const shortTermArtists = await get99TopArtists(authToken, "short_term");

      const shortTermNames = shortTermArtists.map((item) => item.name);

      // find an artist that is near the top of "long term" but isn't anywhere in "short term"
      const longTermArtistsNotInShortTerm = longTermArtists.filter(
        (artist) => !shortTermNames.includes(artist.name)
      );

      const randomArtists = getRandomItemsFromArray(
        longTermArtistsNotInShortTerm,
        5
      );

      const userTopTracksLongTerm = await get99TopTracks(
        authToken,
        "long_term"
      );

      console.log(JSON.stringify(userTopTracksLongTerm, null, 2));

      async function getSongByArtist(artist) {
        // TODO: implement Spotify API for this
        // fetch user's top tracks and see if there is a song by that artist. if there are multiple, play them all (up to 5)
        const userTopTracksByArtist = userTopTracksLongTerm.filter((track) => {
          const artistIds = track.artists.map((a) => a.id);
          return artistIds.includes(artist.id);
        });

        console.log({ userTopTracksByArtist });

        if (userTopTracksByArtist.length === 0) {
          // if there are no songs by that artist in the top tracks, just get one of their top songs
          console.log("Fetching top tracks for artist", artist.name);
          const artistTopTracks = await getArtistTopTracks(
            authToken,
            artist.id
          );
          const randomTrack = getRandomItemFromArray(artistTopTracks);
          return randomTrack;
        } else {
          const randomTrack = getRandomItemFromArray(userTopTracksByArtist);
          return randomTrack;
        }
      }

      const randomTracks = await pMap(randomArtists, getSongByArtist, {
        concurrency: 1,
      });
      return randomTracks;
    },
    conditions: (userSettings) => {
      // if user is ok with listening to songs they've already heard, return true
      // if user just wants new music, return false
    },
  },
  {
    name: "Artist you've recently added to Liked Songs",
    active: false,
    func: (authToken) => {
      // fetch user's recently added tracks, added in the last month
      // if there are no liked songs, throw an error and we'll do something else
      // if there are liked songs, pick one that is not in the user's top artists
    },
  },
  {
    name: "Sound, pulse, or edge of a genre you've been listening to lately",
    active: false,
    func: (authToken) => {
      // fetch user's short term top artists and get the genre names
      // pick a random genre
      // get the pulse playlist from every noise at once
      // filter out songs that are by user's top artists
      // pick 5 random songs
    },
  },
  {
    name: "New releases in one of your favourite genres",
    active: false,
    func: (authToken) => {
      // fetch user's long term top artists and get the genre names
      // pick a random genre near the top of the list
      // do a spotify search for new releases in that genre
      //
    },
  },
  {
    name: "New releases by your favourite artists, that you haven't listened to",
    active: false,
    func: (authToken) => {
      // fetch user's long term top artists
      // get artists that are not in the user's short term top artists
      // find new releases that the user has not listened to. not sure if we can check that.
    },
  },
  {
    name: "A lesser-known artist that you might like",
    active: false,
    func: (authToken) => {
      // get the user's top artists
      // get similar artists for a few of them
      // filter artists to only ones that have less than 1k monthly listeners / followers?
      // maybe make sure they have at least 1 album?
      // maybe make sure the genres are in the user's top genres?
    },
  },
  {
    name: "Throwback to top songs of a previous year",
    active: false,
    func: (authToken) => {
      // look at user's list of playlists. try to find "Top Songs of xxxx"
      // might not work if the user is a new Spotify user. if so, throw an error and we'll do something else
      // if we find a playlist, get some random songs from that playlist.
    },
  },
  {
    name: "A genre that is a little different to what you listen to",
    active: false,
    func: (authToken) => {
      // get the user's top genres
      // pick a random genre near the top
      // get the every noise at once playlist for that genre, and then go to a similar genre that is not in the user's top genres
      // get 5 songs from the 'sound' playlist
      //
    },
  },
  {
    name: "Songs from a genre you like, with track filter, eg. danceability, energy, valence",
    active: false,
    func: (authToken) => {
      // get the user's top genres
      // pick a genre that is danceable - can we do that with ENAO?
    },
  },
];

export async function getRandomBracket({ authToken }) {
  const activeBrackets = brackets.filter((b) => b.active);
  console.log({ activeBrackets });
  const bracket = getRandomItemFromArray(activeBrackets);

  console.log(bracket);

  const bracketData = await bracket.func(authToken);

  return {
    bracket,
    data: bracketData,
  };
}
