// declare the 2 java files needed
var DriverManager = Java.type("java.sql.DriverManager");
var DBUtil  = Java.type("oracle.dbtools.db.DBUtil");


// Create a new connection to use for monitoring
// Grab the connect URL from the base connection in sqlcl
var jdbc = conn.getMetaData().getURL();
var user = 'klrice';
var pass = 'klrice';

//connect
var conn2 = DriverManager.getConnection(jdbc,user,pass);
var util2 = DBUtil.getInstance(conn2);

// probably a better way to rpad a string
function pad(s,n){
   s = s.toString() + "                                                                    "; 
   return ( s.substring(0,n));
}

//
// Simple function to grab the session stats and put them into JSON
//
function stats2json(sid){
     var binds = {};
     binds.SID = sid;

     var list = util2.executeReturnList("select name,value from v$statname sn,v$sesstat  s where sn.statistic# = s.STATISTIC# and s.SID= :SID",binds);
     var ret={};
     for (var i = 0; i < list.length; i++) {
             ret[list[i].NAME] = parseInt(list[i].VALUE);
     }
   return ret;
}

//
// Simple function to grab the session details and put them into JSON
//
function getSession(util){
      /* Current active SQL Connection */
      var results = util.executeReturnList("select sys_context('USERENV','session_user') u,sys_context('USERENV','SESSIONID') sessionID,sys_context('USERENV','SID') sid from dual",null);
     
      var ret = {};
          ret.user      = results[0].U;
          ret.sid       = results[0].SID;
          ret.sessionid = results[0].SESSIONID;

      ctx.write("\tUser:" + ret.user + "\n");
      ctx.write("\tSID:" + ret.sid + "\n");
      ctx.write("\tSession:" + ret.sessionid + "\n");

     return ret;
}

// rebuild the arguments which are the commands to run
var sql="";
for(var i=1;i<args.length;i++){
  sql = sql + " " + args[i];
}

// print the sessions to prove they are different
ctx.write("--Work Session--\n");
var session = getSession(util);

ctx.write("--Monitor Session--\n");
var session2 = getSession(util2);

// grabt the stats before
var before = stats2json(session.sid);

// rebuild the sql from the arguments
ctx.write("Command:\n\t"+ sql + "\n\n");
sqlcl.setStmt(sql);

// run it
sqlcl.run();

// get the after session stats
var after = stats2json(session.sid);

ctx.write("Session Stat Changes:\n\n");

// walk the stats and print the deltas
for(var key in before){
   // print only stats that changed
   if ( before[key] !=  after[key] ) {
     ctx.write( pad(key,64) + "\t\t "+ pad(before[key],12) + " --- "+ pad(after[key],12) + "\t "  );
     ctx.write( pad((after[key]-before[key]),12) + "\n");
   }
}
