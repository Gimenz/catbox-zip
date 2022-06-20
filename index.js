const compressing = require('compressing');
const fs = require('fs');
const { join } = require('path');
const { download, Duration, delay } = require('./utils');
const plugins = require('./utils/loadplugins');
const logger = require('./utils/logger')();

const zip = new compressing.zip.Stream()

let txt = fs.readFileSync('./links.txt').toString('utf-8')
let banner = fs.readFileSync('./utils/banner.txt').toString('utf-8')
// let urls = [...txt.matchAll(/https:\/\/files\.catbox\.moe\/(.+?)\.(\w+|\d+)/gim)].map(x => {
//     return {
//         link: `https://files.catbox.moe/${x[1]}.${x[2]}`,
//         code: x[1],
//     }
// })

// tmp folder path
const tmp = 'tmp'
if (!fs.existsSync(tmp)) {
    fs.mkdirSync(tmp)
}
let startTime = new Date();

// compress ? set true if you want to zip all downloaded files
const compress = false;
// define compressed result path
let resultPath = 'result.zip';

(async () => {
    console.log(banner);
    await delay(2000)
    if (txt == '') return logger.ERROR('Please fill video urls in links.txt')
    let dl_links = []
    logger.INFO(`Start Scraping all download media urls`)

    // start match urls, scrape download links 
    for (const name in plugins) {
        let modul = plugins[name]

        let urls = [...txt.matchAll(modul.pattern)].map(x => {
            return x[0]
        })
        await Promise.all(
            urls.map(async v => {
                if (v.match(modul.pattern)) {
                    const data = await modul.get(v)
                    if(Array.isArray(data)){
                        data.forEach(async (d) => {
                            const data = await modul.get(d)
                            dl_links.push(data)
                        })
                    } else if (data) {
                        dl_links.push(data)
                    }
                }
            })
        )
    }

    await delay(3000)
    logger.INFO(`Found Total ${dl_links.length} downloadable urls`)
    await delay(3000)
    logger.INFO(`Downloading...`)

    // Download all links to tmp dir
    const files = await Promise.all(
        dl_links.map(async v => {
            let headers = {}
            if (v.hasOwnProperty('headers')) {
                headers = v.headers
            }
            return await download(v.dl_link, join(tmp, v.title), { headers }).then(res => {
                return res
            }).catch(() => {
                return false
            })
        })
    )

    if (compress) {
        logger.INFO(`Compressing All Files to ${resultPath}`);

        // add files to zip entry
        files.filter(v => fs.existsSync(v)).forEach(v => {
            zip.addEntry(v)
        });

        // save
        zip.pipe(fs.createWriteStream(resultPath))
        zip.on('close', () => {
            // unlink all downloaded files
            files.filter(v => fs.existsSync(v)).forEach(v => fs.unlinkSync(v))
        })
    }

    var finishTime = new Date()
    let success = files.filter(x => x).length
    let time = Duration(finishTime - startTime)
    logger.SUCCESS(`${compress ? 'Compressed' : 'Downloaded'} ${success} of ${dl_links.length} files in ${time.minutes > 0 ? time.minutes + ' minutes, ' : ''}${time.seconds} seconds`)
})()

// (async () => {
//     logger.INFO(`Found Total ${urls.length} urls`)
//     // Download all links to tmp dir
//     const files = await Promise.all(
//         urls.map(async v => {
//             return await download(v.link, join(tmp, v.code)).then(res => {
//                 return res
//             }).catch(() => {
//                 return false
//             })
//         })
//     )

//     if (compress) {
//         logger.INFO(`Compressing All Files to ${resultPath}`);

//         // add files to zip entry
//         files.filter(v => fs.existsSync(v)).forEach(v => {
//             zip.addEntry(v)
//         });

//         // save
//         zip.pipe(fs.createWriteStream(resultPath))
//         zip.on('close', () => {
//             // unlink all downloaded files
//             files.filter(v => fs.existsSync(v)).forEach(v => fs.unlinkSync(v))
//         })
//     }

//     var finishTime = new Date()
//     let success = files.filter(x => x).length
//     let time = Duration(finishTime - startTime)
//     logger.SUCCESS(`${compress ? 'Compressed' : 'Downloaded'} ${success} of ${urls.length} files in ${time.minutes > 0 ? time.minutes + ' minutes, ' : ''}${time.seconds} seconds`)
// })()