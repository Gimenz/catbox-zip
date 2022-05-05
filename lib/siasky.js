const { default: axios } = require("axios");
const pattern = /https:\/\/siasky\.net+?\/([a-zA-Z0-9._-]+)/gim

module.exports = {
    pattern,
    async get(url) {
        const x = pattern.exec(url)
        return {
            dl_link: `https://siasky.net/${x[1]}`,
            title: `${x[1]}`,
        }
    }
}