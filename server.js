const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const { check } = require('express-validator/check');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');

const saltRounds = 10;
//const mongoose = require('mongoose');

const dbUrl = 'mongodb://sachin:#sachin1@learnmongo-shard-00-00-q5opk.mongodb.net:27017,learnmongo-shard-00-01-q5opk.mongodb.net:27017,learnmongo-shard-00-02-q5opk.mongodb.net:27017/test?ssl=true&replicaSet=learnMongo-shard-0&authSource=admin&retryWrites=true';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({
  genid: function(req) {
    return uuidv4(); // use UUIDs for session IDs
  },
  secret: 'thisIsASecretKey',
  saveUninitialized: false, // don't create session until something stored
  resave: false, //don't save session if unmodified
  store: new MongoStore({
      url: dbUrl,
      touchAfter: 24 * 3600 // time period in seconds
  })
}));
const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Hello World!'));
app.get('/registerUser', (req, res) => {
  res.sendFile('./views/registerUser.html', {root: __dirname});
});
app.post('/register', [
  check('email').isEmail().normalizeEmail(),
  check('pass').isString().trim().escape(),
], (req, res) => {
  console.log(req.body.email);
  console.log(req.body.pass);
  MongoClient.connect(dbUrl,{ useNewUrlParser: true }, function(err, client) {
    if (err) {
      console.log(err);
    }
    const collection = client.db("firstMongo").collection("users");
    bcrypt.hash(req.body.pass, saltRounds, function(err, hash) {
      // Store hash in your password DB.
      if (err) {
        console.log(err);
      }
      collection.findOne({email: req.body.email}, (err,result) => {
        if (err) {
          console.log(err);
          client.close();
        }
        if (result) {
          res.send('email already exist');
          client.close();
        } else {
          collection.insertOne({
            email: req.body.email,
            password: hash,
          }, (err) => {
            console.log(err);
            client.close();
          });
          res.send('sucessfull!');
          client.close();
        }
      });
    });
  });
});
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    else res.send('logged out');
  });
});
app.get('/login', (req, res) => {
  res.sendFile('./views/login.html', {root: __dirname})
});
app.post('/login', [
  check('email').isEmail().normalizeEmail(),
  check('pass').isString().trim().escape(),
], (req, res) => {
  console.log(req.body.email);
  console.log(req.body.pass);
  console.log(`session id ${req.session}`);
  Object.keys(req.session).forEach((key) => {
    console.log(key, req.session[key]);
  })
  if (req.session.user) {
    res.send(`already logged in ${req.session.id}`);
    return;
  }
  MongoClient.connect(dbUrl, { useNewUrlParser: true }, function(err, client) {
    if (err) {
      console.log(err);
    } else {
      const collection = client.db("firstMongo").collection("users");
      collection.findOne({email: req.body.email}, (err, userSearch) => {
        if (err) {
          console.log(err);
        } else {
          if (userSearch) {
            bcrypt.compare(req.body.pass, userSearch.password, function(err, match) {
              if (err) {
                console.log(err);
              }
              if (match) {
                //req.session.id = uuidv4();
                req.session.user = req.body.email;
                res.send('successfully logged in');
              } else {
                res.send('email or password wrong');
              }
            });
          } else {
            res.send('user not exist');
          }
        }
      });
    }
  });
});
app.listen(port, () => {
  console.log(`server listening at port ${port}`);
});