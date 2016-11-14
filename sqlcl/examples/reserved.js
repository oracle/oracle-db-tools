// SQLCL's Command Registry
var CommandRegistry = Java.type("oracle.dbtools.raptor.newscriptrunner.CommandRegistry");

// CommandListener for creating any new command
var CommandListener =  Java.type("oracle.dbtools.raptor.newscriptrunner.CommandListener")

// Broke the .js out from the Java.extend to be easier to read
var cmd = {};

// Called to attempt to handle any command
cmd.handle = function (conn,ctx,cmd) {
  if ( cmd.getSql().trim().startsWith("reserved ") ) {
    // split the arguments
    args = cmd.getSql().trim().split(/(\s+)/);
    var binds = {};
    for(var i=2;i<args.length;i++){
      binds.name = args[i];
      if ( binds.name  && ! binds.name.trim().equals("") ) {
        var cnt = util.executeReturnOneCol('select count(1) from v$reserved_words where keyword = upper(:name)',binds);
        if ( cnt >0  ) {
          ctx.write(args[i] + " is Reserved\n");
        } else {
          ctx.write(args[i] + " is not  Reserved\n");
        } 
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

var ReservedCommand = Java.extend(CommandListener, {
	   handleEvent:  cmd.handle ,
        beginEvent:  cmd.begin  , 
          endEvent:  cmd.end    
});

// Registering the new Command
CommandRegistry.addForAllStmtsListener(ReservedCommand.class);


