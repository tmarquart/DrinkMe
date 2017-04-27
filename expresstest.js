var express  = require('express');
var app      = express();
var path=require('path');

app.get('/', function(req, res){ 
    // YOUR CODE
    //res.send('<html><script>console.log("Hello!!!")</script></html>'); //works
    res.send('./mainpage.html');
});

app.get('/users/', function(req, res){
	// YOUR CODE
res.sendFile(path.join(__dirname+'/mainpage.html'));
});

// number of users
app.get('/users/peter', function(req, res){
	// YOUR CODE
    var peter={
        name:'peter parker',
        email:'peter@mit.edu'
    };
res.send(peter);

});

app.listen(3000,function(){
	console.log('Running on port 3000!');
});