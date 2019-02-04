process.on( "unhandledRejection" , function( reason , p ) {
	console.error( reason, "Unhandled Rejection at Promise" , p );
	console.trace();
});
process.on( "uncaughtException" , function( err ) {
	console.error( err , "Uncaught Exception thrown" );
	console.trace();
});

const cheerio = require( "cheerio" );
const RMU = require( "redis-manager-utils" );
var MyRedis = null;
const R_Key = "DISCOVERCLASSICAL.SONGS";
const sleep = require( "./generic_utils.js" ).sleep;
const MAKE_REQUEST = require( "./generic_utils.js" ).makeRequest;
//const MAKE_REQUEST = require( "./generic_utils.js" ).makeRequestWithPuppeteer;
//const YOUTUBE = require( "./youtube_utils.js" );
//const SPOTIFY = require( "./spotify_utils.js" );


function get_secondary_playlist( url , day , month , year ) {
	return new Promise( function( resolve , reject ) {
		try {
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

const base_url = "http://www.discoverclassical.org/DPRPlayList/events.asp?date=";
function get_daily_playlist( day , month , year ) {
	return new Promise( async function( resolve , reject ) {
		try {
			let url = base_url + month.toString() + "%2F" + day.toString() + "%2F" + year.toString();
			let body = await MAKE_REQUEST( url );
			try { var $ = cheerio.load( body ); }
			catch( err ) { resolve( false ); return; }

			let main_container = $( "dl.wrapper_dropcap-list.dropcap-no-circle" );
			let items = $( main_container ).children();
			for  ( let i = 0; i < items.length; ++i ) {
				let track_info = $( items[ i ] ).children();
				let title = $( track_info[ 0 ] ).text().trim();
				if ( title === "Music Overnight" ) { continue; }
				let result = {};
				let secondary_hosted = $( track_info[ 1 ] );
				if ( $( secondary_hosted ).attr( "href" ) ) {
					result.secondary_url = $( secondary_hosted ).attr( "href" );
					// console.log( "Secondary Hosted Playlist" );
					// console.log( result.secondary_url );
					//result = await get_secondary_playlist( result.secondary_url , day , month , year );
				}
				else {
					let text = $( items[ i ] ).text();
					if ( !text ) { continue; }
					text = text.split( "\n" );
					text = text.map( x => x.trim() );
					text = text.filter( x => x !== "" );
					if ( text.length < 2 ) { continue; }
					result.title = title;
					result.artist = text[ 1 ].split( "Composer:" )[ 1 ].split( "Performers:" )[ 0 ].trim();
					result.performers = text[ 1 ].split( "Performers:" )[ 1 ].split( "Label:" )[ 0 ].trim();
					result.album = text[ 1 ].split( "Label:" )[ 1 ].split( "Length:" )[ 0 ].trim();
					if ( result.performers.length < 3 ) { result.performers = ""; }
					if ( result.album.length < 3 ) { result.album = ""; }
				}
				let db_id = result.title + "---" + result.artist + "---" + result.performers + "---" + result.album;
				let db_id_b64 = new Buffer.from( db_id );
				result.id = db_id_b64 = db_id_b64.toString( "base64" );
				let unique = await MyRedis.setIsMember( R_Key , result.id );
				if ( !unique || unique === "false" || unique === "0" ) {
					console.log( "New Song" );
					await MyRedis.setAdd( R_Key , result.id );
					//latest.push( result );
					//await YOUTUBE.addToPlaylist( result.search_string );
					//await SPOTIFY.addToPlaylist( result.title , result.artist );
					console.log( result );
				}
			}
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function getDaysArray( s , e ) {for(var a=[],d=s;d<=e;d.setDate(d.getDate()+1)){ a.push(new Date(d));}return a;};
function generate_range( start_day , end_day ) {
	let days = getDaysArray( start_day  , end_day );
	days = days.map( x => [ x.getUTCDate() , ( x.getUTCMonth() + 1 ) , x.getUTCFullYear() ] )
	return days;
}


( async ()=> {

	MyRedis = new RMU( 3 );
	await MyRedis.init();
	await sleep( 1000 );

	console.log( "WSWO Playlist Collector Restarted" );

	let start = new Date( "03/01/2018" );
	//let end = new Date( "02/31/2018" );
	let end = new Date();
	let days = generate_range( start , end );
	//console.log( days );

	for ( let i = 0; i < days.length; ++i ) {
		await get_daily_playlist( days[ i ][ 0 ] ,  days[ i ][ 1 ] , days[ i ][ 2 ] );
		await sleep( 500 );
	}




	// setInterval( function() {
	// 	console.log( "Getting Latest Songs" );
	// 	get_last_20_songs();
	// } , 600000 );

})();