const Apify = require('apify');
const util = require('util');
const puppeteer = require('Puppeteer');
const moment=require("moment");


// Important document to read
// https://www.jishuwen.com/d/2Wqd/zh-tw

// const eventData =  require('./helpers/eventData');
// const pageData = require('./helpers/pageData');
// const extractUrls = require('./helpers/extractUrls');
// const eventUrls = require('./helpers/eventUrls');
// const parseDate = require('./helpers/parseDate');
// https://github.com/apifytech/apify-js/blob/master/examples/puppeteer_crawler.js

// https://sdk.apify.com/docs/api/requestqueue#RequestQueue+getInfo

Apify.main(async () =>  {
	// Get the queue and enqueue the first url
	const requestQueue = await Apify.openRequestQueue(`FirstFolderForStorage`);
	await requestQueue.addRequest(new Apify.Request({ url: `https://www.visithoustontexas.com/events/` }));

	// error is hitting eventUrls & not continuing

	const crawler = new Apify.PuppeteerCrawler({
		requestQueue,
		// lets first get the urls
		// if we initially start with 0
		// lets add a page to continue get data from more pages
		handlePageFunction: async ({ request, page }) => {
			if (request.url === `https://www.visithoustontexas.com/events/`) {
				let urls = await eventUrls({ request, page });
				for (let x = 0; x < urls.length; x++) {
					// console.log(' I am here');
					await requestQueue.addRequest(new Apify.Request(urls[x]))
				}
			}
			else {
				// we're clear to obtain
				/// all the event data
				await eventData({ request, page });
			}
		},
		// If request failed 4 times then this function is executed.
		handleFailedRequestFunction: async ({ request, e }) => {
			console.log(`Request ${request.url} failed 4 times`);
			console.log(`error is ${e}, were in the handleFailedRequestFunction`);

			// await Apify.pushData({
			//   url: request.url,
			//   succeeded: false,
			//   errors: request.errorMessages,
			// })
			// console.log(`Request ${request.url} failed 4 times`);
		},
	});
	// Run crawler.
	await crawler.run();
}
);

function extractUrls( elements ) {
	let events = [];
	for (let x = 0; x < elements.length; x++) {
		events.push({ url: elements[x].href })
	}
	return events;
};

const eventUrls = async ({ page, request }) => {
	const requestQueue = await Apify.openRequestQueue('links');
	let links = [];
	// let requestQueue = await Apify.openRequestQueue();
	try {
		// await page.waitForSelector('a.arrow.next', 3000);
		await page.waitForSelector('medium-block-grid-2, li.eventItem.item, contentWrapper.two-col.clearfix a.arrow.next', 3000);
		let nextButton = await page.$eval('a.arrow.next', a => a.href);
		if (nextButton)

		// let events = await page.$$eval(`medium-block-grid-2, li.eventItem.item, contentWrapper.two-col.clearfix, a.arrow.next`, extractUrls);
		// links = links.concat(events);
		await page.waitFor(2200);

		this.requestQueue = await requestQueue.addRequest(new Apify.Request({ url: nextButton }));
		console.log(`nextButton added to queue`);
	}
	catch(e) {
		console.log(`error is ${e}, were in the 1st Catch`);
	};
	// can I set it to only get the 20 a tags on a page
	// or do not go below innerRow tag
	// after finding the correct 20 elements, map through them
	// to find each a tag
	try {
		const requestQueue = await Apify.openRequestQueue('links');
		// await page.waitForSelector('medium-block-grid-2, li.eventItem.item, contentWrapper.two-col.clearfix a.arrow.next', 3000);
		await page.waitForSelector('medium-block-grid-2, li.eventItem.item, contentWrapper.two-col.clearfix a.arrow.next', 3000);
		let nextButton = await page.$eval('a.arrow.next', a => a.href);
		// await this.requestQueue.addRequest(new Apify.Request(request[nextButton]));
		if (nextButton)
		this.requestQueue = await requestQueue.addRequest(new Apify.Request({ url: nextButton }));
		console.log(`secondNextButton added to Queue`);
		// let events = await page.$$eval(`li.eventItem.item`, extractUrls);
		// let events = await page.$$eval(`div.row, a.arrow.next`, extractUrls);
		// let events = await page.$$eval(`div li.eventItem.item, contentWrapper.two-col.clearfix, a.arrow.next`, extractUrls);
		let events = await page.$$eval(`a.arrow.next`, extractUrls);

		// console.log(`Events might have an ${e}`);
		// mesh the links with events
		links = links.concat(events);
		await page.waitFor(2200);
		console.log("events",events);
	}

	catch (e) {
		console.log(`error is ${e}, in 2nd catch`);
	};

	// console.log("The links are getting logged now", links);
	return links;
}


const eventData = async ({ page, request, e }) => {
	// Function to get data from page
	const titles =  await page.$$eval(`div.item-int .title`, a => a.map(el => el.innerText));
	console.log(titles);

	// get the title div
	// const title = await page.$$eval(``, pageData);
	// const date = await page.$$eval('div dates', pageData, 'div dates');
	const dates = await page.$$eval(`div.item-int .dates`, a => a.map(el => el.innerText));
	const descriptions = await page.$$eval(`div.item-int .desc`,  a => a.map(el => el.innerText));
	console.log(`${descriptions}`);
	const urls = request.url;
	const posts = await page.$$eval(`div.item-int`, a => a.map(el => el.innerText));
	const addresses = await page.$$eval('div adrs',  a => a.map(el => el.innerText));
	const timestamps = new Date().toUTCString();

	let events = [];
	/// ---------------------------------------------
	// PUT WHICH ITEM IN THE ARRAY I AM TALKING TO.
	// CURRENTLY, I AM NOT USING THE FOR LOOP CORRECTLY
-----------------------------------------------------------------
	for (x = 0; x < titles.length; x++) {
		events.push({
			title: titles,
			description: descriptions,
			url: urls,
			address: addresses,
		});
	}

	// const DEBG = process.env.DEBU === 'true' ? true : false;

	console.log(`Page ${request.url} succeeded and it has ${posts.length} posts.`);
	console.log(util.inspect(titles,false, null));
	console.log(titles);
	console.log(util.inspect(descriptions, false, null));
}

function parseDate(recurring) {
	const date = moment().format(`DD/MM/YYYY HH:MM:SS`);
	const




}


// https://www.youtube.com/watch?v=pixfH6yyqZk
// https://www.youtube.com/watch?v=IvaJ5n5xFqU
// https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md
