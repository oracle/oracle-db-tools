// SQLCL's Command Registry
var CommandRegistry = Java.type("oracle.dbtools.raptor.newscriptrunner.CommandRegistry");

// CommandListener for creating any new command
var CommandListener =  Java.type("oracle.dbtools.raptor.newscriptrunner.CommandListener")

var Types = Java.type("java.sql.Types");

// Broke the .js out from the Java.extend to be easier to read
var cmd = {};

// Called to attempt to handle any command
cmd.handle = function (conn,ctx,cmd) {
    if ( cmd.getSql().trim().startsWith("sync ") ) {
       var args = cmd.getSql().trim().split(" ");
 
       ctx.write("Syncing " + args[1] + " to " + args[2] + "\n");

       // PLSQL magic 
        var sql = "declare \n" +
               "   h           number;\n" +
               "   th1         number;    -- transform handle\n" +
               "   th2         number;    -- transform handle\n" +
               "   r           clob;\n" +
               "   tc1         clob;\n" +
               "   tc2         clob;\n" +
               "   sxml_from   clob;\n" +
               "   sxml_to     clob;\n" +
               "   diflob      clob;\n" +
               "   difFlag     boolean := false;\n" +
               " begin \n" +
               " select  dbms_metadata.get_sxml('TABLE', ?)\n" +
               "   into sxml_from \n"+
               " from dual; \n"+
               " select  dbms_metadata.get_sxml('TABLE', ? ) \n " +
               "   into sxml_to \n " +
               " from dual; \n " +
               "    h := dbms_metadata_diff.openc('TABLE'); \n " +
             
               "   dbms_metadata_diff.add_document ( \n " +
               "                 handle       => h, \n " +
               "                 document     => sxml_from); \n " +
                        
               "   dbms_metadata_diff.add_document ( \n " +
               "                 handle       => h, \n " +
               "                 document     => sxml_to); \n " +
                       
               "   tc1 := sys.dbms_metadata_diff.fetch_clob(h); \n " +
               "   dbms_metadata_diff.close(h);             \n " +


               "   --  Open a context and add ALTERXML transform to generate ALTER_XML \n " +
               "   --  required for the above diff document. \n " +
               "   h := dbms_metadata.openw('TABLE'); \n " +
               "   th1 := dbms_metadata.add_transform(h, 'ALTERXML'); \n " +

               "   -- create a temporary lob for alter XML statements and do the convert \n " +
               "   th2 := dbms_metadata.add_transform(h, 'ALTERDDL'); \n " +

               "   -- create a temporary lob for alter statements and do the convert \n " +
               "   -- LOB is already package scope and may have old contents from a \n " +
               "   -- prev. call  \n " +
               "   DBMS_LOB.CREATETEMPORARY(r, TRUE ); \n " +
               "   dbms_metadata.convert(h, tc1, r); \n " +
               "   dbms_metadata.close(h);             \n " +
               "   ?  := r; \n " +
               " end; \n ";


        // call the plsql
        var call = conn.prepareCall(sql);
            call.setString(1,args[1])
            call.setString(2,args[2])
            call.registerOutParameter(3,Types.CLOB);
            call.execute();
        var clob = call.getClob(3);
     
        // get the results
        var results = clob.getSubString(1, clob.length()); 
  
       ctx.write(results);

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

var SyncCommand = Java.extend(CommandListener, {
		handleEvent: cmd.handle ,
        beginEvent:  cmd.begin  , 
        endEvent:    cmd.end    
});

// Registering the new Command
CommandRegistry.addForAllStmtsListener(SyncCommand.class);


