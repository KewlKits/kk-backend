const mongoose = require('mongoose');

const { Schema } = mongoose.Schema;

const songSchema = new Schema({
  uri: String,
  createdAt: Date,
  title: String,
  artist: String,
  album: String,
  albumArtUrl: String,
});

const partySchema = new Schema({
  name: String,
  location: [Number],
  createdAt: Date,
  pool: [songSchema],
  queue: [songSchema],
});

module.exports = mongoose.model('Party', partySchema);
