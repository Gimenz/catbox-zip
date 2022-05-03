const fs = require('fs');
const path = require('path');

const Scandir = (dir) => {
	let subdirs = fs.readdirSync(dir)
	let files = subdirs.map((sub) => {
		let res = path.join(dir, sub)
		return fs.statSync(res).isDirectory() ? Scandir(res) : res
	});

	return files.reduce((a, f) => a.concat(f), [])
}

const pluginLoader = (dir) => {
	let pluginFolder = path.join(__dirname, dir)
	let pluginFilter = filename => /\.js$/.test(filename)

	let plugins = {}

	for (let filelist of Scandir(pluginFolder).filter(pluginFilter)) {
		filename = path.basename(filelist, '.js')
		try {
			plugins[filename] = require(filelist)
		} catch (e) {
			delete plugins[filename]
		}
	}
	return plugins
}

let plugins = pluginLoader('../lib');

module.exports = plugins;