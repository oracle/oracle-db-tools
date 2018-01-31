//
// Simple command to add "s <USER>" which issues
// alter session set current_schema = <USER>
//
//
// SQLCL's Command Registry
var CommandRegistry = Java.type("oracle.dbtools.raptor.newscriptrunner.CommandRegistry");

// CommandListener for creating any new command
var CommandListener =  Java.type("oracle.dbtools.raptor.newscriptrunner.CommandListener")


// Broke the .js out from the Java.extend to be easier to read
var cmd = {};

// Called to attempt to handle any command
cmd.handle = function (conn,ctx,cmd) {
	var subCmd = cmd.getSql().trim().split(" ")
	if ( subCmd[0].equalsIgnoreCase("s")){
             sqlcl.setStmt('alter session set current_schema = ' + subCmd[1]);
             sqlcl.run();

	    return true;
	}
}
// fired before ANY command
cmd.begin = function (conn,ctx,cmd) {}

// fired after ANY Command
cmd.end = function (conn,ctx,cmd) {}

// Actual Extend of the Java CommandListener

var SetSchema = Java.extend(CommandListener, {
        handleEvent: cmd.handle ,
        beginEvent:  cmd.begin  ,
        endEvent:    cmd.end
});

// Registering the new Command
CommandRegistry.addForAllStmtsListener(SetSchema.class);
