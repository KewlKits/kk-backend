const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  uri: String,
  title: String,
  artist: String,
  album: String,
  albumArtUrl: String,
  createdAt: Date,

  party: mongoose.Schema.Types.ObjectId,
  owner: mongoose.Schema.Types.ObjectId,
  upvotedBy: [mongoose.Schema.Types.ObjectId],
  downvotedBy: [mongoose.Schema.Types.ObjectId],
});

songSchema.methods.addUpvote = function (userId) {
  this.upvotedBy.push(userId);

  if (this.downvotedBy.includes(userId)) {
    this.downvotedBy.remove(userId);
  }
};

songSchema.methods.removeUpvote = function (userId) {
  this.upvotedBy.remove(userId);
};

songSchema.methods.addDownvote = function (userId) {
  this.downvotedBy.push(userId);
  if (this.upvotedBy.includes(userId)) {
    this.upvotedBy.remove(userId);
  }
};

songSchema.methods.removeDownvote = function (userId) {
  this.downvotedBy.remove(userId);
};


module.exports = mongoose.model('Song', songSchema);
