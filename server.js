const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const router = express.Router();

router.get('/', (req, res) => {
  res.json({message: "working"});
});

app.use('/', router);

app.listen(process.env.PORT);
