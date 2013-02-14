"use strict";

//test - has the addon started?
console.log("Addon is running!");

let obs_svc = require("observer-service");
let {prefs} = require("simple-prefs");
let tabs = require("tabs")

prefs["logtoconsole"] = true;

tabs.open("chrome://global/content/console.xul")

let mtp = require("./micropilot").Micropilot('ctp-micropilot');
mtp.start()

//all ctp topics
let topics = ['final-ui-startup', 'clicktoplay-instance-created', 'clicktoplay-instance-started',
			'clicktoplay-instance-stopped', 'clicktoplay-inpage-activate', 'clicktoplay-inpage-settings',
			'clicktoplay-inpage-close', 'clicktoplay-inpage-context', 'clicktoplay-inpage-context-activate',
			'clicktoplay-inpage-context-close', 'clicktoplay-doorhanger-icon', 'clicktoplay-doorhanger-dropdown',
			'clicktoplay-doorhanger-activate', 'clicktoplay-doorhanger-activeateall', 
			'clicktoplay-doorhanger-activatealways', 'clicktoplay-doorhanger-activatenever', 
			'clicktoplay-instance-scripted', 'flashplugin-perfstats', 'plugin-started', 
			'plugin-stopped', 'plugin-crashed-log', 'plugin-crash-submitted'];
			
topics.forEach(
  function(t){
    obs_svc.add(t, function(subj){
      mtp.record({msg:t,data:subj,ts:Date.now()})
    })
})

//test - can we write to global observer service and pick up the message?
obs_svc.notify('final-ui-startup', 'Passed a message on final-ui-startup!');