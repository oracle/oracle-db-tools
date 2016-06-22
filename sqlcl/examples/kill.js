// SQLCL's Command Registry
var CommandRegistry = Java.type("oracle.dbtools.raptor.newscriptrunner.CommandRegistry");

// CommandListener for creating any new command
var CommandListener =  Java.type("oracle.dbtools.raptor.newscriptrunner.CommandListener")

// Broke the .js out from the Java.extend to be easier to read
var cmd = {};

// Called to attempt to handle any command
cmd.handle = function (conn,ctx,cmd) {
  if ( cmd.getSql().trim().startsWith("kill ") ) {
    // split the arguments
    args = cmd.getSql().trim().split(/(\s+)/);
    // is the first arg a number
    if ( isNaN(args[2]) ) {
      var binds={}
          binds.who = args[2];
      // find all sessions for the passed in username
      var sessions = util.executeReturnList('select sid,serial# serial from v$session where username =  :who ',binds);
        for (i = 0; i < sessions.length; i++) {
          ctx.write( 'Killing:'+ sessions[i].SID  + "," + sessions[i].SERIAL+ "\n");
          sqlcl.setStmt("alter system kill session  '"+ sessions[i].SID  + "," + sessions[i].SERIAL + "' IMMEDIATE;");
          sqlcl.run();
        }

    } else {
      // args were numbers so kill the specific session
      sqlcl.setStmt("alter system kill session  '"+ args[2].trim()  +","+ args[4].trim() + "' IMMEDIATE;");
      sqlcl.run();
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

var KillCommand = Java.extend(CommandListener, {
		   handleEvent:  cmd.handle ,
        beginEvent:  cmd.begin  , 
          endEvent:  cmd.end    
});

// Registering the new Command
CommandRegistry.addForAllStmtsListener(KillCommand.class);


