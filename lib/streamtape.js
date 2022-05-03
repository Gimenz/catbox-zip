const { default: axios } = require("axios");
const pattern = /https:\/\/s(?:tr)?(?:eam)?(?:ta?p?e?|cloud)\..*?\/[ev]\/([a-zA-Z0-9]+)/gim

module.exports = {
    pattern,
    async get(url) {
        url = pattern.exec(url)[0]
        const { data } = await axios.get(url);

        let size = /<p class="subheading">(.*?)<\/p>/.exec(data)[1]
        let dl_link = 'https:' + eval(/\('norobotlink'\)\.innerHTML = (.*?);/.exec(data)[1])
        // https://streamadblockplus.com/get_video?id=DzoKv20qddFkpgB&expires=1651659220&ip=F0SSKRWNDy9XKxR&token=pXKQP167CHnp&dl=1
        return {
            title: /<h2>(.*?)<\/h2>/.exec(data)[1],
            size,
            dl_link
        };
    }
}