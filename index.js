const express = require('express')
const app = express()
const Crawler = require("crawler");
let $;
// = require("jquery");

const c = new Crawler({
	maxConnections: 10,
	// This will be called for each crawled page
	callback: function (error, res, done) {
		if (error) {
			console.log(error);
		} else {
			var $ = res.$;
			// $ is Cheerio by default
			//a lean implementation of core jQuery designed specifically for the server
			console.log($("title").text());
		}
		done();
	}
});

let cache = []
const JSONStringifyCallback = (key, value) => {
	if (typeof value === 'object' && value !== null) {
		if (cache.indexOf(value) !== -1) {
			// Duplicate reference found, discard key
			return;
		}
		// Store value in our collection
		cache.push(value);
	}
	return value;
}

const doCrawling = (req, res) => {
	c.queue([{
		uri: 'https://www.npmjs.com/package/express',

		// The global callback won't be called
		callback: function (error, response, done) {
			$ = response.$;
			if (error) {
				console.log(error);
			} else {

				getPageLinks(response.body, "a", /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/, async (links, parsedPages) => {
					const allLinks = [...JSON.parse(JSON.stringify(links, JSONStringifyCallback))];
					const allParsedPages = [...JSON.parse(JSON.stringify(parsedPages, JSONStringifyCallback))]
					const allLinksArray = Object.keys(allLinks).filter((tag, index) => index)
					for (let idx = 0; idx < 10; i++) {

					}
					res.send({
						links: allLinks,
						parsedPages: allParsedPages
					})
				})
			}
			done();
		}
	}]);
}


const getPageLinks = async (data, selector, regex, callback) => {
	let parsedPages = [];
	let url = '';
	var links = await $(selector, data)				// jquery context is our response data
		.filter(function () {
			return this.href.match(regex);      // without an href matching our regex
		})

	if (url.lastIndexOf('?') != -1) {
		url = url.substr(0, url.lastIndexOf('?')); // some weird querystring gets added i don't want
	}

	parsedPages.push(url);  			// watchin' our tracks
	callback(links, parsedPages);
}

app.get('/', (req, res) => { res.send('Hello World') })

app.get('/do-crawling', doCrawling)


app.listen(3000)