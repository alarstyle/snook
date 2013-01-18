var express = require('express');
var pg = require('pg');

//pg.connect(process.env.DATABASE_URL, function(err, client) {
  //var query = client.query('SELECT * FROM your_table');

  //query.on('row', function(row) {
    //console.log(JSON.stringify(row));
  //});
//});

var app = express.createServer(express.logger());
/*11*/
app.get('/', function(request, response) {
  response.send('Hello World! '+process.env.DATABASE_URL);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});