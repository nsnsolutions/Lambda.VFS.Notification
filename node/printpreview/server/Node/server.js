var express = require('express'); // Web Server
var cors = require('cors'); // For Soliving Cross Domain Calls
var bodyParser = require('body-parser');  
var exec = require('child_process').execFile; // Allows us to exec a child process 
var spawn = require('child_process').spawn;
var moment  = require('moment'); // Date formatting
var fs = require('fs'); // file management
var AWS = require('aws-sdk');  // AWS
var winston = require('winston'); // Logging

var cities = [{name: 'Delhi', country: 'India'}, {name: 'New York', country: 'USA'}, {name: 'London', country:'England'}];

var app = express.createServer();
var commandPacket;

AWS.config.loadFromPath('./config.json');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(cors());

app.get('/vfs/api/cities', function (request, response) {
	response.send(cities);
});

app.get('/vfs/api/products', function (request, response) {
	response.send(products);
});


/* 
	Dynamo Section -- Move to another file eventually
*/
app.get('/vfs/api/tables', function (request, response) {
	
	var db = new AWS.DynamoDB();	
	db.listTables(function(err, data) {
		response.send(data.TableNames);	
  		console.log(data.TableNames);
	});

});

app.get('/vfs/api/jobs', function (request, response) {
	
	

});


app.get('/vfs/api/commandpacket', function (request, response) {

	fs.readFile('..\\Files\\cp.json', 'utf8', function (err, data) {
  		if (err) throw err;
  		response.send(data);
	});
	
});

function execProcess(resultOutput) {
	
	console.log("Processing Command Packet");
	
	child = exec('C:\\VFS\\TestConsole\\VFS.TestConsole.exe', [commandPacket], function(error, stdout, stderr) {  
			
		resultOutput(stdout);
	
	});
	
}

app.post('/vfs/api/submitOrder', function (request, response, next ) {

	var logger = new winston.Logger();
	logger.info('VFS Recieved Command Packetinfo');

	commandPacket = JSON.stringify(request.body);

	execProcess(function (resultOutput) {
		
		//var html = "<html><body>Success</body></html>";
		//response.send(html)
		response.send(resultOutput);
		
	});
	
});

app.listen(process.env.PORT);


var products = [
    {
        "id": "1",
        "name": "Custom Email",
		"library": "Velocify",
        "category": "Custom Docs",
		"preview": "https://store.velma.com/Library/MMI/Email/EM-Z9JV7A_Preview.jpg",
		"thumb": "https://store.velma.com/Library/MMI/Email/EM-Z9JV7A_Thumb.jpg",
		"sku": "NCSF-B8UJ39"
    },
    {
        "id": "2",
        "name": "Custom Flyer",
		"library": "Velocify",
        "category": "Client Marketing",
		"preview": "https://store.velma.com/Library/MMI/Print/Flyer/FLY1-SGWZC3_Preview.jpg",
		"thumb": "https://store.velma.com/Library/MMI/Print/Flyer/FLY1-SGWZC3_Thumb.jpg",
		"sku": "NCFF-BHEJ39"
    },
    {
        "id": "3",
        "name": "Referral Request",
		"library": "Velocify",
        "category": "Education",
		"preview": "https://store.velma.com/Library/Velma/Print/Postcard/PCSM-ZAHUZM_Preview.jpg",
		"thumb": "https://store.velma.com/Library/Velma/Print/Postcard/PCSM-ZAHUZM_Thumb.jpg",
		"sku": "ASSF-B8HYJ3"
    },
    {
        "id": "4",
        "name": "Time Running Out",
		"library": "Velocify",
        "category": "Loan Process",
		"preview": "https://store.velma.com/Library/Velma/Print/Postcard/PCSM-8CEJAV_Preview.jpg",
		"thumb": "https://store.velma.com/Library/Velma/Print/Postcard/PCSM-8CEJAV_Thumb.jpg",
		"sku": "NCSF-ED8UJ39"
    },
    {
        "id": "5",
        "name": "Annual Mortgage Review",
		"library": "Velocify",
        "category": "Mortgage",
		"preview": "https://store.velma.com/Library/Velma/Print/Postcard/PCSM-B8BBWL_Preview.jpg",
		"thumb": "https://store.velma.com/Library/Velma/Print/Postcard/PCSM-B8BBWL_Thumb.jpg",
		"sku": "HUSF-44UJ39"
    },
    {
        "id": "6",
        "name": "Refi Card",
		"library": "Velocify",
        "category": "Client Marketing",
		"preview": "https://store.velma.com/Library/Velma/Print/Postcard/Y6I8II_Preview.jpg",
		"thumb": "https://store.velma.com/Library/Velma/Print/Postcard/Y6I8II_Thumb.jpg",
		"sku": "PLSF-gggJ39"
    },
    {
        "id": "7",
        "name": "Count on Me",
		"library": "Velocify",
        "category": "Client Marketing",
		"preview": "https://store.velma.com/Library/Velma/Print/Postcard/32X70B_Preview.jpg",
		"thumb": "https://store.velma.com/Library/Velma/Print/Postcard/32X70B_Thumb.jpg",
		"sku": "NGYF-B8UJ39"
    },
    {
        "id": "8",
        "name": "Happy Birthday",
		"library": "Velocify",
        "category": "Graduation",
		"preview": "https://store.velma.com/Library/Velma/Email/EM-LVDF34_Preview.jpg",
		"thumb": "https://store.velma.com/Library/Velma/Email/EM-LVDF34_Thumb.jpg",
		"sku": "ARSF-GHJ39"
    },
    {
        "id": "9",
        "name": "Thank You",
		"library": "Velocify",
        "category": "Client Marketing",
		"preview": "https://store.velma.com/Library/WJBradley/Print/Notecards/B8UJ39_Preview.jpg",
		"thumb": "https://store.velma.com/Library/WJBradley/Print/Notecards/B8UJ39_Thumb.jpg",
		"sku": "NCSF-B8UJ39"
    }
];