var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var http = require('http');
var opn = require('opn');


var request = require('request');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({limit: '10mb'}));
app.use(function(req, res, next) {
 res.header("Access-Control-Allow-Origin", "*");
 res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
 res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, browser_id");
 next();
});
/*Server Array */
var serverSet = [
	{
	"url": "http://doesNotExist.kratikal.com",
	"priority": 1
	},
	{
	"url": "http://kratikal.com",
	"priority": 7
	},
	{
	"url": "http://offline.kratikal.com",
	"priority": 2
	},
	{
	"url": "http://google.com",
	"priority": 4
	}
	]
  

  function serverTest(url, priority) {
    //creates options to allow for request timeout
    var options = {
        url: url,
        timeout: 5000
    };
    return new Promise (
        function(resolve, reject) {
            request(options, function(err, res, body) {
                 //test if server responds with a positive status
                if (res !== undefined) {
                    if (res.statusCode >= 200 && res.statusCode <= 299) {
                        resolve({"url": url, "priority": priority});
                    } else
                    if (res.statusCode >= 300 && res.statusCode <= 399) {
                        reject("The server is not working");
                    } else
                    if (res.statusCode >= 400 && res.statusCode <= 499) {
                        reject("The server is broken");
                    }//==> end of inner if/else statement
                } else {
                    reject("Server is not responsive");
                }//==> end of outer if/else statement
            });//==> end of get request
        }
    );
};
  function findServer(servers) {
	var build = []
	var promises = servers.map(server => {
	  return serverTest(server.url, server.priority)
		.then(resolve => {
		  // Do your validation of resolve here
		  build.push(resolve)
		})
		.catch(error => {
		  // By using catch, you ensure this promise chain will continue to 
		  // resolve as long as you don't throw an error here or return another
		  // Promise that will reject
		  console.log("Server " + server.url + " failed with : " + error)
		})
	})
  
	return Promise.all(promises).then(values => {
	  // At this point you know that all your promises have resolved, and
	  // the successful ones have added an element to 'build'
	  return build
	});
  };
  // Route for get hit 
 app.get('/server', function(req,res){
	 findServer(serverSet)// call this function for get the lower priority url 
	.then(servelistArrary=>{
		if(servelistArrary.length<0){
			throw new Error('Data is not available in the given array!')
		}else if(servelistArrary.length === 1){// if length of array is 1 it will return 
			return servelistArrary[0]
		}else{
			for(let i = 0 ; i<servelistArrary.length;+i++ )// for loop for  iterate one by one of an array 
			{
				let outerelement = servelistArrary[i].priority//iterate priority 
				let outerelementurl = servelistArrary[i].url//iterate url 
				for(let j=i+1;j<servelistArrary.length;j++){//second loop for compaire the periority 
					let innerelement = servelistArrary[j].priority//iterate priority 
				    let innerelementurl = servelistArrary[j].url//iterate url 
					if(outerelement<innerelement){// if outerelement priority is less then innerelement priority 
						servelistArrary[i].priority = innerelement
						servelistArrary[i].url = innerelementurl
						servelistArrary[j].priority = outerelement
						servelistArrary[j].url = outerelementurl
						innerelement = servelistArrary[j].priority
						innerelementurl = servelistArrary[j].url
						outerelement = servelistArrary[i].priority
						outerelementurl = servelistArrary[i].url
					}
					
				}
				
			}
		}
		/*************for url run directly on chrom browser */
		// let url =  servelistArrary[0].url
		// opn(url);
		// opn(servelistArrary[0].url, {app: 'chrom'});
		res.send(servelistArrary[0])//return zero index which having lowest prioty index 
	})

} )

console.log('Hello World...!');

app.listen(8007, () => console.log('Example app listening on port 8007!'));
console.log('your server will be started');
