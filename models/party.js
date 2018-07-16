const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  uri: String,
  title: String,
  artist: String,
  album: String,
  albumArtUrl: String,
  createdAt: Date,
});

const partySchema = new mongoose.Schema({
  name: String,
  location: [Number],
  pool: [songSchema],
  queue: [songSchema],
  createdAt: Date,
});

partySchema.methods.addSongToQueue = function (uri, title, artist, album, albumArtUrl) {
  // Only add if unique
  if (!this.queue.map(song => song.uri).includes(uri)) {
    this.queue.push({
      uri,
      title,
      artist,
      album,
      albumArtUrl,
      createdAt: new Date(),
    });
  }
};

partySchema.methods.removeSongFromQueue = function (songId) {
  this.queue.remove(songId);
};


module.exports = mongoose.model('Party', partySchema);
