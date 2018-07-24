const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  score: Number,

  parties: [mongoose.Schema.Types.ObjectId],
  songs: [mongoose.Schema.Types.ObjectId],
  upvotes: [mongoose.Schema.Types.ObjectId],
  downvotes: [mongoose.Schema.Types.ObjectId],
});

userSchema.methods.addParty = function (partyId) {
  this.parties.push(partyId);
};

userSchema.methods.removeParty = function (partyId) {
  this.parties.remove(partyId);
};

userSchema.methods.addSong = function (songId) {
  this.songs.push(songId);
};

userSchema.methods.removeSong = function (songId) {
  this.songs.remove(songId);
};

userSchema.methods.upvote = function (songId) {
  this.upvotes.push(songId);

  if (this.downvotes.includes(songId)) {
    this.downvotes.remove(songId);
  }
};

userSchema.methods.removeUpvote = function (songId) {
  this.upvotes.remove(songId);
};

userSchema.methods.downvote = function (songId) {
  this.downvotes.push(songId);

  if (this.upvotes.includes(songId)) {
    this.upvotes.remove(songId);
  }
};

userSchema.methods.removeDownvote = function (songId) {
  this.downvotes.remove(songId);
};

module.exports = mongoose.model('User', userSchema);
