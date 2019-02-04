const request = require( "request" );
//const puppeteer = require( "puppeteer" );

function sleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }
module.exports.sleep = sleep;

function MAKE_REQUEST( wURL ) {
	return new Promise( async function( resolve , reject ) {
		try {
			request( { url: wURL , headers: { "Cache-Control": "private, no-store, max-age=0" } } , async function ( err , response , body ) {
				if ( err ) { resolve( false ); return; }
				console.log( wURL + "\n\t--> RESPONSE_CODE = " + response.statusCode.toString() );
				if ( response.statusCode !== 200 ) {
					//console.log( "bad status code ... " );
					resolve( false );
					return;
				}
				else {
					resolve( body );
					return;
				}
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.makeRequest = MAKE_REQUEST;


// function MAKE_REQUEST_WITH_PUPPETEER( wURL ) {
// 	// https://github.com/GoogleChrome/puppeteer/issues/822
// 	return new Promise( async function( resolve , reject ) {
// 		try {
// 			console.log( "Searching --> " + wURL );
// 			const browser = await puppeteer.launch( /* { args: [ "--disable-http2" ] } */ );
// 			const page = await browser.newPage();
// 			let response = await page.goto( wURL /* , { waitUntil: "networkidle2" } */ );
// 			let wBody = false;
// 			if ( response._status !== 404 ) {
// 				wBody = await page.content();
// 			}
// 			await browser.close();
// 			resolve( wBody );
// 		}
// 		catch( error ) { console.log( error ); reject( error ); }
// 	});
// }
// module.exports.makeRequestWithPuppeteer = MAKE_REQUEST_WITH_PUPPETEER;