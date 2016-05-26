/**
 * @license Organized v0.1.0
 * (c) 2016 Giancarlo Trevisan
 * License: MIT
 */
const HTTP = require('http');
const URL = require('url');
const FS = require('fs');
const Path = require('path');
const DBC = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

// To setup mongodb on a Cloud9 workspace see https://community.c9.io/t/setting-up-mongodb/1717
// mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]
const dburl = 'mongodb://' + process.env.IP + ':28017/organized';

const mime = {
    '.htm': 'text/html',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
};

// Command line arguments
var Debug = false;
process.argv.forEach(function (val, index, array) {
  switch (val) {
    case '-d':
    case '--debug':
      Debug = true;
  }
});

// Helper functions
function log(text, error) {
  if (Debug || error) {
    console.log(text);
  }
}

// Server
HTTP.createServer(function(req, res) {
  log(req.url);
  log(req.method);
  log(req.headers);

  req.on('error', function(err) {
    log(err.stack, true);
    res.writeHead(500);
    res.end();
  });

  var url = req.url;
  log(req.url.pathname);
  if (/^\/api\/auth/.test(url)) { // Authetication request
    if (req.method === 'POST') {
      DBC.connect(dburl, function(err, db) {
        db.collection('people').findOne({ username: '' }, function (err, person) {
          // Verify credentials
          if (person.password === password) {
            // Create session
            db.collection('sessions').insert({ user: '', timestamp: Date.now() }, function (err, session) {
              res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
              res.end(JSON.stringify({session: session._id}));
            });
          } else {
            res.writeHead(401);
            res.end();
          }
        });
      });
    } else {
      res.writeHead(401);
    }
  } else if (/^\/api\/(courses|people|events|groups)\/?/.test(url)) { // CRUD request
    var args = url.split('/');
    log(args);
    switch (req.method) {
      case 'GET': // Select
        DBC.connect(dburl, function(err, db) {
          res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
          db.collection(args[2]).find(args[3] ? { _id: ObjectID(args[3]) } : { }).stream()
            .on('data', function(item) { res.write(JSON.stringify(item)); })
            .on('end', function() { res.end(); });
        });
        break;
      case 'POST': // Insert
      case 'PUT': // Update
        var body = [];
        req
          .on('data', function(chunk) {
            body.push(chunk);
          })
          .on('end', function() {
            var data = JSON.parse(Buffer.concat(body).toString());
            if (req.method === 'POST')
              delete data._id;
            DBC.connect(dburl, function(err, db) {
              res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
              res.end(JSON.stringify(db.collection(args[2]).updateOne({ _id: ObjectID(args[3]) }, data, { upsert: true })));
          });
        });
        break;
      case 'DELETE': // Delete
        DBC.connect(dburl, function(err, db) {
          res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
          res.end(JSON.stringify(db.collection(args[2]).deleteOne({ _id: ObjectID(args[3]) })));
        });
        break;
      default:
        log('Unknown method ' + req.method);
        res.writeHead(405);
        res.end();
        break;
    }
  } else { // Site request
    if (url === '/') url = '/index.htm';
    FS.readFile('.' + url, function(err, data) {
        if (err) {
            res.end();
            return log(err, true);
        }
        log(url);
        res.writeHead(200, {'content-type': mime[Path.extname(url)] + '; charset=utf-8'});
        res.end(data);
    });
  }
}).listen(process.env.PORT, process.env.IP);
log((new Date()).toString() + ': Webbase server running at ' + process.env.IP + ':' + process.env.PORT, true);
