const express = require("express");
const app = express();
const fs = require("fs");
var request = require("request");

const moviePath = "/media/pi/KD's Seagate/Samples/";
//const moviePath = "/Volumes/KD's Seagate/Samples/";

const movie_list = [
  {
    id: 'tt0372784',
    poster: 'https://m.media-amazon.com/images/M/MV5BOTY4YjI2N2MtYmFlMC00ZjcyLTg3YjEtMDQyM2ZjYzQ5YWFkXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg'
  },
  {
    id: 'tt0448115',
    poster: 'https://m.media-amazon.com/images/M/MV5BOWZhZjE4NGQtODg5Ni00MjQ1LWJmMzAtNzQ2N2M1NzYzMDJkXkEyXkFqcGdeQXVyMjMwNDgzNjc@._V1_SX300.jpg'
  },
  {
    id: 'tt2381249',
    poster: 'https://m.media-amazon.com/images/M/MV5BOTFmNDA3ZjMtN2Y0MC00NDYyLWFlY2UtNTQ4OTQxMmY1NmVjXkEyXkFqcGdeQXVyNTg4NDQ4NDY@._V1_SX300.jpg'
  },
  {
    id: 'tt2935510',
    poster: 'https://m.media-amazon.com/images/M/MV5BZTllZTdlOGEtZTBmMi00MGQ5LWFjN2MtOGEyZTliNGY1MzFiXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg'
  },
  {
    id: 'tt6146586',
    poster: 'https://m.media-amazon.com/images/M/MV5BMDg2YzI0ODctYjliMy00NTU0LTkxODYtYTNkNjQwMzVmOTcxXkEyXkFqcGdeQXVyNjg2NjQwMDQ@._V1_SX300.jpg'
  },
  {
    id: 'tt8079248',
    poster: 'https://m.media-amazon.com/images/M/MV5BMjQ0NTI0NjkyN15BMl5BanBnXkFtZTgwNzY0MTE0NzM@._V1_SX300.jpg'
  },
]
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/views'));

app.get("/", function (req, res) {
  res.render(__dirname + "/views/index");
  console.log(movie_list);
});

app.get("/library", function (req, res) {
  res.render(__dirname + "/views/library", {movies: movie_list});
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
  const videoPath = moviePath+req.params.movid + ".mp4";
  const videoSize = fs.statSync(videoPath).size;

  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  res.writeHead(206, headers);

  const videoStream = fs.createReadStream(videoPath, { start, end });
  console.log(headers);
  
  videoStream.pipe(res);
});

app.get("/efflux-api/download/:movid", function(req, res){
  const videoPath = moviePath+req.params.movid + ".mp4";
  res.sendFile(videoPath);
})

app.listen(8000, function () {
  console.log("Listening on port 8000!");
});
