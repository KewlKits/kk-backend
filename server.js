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
    Party.remove({
      _id: req.params.party_id,
    }, (err, party) => {
      if (err) {
        res.status(400).json({ error: err });
      }
      res.status(200).json(party);
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
        res.status(200).json(party);
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
      party.addSongToQueue(
        req.body.uri, req.body.title, req.body.artist, req.body.album, req.body.albumArtUrl,
      );

      party.save((saveErr) => {
        if (saveErr) {
          res.status(400).json({ error: saveErr });
        }
        res.status(200).json(party);
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
        res.status(200).json(party);
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
  });

app.use('/', router);

app.listen(process.env.PORT);
