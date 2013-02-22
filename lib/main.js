"use strict";

let obs_svc = require("observer-service");
//let {prefs} = require("simple-prefs");
let prefs = require("simple-prefs");
let tabs = require("tabs")

prefs.prefs["micropilotlog"] = true;
prefs.prefs["sdk.console.logLevel"] = 0;

tabs.open("chrome://global/content/console.xul")

let mtp = require("./micropilot").Micropilot('ctp-micropilot');
mtp.start()

//get installed addons
var {Cu} = require("chrome");
var {AddonManager} = Cu.import("resource://gre/modules/AddonManager.jsm");

AddonManager.getAddonsByTypes(["extension"], function (addons) {
  addons.forEach(function (addon) {
    console.log(addon.name + " " + addon.version);
  });
});

//test - has the addon started?
mtp.record({msg:"We're recording!",data:"datablob",ts:Date.now()});

//all ctp topics
let topics = ['clicktoplay-instance-created', 'clicktoplay-instance-started',
			'clicktoplay-instance-stopped', 'clicktoplay-inpage-activate', 'clicktoplay-inpage-settings',
			'clicktoplay-inpage-close', 'clicktoplay-inpage-context', 'clicktoplay-inpage-context-activate',
			'clicktoplay-inpage-context-close', 'clicktoplay-doorhanger-icon', 'clicktoplay-doorhanger-dropdown',
			'clicktoplay-doorhanger-activate', 'clicktoplay-doorhanger-activeateall', 
			'clicktoplay-doorhanger-activatealways', 'clicktoplay-doorhanger-activatenever', 
			'clicktoplay-instance-scripted', 'flashplugin-perfstats', 'plugin-started', 
			'plugin-stopped', 'plugin-crashed-log', 'plugin-crash-submitted'];

topics.forEach(
  function(t){
    obs_svc.add(t, function(subj, data){
      mtp.record({msg:t,data:data,ts:Date.now()})
    })
})

function onPrefChange(prefName) {
    //mtp.record(prefs["firstname"]);
    console.log(prefs.prefs["firstname"]);
}
prefs.on("firstname", onPrefChange);

/*mtp.lifetime(5000).then(function(mtp){ 
	mtp.data().then(
		function(data) {
			console.log(JSON.stringify(data,null,2));
		}
	);
})*/

mtp.lifetime(3000).then(function(recorded_data){
	//recorded_data.ezupload();
	recorded_data.ezupload({url:"http://mango-gw.mango.metrics.scl3.mozilla.com", interval: 1000, killaddon:true});
})

//test - can we write to global observer service and pick up the message?
//obs_svc.notify('final-ui-startup', 'Passed a message on final-ui-startup!');