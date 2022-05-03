const { default: axios } = require('axios');
const fs = require('fs');
const MimeType = require('mime-types');
const logger = require('./logger')();

/**
 * 
 * @param {string} str 
 * @returns 
 */
const dots = (str, ratio = 0.50) => {
    return str.length > 50 ? str.slice(0, str.length > 50 ? str.length * ratio : 50) + '...' : str
}

const delay = async (ms) => await new Promise((resolve) => setTimeout(resolve, ms))

const download = async (url, savePath, options) => {
    logger.INFO(`Downloading "${dots(url)}"`);
    return axios.get(url, {
        responseType: 'arraybuffer',
        ...options
    }).then(res => {
        const ext = MimeType.extension(res.headers['content-type'])
        savePath = MimeType.lookup(savePath) ? savePath : `${savePath}.${ext}`
        fs.writeFileSync(savePath, res.data)
        logger.SUCCESS(`Downloaded, saved to ${savePath}`);
        return `${savePath}.${ext}`
    }).catch(e => {
        logger.ERROR(`Failed to download ${url}`)
        return false
    })
}

// https://stackoverflow.com/questions/53413034/how-to-calculate-difference-between-two-timestamps-using-javascript
const Duration = (difference) => {
    let secondsInMiliseconds = 1000,
        minutesInMiliseconds = 60 * secondsInMiliseconds,
        hoursInMiliseconds = 60 * minutesInMiliseconds;

    var differenceInHours = difference / hoursInMiliseconds,
        differenceInMinutes = differenceInHours % 1 * 60,
        differenceInSeconds = differenceInMinutes % 1 * 60;
    return {
        hours: Math.floor(differenceInHours),
        minutes: Math.floor(differenceInMinutes),
        seconds: Math.floor(differenceInSeconds)
    }
}

module.exports = {
    download,
    dots,
    Duration,
    delay
}

//download('https://4.bp.blogspot.com/-dFNTsm4lFuQ/WVIUEq5JGaI/AAAAAAAAZpk/AieZK0aOUuMcUvvhYO-uYq1okNWjtCoYgCEwYBhgL/s1600/DUST_lovablemaria%2B%25281%2529.jpg', './tmp/1')