// SQLCL's Command Registry
var CommandRegistry = Java.type("oracle.dbtools.raptor.newscriptrunner.CommandRegistry");

// CommandListener for creating any new command
var CommandListener =  Java.type("oracle.dbtools.raptor.newscriptrunner.CommandListener")

// Broke the .js out from the Java.extend to be easier to read
var cmd = {};

// Called to attempt to handle any command
cmd.handle = function (conn,ctx,cmd) {
   return false;
}

// fired before ANY command
cmd.begin = function (conn,ctx,cmd) {
  if ( cmd.getSql().trim().equalsIgnoreCase("select 1 from dual") ) {
     ctx.write("\nReally? Come on man, Try something harder next time.\n");
  }
}

// fired after ANY Command
cmd.end = function (conn,ctx,cmd) {
  if ( cmd.getSql().trim().equalsIgnoreCase("select 1 from dual") ) {
     ctx.write("\nWhat'd you really expect???.\n");
  }
}

// Actual Extend of the Java CommandListener

var SnarkCommand = Java.extend(CommandListener, {
		handleEvent: cmd.handle ,
        beginEvent:  cmd.begin  , 
        endEvent:    cmd.end    
});

// Registering the new Command
CommandRegistry.addForAllStmtsListener(SnarkCommand.class);


