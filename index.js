const express = require('express')
const app = express()
const Crawler = require("crawler");
let $;

const c = new Crawler({
	rateLimit: 100,
    maxConnections: 1,
	// This will be called for each crawled page
	callback: function (error, res, done) {
		if (error) {
			console.log('12--error>>>>>>', error);
		} else {
			var $ = res.$;
			// $ is Cheerio by default
			//a lean implementation of core jQuery designed specifically for the server
			console.log('17--res-->>>', $("title").text());
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
				console.log('30--error>>>>>>>>>>>>>', error);
			} else {
				let bodyStr = response.body;
				let links = [], pages = [];
				links = await getLinks(bodyStr, links);
				pages = await getLinksPages(links);
				res.send({
					links: links,
					mathcedPages: pages
				});
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

const getLinksPages = async (links) => {
	// console.log('63---links: ', links, typeof links);
	// console.log('64---links: ', links[0], typeof links[0]);
	let matchedWordPages = [];

	$(links).each((index, link) => {
		// console.log('67---index, link: ', index, link);
		c.queue([{
			uri: `https://www.chevron.com${link}`,
	
			// The global callback won't be called
			callback: async (error, response, done) => {
				$ = response.$;
				if (error) {
					console.log('74--error>>>>>>>>>>>>>', error);
				} else {
					let bodyString = response.body;
					matchedWordPages = await findMatchWord(`https://www.chevron.com${link}`, bodyString, matchedWordPages);
				}
				done();
			}
		}]);
	});
	return matchedWordPages;
}

const findMatchWord = async(pageLink, bodyString, matchedWordPages) => {
	if(bodyString.toLowerCase().indexOf("iot") !== -1) {
		matchedWordPages.push(pageLink);
	}
	console.log('0000------->>matchedWordPages: ', matchedWordPages);
	return matchedWordPages;
}

app.get('/', (req, res) => { res.send('Hello World') })

app.get('/do-crawling', doCrawling)


app.listen(3000)