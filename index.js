const express = require("express");
const app = express();
const fs = require("fs");
var request = require("request");

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/views'));

app.get("/", function (req, res) {
  res.render(__dirname + "/views/index");
});

app.get("/library", function (req, res) {
  res.render(__dirname + "/views/library");
});

app.get("/stream/:movid", function (req, res) {
  var API= 'ebce8643';
  request("http://www.omdbapi.com/?" + "&i=" + req.params.movid + "&apikey=" + API, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var lol = JSON.parse(body);
      res.render(__dirname + "/views/playback", { id: req.params.movid, data: lol });
    }
  })
});

app.get("/settings", function (req, res) {
  res.render(__dirname + "/views/settings");
});

app.get("/efflux-api/:movid", function (req, res) {
  // Ensure there is a range given for the video
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }

  // get video stats (about 61MB)
  const videoPath = req.params.movid + ".mp4";
  const videoSize = fs.statSync(videoPath).size;

  // Parse Range
  // Example: "bytes=32324-"
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  // Create headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);

  // create video read stream for this particular chunk
  const videoStream = fs.createReadStream(videoPath, { start, end });

  // Stream the video chunk to the client
  videoStream.pipe(res);
});

app.listen(8000, function () {
  console.log("Listening on port 8000!");
});
