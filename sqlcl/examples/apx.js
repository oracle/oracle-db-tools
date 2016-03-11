function processApex(ctx,conn,subCmd){
  if ( subCmd.length > 1 ) {
    try {
    switch (subCmd[1]) {
        case "export":
            exportApp(conn,subCmd[2])
            break;
        case "log":
            runReport("SELECT workspace, application_id,application_name, page_Views, total_elapsed_time,average_elapsed_time,minimum_elapsed_time,maximum_elapsed_time FROM APEX_WORKSPACE_LOG_SUMMARY");
            break;
        case "sessions":
            runReport("select * from APEX_WORKSPACE_SESSIONS");
            break;
        case "devs":
            runReport("select * from APEX_WORKSPACE_DEVELOPERS");
            break;
        case "users":
            runReport("select * from APEX_WORKSPACE_APEX_USERS");
            break;
        default:
            sqlcl.setStmt("select WORKSPACE,APPLICATION_ID,APPLICATION_NAME,ALIAS from apex_applications");
            sqlcl.run();
            break;
     }
   } catch(e){
    ctx.write(e +"\n")
   }
  } else {
    ctx.write("\n Usages: myapex....\n");
  }
}

function runReport(sql){
  sqlcl.setStmt(sql)
  sqlcl.run();
}
function setupOWA(){
  util.execute("declare  nm     owa.vc_arr;   vl     owa.vc_arr;   begin  nm(1) := 'WEB_AUTHENT_PREFIX';  vl(1) := 'WEB$';  owa.init_cgi_env( 1, nm, vl );  sys.htp.htbuf_len := 84;  end;");
}
function exportApp(conn,appId){
  // setup the OWA env
  setupOWA();
  var binds = {};
  binds.APPLICATION_ID = appId;

  // lookup the workspace ID
  binds.WORKSPACE_ID = util.executeReturnOneCol("select workspace_id from apex_applications where application_id = :APPLICATION_ID", binds);
  // do it
  util.execute("begin apex_util.export_application(p_application_id=>:APPLICATION_ID,p_workspace_id=>:WORKSPACE_ID); end; ", binds);
  // get the OWA buffer
  var page = getPage(conn);
  // print it
  ctx.write(page);                

}
// reusable function to get anything in the OWA bugger
function getPage(conn){
try {
   var Types = Java.type("java.sql.Types")
   var BufferedReader = Java.type("java.io.BufferedReader")
   var InputStreamReader = Java.type("java.io.InputStreamReader")
   
    var GET_PAGE = "declare " + //$NON-NLS-1$
          "   l_buf  varchar2(32767); " + //$NON-NLS-1$
          "   l_clob CLOB; " + //$NON-NLS-1$
          "   l_lines htp.htbuf_arr; " + //$NON-NLS-1$
          "   l_num   number := 999999; " + //$NON-NLS-1$
          " begin " + //$NON-NLS-1$
          "   dbms_lob.createtemporary(l_clob, TRUE); " + //$NON-NLS-1$
          "   OWA.GET_PAGE(l_lines, l_num); " + //$NON-NLS-1$
          "   for i in 1..l_num loop " + //$NON-NLS-1$
          "     dbms_lob.append(l_clob,l_lines(i)); " + //$NON-NLS-1$
          "   end loop; " + //$NON-NLS-1$
          "   ? := l_clob;" + //$NON-NLS-1$
          " end;"; //$NON-NLS-1$

        var cs = conn.prepareCall(GET_PAGE);
        cs.registerOutParameter(1, Types.CLOB);
        cs.execute();
        var clob = cs.getClob(1);

          var r = new BufferedReader(new InputStreamReader(clob.getAsciiStream(), "UTF-8"))
          var str = null; 
          var content = "";
          while ((str = r.readLine()) != null) { content = content + str + "\n"; }
          cs.close();
        return content;
      }catch(e){
            ctx.write(e +"\n")
      }

}

// SQLCL's Command Registry
var CommandRegistry = Java.type("oracle.dbtools.raptor.newscriptrunner.CommandRegistry");

// CommandListener for creating any new command
var CommandListener =  Java.type("oracle.dbtools.raptor.newscriptrunner.CommandListener")

// Broke the .js out from the Java.extend to be easier to read
var cmd = {};

// Called to attempt to handle any command
cmd.handle = function (conn,ctx,cmd) {
  var subCmd = cmd.getSql().trim().split(" ")
  // my command name is "myapex *"
  if ( subCmd[0].equalsIgnoreCase("apx")){
     processApex(ctx,conn,subCmd)
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
var MyApexCmd = Java.extend(CommandListener, {
		handleEvent: cmd.handle ,
        beginEvent:  cmd.begin  , 
        endEvent:    cmd.end    
});

// Registering the new Command
CommandRegistry.addForAllStmtsListener(MyApexCmd.class);


