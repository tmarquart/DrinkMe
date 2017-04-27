// documentation http://kripken.github.io/sql.js/documentation/#http://kripken.github.io/sql.js/documentation/class/Database.html

var sql = require('sql.js');
// or sql = window.SQL if you are in a browser 
 
// Create a database 
var db = new sql.Database();
// NOTE: You can also use new sql.Database(data) where 
// data is an Uint8Array representing an SQLite database file 
 
// Execute some sql 
var sqlstr = "CREATE TABLE hello (a int, b char);";
sqlstr += "INSERT INTO hello VALUES (0, 'hello');";
sqlstr += "INSERT INTO hello VALUES (1, 'world');";
sqlstr += "INSERT INTO hello VALUES (2, 'world');";
db.run(sqlstr); // Run the query without returning anything 

var valObj={a:3,b:'k'};
var sqlstr3=addItem(valObj,'hello');
//db.run("INSERT INTO hello (a,b) VALUES (3,'k');");
db.run(sqlstr3)

var sqlstr2 = "CREATE TABLE joind (ak int, q char);";
sqlstr2 += "INSERT INTO joind VALUES (0, 'x');";
sqlstr2 += "INSERT INTO joind VALUES (1, 'y');";
sqlstr2 += "INSERT INTO joind VALUES (2, 'z');";

db.run(sqlstr2);

var queryStr="SELECT * FROM hello LEFT JOIN joind on hello.a=joind.ak";

var qryd=db.exec(queryStr)
console.log(JSON.stringify(qryd[0].values));

var sumd=db.exec("SELECT SUM(a) as TOTAL FROM hello GROUP BY b")
console.log(JSON.stringify(sumd))

var res = db.exec("SELECT * FROM hello");
/*
[
    {columns:['a','b'], values:[[0,'hello'],[1,'world']]}
]
*/
//console.log(res);
//console.log(res[0].values[0])
 
// Prepare an sql statement 
var stmt = db.prepare("SELECT * FROM hello WHERE a=:aval AND b=:bval");
//console.log(stmt)
// Bind values to the parameters and fetch the results of the query 
var result = stmt.getAsObject({':aval' : 1, ':bval' : 'world'});
console.log(result); // Will print {a:1, b:'world'} 
 
// Bind other values 
stmt.bind([0, 'hello']);
while (stmt.step()) console.log(stmt.get()); // Will print [0, 'hello'] 
 
// You can also use javascript functions inside your SQL code 
// Create the js function you need 
function add(a, b) {return a+b;}
// Specifies the SQL function's name, the number of it's arguments, and the js function to use 
db.create_function("add_js", add);
// Run a query in which the function is used 
db.run("INSERT INTO hello VALUES (add_js(7, 3), add_js('Hello ', 'world'));"); // Inserts 10 and 'Hello world' 
 
// free the memory used by the statement 
stmt.free();
// You can not use your statement anymore once it has been freed. 
// But not freeing your statements causes memory leaks. You don't want that. 
 
// Export the database to an Uint8Array containing the SQLite database file 
var binaryArray = db.export();
console.log(binaryArray)

test=Object.keys(valObj)

console.log(test)
console.log(valObj[test[1]])

addItem(valObj,'hello');

function addItem(inputObj, tableName){
    var sqlstr= "INSERT INTO " + tableName + " ("
    var tblKeys=Object.keys(inputObj);
    //creates arrays of keys and values
    var vals=tblKeys.map(function(item){
        return inputObj[item];
    });

    tblKeys.forEach(function(item){
        //sqlstr+="'" + item+"',";
        sqlstr+=item+',';
    });

    sqlstr=sqlstr.slice(0,-1); //remove comma
    sqlstr=sqlstr+') VALUES (';

    vals.forEach(function(item){
        sqlstr+=JSON.stringify(item)+',';
    });
    sqlstr=sqlstr.slice(0,-1); //remove comma
    sqlstr+=');';
    console.log(sqlstr);
    return sqlstr;
}