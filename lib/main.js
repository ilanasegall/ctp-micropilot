"use strict";
 

let monitor = require("micropilot").Micropilot('ctp_test');

monitor.watch(['final-ui-startup', 'clicktoplay-instance-created','clicktoplay-inpage-activate'])

monitor.data().then(function(data){console.log(JSON.stringify(data))})