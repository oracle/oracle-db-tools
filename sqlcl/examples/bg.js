// declare the 2 java files needed
var DriverManager = Java.type("java.sql.DriverManager");
var ScriptExecutor  = Java.type("oracle.dbtools.raptor.newscriptrunner.ScriptExecutor");

var BGsql="";
for(var i=1;i<args.length;i++){
  BGsql = BGsql + " " + args[i];
}

// Create a new connection to use for monitoring
// Grab the connect URL from the base connection in sqlcl
var jdbc = conn.getMetaData().getURL();
var user = 'klrice';
var pass = 'klrice';

runme(BGsql);

//
// running the actual sql
//
function main(arg){
	function inner(){
    // make a new connect
		var conn2  = DriverManager.getConnection(jdbc,user,pass);		
		var sqlcl2 = new ScriptExecutor(conn2);		
		
		sqlcl2.setStmt(arg);
		// run it
		sqlcl2.run();
		conn2.close();
	}
	return inner;
};

// make a thread and start it up
// runs later
function runme(arg){
	// import and alias Java Thread and Runnable classes
	var Thread = Java.type("java.lang.Thread");
	var Runnable = Java.type("java.lang.Runnable");

	// declare our thread
	this.thread = new Thread(new Runnable(){
	  	run: main(arg)
	});

	// start our thread
	this.thread.start();
	return;
}
