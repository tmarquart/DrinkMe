var sql = require('sql.js');
var fs = require('fs');
// or sql = window.SQL if you are in a browser 

// Create a database 

//function initializeDB()

//Create new DB

var dbObj={};
var db;
//var Username=1000000*Math.floor(Math.random());
//Username=Username.toString();
var Username='User1';
var BarID='MuddyCharles';
//var BaseChannel='DrinkMe/' + BarID + '/' + Username +'/';

//MQTT
var mqtt = require('mqtt');

var client = mqtt.connect('mqtt://107.170.38.244', 8083);
client.on('connect', function () {
    console.log('connected');
    client.subscribe('chat');
    client.subscribe('DrinkMe/#');
});


client.on('message', function (topic, msg) {
    console.log(msg.toString());
    //var newobj=JSON.parse(msg.toString());
    var msgStr=msg.toString();
    var topicArr=topic.split('/');
    var UsernameID=topicArr.splice(2,1);
    var exUser=topicArr.join('/');
    console.log(JSON.stringify(topicArr));
    console.log(topic);
    //if (newobj.command=='getMenu'){
    if (exUser=='DrinkMe/MuddyCharles/getMenu/request'){
        console.log('GET MENU!');
        //console.log(msg.data);
        client.publish(topic.replace('request','response'),JSON.stringify(getDrinksList(msgStr)));
    }
    if (exUser=='DrinkMe/MuddyCharles/addDrink/request'){
        LoadDB();
        addToCart({CustomerID:UsernameID[0],BarID:BarID,ItemID:msgStr});
        var out=db.exec("SELECT * FROM OrderDetail;");
        console.log(JSON.stringify(out));
        SaveDB();
    }
    if (exUser=='DrinkMe/MuddyCharles/getCart/request'){
        LoadDB();
        var cart = getCart(msgStr);
        console.log(msgStr);
        client.publish(topic.replace('request','response'),JSON.stringify(cart));
        SaveDB();
    }
    //if (topic==BaseChannel)
    //console.log(newobj);
    //console.log(newobj.ItemID)
});
//{command:string, data:[{},{}]}




function NewDB(){
    db = new sql.Database();
    var sqlstr = initialDBString();
    db.run(sqlstr);
}

function LoadDB(){
    var filebuffer = fs.readFileSync('filename.sqlite');
    db = new sql.Database(filebuffer);
}

function getDrinksList(BarID){
    NewDB();
    var arr=db.exec('SELECT * FROM ItemDetails WHERE BarID="' + BarID + '";');
    console.log(JSON.stringify(arr));
    SaveDB();
    return objectify(arr);
}


 var testOrder = { ItemID: 1, CustomerID: 2, BarID: 1 };
 //console.log(JSON.stringify(testOrder)); //
// addToCart(testOrder);
// checkout(1);
//var out = db.exec('SELECT * FROM OrderDetail LEFT JOIN Orders ON OrderDetail.OrderID=Orders.OrderID;');
//console.log(JSON.stringify(out));

//var out=getBarActiveOrders(1);

// main('checkout',{CustomerID:1});
// var out=main('getBarActiveOrders',testOrder);

// var objarrtest = JSON.stringify(objectify(out));
// console.log(objarrtest);

//Save DB
function SaveDB(){
    var data = db.export();
    var buffer = new Buffer(data);
    fs.writeFileSync('./filename.sqlite', buffer);
}
//functions
function main(cmd, obj){

    if (cmd=='getBarActiveOrders'){
        return getBarActiveOrders(obj.BarID);
    } else if(cmd=='checkout'){
        checkout(obj.CustomerID);
    }

}

function getBarActiveOrders(BarID){
    var sqlstr=('SELECT * FROM Orders LEFT JOIN OrderDetail ON OrderDetail.OrderID=Orders.OrderID WHERE Orders.BarID=' + BarID +  ';');
    console.log(sqlstr);
    var output=db.exec(sqlstr);
    return output;
}

function checkout(CustomerID){
    db.run('UPDATE Orders SET OrderStatus="Active", OrderTime=' + Date.now() + ' WHERE CustomerID=' + CustomerID + ';');
}

function setComplete(OrderID){
    db.run('UPDATE Orders SET OrderStatus="Active", OrderTime=' + Date.now() + ' WHERE OrderID=' + OrderID + ';');
}

function getCart(CustomerID){
    return db.exec('SELECT * FROM OrderDetail LEFT JOIN Orders ON OrderDetail.OrderID=Orders.OrderID WHERE CustomerID="' + CustomerID +  '";')
}

function addToCart(inputs) {
    //inputs - drinkID, customerID, BarID

    //see if an order exists
    var testsql = 'SELECT OrderID FROM Orders WHERE CustomerID="' + inputs.CustomerID + '" AND OrderStatus="Pending";';
    var testout = db.exec(testsql);
    console.log(JSON.stringify(testout));
    console.log(testout.length);
    var orderID;
    if (testout.length == 0) {
        //create new order    
        var orderObj = { CustomerID: inputs.CustomerID, OrderStatus: 'Pending', OrderTime: Date.now(), BarID: inputs.BarID };
        var sqlstr = addItem(orderObj, 'Orders');
        db.run(sqlstr);
        orderID=db.exec('SELECT last_insert_rowid();')[0].values[0][0];
    } else {
        //use existing orderid
        orderID=testout[0].values[0][0]; //currently no testing to see if two open orders exist, which shouldnt happen
        console.log(orderID);
    }

    var orderItem={ItemID:inputs.ItemID, OrderID:orderID};
    var sqlstr2 = addItem(orderItem,'OrderDetail');
    console.log(sqlstr2);
    db.run(sqlstr2);
    //var orderID=db.exec('SELECT last_insert_rowid();');
    //console.log(JSON.stringify(orderID));

}

function addItem(inputObj, tableName) {
    var sqlstr = "INSERT INTO " + tableName + " ("
    var tblKeys = Object.keys(inputObj);
    //creates arrays of keys and values
    var vals = tblKeys.map(function (item) {
        return inputObj[item];
    });

    tblKeys.forEach(function (item) {
        //sqlstr+="'" + item+"',";
        sqlstr += item + ',';
    });

    sqlstr = sqlstr.slice(0, -1); //remove comma
    sqlstr = sqlstr + ') VALUES (';

    vals.forEach(function (item) {
        sqlstr += JSON.stringify(item) + ',';
    });
    sqlstr = sqlstr.slice(0, -1); //remove comma
    sqlstr += ');';
    //console.log(sqlstr);
    return sqlstr;
}

function objectify(inputTbl) {
    var objArr = [];
    var cols = inputTbl[0].columns;
    inputTbl[0].values.forEach(function (drink) { //if there are multiple items
        var tempObj = {};
        drink.forEach(function (parameter, i) {
            tempObj[cols[i]] = parameter;
        });
        objArr.push(tempObj);
    });

    return objArr;

}

function initialDBString() {

    var sqlstr = 'CREATE TABLE ItemDetails (ItemID INTEGER PRIMARY KEY, ItemName string, ItemCost float, BarID string, Type string, ItemDescription);';//, Price float';

    var firstDrink = { ItemName: 'Miller High Life', ItemCost: 1.50, BarID: 'MuddyCharles', Type: 'Beer', ItemDescription: 'Super cheap' };
    var drink2 = { ItemName: 'Bud Light', ItemCost: 2, BarID: 'MuddyCharles', Type: 'Beer', ItemDescription: 'Cheap' };
    sqlstr += addItem(firstDrink, 'ItemDetails');
    sqlstr += addItem(drink2, 'ItemDetails');

    //db.run(sqlstr);

    sqlstr += 'CREATE TABLE Bars (BarUsername string UNIQUE, BarName string, BarAddress string);';

    var muddies = { BarUsername: 'MuddyCharles', BarName: 'Muddy Charles', BarAddress: '123 Memorial Drive' };
    sqlstr += addItem(muddies, 'Bars');

    //db.run(sqlstr2);

    sqlstr += 'CREATE TABLE Users (Username string UNIQUE, FirstName string, LastName string, BankAcct integer);';
    var user1 = { Username: 'User1', FirstName: 'John', LastName: 'Smith', BankAcct: 1234 };
    var user2 = { Username: 'User2', FirstName: 'Jane', LastName: 'Doe', BankAcct: 5678 };
    sqlstr += addItem(user1, 'Users');
    sqlstr += addItem(user2, 'Users');

    //db.run(sqluser);

    sqlstr += 'CREATE TABLE OrderDetail (DetailID INTEGER PRIMARY KEY, ItemID integer, OrderID integer);';
    var orderdetail1 = { ItemID: 1, OrderID: 1};
    var orderdetail2 = { ItemID: 2, OrderID: 1};
    var orderdetail3 = { ItemID: 1, OrderID: 2};
    sqlstr += addItem(orderdetail1, 'OrderDetail');
    sqlstr += addItem(orderdetail2, 'OrderDetail');
    sqlstr += addItem(orderdetail3, 'OrderDetail');

    //db.run(sqldetails);

    sqlstr += 'CREATE TABLE Orders (OrderID INTEGER PRIMARY KEY, CustomerID string, OrderStatus string, OrderTime integer, BarID string);';
    var order1 = { CustomerID: 1, OrderStatus: 'Active', OrderTime: 1493127614062, BarID: 1 };
    var order2 = { CustomerID: 1, OrderStatus: 'Pending', OrderTime: 1493127614062, BarID: 1 };
    sqlstr += addItem(order1, 'Orders');
    sqlstr += addItem(order2, 'Orders');
    return sqlstr;
}

function channel2Obj(inputString){
    inputString.split('/');
}


