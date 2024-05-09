var express = require('express'),
    async = require('async'),
    pg = require("pg"),
    path = require("path"),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server);

var db_uri = "postgres://" + process.env['POSTGRES_USER']
    + ':' + process.env['POSTGRES_PASSWORD']
    + "@" + process.env['POSTGRES_HOST']
    + ':' + process.env['POSTGRES_PORT']
    + '/' + process.env['POSTGRES_DB'];

io.sockets.on('connection', function (socket) {

  socket.emit('message', { text : 'Welcome!' });

    socket.on('subscribe', function (data) {
    socket.join(data.channel);
  });
});

async.retry(
  {times: 1000, interval: 1000},
  function(callback) {
      const client = new pg.Client(db_uri);
      client.connect().then(() => {
        callback(undefined, client);
      }).catch((err) => {
        console.error("Waiting for db", err);
        callback(err, undefined);
      });
  },
  function(err, client) {
    if (err) {
      return console.error("Giving up");
    }
    console.log("Connected to db");
    getVotes(client);
  }
);

function getVotes(client) {
  client.query('SELECT vote, COUNT(id) AS count FROM votes GROUP BY vote', [])
  .then((result) => {
    var votes = collectVotesFromResult(result);
    io.sockets.emit("scores", JSON.stringify(votes));
    setTimeout(function() {getVotes(client) }, 1000);
  }).catch((err) => {
    console.error("Error performing query: " + err);
    setTimeout(function() {getVotes(client) }, 1000);
  });
}

function collectVotesFromResult(result) {
  var votes = {a: 0, b: 0, c: 0, d: 0};

  result.rows.forEach(function (row) {
    votes[row.vote] = parseInt(row.count);
  });

  return votes;
}

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  next();
});

app.use(express.static(__dirname + '/views'));

app.get('/', function (req, res) {
  res.sendFile(path.resolve(__dirname + '/views/index.html'));
});

server.listen(80, function () {
  var port = server.address().port;
  console.log('App running on port ' + port);
});
