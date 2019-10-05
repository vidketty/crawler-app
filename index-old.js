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
				let links = [], pages = [];
				links = await getLinks(bodyStr, links);
				pages = await getLinksPages(links);
				res.send({
					links,
					pages
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

const getLinksPages = async (links) => {
	let matchedWordPages = [];
	const reviewedLinks = []
	const queue = [];
	return new Promise((reject ,resolve) => {
		for(let i = 0; i < links.length; i++) {
			const link = links[i];
			queue.push({
				uri: `https://www.chevron.com${link}`,
				jQuery: false,
				// The global callback won't be called
				callback: async (error, response, done) => {
					if (error) {
						console.log(error);
					} else {
						let bodyString = response.body;
						const hasWord = await findMatchWord(bodyString);
						if(hasWord) {
							matchedWordPages.push(`https://www.chevron.com/${link}`)
						}
					}
					reviewedLinks.push(`https://www.chevron.com/${link}`);
					if(reviewedLinks.length === [...links].length){
						resolve(matchedWordPages)
					}
					done();
				}
			});
		}
		c.queue(queue)
	})
}

const findMatchWord = async(bodyString, matchedWordPages) => {
	return bodyString.toLowerCase().indexOf('iot') !== -1;
	// $(bodyString).find("p").each(((index, element) => {
	// 	console.log('91---element: ', element);
	// 	if(element && element.children && element.children.length && element.children[0].data) {
	// 		console.log('92---element.children[0].data: ', element.children[0].data);
	// 		// Inside this if we will get the matched IoT element p tag of the page
	// 		if(element.children[0].data.includes("IoT")) {
	// 			console.log('94->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>String Contains IOT-----');
	// 		}
	// 	}
	// }));
	// return matchedWordPages;
}

app.get('/', (req, res) => { res.send('Hello World') })

app.get('/do-crawling', doCrawling)


app.listen(3000)