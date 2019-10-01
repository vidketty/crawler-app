var Crawler = require("crawler");

var c = new Crawler({
	maxConnections: 10,
	// This will be called for each crawled page
	callback: function (error, res, done) {
		if (error) {
			console.log(error);
		} else {
			var $ = res.$;
			// $ is Cheerio by default
			//a lean implementation of core jQuery designed specifically for the server
			console.log('$("title").text()', $("title").text());
		}
		done();
	}
});


// Queue URLs with custom callbacks & parameters
c.queue([{
	uri: 'https://www.chevron.com/',

	// @TODO if jQuery not required. 
	// jQuery: false,

	// The global callback won't be called
	callback: function (error, res, done) {
		if (error) {
			console.log(error);
		} else {
			// $ you can $ for jQuery.
			const $ = res.$

			console.log(res.body);
		}
		done();
	}
}]);
