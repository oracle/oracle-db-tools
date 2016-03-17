// SQLCL's Command Registry
var CommandRegistry = Java.type("oracle.dbtools.raptor.newscriptrunner.CommandRegistry");

// CommandListener for creating any new command
var CommandListener =  Java.type("oracle.dbtools.raptor.newscriptrunner.CommandListener")

var FileUtils = Java.type("oracle.dbtools.common.utils.FileUtils")
var Scanner = Java.type("java.util.Scanner")

// Broke the .js out from the Java.extend to be easier to read
var cmd = {};

// Called to attempt to handle any command
cmd.handle = function (conn,ctx,cmd) {
  if ( cmd.getSql().trim().startsWith("cat ") ) {
    fName = cmd.getSql().trim().substring(4);
    var fUrl = FileUtils.getFile(ctx, fName);
    var stream = fUrl.getInputStream();
    var s = new Scanner(stream).useDelimiter("\\A");
    var content = s.next();
    ctx.write(content + "\n")
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

var CatCommand = Java.extend(CommandListener, {
		handleEvent: cmd.handle ,
        beginEvent:  cmd.begin  , 
        endEvent:    cmd.end    
});

// Registering the new Command
CommandRegistry.addForAllStmtsListener(CatCommand.class);


