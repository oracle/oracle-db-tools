// MISC java things we'll need in a few lines
var SimpleDateFormat        = Java.type("java.text.SimpleDateFormat");
var OracleCallableStatement = Java.type("oracle.jdbc.OracleCallableStatement");
var OracleTypes             = Java.type("oracle.jdbc.OracleTypes");
var BigDecimal              = Java.type("java.math.BigDecimal");
var CopyOption              = Java.type("java.nio.file.StandardCopyOption");
var Charset                 = Java.type("java.nio.charset.Charset");
var BufferedReader          = Java.type("java.io.BufferedReader");
var FileSystems             = Java.type("java.nio.file.FileSystems");
var Files                   = Java.type("java.nio.file.Files");

function ApexExport()  {
    this.CmdName = "apxexp";

    this.sql = {
    // various SQL we'll need later
            gStmt : "select application_id, application_name from apex_applications where workspace_id = :wsID and  ( :locked = 'Y'  OR (:locked = 'N' and build_status <> 'Run and Hidden' ))  union " +
                                 "select application_id, application_name from apex_applications where workspace_id = :wsID order by application_id",

            gStmtInstance : "select application_id, application_name from apex_applications where workspace_id <> 10 and build_status <> 'Run and Hidden' union " +
                                             "select application_id, application_name from apex_ws_applications where workspace_id <> 10 order by application_id",

            gStmtWorkspaces : "select workspace_id, workspace from apex_workspaces where workspace_id > 11 and (:wsID is null or workspace_id = :wsID) order by workspace_id",

            gStmtWorkspacesFeedback : "select distinct workspace_id, workspace_name from apex_team_feedback where workspace_id > 11  and (:wsID is null or workspace_id = :wsID) order by workspace_id",

            gStmtSetSGID : "begin wwv_flow_api.set_security_group_id(p_security_group_id=>:SGID); end;",

            gStmtGetSGID : "select v('FLOW_SECURITY_GROUP_ID') sgid from sys.dual",

            gStmtIsWS : "select count(*) from apex_ws_applications where application_id = :appID",
            gStmtIsWSName: "select WORKSPACE_ID from apex_workspaces where workspace = :wsName",
            gStmtIsWSApps : "select APPLICATION_ID from apex_applications where WORKSPACE_ID = :wsID"
        };

    // hold all command line options
    this.options={};

    //
    // Get the cmd line args
    //
    this.setVarsFromArgs = function(args){
            for (var i = 0; i < args.length; i++) {
                this.debug('Param:' + args[i])
                if ( args[i].equalsIgnoreCase(this.CmdName)) {
                    // just skip it.
                } else if (args[i].equalsIgnoreCase("-exportFolder")) {
                    this.options.exportFolder = args[++i];
                } else if (args[i].equalsIgnoreCase("-workspaceid")) {
                    this.options.workspaceID = args[++i];
                } else if (args[i].equalsIgnoreCase("-workspace")) {
                    this.options.workspaceName = args[++i];
                } else if (args[i].equalsIgnoreCase("-applicationid")) {
                    this.options.appID = args[++i];
                } else if (args[i].equalsIgnoreCase("-debug")) {
                    this.options.gDebug = true;
                } else if (args[i].equalsIgnoreCase("-skipExportDate")) {
                    this.options.skipDate = true;
                } else if (args[i].equalsIgnoreCase("-expPubReports")) {
                    this.options.pubReports = true;
                } else if (args[i].equalsIgnoreCase("-expSavedReports")) {
                    this.options.savedReports = true;
                } else if (args[i].equalsIgnoreCase("-expIRNotif")) {
                    this.options.IRNotifications = true;
                } else if (args[i].equalsIgnoreCase("-expTranslations")) {
                    this.options.expTranslations = true;
                } else if (args[i].equalsIgnoreCase("-instance")) {
                    this.options.instance = true;
                } else if (args[i].equalsIgnoreCase("-expWorkspace")) {
                    this.options.expWorkspace = true;
                } else if (args[i].equalsIgnoreCase("-expMinimal")) {
                    this.options.expMinimal = true;
                } else if (args[i].equalsIgnoreCase("-expFiles")) {
                    this.options.expFiles = true;
                } else if (args[i].equalsIgnoreCase("-expFeedback")) {
                    this.options.expFeedback = true;
                } else if (args[i].equalsIgnoreCase("-expTeamdevdata")) {
                    this.options.expTeamdevdata = true;
                } else if (args[i].equalsIgnoreCase("-deploymentSystem")) {
                    this.options.deploymentSystem = args[++i];
                } else if (args[i].equalsIgnoreCase("-expFeedbackSince")) {
                    var dtFmt = new SimpleDateFormat("yyyyMMdd");
                    var str= args[++i];
                    try {
                        expFeedbackSinceU = dtFmt.parse(str);
                        this.options.expFeedbackSince = str;
                    } catch (e) {
                        ctx.write("Invalid date format: "+str);
                    }
                } else if (args[i].equalsIgnoreCase("-expOriginalIds")) {
                    this.options.expOriginalIds = true;
                } else if (args[i].equalsIgnoreCase("-expLocked")) {
                    this.options.expLocked = true;
                } else if (args[i].equalsIgnoreCase("-replace")) {
                    this.options.replace = true;

                } else {
                    this.usage();
                    ctx.write("\nUnknown Option :" + args[i] + "\n")
                    return false; // return false to signal not to continue
                }
            }
            return true; // all is good all args processed
    }

    this.usage = function(){
            ctx.write("\nUsage "+this.CmdName+"  [options]  \n");
            ctx.write("    -exportFolder:     Name of the folder where the files will be exported to\n");
            ctx.write("    -applicationid:    ID for application to be exported\n");
            ctx.write("    -workspaceid:      Workspace ID for which all applications to be exported or the workspace to be exported\n");
            ctx.write("    -workspace:        Case Sensative workspace name to export\n");
            ctx.write("    -instance:         Export all applications\n");
            ctx.write("    -expWorkspace:     Export workspace identified by -workspaceid or all workspaces if -workspaceid not specified\n");
            ctx.write("    -expMinimal:       Only export workspace definition, users, and groups\n");
            ctx.write("    -expFiles:         Export all workspace files identified by -workspaceid\n");
            ctx.write("    -skipExportDate:   Exclude export date from application export files\n");
            ctx.write("    -expPubReports:    Export all user saved public interactive reports\n");
            ctx.write("    -expSavedReports:  Export all user saved interactive reports\n");
            ctx.write("    -expIRNotif:       Export all interactive report notifications\n");
            ctx.write("    -expTranslations:  Export the translation mappings and all text from the translation repository\n");
            ctx.write("    -expFeedback:      Export team development feedback for all workspaces or identified by -workspaceid to development or deployment\n");
            ctx.write("    -expTeamdevdata:   Export team development data for all workspaces or identified by -workspaceid\n");
            ctx.write("    -deploymentSystem: Deployment system for exported feedback\n");
            ctx.write("    -expFeedbackSince: Export team development feedback since date in the format YYYYMMDD\n");
            ctx.write("    -expOriginalIds:   If specified, the application export will emit ids as they were when the application was imported\n");
            ctx.write("    -replace:          Replace existing files\n");
            ctx.write("    \n");
            ctx.write("    Application Example: \n");
            ctx.write("       "+this.CmdName+"  -applicationid 31500 \n");
            ctx.write("    Workspace  Example: \n");
            ctx.write("       "+this.CmdName+" -workspaceid 9999 \n");
            ctx.write("    Instance Example:\n");
            ctx.write("       "+this.CmdName+"  -instance \n");
            ctx.write("    Export All Workspaces Example:\n");
            ctx.write("       "+this.CmdName+" -expWorkspace \n");
            ctx.write("    Export Feedback to development environment:\n");
            ctx.write("       "+this.CmdName+" -workspaceid 9999 -expFeedback \n");
            ctx.write("    Export Feedback to deployment environment EA2 since 20100308:\n");
            ctx.write("       "+this.CmdName+" -workspaceid 9999 -expFeedback -deploymentSystem EA2 -expFeedbackSince 20100308 \n");

            ctx.write(" \n");
            ctx.write(" SQLcl Scripting Example:\n");
            ctx.write(" \n");
            ctx.write("    script  \n");
            ctx.write("       var a = new ApexExport();\n");
            ctx.write("       var myoptions = ['-expWorkspace','-replace'];\n");
            ctx.write("       a.run(myoptions);\n");
            ctx.write("   /\n");
    }
    this.ExpFeed=function ( workspaceID,  deploymentSystem, expFeedbackSince){
                 var binds= {"wsID": workspaceID};

                //Export feedback for all workspaces
                var ret = util.executeReturnList(this.sql.gStmtWorkspacesFeedback,binds);

                for (var i = 0; ret != null && i < ret.length; i++) {
                    ctx.write("Exporting Feedback for Workspace " + ret[i].WORKSPACE_ID + ":'" + ret[i].WORKSPACE + "'\n ");

                    this.ExportFeedback(ret[i].WORKSPACE_ID, deploymentSystem, expFeedbackSince);
                    this.debug("  Completed at " + new Date());
                }
                if ( ret == null || ret.length == 0){
                    ctx.write('Nothing to export\n')
                }
        }
    this.ExportWorkspaces=function ( workspaceID,  teamdevdata,  minimal) {
            var binds= {"wsID": workspaceID};
            this.debug(JSON.stringify(binds))
            //Export all workspaces
            var ret = util.executeReturnList(this.sql.gStmtWorkspaces,binds);

            for (var i = 0; ret != null && i < ret.length; i++) {

                ctx.write("Exporting Workspace " + ret[i].WORKSPACE_ID + ":'" + ret[i].WORKSPACE + "' \n");

                this.ExportWorkspace(ret[i].WORKSPACE_ID, teamdevdata, minimal);

                this.debug("  Completed at " + new Date());
            }// end for
        }// end function

    this.ExportFiles = function (appIDToExport,workspaceID,userName){
            var now;

            if (this.options.instance) {
                this.debug('Instance')
                var appID;
                var appName;
                var ret = util.executeReturnList(this.sql.gStmtInstance,null);
                if ( ret != null ) {
                    for (var i = 0; i < ret.length; i++) {
                        ctx.write("Exporting Application " + ret[i].APPLICATION_ID + ":'" + ret[i].APPLICATION_NAME + "' \n");
                        this.ExportFile(ret[i].APPLICATION_ID, true);
                        this.debug("  Completed at " + new Date());
                    }
                } else {
                 ctx.write("  Nothing to do.");
                }

            }

            else if (workspaceID != null && workspaceID != 0) {
                var binds = {"SGID": workspaceID,"wsID":workspaceID}
                var appID;
                util.executeUpdate(this.sql.gStmtSetSGID,binds);
                var securityGroupID = util.executeReturnOneCol(this.sql.gStmtGetSGID );

                if (securityGroupID != workspaceID) {
                    ctx.write("Invalid Workspace ID '" + workspaceID + "' for User '" + userName+ "'\n");
                    out.flush();
                    return;
                }

                if (!this.options.expLocked) {
                    binds.locked = 'N'
                } else {
                    binds.locked = 'Y'
                }
                var ret = util.executeReturnList(this.sql.gStmt,binds);

                for (i = 0; i < ret.length; i++) {

                    ctx.write("Exporting Application " + ret[i].APPLICATION_ID + ":'" + ret[i].APPLICATION_NAME + "' \n");

                    this.ExportFile(ret[i].APPLICATION_ID, true);

                    this.debug("  Completed at " + new Date());
                }

            } else if ( appIDToExport != null ) {
                // Exporting only one specific application
                ctx.write("Exporting application " + appIDToExport + "\n");


                this.ExportFile(appIDToExport, false);

                this.debug("  Completed at " + new Date());
            }
        }
    this.ExportStaticFiles = function ( workspaceID) {
            //
            // Call the stored procedure export_files_to_clob, which will return the
            // files export in a CLOB

            var lstmt = "begin ? := wwv_flow_utilities.export_files_to_clob(?); end;";

            cstmt =  conn.prepareCall(lstmt);

            cstmt.registerOutParameter(1, OracleTypes.CLOB);
            cstmt.setBigDecimal(2, new BigDecimal(workspaceID));

            cstmt.execute();

            var clob = cstmt.getCLOB(1);
            var theFileName  = "files_" + workspaceID + ".sql";

            ctx.write("Exporting Static Files for Workspace: " + workspaceID+ "\n");
            var bytes = this.clob2file(clob,theFileName);

            cstmt.close();
    }

    this.debug=function (str){
        if ( this.options.gDebug ) { ctx.write("\n>>>"+str+"\n"); out.flush();}
    }
    this.getWSID=function(name){
      var binds={"wsName": this.options.workspaceName};
      var wsID = util.executeReturnOneCol(this.sql.gStmtIsWSName,binds);
      return wsID;
    }
    this.clob2file=function (clob,fName){
        var stream =  new BufferedReader(clob.getCharacterStream());
        var path; 
       
        // get the path/file handle to write to
        if (this.options.exportFolder){
            var folderPath = FileSystems.getDefault().getPath(this.options.exportFolder);
            
            // check if the export folder exists. If not create it.
            if (!folderPath.toFile().isDirectory()){
                Files.createDirectory(folderPath);
            }
            
            path = FileSystems.getDefault().getPath(this.options.exportFolder, fName);
        }
        else{
            path = FileSystems.getDefault().getPath(fName);
        }
       
        // dump the file stream to the file
        var bytes=0;
        if (  ! path.toFile().exists() ||
                 (  this.options.replace && path.toFile().exists()  ))   {
                var bw = Files.newBufferedWriter(path,Charset.forName("UTF-8"))
                var line = null;
                while((line = stream.readLine())!=null){
                    if ( ! ( this.options.skipDate &&  line.indexOf("--   Date and Time:") != 0  ) ) {
                        bw.write(line,0,line.length());
                        bytes = bytes + line.length();
                    }
                    bw.newLine();
                }
                bw.flush();
                bw.close();
         } else {
              ctx.write('File Exists. Failed to write ' + fName  + '\n Pass -replace to overwrite.\n')
         }
         this.debug(" Wrote " + bytes + " bytes to " + fName);
         return bytes;

    }

     this.ExportFeedback=function ( workspaceID,  deploymentSystem, expFeedbackSince) {

            //
            // Call the stored procedure export_feedback_to_development or export_feedback_to_deployment, which will return the
            // application export in a CLOB
            var lstmt = null;
            if (deploymentSystem == null){
                lstmt = "begin ? := wwv_flow_utilities.export_feedback_to_development(?,to_date(?,'RRRRMMDD')); end;";
            } else {
                lstmt = "begin ? := wwv_flow_utilities.export_feedback_to_deployment(?,?,to_date(?,'RRRRMMDD')); end;";
            }

            var cstmt =  conn.prepareCall(lstmt);
            if (deploymentSystem == null){
                cstmt.registerOutParameter(1, OracleTypes.CLOB);
                cstmt.setString(2, workspaceID);
                cstmt.setString(3, expFeedbackSince);
            } else {
                cstmt.registerOutParameter(1, OracleTypes.CLOB);
                cstmt.setBigDecimal(2, new BigDecimal(workspaceID));
                cstmt.setString(3, deploymentSystem);
                cstmt.setString(4, expFeedbackSince);
            }

            cstmt.execute();
            var clob = cstmt.getCLOB(1);
            //
            // Create a new file in the local directory
            //
            var theFileName = "fb" + workspaceID + ".sql";

            var bytes = this.clob2file(clob,theFileName);
            if ( !clob) {
                ctx.write("No Feedback to Export.")
            }
            //
            // Close all streams and statements
            //
            cstmt.close();
        }

    this.ExportWorkspace=function ( workspaceID,  teamdevdata,  minimal)  {
            //
            // Call the stored procedure export_to_clob, which will return the
            // application export in a CLOB

            var sql = "begin ? := wwv_flow_utilities.export_workspace_to_clob(?, "+
                      "  case when ? ='Y' then true else false end, "+
                      "  case when ? ='Y' then true else false end); "+
                      " end;";
            var cstmt =  conn.prepareCall(sql);

            cstmt.setBigDecimal(2,  new BigDecimal(workspaceID));
            cstmt.setString(3,      teamdevdata ? "Y" : "N");
            cstmt.setString(4,      minimal     ? "Y" : "N");

            cstmt.registerOutParameter(1, OracleTypes.CLOB);
            cstmt.execute();

            var clob = cstmt.getCLOB(1);
            var theFileName = "w" + workspaceID + ".sql";

            var bytes = this.clob2file(clob,theFileName);

            cstmt.close();

    }

     this.ExportFile=function ( appID,expPkgAppMapping)  {

            if ( appID==null){
                return;
            }
            this.debug('Exporting>' + appID)
            //
            // Call the stored procedure export_to_clob, which will return the
            // application export in a CLOB
            var cstmt = conn.prepareCall(
                    "begin\n" +
                    "    ? := wwv_flow_utilities.export_application_to_clob (\n" +
                    "             p_application_id            => ?,\n" +
                    "             p_export_ir_public_reports  => ?,\n" +
                    "             p_export_ir_private_reports => ?,\n" +
                    "             p_export_ir_notifications   => ?,\n" +
                    "             p_export_translations       => ?,\n" +
                    "             p_export_pkg_app_mapping    => ?,\n" +
                    "             p_with_original_ids         => case when ?='Y' then true else false end );\n" +
                    "end;");
            this.debug('Binding..')

            cstmt.registerOutParameter(1, OracleTypes.CLOB);
            cstmt.setBigDecimal(2, new BigDecimal(appID));
            cstmt.setString(3, this.options.pubReports       ? "Y" : "N");
            cstmt.setString(4, this.options.savedReports     ? "Y" : "N");
            cstmt.setString(5, this.options.IRNotifications  ? "Y" : "N");
            cstmt.setString(6, this.options.expTranslations  ? "Y" : "N");
            cstmt.setString(7, this.options.expPkgAppMapping ? "Y" : "N");
            cstmt.setString(8, this.options.expOriginalIds   ? "Y" : "N");
            this.debug('Bound')

            cstmt.execute();

            var clob = cstmt.getCLOB(1);
            //
            // Create a new file in the local directory
            //
            var binds = {"appID":appID};

            var count = util.executeReturnOneCol(this.sql.gStmtIsWS,binds);

            if (count == 0) {
                theFileName = "f" + appID + ".sql";
            } else {
                theFileName = "ws" + appID + ".sql";
            }
            this.clob2file(clob,theFileName);
            cstmt.close();
    }



//
// main method
//
    this.run = function(args){
        // get the user once as it's used a few times/places
        var userName = util.executeReturnOneCol('select user from dual' )

        // process the args and place into the options
        if ( ! this.setVarsFromArgs(args) ) {
            return;
        }
        if ( this.options.workspaceName ) {
            this.options.workspaceID  = this.getWSID(this.options.workspaceName);
        }
        // debug of what was passed
        this.debug("\nRunning with Flags set:\n\t" + JSON.stringify(this.options) + "\n");

        // no app OR  no workspace , no luck
        if ( this.options.appID == null
            && this.options.workspaceID == null
            &&  ( ! this.options.instance )
            &&  ( ! this.options.expWorkspace )){
            this.usage()
        } else {
            if (this.options.expWorkspace) {
                this.ExportWorkspaces(this.options.workspaceID, this.options.expTeamdevdata, this.options.expMinimal);
            } else if (this.options.expFeedback) {
                this.ExpFeed(this.options.workspaceID, this.options.deploymentSystem, this.options.expFeedbackSince);
            } else if (this.options.expFiles && this.options.workspaceID) {
                this.ExportStaticFiles(this.options.workspaceID);
            } else {
                this.ExportFiles(this.options.appID, this.options.workspaceID, userName);
            }
        }
        ctx.write('\n')
        out.flush();
    }


};

//
//  Now to install the Command into SQLcl
//
// SQLCL's Command Registry
var CommandRegistry = Java.type("oracle.dbtools.raptor.newscriptrunner.CommandRegistry");

// CommandListener for creating any new command
var CommandListener =  Java.type("oracle.dbtools.raptor.newscriptrunner.CommandListener")

// Broke the .js out from the Java.extend to be easier to read
var cmd = {};

// Called to attempt to handle any command
cmd.handle = function (conn,ctx,cmd) {
  if ( cmd.getSql().trim().startsWith("apxexp") ) {
    // split the arguments
    args = cmd.getSql().trim().split(/\s+/);

    // is the first arg a number
    var ae = new ApexExport();
    ae.run(args);
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

var APEXExportCommand = Java.extend(CommandListener, {
        handleEvent:    cmd.handle ,
        beginEvent:     cmd.begin  ,
        endEvent:       cmd.end
});

// Registering the new Command
CommandRegistry.addForAllStmtsListener(APEXExportCommand.class);


/*
script
var a = new ApexExport();
var myoptions = ["-expWorkspace","-replace"];
a.run(myoptions);
/

*/
