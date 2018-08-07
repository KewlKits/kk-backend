const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Party = require('./models/party');
const Song = require('./models/song');
const User = require('./models/user');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI);

const safelyDeleteSong = (songId) => {
  Song.findById(songId, (err, song) => {
    // Delete pointer in owner
    User.findById(song.owner, (ownerFindErr, owner) => {
      owner.removeSong(songId);
      owner.save();
    });

    // Delete pointer in upvoters
    song.upvotedBy.forEach((upvoterId) => {
      User.findById(upvoterId, (upvoterFindErr, upvoter) => {
        upvoter.removeUpvote(songId);
        upvoter.save();
      });
    });

    // Delete pointers in downvoters
    song.downvotedBy.forEach((upvoterId) => {
      User.findById(upvoterId, (downvoterFindErr, downvoter) => {
        downvoter.removeDownvote(songId);
        downvoter.save();
      });
    });
  });

  Song.remove({ _id: songId }, (removeErr, song) => {
  });
};

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({ message: 'online' });
});

router.route('/party')
  .get((req, res) => {
    Party.find((err, parties) => {
      if (err) {
        res.status(400).json({ error: err });
      }
      res.status(200).json(parties);
    });
  })
  .post((req, res) => {
    const party = new Party();
    party.name = req.body.name;
    party.location = [req.body.longitude, req.body.latitude];
    party.playlistUri = req.body.playlistUri;
    party.createdAt = new Date();

    party.owner = mongoose.Types.ObjectId(req.body.owner);

    party.save((err) => {
      if (err) {
        res.status(400).json({ error: err });
      }
      User.findById(req.body.owner, (userFindErr, user) => {
        if (userFindErr) {
          res.status(400).json({ error: userFindErr });
        }
        user.addParty(party._id);
        user.save((userSaveErr) => {
          if (userSaveErr) {
            res.status(400).json({ error: userSaveErr });
          }
          res.status(200).json(party);
        });
      });
    });
  });

router.route('/party/:party_id')
  .get((req, res) => {
    Party.findById(req.params.party_id, (err, party) => {
      if (err) {
        res.status(400).json({ error: err });
      }
      res.status(200).json(party);
    });
  })
  .delete((req, res) => {
    Party.findById(req.params.party_id, (err, party) => {
      // Delete all songs in queue
      party.queue.forEach((songId) => {
        Song.findById(songId, (songFinderr, song) => {
          // Delete pointer in owner
          User.findById(song.owner, (ownerFindErr, owner) => {
            owner.removeSong(songId);
            owner.save();
          });
   
          // Delete pointer in upvoters
          song.upvotedBy.forEach((upvoterId) => {
            User.findById(upvoterId, (upvoterFindErr, upvoter) => {
              upvoter.removeUpvote(songId);
              upvoter.save();
            });
          });
    
          // Delete pointers in downvoters
          song.downvotedBy.forEach((upvoterId) => {
            User.findById(upvoterId, (downvoterFindErr, downvoter) => {
              downvoter.removeDownvote(songId);
              downvoter.save();
            });
          });

          Song.remove({ _id: songId }, (removeErr, song) => {
          });
        });
      });

      // Delete all songs in pool
      party.pool.forEach((songId) => {
        Song.findById(songId, (songFinderr, song) => {
          // Delete pointer in owner
          User.findById(song.owner, (ownerFindErr, owner) => {
            owner.removeSong(songId);
            owner.save();
          });
   
          // Delete pointer in upvoters
          song.upvotedBy.forEach((upvoterId) => {
            User.findById(upvoterId, (upvoterFindErr, upvoter) => {
              upvoter.removeUpvote(songId);
              upvoter.save();
            });
          });
    
          // Delete pointers in downvoters
          song.downvotedBy.forEach((upvoterId) => {
            User.findById(upvoterId, (downvoterFindErr, downvoter) => {
              downvoter.removeDownvote(songId);
              downvoter.save();
            });
          });

          Song.remove({ _id: songId }, (removeErr, song) => {
          });
        });
      });

      // Delete pointer in owner
      User.findById(party.owner, (ownerFindErr, owner) => {
        owner.removeParty(party._id);
        owner.save((ownerSaveErr) => {
          // Delete party
          Party.remove({ _id: req.params.party_id }, (removeErr, deletedParty) => {
            res.status(200).json(deletedParty);
          });
        });
      });
    });
  });

router.route('/party/:party_id/now_playing')
  .put((req, res) => {
    Party.findById(req.params.party_id, (err, party) => {
      if (err) {
        res.status(400).json({ error: err });
      }
      party.setNowPlaying(req.body.song_uri);
      party.save((saveErr) => {
        if (saveErr) {
          res.status(400).json({ error: saveErr });
        }
        res.status(200).json(party);
      });
    });
  });

router.route('/party/:party_id/pool/add')
  .put((req, res) => {
    Party.findById(req.params.party_id, (err, party) => {
      if (err) {
        res.status(400).json({ error: err });
      }
      const song = new Song();
      song.uri = req.body.uri;
      song.title = req.body.title;
      song.artist = req.body.artist;
      song.album = req.body.album;
      song.albumArtUrl = req.body.albumArtUrl;
      song.createdAt = new Date();

      song.party = req.params.party_id;
      song.owner = req.body.owner;

      song.save((songSaveErr) => {
        if (songSaveErr) {
          res.status(400).json({ error: songSaveErr });
        }
        party.addSongToPool(song._id);
        party.save((saveErr) => {
          if (saveErr) {
            res.status(400).json({ error: saveErr });
          }
          User.findById(req.body.owner, (userFindErr, user) => {
            if (userFindErr) {
              res.status(400).json({ error: userFindErr });
            }
            user.addSong(song._id);
            user.save((userSaveErr) => {
              if (userSaveErr) {
                res.status(400).json({ error: userSaveErr });
              }
              res.status(200).json(party);
            });
          });
        });
      });
    });
  });

router.route('/party/:party_id/pool/remove')
  .put((req, res) => {
    Party.findById(req.params.party_id, (err, party) => {
      if (err) {
        res.status(400).json({ error: err });
      }
      party.removeSongFromPool(req.body.song_id);

      party.save((saveErr) => {
        if (saveErr) {
          res.status(400).json({ error: saveErr });
        }
        Song.findById(req.body.song_id, (songFinderr, song) => {
          // Delete pointer in owner
          User.findById(song.owner, (ownerFindErr, owner) => {
            owner.removeSong(req.body.song_id);
            owner.save();
          });
   
          // Delete pointer in upvoters
          song.upvotedBy.forEach((upvoterId) => {
            User.findById(upvoterId, (upvoterFindErr, upvoter) => {
              upvoter.removeUpvote(req.body.song_id);
              upvoter.save();
            });
          });
    
          // Delete pointers in downvoters
          song.downvotedBy.forEach((upvoterId) => {
            User.findById(upvoterId, (downvoterFindErr, downvoter) => {
              downvoter.removeDownvote(req.body.song_id);
              downvoter.save();
            });
          });

          Song.remove({ _id: req.body.song_id }, (removeErr, song) => {
            res.status(200).json(party);
          });
        });
      });
    });
  });

router.route('/party/:party_id/pool')
  .put((req, res) => {
    Party.findById(req.params.party_id, (err, party) => {
      if (err) {
        res.status(400).json({ error: err });
      }
      party.moveSongToQueue(req.body.song_id);

      party.save((saveErr) => {
        if (saveErr) {
          res.status(400).json({ error: saveErr });
        }
        res.status(200).json(party);
      });
    });
  });

router.route('/party/:party_id/queue/add')
  .put((req, res) => {
    Party.findById(req.params.party_id, (err, party) => {
      if (err) {
        res.status(400).json({ error: err });
      }
      const song = new Song();
      song.uri = req.body.uri;
      song.title = req.body.title;
      song.artist = req.body.artist;
      song.album = req.body.album;
      song.albumArtUrl = req.body.albumArtUrl;
      song.createdAt = new Date();

      song.party = req.params.party_id;
      song.owner = req.body.owner;

      song.save((songSaveErr) => {
        if (songSaveErr) {
          res.status(400).json({ error: songSaveErr });
        }
        party.addSongToQueue(song._id);
        party.save((saveErr) => {
          if (saveErr) {
            res.status(400).json({ error: saveErr });
          }
          User.findById(req.body.owner, (userFindErr, user) => {
            if (userFindErr) {
              res.status(400).json({ error: userFindErr });
            }
            user.addSong(song._id);
            user.save((userSaveErr) => {
              if (userSaveErr) {
                res.status(400).json({ error: userSaveErr });
              }
              res.status(200).json(party);
            });
          });
        });
      });
    });
  });

router.route('/party/:party_id/queue/remove')
  .put((req, res) => {
    Party.findById(req.params.party_id, (err, party) => {
      if (err) {
        res.status(400).json({ error: err });
      }
      party.removeSongFromQueue(req.body.song_id);

      party.save((saveErr) => {
        if (saveErr) {
          res.status(400).json({ error: saveErr });
        }
        Song.findById(req.body.song_id, (songFinderr, song) => {
          // Delete pointer in owner
          User.findById(song.owner, (ownerFindErr, owner) => {
            owner.removeSong(req.body.song_id);
            owner.save();
          });
   
          // Delete pointer in upvoters
          song.upvotedBy.forEach((upvoterId) => {
            User.findById(upvoterId, (upvoterFindErr, upvoter) => {
              upvoter.removeUpvote(req.body.song_id);
              upvoter.save();
            });
          });
    
          // Delete pointers in downvoters
          song.downvotedBy.forEach((upvoterId) => {
            User.findById(upvoterId, (downvoterFindErr, downvoter) => {
              downvoter.removeDownvote(req.body.song_id);
              downvoter.save();
            });
          });

          Song.remove({ _id: req.body.song_id }, (removeErr, song) => {
            res.status(200).json(party);
          });
        });
      });
    });
  });

router.route('/party/:party_id/queue/move')
  .put((req, res) => {
    Party.findById(req.params.party_id, (err, party) => {
      if (err) {
        res.status(400).json({ error: err });
      }
      party.moveSongInQueue(req.body.index, req.body.target);

      party.save((saveErr) => {
        if (saveErr) {
          res.status(400).json({ error: saveErr });
        }
        res.status(200).json(party);
      });
    });
  });

router.route('/user')
  .get((req, res) => {
    User.find((err, users) => {
      if (err) {
        res.status(400).json({ error: err });
      }
      res.status(200).json(users);
    });
  })
  .post((req, res) => {
    const user = new User();
    user.name = req.body.name;
    user.score = 0;

    user.save((err) => {
      if (err) {
        res.status(400).json({ error: err });
      }
      res.status(200).json(user);
    });
  })
  .put((req, res) => {
    User.findOne({ name: req.body.name }, (err, user) => {
      if (err) {
        res.status(400).json({ error: err });
      }
      if (user) {
        res.status(200).json(user);
      } else {
        const newUser = new User();
        newUser.name = req.body.name;
        newUser.score = 0;

        newUser.save((saveErr) => {
          if (saveErr) {
            res.status(400).json({ error: saveErr });
          }
          res.status(200).json(newUser);
        });
      }
    });
  });

router.route('/user/:user_id')
  .get((req, res) => {
    User.findById(req.params.user_id, (err, user) => {
      if (err) {
        res.status(400).json({ error: err });
      }
      res.status(200).json(user);
    });
  });

router.route('/user/:user_id/score')
  .put((req, res) => {
    User.findById(req.params.user_id, (err, user) => {
      if (err) {
        res.status(400).json({ error: err });
      }
      user.setScore(req.body.score);
      user.save((saveErr) => {
        if (saveErr) {
          res.status(400).json({ error: saveErr });
        }
        res.status(200).json(user);
      });
    });
  });

router.route('/song')
  .get((req, res) => {
    Song.find((err, songs) => {
      if (err) {
        res.status(400).json({ error: err });
      }
      res.status(200).json(songs);
    });
  });

router.route('/song/:song_id')
  .get((req, res) => {
    Song.findById(req.params.song_id, (err, song) => {
      if (err) {
        res.status(400).json({ error: err });
      }
      res.status(200).json(song);
    });
  });

router.route('/song/list')
  .put((req, res) => {
    console.log(req.body);
    const query = req.body.songIds.map(songId => mongoose.Types.ObjectId(songId));
    Song.find({
      _id: { $in: query },
    }, (err, songs) => {
      if (err) {
        res.status(400).json({ error: err });
      }
      res.status(200).json(songs);
    });
  });

router.route('/song/:song_id/upvote')
  .put((req, res) => {
    Song.findById(req.params.song_id, (err, song) => {
      if (err) {
        res.status(400).json({ error: err });
      }
      song.addUpvote(req.body.user_id);
      song.save((songSaveErr) => {
        if (songSaveErr) {
          res.status(400).json({ error: songSaveErr });
        }
        User.findById(req.body.user_id, (userFindErr, user) => {
          if (userFindErr) {
            res.status(400).json({ error: userFindErr });
          }
          user.upvote(req.params.song_id);
          user.save((userSaveErr) => {
            if (err) {
              res.status(400).json({ error: userSaveErr });
            }
            res.status(200).json(song);
          });
        });
      });
    });
  });

router.route('/song/:song_id/unupvote')
  .put((req, res) => {
    Song.findById(req.params.song_id, (err, song) => {
      if (err) {
        res.status(400).json({ error: err });
      }
      song.removeUpvote(req.body.user_id);
      song.save((songSaveErr) => {
        if (songSaveErr) {
          res.status(400).json({ error: songSaveErr });
        }
        User.findById(req.body.user_id, (userFindErr, user) => {
          if (userFindErr) {
            res.status(400).json({ error: userFindErr });
          }
          user.removeUpvote(req.params.song_id);
          user.save((userSaveErr) => {
            if (err) {
              res.status(400).json({ error: userSaveErr });
            }
            res.status(200).json(song);
          });
        });
      });
    });
  });

router.route('/song/:song_id/downvote')
  .put((req, res) => {
    Song.findById(req.params.song_id, (err, song) => {
      if (err) {
        res.status(400).json({ error: err });
      }
      song.addDownvote(req.body.user_id);
      song.save((songSaveErr) => {
        if (songSaveErr) {
          res.status(400).json({ error: songSaveErr });
        }
        User.findById(req.body.user_id, (userFindErr, user) => {
          if (userFindErr) {
            res.status(400).json({ error: userFindErr });
          }
          user.downvote(req.params.song_id);
          user.save((userSaveErr) => {
            if (err) {
              res.status(400).json({ error: userSaveErr });
            }
            res.status(200).json(song);
          });
        });
      });
    });
  });

router.route('/song/:song_id/undownvote')
  .put((req, res) => {
    Song.findById(req.params.song_id, (err, song) => {
      if (err) {
        res.status(400).json({ error: err });
      }
      song.removeDownvote(req.body.user_id);
      song.save((songSaveErr) => {
        if (songSaveErr) {
          res.status(400).json({ error: songSaveErr });
        }
        User.findById(req.body.user_id, (userFindErr, user) => {
          if (userFindErr) {
            res.status(400).json({ error: userFindErr });
          }
          user.removeDownvote(req.params.song_id);
          user.save((userSaveErr) => {
            if (err) {
              res.status(400).json({ error: userSaveErr });
            }
            res.status(200).json(song);
          });
        });
      });
    });
  });

app.use('/', router);

app.listen(process.env.PORT);
