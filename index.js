var express = require('express');
var app = express();

app.get("/kart", function(req, res) {
  res.send('HIII');
})

var port = process.env['PORT'] || 3000;
app.listen(port, function() {
  console.log("Listenin' for kart on port " + port);
});
