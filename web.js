var express = require('express'),
	pg = require('pg'),
    imageMagick = require('gm').subClass({ imageMagick: true });

var dbUrl = process.env.DATABASE_URL || "postgres://postgres:password@localhost/postgres";

pg.connect(dbUrl, function(err, client) {
	/*var query = client.query('SELECT * FROM your_table');

	query.on('row', function(row) {
	  	console.log(JSON.stringify(row));
	});*/
});

var app = express();

//app.use(express.basicAuth('username', 'password'));

app.use(express.static(__dirname + '/public'));
/*
app.get('/', function(req, res) {
  	res.send(" Hello ");
});*/

app.get('/', function (req, res, next) {
    imageMagick(__dirname + '/public/img/img.jpg')
    .autoOrient()
    .flip()
    .stream('png', function (err, stdout) {
        if (err) return next(err);
        res.setHeader('Content-Type', 'image/jpg');
        stdout.pipe(res);
    });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  	console.log("Listening on " + port);
});
