
var fatFinger = [  {  bad:"form",   good:"from"},
                   {  bad:"hwere",  good:"where"},
                   {  bad:"“",  good:"\"" , all:true},
                   {  bad:"”",  good:"\"" , all:true},
                   {  bad:"dula",   good:"dual"}                  
                ];




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
for(var i = 0; i < fatFinger.length; i++) {
    var w = fatFinger[i];
      if ( cmd.getSql().trim().indexOf(" "+ w.bad +" ") >0 ) {
          ctx.write("\n***Mispelled "+ w.bad +" again.   AUTOCORRECTING ***\n"); 
          cmd.setSql(cmd.getSql().replace(" "+ w.bad +" ", " "+ w.good +" /* AUTO CORRECTED */ "));
      } else  if ( w.all && cmd.getSql().trim().indexOf( w.bad ) >0 ) {
          ctx.write("\n***Mispelled "+ w.bad +" again.   AUTOCORRECTING ***\n"); 
          cmd.setSql(cmd.getSql().replace( w.bad , w.good ));
      }
  }  


}

// fired after ANY Command
cmd.end = function (conn,ctx,cmd) {
}

// Actual Extend of the Java CommandListener

var AutoCorrectCommand = Java.extend(CommandListener, {
		handleEvent: cmd.handle ,
        beginEvent:  cmd.begin  , 
        endEvent:    cmd.end    
});

// Registering the new Command
CommandRegistry.addForAllStmtsListener(AutoCorrectCommand.class);


