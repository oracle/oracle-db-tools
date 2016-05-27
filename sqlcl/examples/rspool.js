// SQLCL's Command Registry
var CommandRegistry = Java.type("oracle.dbtools.raptor.newscriptrunner.CommandRegistry");

// CommandListener for creating any new command
var CommandListener =  Java.type("oracle.dbtools.raptor.newscriptrunner.CommandListener")

var MultiLineHistory =  Java.type("oracle.dbtools.raptor.console.MultiLineHistory")

// Broke the .js out from the Java.extend to be easier to read
var cmd = {};

// Called to attempt to handle any command
cmd.handle = function (conn,ctx,cmd) {
   if ( cmd.getSql().trim().startsWith("rspool") ) {
    // split up the args for better names
        var sql = cmd.getSql().trim();
        var args = sql.split(/\s+/);
       	var iterations = args[1] ;
       	var sleep = args[2] ;
       	var fname = args[3] ;
        if ( args.length < 4 ){
          ctx.write("Usage : rspool <iterations> <sleep in s> <base filename>");
          return true;
        }
        // find the last select from history
        var repeatSQL = getLastSelect();

        if ( repeatSQL ){
            var i=0;
            // do stuff
            while( i <= iterations ){
              ctx.write("Loop:" + i + " of  " + iterations + " with a sleep of " + sleep + "s\n");
              run("spool " +  fname+ "." + i + ".log;" );
              run(repeatSQL + ";\n");
              run(" spool off");
              if (i != iterations) {
                try {
                  Thread.sleep(  Math.round(sleep * 1000));
                } catch ( e) {
                  break;
                }
              }
              i++;
            }
        }
    return true;
   }
   return false;
}

// fired before ANY command
cmd.begin = function (conn,ctx,cmd) {
}

// fired after ANY Command
cmd.end = function (conn,ctx,cmd) {
}

// Actual Extend of the Java CommandListener

var RSpoolCommand = Java.extend(CommandListener, {
		   handleEvent:    cmd.handle ,
        beginEvent:    cmd.begin  , 
          endEvent:    cmd.end    
});

// Registering the new Command
CommandRegistry.addForAllStmtsListener(RSpoolCommand.class);

// run stuff
function run(sql){
    sqlcl.setStmt(sql);
    sqlcl.run();
}
// find last select or with statement
function getLastSelect(){
	var MultiLineHistory =  Java.type("oracle.dbtools.raptor.console.MultiLineHistory");
	var nextCmd = null;
    var check=MultiLineHistory.getInstance().size();
    while(check>-1 && nextCmd==null){
      var next =  MultiLineHistory.getInstance().get(check);
      if ( next.toLowerCase().startsWith("select ") || next.toLowerCase().startsWith("with ") ){
        nextCmd = next;
      }
      check--;
    }
    return nextCmd;
}