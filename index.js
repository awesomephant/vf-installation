const express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);
const { exec } = require('child_process');

function makePrediction() {
    let now = + new Date();
    exec(`runPrediction.bat ${now}`, (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(stdout);
        io.emit('predDone', now)
    });
}

app.use(express.static('app'))

app.get('/', function (req, res) {
    res.sendFile(__dirname + 'index.html');
});

io.on('connection', function (socket) {
    console.log('Connected.');

    socket.on('getPred', function () {
        console.log('Making prediction..');
        
        makePrediction();
    });

});

http.listen(3000, function () {
    console.log('Listening on port 3000');
});