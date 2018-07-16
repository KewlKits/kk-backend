const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  uri: String,
  createdAt: Date,
  title: String,
  artist: String,
  album: String,
  albumArtUrl: String,
});

const partySchema = new mongoose.Schema({
  name: String,
  location: [Number],
  createdAt: Date,
  pool: [songSchema],
  queue: [songSchema],
});

module.exports = mongoose.model('Party', partySchema);
