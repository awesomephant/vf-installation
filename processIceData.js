// Writing this in node for dev efficiency
const glob = require('glob')
const sharp = require('sharp');
const basePath = './ice-data-raw'
const outputDir = './ice-data-raw/pairs'

function makeArrayPairs(filenames, interval) {
    let pairs = [];
    for (let i = 0; i < filenames.length - interval; i++) {
        pairs.push([
            filenames[i],
            filenames[i + interval]
        ])
    }
    return pairs;
}
/**
 * Given an array of image pairs, generates and saves composite A/B images of each pair.
 */
function generateImages(pairs) {
    for (let i = 0; i < pairs.length; i++) {
        // Create a blank 300x200 PNG image of semi-transluent red pixels
        let pair = pairs[i];
        console.log(`Writing pair ${i}/${pairs.length}`)
        sharp(pair[0]).resize(500, 500).toBuffer((err, dataA, info) => {
            sharp(pair[1]).resize(500, 500).toBuffer((err, dataB, info) => {
                sharp({ create: { width: 1000, height: 500, channels: 3, background: { r: 0, g: 0, b: 0 } } })
                    .composite([{ input: dataA, gravity: 'northwest' }, { input: dataB, gravity: 'northeast' }])
                    .toFile(`${outputDir}/${i}.png`, function (err) { });
            })
        });
    }
}

/**
 * Given an array of input folders, returns a 2D array of filenames corresponding to images one hour apart
 * @param {Array} inputSeries 
 * @param {Number} step: Step in Hours
 */
function getImagePairs(inputSeries, step, cb) {
    let allPairs = [];
    for (let i = 0; i < inputSeries.length; i++) {
        // Image interval in minutes
        let interval = 2; // TODO: Load this from metadata-file
        let imageInterval = (step * 60) / interval;
        glob(`${basePath}/${inputSeries[i]}/*.jpg`, {}, function (err, files) {
            if (err) { console.log(err) }
            let pairs = makeArrayPairs(files, imageInterval)
            console.log(`Input series ${i}: ${files.length} images. ${pairs.length} image pairs added`)
            allPairs = allPairs.concat(pairs)
            if (i === inputSeries.length - 1) {
                console.log(`\n${allPairs.length} image pairs found`)
                cb(allPairs);
            }
        })
    }
}

function processIceData() {
    console.log('\nProcessing ice data\n====================\n')
    let step = 1;
    console.log(`Timestep: ${step} hour(s)\n`)

    getImagePairs([5, 6, 7, 8], step, function (pairs) {
        console.log(`Generating composite images...\n`)
        generateImages(pairs);
    })

}

processIceData()