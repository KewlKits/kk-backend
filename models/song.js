const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  uri: String,
  title: String,
  artist: String,
  album: String,
  albumArtUrl: String,
  createdAt: Date,

  party: mongoose.Scheme.Types.ObjectId,
  owner: mongoose.Scheme.Types.ObjectId,
  upvotedBy: [mongoose.Scheme.Types.ObjectId],
  downvotedBy: [mongoose.Scheme.Types.ObjectId],
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
