// declare the java classes  needed
var DriverManager = Java.type("java.sql.DriverManager");
var DBUtil  = Java.type("oracle.dbtools.db.DBUtil");
var Thread  = Java.type("java.lang.Thread");
var System  = Java.type("java.lang.System");

// Create a new connection to use for monitoring
// Grab the connect URL from the base connection in sqlcl
var jdbc = conn.getMetaData().getURL();
var user,pass;

var binds = {};

// long ops sql
var sql = " SELECT sid, to_char(start_time,'hh24:mi:ss') stime, " +
  " message,( sofar/totalwork)* 100 percent  " +
  " FROM v$session_longops " +
  " WHERE sofar/totalwork < 1" +
  " and   sid = :SID";

if ( args.length != 3 ) {
  System.out.println(" NO USERNAME and PASSWORD passed in");
} else {
  // use username/password passed in as args
  user = args[1];
  pass = args[2]; 

  // grab SQLCL session's SID
  var SID = util.executeReturnOneCol("select sys_context('USERENV','SID')  from dual")
  binds.SID = SID;

  // start it up
  runme();

}

function main(arg){
	function inner(){
		System.out.println("\nStarting Monitoring sid= " + binds.SID )
      //connect
		var conn2  = DriverManager.getConnection(jdbc,user,pass);
		var util2  = DBUtil.getInstance(conn2);
       	var last = 0;
      // run always !
        while(true) {
        ret = util2.executeReturnList(sql,binds);
      // only print if the percent changed
        if ( ret.length > 0 && last != ret[0].PERCENT ){
        	last = ret[0].PERCENT;
        	System.out.println( ret[0].STIME + "> " + ret[0].PERCENT + ' Completed \t' + ret[0].MESSAGE);

    	} 
      // sleepy time
        Thread.sleep(1000);
       } 
       	System.out.println("\nDone Monitoring")
		conn2.close();       
	}
	return inner;
};


function runme(){
	// import and alias Java Thread and Runnable classes
	var Thread = Java.type("java.lang.Thread");
	var Runnable = Java.type("java.lang.Runnable");

	// declare our thread
	this.thread = new Thread(new Runnable(){
         run: main()
	});

	// start our thread
	this.thread.start();
	return;
}
