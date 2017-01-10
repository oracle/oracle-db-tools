// MISC java things we'll need in a few lines
var SimpleDateFormat        = Java.type("java.text.SimpleDateFormat");
var OracleCallableStatement = Java.type("oracle.jdbc.OracleCallableStatement");
var OracleTypes             = Java.type("oracle.jdbc.OracleTypes");
var BigDecimal              = Java.type("java.math.BigDecimal");
var CopyOption              = Java.type("java.nio.file.StandardCopyOption");
var Charset                 = Java.type("java.nio.charset.Charset")
var BufferedReader          = Java.type("java.io.BufferedReader")
function ApexImport()  {
    this.CmdName = "apximp";

    this.sql = {
    // various SQL we'll need later
          wsID :    "begin apex_application_install.SET_WORKSPACE_ID(   P_WORKSPACE_ID   =>  :workspaceID ); end;",
          appID:    "begin apex_application_install.SET_APPLICATION_ID(   P_APPLICATION_ID   =>  :appID); end;",
          appGenID : "begin apex_application_install.GENERATE_APPLICATION_ID(); end;",
          offset :  "begin apex_application_install.SET_OFFSET(   P_OFFSET   =>  :offset ); end;",
          schema :  "begin apex_application_install.SET_SCHEMA(   P_SCHEMA   =>  :schema ); end;",
          appName:  "begin apex_application_install.SET_APPLICATION_NAME(   P_APPLICATION_NAME   =>  :appName  ); end;",
          appAlias: "begin     apex_application_install.SET_APPLICATION_ALIAS(   P_APPLICATION_ALIAS   =>  :appAlias); end;",
          proxy:       "begin     apex_application_install.SET_PROXY(   P_PROXY   =>  :proxy  ); end;",
          supportObjs: "begin     apex_application_install.SET_AUTO_INSTALL_SUP_OBJ(   P_AUTO_INSTALL_SUP_OBJ   =>  :supportingObjects); end;",
          appFiles:    "begin     apex_application_install.SET_STATIC_APP_FILE_PREFIX(   P_FILE_PREFIX   =>  :appFilePrefix  ); end;",
          themeFiles:  "begin     apex_application_install.SET_STATIC_THEME_FILE_PREFIX(   P_THEME_NUMBER   =>  :themeNumber ,P_FILE_PREFIX    =>  :themeFilePrefix );  end;",
          pluginFiles: "begin     apex_application_install.SET_STATIC_PLUGIN_FILE_PREFIX(   P_PLUGIN_TYPE   =>  :pluginType  ,P_PLUGIN_NAME   =>  :pluginName  ,  P_FILE_PREFIX   =>  :pluginFilePrefix); end;",
          appImagePrefix: "begin     apex_application_install.SET_IMAGE_PREFIX(   P_IMAGE_PREFIX   =>  :imgPrefix ); end;",
          details :"select apex_application_install.get_application_id \"Application ID\", " +
                   " apex_application_install.get_workspace_id \"Workspace ID\", " +
                   " apex_application_install.get_offset  \"Offset\", " +
                   " apex_application_install.get_schema   \"Parsing Schema\", " +
                   " apex_application_install.get_application_name \"Application Name\", " +
                   " apex_application_install.get_application_alias \"Application Alias\", " +
                   " apex_application_install.get_image_prefix \"Image Prefix\", " +
                   " apex_application_install.get_proxy  \"Proxy\", " +
                   " apex_application_install.get_static_app_file_prefix \"App File Prefix\" " +
            " from dual"
    };

    // hold all command line options
    this.options={};

    //
    // Get the cmd line args
    //
    this.setVarsFromArgs = function(args){
            if ( args!=null && args.length == 0){ this.usage();return false;}
            for (var i = 0; i < args.length; i++) {
                this.debug('Param:' + args[i])
                if ( args[i].equalsIgnoreCase(this.CmdName)) {
                    // just skip it.
                  } else if (args[i].equalsIgnoreCase("-file")) {
                      this.options.fileName = args[++i];
                } else if (args[i].equalsIgnoreCase("-workspaceid")) {
                    this.options.workspaceID = args[++i];
                } else if (args[i].equalsIgnoreCase("-applicationid")) {
                    this.options.appID = args[++i];
                } else if (args[i].equalsIgnoreCase("-debug")) {
                    this.options.gDebug = true;
                } else if (args[i].equalsIgnoreCase("-offset")) {
                    this.options.offset = args[++i];
                } else if (args[i].equalsIgnoreCase("-schema")) {
                    this.options.schema = args[++i];
                } else if (args[i].equalsIgnoreCase("-name")) {
                    this.options.appName = args[++i];
                } else if (args[i].equalsIgnoreCase("-alias")) {
                    this.options.appAlias = args[++i];
                } else if (args[i].equalsIgnoreCase("-imagePrefix")) {
                    this.options.imgPrefix = args[++i];
                } else if (args[i].equalsIgnoreCase("-appFilePrefix")) {
                    this.options.appFilePrefix = args[++i];
                } else if (args[i].equalsIgnoreCase("-themeFilePrefix")) {
                    this.options.themeNumber = args[++i];
                    this.options.themeFilePrefix = args[++i];
                } else if (args[i].equalsIgnoreCase("-pluginFilePrefix")) {
                    this.options.pluginType = args[++i];
                    this.options.pluginName = args[++i];
                    this.options.pluginFilePrefix = args[++i];
                } else if (args[i].equalsIgnoreCase("-proxy")) {
                    this.options.proxy = args[++i];
                } else if (args[i].equalsIgnoreCase("-installSupportingObjects")) {
                    this.options.supportingObjects = true;
                } else {
                    this.usage();
                    ctx.write("\nUnknown Option :" + args[i] + "\n")
                    return false; // return false to signal not to continue
                }
            }
            if ( ! this.options.fileName ){
                ctx.write("\nNO FILE SPECIFIED TO IMPORT\n");
                this.usage();
                ctx.write("\n")
              return false;
            }
            return true; // all is good all args processed
    }

    this.usage = function(){
            ctx.write("\nUsage "+this.CmdName+" -file [file name] [options]  \n");
            ctx.write("   -file                       APEX Export file to import. ONLY REQUIRED OPTION. \n");
            ctx.write("   -workspaceid                Workspace ID to import application into \n");
            ctx.write("   -applicationid              New Application ID or AUTO for a new generated ID \n");
            ctx.write("   -offset                     Specify the offset to be using during import \n");
            ctx.write("   -schema                     Change the PARSE_AS schema of the application \n");
            ctx.write("   -name                       Change the name of the application \n");
            ctx.write("   -alias                      Change the alias of the application \n");
            ctx.write("   -imagePrefix                Change the image prefix used in the application \n");
            ctx.write("   -appFilePrefix              Change the Application Static file prefix used in the application \n");
            ctx.write("   -themeFilePrefix            Change the Theme file prefix used in the application \n");
            ctx.write("         Example: -themeFilePrefix number prefix \n");
            ctx.write("   -pluginFilePrefix           Change the Plugin file prefix used in the application \n");
            ctx.write("         Example: -pluginFilePrefix type name prefix \n");
            ctx.write("   -proxy                      Change the proxy used by the application \n");
            ctx.write("   -installSupportingObjects   Specify to install supporting objects \n");
            ctx.write("   -debug                      Print debug messages \n");
            ctx.write("  \n");
            ctx.write("    Application Example: \n");
            ctx.write("       "+this.CmdName+"  -applicationid 31500 \n");
            ctx.write("       "+this.CmdName+"  -applicationid AUTO \n");
            ctx.write("    Offset  Example: \n");
            ctx.write("       "+this.CmdName+" -offset -123 \n");
            ctx.write("    Schema Example:\n");
            ctx.write("       "+this.CmdName+"  -schema KLRICE \n");
            ctx.write("    Application Name:\n");
            ctx.write("       "+this.CmdName+" -name MyApp\n");
            ctx.write(" \n");
            ctx.write(" SQLcl Scripting Example:\n");
            ctx.write(" \n");
            ctx.write("    script  \n");
            ctx.write("       var a = new ApexImpport();\n");
            ctx.write("       var myoptions = ['-applicationid','123'];\n");
            ctx.write("       a.run(myoptions);\n");
            ctx.write("   /\n");
    }

    this.debug=function (str){
        if ( this.options.gDebug ) { ctx.write("\n>>>"+str+"\n"); out.flush();}
    }

    this.printOptions = function(args){
      var ret = util.executeReturnList(this.sql.details,this.options);
      this.debug('Tried>>' + this.sql.details);
      this.debug('Got>>' + ret);
      ctx.write("** Importing with the following options **\n")
      if ( ret && ret.length == 1) {
          var it = ret[0].keySet().iterator();
          while(it.hasNext()){
            var key = it.next();
            var value = ret[0].get(key);
            if ( value ){
              ctx.write(key + "\t:" + value + "\n");
            }
          }
        }
      ctx.write("****\n")
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
        // debug of what was passed
        this.debug("\nRunning with Flags set:\n\t" + JSON.stringify(this.options) + "\n");
            if ( this.options.workspaceID ) {
              util.execute(this.sql.wsID,this.options);
            } else {
              // get the default workspace ( lowest WorkSpace ID with this schema assigned )
              var bind = {};
              bind.workspaceID = util.executeReturnOneCol('select min(workspace_id) wsID  from  apex_workspace_schemas where schema = user' )
              util.execute(this.sql.wsID,bind);
              var  name = util.executeReturnOneCol('select workspace_name from  apex_workspace_schemas where WORKSPACE_ID = :workspaceID' , bind)
              this.options.wsID = bind.wsID;

              ctx.write('*** USING DEFAULT WORKSPACE *** \n');
              ctx.write('*** '+name+' *** \n');

            }
            if (this.options.appID ){
              if (this.options.appID.equals('AUTO') ) {
                util.execute(this.sql.appGenID,this.options);
              } else {
                util.execute(this.sql.appID,this.options);
              }
            }
            if ( this.options.offset ){
              util.execute(this.sql.offset,this.options);
            }
            if ( this.options.schema) {
              util.execute(this.sql.schema,this.options);
            }
            if ( this.options.appName ){
              util.execute(this.sql.appName,this.options);
            }
            if ( this.options.appAlias ){
              util.execute(this.sql.appAlias,this.options);
            }
            if ( this.options.imgPrefix ){
              util.execute(this.sql.appImagePrefix,this.options);
            }
            if( this.options.appFilePrefix ){
              util.execute(this.sql.appFiles,this.options);
            }
            if ( this.options.themeNumber &&
                 this.options.themeFilePrefix ) {
                   util.execute(this.sql.themeFiles,this.options);
                 }

            if ( this.options.pluginType &&
                 this.options.pluginName &&
                 this.options.pluginFilePrefix ) {
                   util.execute(this.sql.pluginFiles,this.options);
                 }
            if ( this.options.proxy ) {
              util.execute(this.sql.proxy,this.options);
            }
            if ( this.options.supportingObjects) {
              util.execute(this.sql.supportObjs,this.options);
            }
        this.printOptions();
        ctx.write('\n')
        out.flush();
        sqlcl.setStmt("prompt running...@" + this.options.fileName);
        sqlcl.run();
        sqlcl.setStmt("@" + this.options.fileName);
        sqlcl.run();
        ctx.write("\n")
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
  if ( cmd.getSql().trim().startsWith("apximp") ) {
    // split the arguments
    args = cmd.getSql().trim().split(/\s+/);

    // is the first arg a number
    var ai = new ApexImport();
    ai.run(args);
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

var APEXImportCommand = Java.extend(CommandListener, {
        handleEvent:    cmd.handle ,
        beginEvent:     cmd.begin  ,
        endEvent:       cmd.end
});

// Registering the new Command
CommandRegistry.addForAllStmtsListener(APEXImportCommand.class);


/*
script
var a = new ApexImport();
var myoptions = ["-expWorkspace","-replace"];
a.run(myoptions);
/

*/
