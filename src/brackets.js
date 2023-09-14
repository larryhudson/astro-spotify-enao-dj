// brackets are batches of songs that the DJ comes up with.
// each of these has a 'func' function that takes in the user's auth token and returns:
// - a list of song objects, with track name, artists, song ID,
// - a description of the bracket that will be passed into an AI prompt
// each bracket also has 'conditions' function. when we're picking a bracket, we will only pick if the conditions are met.

// things to keep in mind:
// - we want to keep track of history so we're not playing the same songs over and over again.
export const brackets = [
  {
    name: "Artist you haven't listened to in a while",
    func: (authToken) => {
      // fetch user's top artists for "long term" and "short term"
      // find an artist that is near the top of "long term" but isn't anywhere in "short term"
      // fetch user's top tracks and see if there is a song by that artist. if there are multiple, play them all (up to 5)
      // if there are no songs by that artist in the top tracks, just get one of their top songs
    },
    conditions: (userSettings) => {
      // if user is ok with listening to songs they've already heard, return true
      // if user just wants new music, return false
    },
  },
  {
    name: "Artist you've recently added to Liked Songs",
    func: (authToken) => {
      // fetch user's recently added tracks, added in the last month
      // if there are no liked songs, throw an error and we'll do something else
      // if there are liked songs, pick one that is not in the user's top artists
    },
  },
  {
    name: "Sound, pulse, or edge of a genre you've been listening to lately",
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
    func: (authToken) => {
      // fetch user's long term top artists and get the genre names
      // pick a random genre near the top of the list
      // do a spotify search for new releases in that genre
      //
    },
  },
  {
    name: "New releases by your favourite artists, that you haven't listened to",
    func: (authToken) => {
      // fetch user's long term top artists
      // get artists that are not in the user's short term top artists
      // find new releases that the user has not listened to. not sure if we can check that.
    },
  },
  {
    name: "A lesser-known artist that you might like",
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
    func: (authToken) => {
      // look at user's list of playlists. try to find "Top Songs of xxxx"
      // might not work if the user is a new Spotify user. if so, throw an error and we'll do something else
      // if we find a playlist, get some random songs from that playlist.
    },
  },
  {
    name: "A genre that is a little different to what you listen to",
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
    func: (authToken) => {
      // get the user's top genres
      // pick a genre that is danceable - can we do that with ENAO?
    },
  },
];
