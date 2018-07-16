const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Party = require('./models/party');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI);

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'online' });
});

router.route('/party')
  .post((req, res) => {
    const party = Party();
    party.name = req.body.name;
    party.location = [req.body.longitude, req.body.latitude];
    party.createdAt = new Date();

    party.save((err) => {
      if (err) {
        res.status(400).json({ error: err });
      }
      res.status(200).json(party);
    });
  });

app.use('/', router);

app.listen(process.env.PORT);
