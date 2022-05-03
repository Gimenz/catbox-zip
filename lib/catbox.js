const { default: axios } = require("axios");
const pattern = /https:\/\/files\.catbox\.moe\/(.+?)\.(\w+|\d+)/gim

module.exports = {
    pattern,
    async get(url) {
        const x = pattern.exec(url)
        return {
            dl_link: `https://files.catbox.moe/${x[1]}.${x[2]}`,
            title: `${x[1]}.${x[2]}`,
        }
    }
}