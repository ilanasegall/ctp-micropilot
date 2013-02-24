/*! This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

"use strict";

const sec = 1000;
// gross that these are 'lets', but allows overrides in static-args
let DURATION = 86400*7*sec;
let UPLOADINTERVAL = 86400*sec; // TODO (glind) could be a pref, in fancy world?
let UPLOADURL = 'https://metrics.mozilla.com/test.php';


console.log("Addon is running!");

//test - has the addon started?
let obs_svc = require("observer-service");
let {prefs} = require("simple-prefs");
let tabs = require("tabs")
let micropilot = require("micropilot");

let mtp;  // grumble, put this up in scope, so UNLOAD can see it.

/* utils */
let jsondump = function(thing){
	console.log(JSON.stringify(thing,null,2));
}

// storeage of study specific data
let {storage} = require("simple-storage");
storage.hasemail = false;

// prefs to 'show all recording events'
prefs["micropilotlog"] = true;
prefs["sdk.console.logLevel"] = 0;


//tabs.open("chrome://global/content/console.xul")



//all ctp topics
let topics = ['clicktoplay-instance-created', 'clicktoplay-instance-started',
			'clicktoplay-instance-stopped', 'clicktoplay-inpage-activate', 'clicktoplay-inpage-settings',
			'clicktoplay-inpage-close', 'clicktoplay-inpage-context', 'clicktoplay-inpage-context-activate',
			'clicktoplay-inpage-context-close', 'clicktoplay-doorhanger-icon', 'clicktoplay-doorhanger-dropdown',
			'clicktoplay-doorhanger-activate', 'clicktoplay-doorhanger-activeateall',
			'clicktoplay-doorhanger-activatealways', 'clicktoplay-doorhanger-activatenever',
			'clicktoplay-instance-scripted', 'flashplugin-perfstats', 'plugin-started',
			'plugin-stopped', 'plugin-crashed-log', 'plugin-crash-submitted'];

let startStudy = function(duration,url){
	let mtp = micropilot.Micropilot('ctp-micropilot');
	mtp.start();
	mtp.record({msg:"We're recording!",data:"datablob",ts:Date.now()});
	mtp.watch(topics);
	mtp.lifetime(duration).then(function(s){
		s.data().then(function(d){
			jsondump(d);
			mtp.ezupload({
				'url': url,
				'killaddon': true})
		});
	})
	return mtp
}


/*
topics.forEach(
  function(t){
    obs_svc.add(t, function(subject, data){
      console.log(JSON.stringify({msg:t,subject:subject, data:data,ts:Date.now()}))
    })
})*/

//test - can we write to global observer service and pick up the message?
//obs_svc.notify('final-ui-startup', 'Passed a message on final-ui-startup!');


/* ui */
let getUserEmail = function(study){
	// if we don't have it?
	console.log(require("self").data.url("email.html"))
	let p = require("sdk/panel").Panel({
		contentURL: require("self").data.url("email.html"),
		width: 300,
		height: 300
	});
	p.port.on('useremail',function(data){
		console.log("got email!")
		study.record({ts: Date.now(), "msg": "useremail", "data": data.email})
		p.destroy();
		storage.hasemail = true;
	})
	p.show();
}

// pref is just to pop up the ui. no storage
require("sdk/simple-prefs").on("getuseremail", getUserEmail);


/* Fuse based recurrent upload*/
let uploadrecur= function(study,interval,url){
  if (! storage.lastupload) storage.lastupload = Date.now(); // tied to addon
  micropilot.Fuse({start: storage.lastupload, duration:interval}).then(
    function(){
      micropilot.microlog("mircopilot-recur-upload: fuse wants to upload");
      storage.lastupload = Date.now();
      study.upload(url).then(function(response){
		micropilot.microlog("micropilot-upload-response", response.text);
      });
      uploadrecur(study,interval,url); // call it again.
    })
};


function main(options,callbacks){
	//https://addons.mozilla.org/en-US/developers/docs/sdk/1.9/dev-guide/tutorials/load-and-unload.html
	let reason = options.loadReason;
	let {duration,uploadurl,uploadinterval} = options.staticArgs;

	DURATION = duration * sec || DURATION;
	UPLOADINTERVAL = uploadinterval * sec || UPLOADINTERVAL;
	UPLOADURL = uploadurl || UPLOADURL;

	console.log("DURATION:", DURATION);
	console.log("UPLOADURL:", UPLOADURL);
	console.log("UPLOADINTERVAL:", UPLOADINTERVAL);

	mtp = startStudy(DURATION,UPLOADURL)
	mtp.record({ts:Date.now(),msg: "addon-main", data:{"reason": reason} });
	uploadrecur(mtp,UPLOADINTERVAL,UPLOADURL);

	if (! storage.hasemail) getUserEmail(mtp);
}

exports.onUnload = function(reason){
	// note: won't catch unintall, just disable, shutdown, etc.
	// mtp must already exist.
	mtp.record({ts:Date.now(),msg: "addon-unload", data:{"reason": reason} });
}

exports.main = main;



