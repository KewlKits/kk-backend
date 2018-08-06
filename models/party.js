const mongoose = require('mongoose');

const partySchema = new mongoose.Schema({
  name: String,
  location: [Number],
  playlistUri: String,
  createdAt: Date,

  owner: mongoose.Schema.Types.ObjectId,
  pool: [mongoose.Schema.Types.ObjectId],
  queue: [mongoose.Schema.Types.ObjectId],
  nowPlaying: mongoose.Schema.Types.ObjectId,
});

partySchema.methods.addSongToPool = function (songId) {
  this.pool.push(songId);
};

partySchema.methods.removeSongFromPool = function (songId) {
  this.pool.remove(songId);
};

partySchema.methods.addSongToQueue = function (songId) {
  this.queue.push(songId);
};

partySchema.methods.removeSongFromQueue = function (songId) {
  this.queue.remove(songId);
};

partySchema.methods.moveSongToQueue = function (songId) {
  this.queue.push(songId);
  this.pool.remove(songId);
};

partySchema.methods.moveSongInQueue = function (index, target) {
  this.queue.splice(target, 0, this.queue.splice(index, 1)[0]);
};

partySchema.methods.setNowPlaying = function (songId) {
  this.nowPlaying = songId;
};

module.exports = mongoose.model('Party', partySchema);
