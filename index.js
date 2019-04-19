const express = require('express');
const NodeWebcam = require("node-webcam");
const sharp = require('sharp');

var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);
const { exec } = require('child_process');

function timestamp() {
    return + new Date()
}

const cameraOptions = {
    width: 1024,
    quality: 100,
    delay: 0,
    saveShots: true,
    output: "png",
};
let Webcam = NodeWebcam.create(cameraOptions);

function captureImage(cb) {
    let t = timestamp();
    let filename = `./app/captures/capture-${t}.png`
    let filename_scaled = `./app/captures/scaled/capture-${t}.png`

    Webcam.capture(filename, function (err, data) {
        exec(`scaleImage.bat ${t}`, (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(stdout);
            io.emit('captureDone', t)
            cb(t);
        });
    });
}

function makePrediction(t, cb) {
    exec(`runPrediction.bat ${t}`, (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(stdout);
        io.emit('predDone', t)
        cb();
    });
}

app.use(express.static('app'))

app.get('/', function (req, res) {
    res.sendFile(__dirname + 'index.html');
});

io.on('connection', function (socket) {
    console.log('Connected.');

    socket.on('getPred', function (timestamp) {
        console.log(`Making prediction for ${timestamp}`);
        makePrediction(timestamp);
    });
    socket.on('getCapture', function () {
        console.log('Taking capture..');
        captureImage();
    });
    socket.on('runCycle', function () {
        console.log('Taking capture..');
        captureImage(function(timestamp){
            makePrediction(timestamp, function(){
                io.emit('cycleDone')
            })
        });
    });

});

http.listen(3000, function () {
    console.log('Listening on port 3000');
});