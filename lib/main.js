/*! This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

"use strict";

const sec = 1000;
const DURATION=10*sec;

console.log("Addon is running!");

//test - has the addon started?
let obs_svc = require("observer-service");
let {prefs} = require("simple-prefs");
let tabs = require("tabs")

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

let micropilot = require("micropilot");
let mtp = micropilot.Micropilot('ctp-micropilot');
mtp.start()
mtp.record({msg:"We're recording!",data:"datablob",ts:Date.now()});
mtp.watch(topics);
mtp.lifetime(DURATION).then(function(s){
	s.data().then(function(d){
		jsondump(d);
		mtp.ezupload({
			'killaddon': true})
		//micropilot.killaddon() // remove the addon.
	});
})

/*
topics.forEach(
  function(t){
    obs_svc.add(t, function(subj, data){
      console.log(JSON.stringify({msg:t,data:data,ts:Date.now()}))
    })
})*/

//test - can we write to global observer service and pick up the message?
//obs_svc.notify('final-ui-startup', 'Passed a message on final-ui-startup!');


/* ui */
let getUserEmail = function(){
	// if we don't have it?
	console.log(require("self").data.url("email.html"))
	let p = require("sdk/panel").Panel({
		contentURL: require("self").data.url("email.html"),
		width: 300,
		height: 300
	});
	p.port.on('useremail',function(data){
		console.log("got email!")
		mtp.record({ts: Date.now(), "msg": "useremail", "data": data.email})
		p.destroy();
		storage.hasemail = true;
	})
	p.show();
}

// pref is just to pop up the ui. no storage
require("sdk/simple-prefs").on("getuseremail", getUserEmail);


function main(){
	// if email pref is unset, make them set it?
	// prove that recording works?
	//
	if (! storage.hasemail) getUserEmail();
}

exports.main = main;



