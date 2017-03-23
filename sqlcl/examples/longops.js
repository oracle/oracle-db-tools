// declare the java classes  needed
var DriverManager = Java.type("java.sql.DriverManager");
var DBUtil  = Java.type("oracle.dbtools.db.DBUtil");
var Thread  = Java.type("java.lang.Thread");
var System  = Java.type("java.lang.System");

// Create a new connection to use for monitoring
// Grab the connect URL from the base connection in sqlcl
if ( typeof conn !== 'undefined' ) {

    var LongOpsBinds = {};

    // long ops sql
    var sql = " SELECT sid, to_char(start_time,'hh24:mi:ss') stime, " +
      " message,( sofar/totalwork)* 100 percent  " +
      " FROM v$session_longops " +
      " WHERE sofar/totalwork < 1" +
      " and   sid = :SID";

    if ( !conn  ) {
      System.out.println(" Not Monitoring , not connected ");
    }else {
      // grab SQLCL session's SID
      var SID = util.executeReturnOneCol("select sys_context('USERENV','SID')  from dual")
      LongOpsBinds.SID = SID;

      // start it up
      runme();

    }
} else {
  System.out.println("Not Connected, longops could not run ");
}

function main(arg){
	function inner(){
		System.out.println("\nStarting Monitoring sid= " + LongOpsBinds.SID )
      //connect
        try {
		     var conn2  = ctx.cloneCLIConnection();
             var util2  = DBUtil.getInstance(conn2);
             var last = 0;
             // run always !
             while(true) {
                ret = util2.executeReturnList(sql,LongOpsBinds);
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
         } catch (e) {
       	      System.out.println("\nLong Ops Monitoring Failed:" + e.getLocalizedMessage());
         }
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
