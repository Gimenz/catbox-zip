const compressing = require('compressing');
const tmp = require('os').tmpdir()
const fs = require('fs');
const { join } = require('path');
const { download, Duration } = require('./utils');
const logger = require('./logger')();

const zip = new compressing.zip.Stream()

let txt = fs.readFileSync('./links.txt').toString('utf-8')
let urls = [...txt.matchAll(/https:\/\/files\.catbox\.moe\/(.+?)\.(\w+|\d+)/gim)].map(x => {
    return {
        link: `https://files.catbox.moe/${x[1]}.${x[2]}`,
        code: x[1],
        ext: x[2]
    }
})

let resultPath = 'result.zip'
let startTime = new Date();

(async () => {
    // Download all links to tmp dir
    const files = await Promise.all(
        urls.map(async v => {
            return await download(v.link, join(tmp, v.code)).then(res => {
                return res
            }).catch(() => {
                return false
            })
        })
    )

    logger.INFO(`Compressing All Files to ${resultPath}`);

    // add files to zip entry
    files.filter(Boolean).forEach(v => {
        zip.addEntry(v)
    });


    // save
    zip.pipe(fs.createWriteStream(resultPath))
    zip.on('close', () => {
        var finishTime = new Date()
        let success = files.filter(x => x).length
        let time = Duration(finishTime - startTime)
        logger.SUCCESS(`Compressed ${success} of ${urls.length} files in ${time.minutes > 0 ? time.minutes + 'minutes ' : ''}${time.seconds} seconds`)

        // unlink all downloaded files
        files.filter(Boolean).forEach(v => fs.unlinkSync(v))
    })
})()