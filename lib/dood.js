const { default: axios } = require("axios");
const pattern = /https?:\/\/(?:www\.)?dood\.(?:.+?)\/.+?\/([a-z0-9]+)/gim
//const baseURL = 'https://dood.so'

module.exports = {
    pattern,
    async get(url) {
        try {
            //const id = pattern.exec(url)[0]

            //Dood only works on .so / .sh domain
            if (!/\.(so|sh)\//.test(url)) {
                url = url.replace(/\.(.*?)\//, '.so/');
            }
            
            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.41 Safari/537.36',
                'Referer': url
            }

            const baseURL = new URL(url).origin
            if (!/\/(e|f)\//.test(url)) {
                const get_iframe = await axios.get(url, { headers })
                const iframe = baseURL + /<iframe src="(.*?)"/.exec(get_iframe.data)[1]
                url = iframe
            } else if (/\/f\//.test(url)) {
                const get_single = await axios.get(url, { headers })
                const regexp = /"(https:\/\/dood\.(.*?)\/(.*?)\/(.*?))"/g;
                const str = get_single.data;
                const all_single = [...str.matchAll(regexp)].map(x => {
                    return x[1]
                })
                url = all_single
            }

            if(Array.isArray(url)) return url

            const get_md5 = await axios.get(url, { headers })


            if (/<title>Video not found \| DoodStream<\/title>/.test(get_md5.data)) return false

            let title = /<title>(.*?)<\/title>/.exec(get_md5.data)[1]
            let pass_md5 = '/pass_md5/' + /\$\.get\('\/pass_md5\/(.*?)',/.exec(get_md5.data)[1]
            const token = pass_md5.slice(pass_md5.lastIndexOf('/')).substring(1)
            const md5 = await axios.get(baseURL + pass_md5, { headers })

            // from dood.to
            function makePlay(token) {
                for (var a = "", t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", n = t.length, o = 0; 10 > o; o++) a += t.charAt(Math.floor(Math.random() * n));
                return a + "?token=" + token + "&expiry=" + Date.now();
            };

            const media_url = md5.data + makePlay(token)

            let json = {
                title,
                dl_link: media_url,
                headers,
                media_file: async function () {
                    const { data } = await axios.get(media_url, {
                        headers,
                        responseType: 'arraybuffer'
                    })
                    return data
                }
            }
            return json
        } catch (error) {
            return false
        }
    }
}