const express = require('express')
const app = express()
const Crawler = require("crawler");
let $;

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

const doCrawling = (req, res) => {
	c.queue([{
		uri: 'https://www.chevron.com',

		// The global callback won't be called
		callback: async (error, response, done) => {
			$ = response.$;
			if (error) {
				console.log(error);
			} else {
				let bodyStr = response.body;
				let links = []
				links = await getLinks(bodyStr, links);
				res.send({
					links
				})
			}
			done();
		}
	}]);
}

const getLinks = async (bodyStr, links) => {
	$(bodyStr).find("a[href!='javascript:void(0)']").each(((index, element) => {
		console.log(index, $(element).attr('href'));
		const link = $(element).attr('href');
		if (
			links.indexOf(link) === -1
			&& link.indexOf('#') !== 0
			&& link.indexOf('http://') === -1
			&& link.indexOf('https://') === -1
		) {
			links.push(link);
		}
	}));
	return links;
}

app.get('/', (req, res) => { res.send('Hello World') })

app.get('/do-crawling', doCrawling)


app.listen(3000)