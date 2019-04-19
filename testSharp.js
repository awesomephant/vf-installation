const sharp = require('sharp');
function test() {
    let t = 123;
    let a = 'ed'
    let filename = `./pr${a}.png`
    let filename_scaled = `./app/captures/scaled/capture-${t}.png`

        sharp(filename)
            .resize(300, 200)
            .toFile(filename_scaled, function (err) {
                console.log(err)
                // output.jpg is a 300 pixels wide and 200 pixels high image
                // containing a scaled and cropped version of input.jpg
            });
}

test()