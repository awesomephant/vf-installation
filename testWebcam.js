//Available in nodejs

var NodeWebcam = require("node-webcam");


//Default options

var opts = {
    width: 1280,
    height: 720,
    quality: 100,
    delay: 0,
    saveShots: true,
    output: "jpeg",
    device: false,
    callbackReturn: "location",
    verbose: false

};


var Webcam = NodeWebcam.create(opts);


//Get list of cameras

Webcam.list(function (list) {
    console.log(list)
    Webcam.capture("test_picture", function (err, data) { });
});