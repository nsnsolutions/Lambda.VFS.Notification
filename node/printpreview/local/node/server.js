// Digital Ocean
// Javascript Enginer: V8 -- Fast 

var express = require('express');
var lodash = require('lodash');
var bodyParser = require('body-parser');
var exec = require('child_process').execFile; // Allows us to exec a child process 
var spawn = require('child_process').spawn;
var moment  = require('moment'); // Date formatting

var cities = [{name: 'Delhi', country: 'India'}, {name: 'New York', country: 'USA'}, {name: 'London', country:'England'}];


var app = express();
var commandPacket;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.listen(3000, function () {

		console.log("Listening on port 3000....");
	
});		

app.get('/api/cities', function (request, response) {
	
	response.send(cities);
	
});

app.get('/api/businesses/:id', function (request, response) {
	
	var id = request.params.id;
	
	var business = lodash.find(businesses, function(item) {
		
		return item.id = id;
	
	});
	
	response.send(business); 
	
});

app.get('/api/business/askforbyid/:id', function (request, response) {
	
	var id = request.params.id;
	
	console.log(request.params.id);
	
	var business = lodash.find(businesses, function(item) {
		
		return item.id == id;
	
	});
	
	response.send(business); 
	
});


function execProcess(resultOutput) {
	
	console.log("Processing Command Packet");
	
	child = exec('C:\\VFS\\TestConsole\\VFS.TestConsole.exe', [commandPacket], function(error, stdout, stderr) {  
			
		resultOutput(stdout);
	
	});
	
}

app.post('/submitOrder', function (request, response) {

    commandPacket = JSON.stringify(request.body);
	
	execProcess(function (resultOutput) {
		
		response.send(resultOutput);
		
	});
	
	
});

