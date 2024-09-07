# Overview
Find out how to include SQLcl libraries in your product and run database and liquibase commands.
###Java Setup
Java required 
##Artifactory Repositories
###Maven


```
    <repository>
      <name>dbtools-release</name>
      <url>https://artifacthub-phx.oci.oraclecorp.com/dbtools-dev-mvn-release/</url>
      <id>dbtools-release</id>
    </repository>
```
 
###SQLcl Maven Coordinates

```
    <dependencies>
        <dependency>
            <groupId>oracle.dbtools</groupId>
            <artifactId>dbtools-arbori</artifactId>
        </dependency>
        <dependency>
            <groupId>oracle.dbtools</groupId>
            <artifactId>dbtools-net</artifactId>
        </dependency>
        <dependency>
            <groupId>oracle.dbtools</groupId>
            <artifactId>dbtools-data</artifactId>
        </dependency>
        <dependency>
            <groupId>oracle.dbtools</groupId>
            <artifactId>dbtools-datapump</artifactId>
        </dependency>
        <dependency>
            <groupId>oracle.dbtools</groupId>
            <artifactId>dbtools-http</artifactId>
        </dependency>
        <dependency>
            <groupId>oracle.dbtools</groupId>
            <artifactId>dbtools-jobs</artifactId>
        </dependency>
        <dependency>
            <groupId>com.oracle.database.jdbc</groupId>
            <artifactId>ojdbc11</artifactId>
        </dependency>
        <dependency>
            <groupId>oracle.dbtools</groupId>
            <artifactId>dbtools-common-all</artifactId>
        </dependency>
    </dependencies>
```

#Examples
##Overview
The main example here is aimed at showing how to use liquibase to prepare a changeset, in this case a simple object export, and then update the "production" db with that changeset.

##Preparation
For this to work, we need some files which the runner will run two files, one on the development db and on on the production  db.  On the development db, we need to run 

```
cd /Users/bamcgill/sandbox/liquibase/integrate
!rm *.xml
lb generate-db-object -object-name OOW_DEMO_STORES -object-type table
```

which will generate the changelog.  Change this to your specific location.  
Next, you will create a second file called lbupdate.sql, which contains the following:

```
set ddl SEGMENT_ATTRIBUTES off
set ddl storage off
lb update -chf  oow_demo_stores_table.xml 
```

This specifies the way we want ddl to be generated and applied to the database and then run the changelog we generated above.

##SQLcl Runner
This class is a wrapper around SQLcl to create a very simple API which users  can call.  
`runSQLcl("Commands to run", <SQLcl arguments>...) `

what this allows you to do is to run a script and give the api a named connection, or a url to connect. to a database.  e.g., this runs a script called `myinterestingfile.sql`  with a named connection called `cicd-dev `
`runSQLcl("@myinterestingfile.sql", "-name","cicd-dev"

```
package oracle.dbtools;
import liquibase.Scope;
import oracle.dbtools.commands.OCIConnectorTypeFactory;
import oracle.dbtools.raptor.console.ConsoleService;
import oracle.dbtools.raptor.newscriptrunner.ScriptRunnerContext;
import oracle.dbtools.raptor.newscriptrunner.ScriptRunnerContextFactory;
import oracle.dbtools.raptor.newscriptrunner.commands.connect.ConnectionContextFactory;
import oracle.dbtools.raptor.newscriptrunner.commands.connect.ConnectorTypeCacheFactory;
import oracle.dbtools.raptor.newscriptrunner.commands.connector.*;
import oracle.dbtools.raptor.newscriptrunner.util.container.ProviderFactory;
import oracle.dbtools.raptor.newscriptrunner.util.provider.EnvironmentFactory;
import oracle.dbtools.raptor.scriptrunner.cmdline.SqlCli;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * This is a simple runner for SQLcl.  We have it at this level because all commands
 * are available from here including liquibase, mle, and mdb.
 *
 * @author bamcgill
 * @author skutz
 */
public class SQLclRunner {
    PrintStream newPs;
    String result;
    private final ByteArrayOutputStream newOut;
    private final PrintStream oldOut , oldErr;
    
    public SQLclRunner() {
        oldOut = System.out;
        oldErr = System.err;
        newOut = new ByteArrayOutputStream();
        newPs = new PrintStream(newOut);
    }

    public String runSqlcl(final String input, final String... args) {
        System.setProperty("force.interactive", "true");
        System.setProperty("no.login.sql", "true");
        System.setProperty("user.dir", System.getProperty("java.io.tmpdir"));
        // this disables the highlighter. needs better way to kill banner and highlighter
        System.setProperty("dev.flag", "true");
        final InputStream inputStream = new ByteArrayInputStream((input + "\nquit\n").getBytes(StandardCharsets.UTF_8));
        final PrintStream cmdStream = new PrintStream(new OutputStream() {
            @Override
            public void write(final int b) {
            }
        });
        try {
            final ScriptRunnerContext context = getContext(newPs);
            Scope.setScopeManager(null);
            SqlCli cli = new SqlCli(context, ConsoleService.builder().streams(inputStream, cmdStream), args);
            System.setOut(newPs);
            System.setErr(newPs);
            cli.runSqlcl();
            System.setOut(oldOut);
            System.setErr(oldErr);
            newPs.flush();
            result = newOut.toString();
            newOut.reset();
            cli.close();
            return result;
        } catch (final Exception e) {
           System.out.println(e.getMessage());
        } finally {
            newOut.reset();
            result = "";
        }
        return result;
    }

    private ScriptRunnerContext getContext( PrintStream cmdStream) throws Exception {
        try {
            List<ProviderFactory<?>> contextFactories = new ArrayList<>(List.of(new ScriptRunnerContextFactory(), //
                    new EnvironmentFactory(), //
                    new ConnectionContextFactory(), //
                    new ConnectorTypeCacheFactory(), //
                    new OracleConnectorTypeFactory(), //
                    new OracleRestConnectorTypeFactory(), //
                    new CloudWalletConnectorTypeFactory(), //
                    new SocksProxyConnectorTypeFactory(), //
                    new ThirdPartyConnectorTypeFactory(), //
                    new OCIConnectorTypeFactory(), //
                    new NamedConnectionsConnectorTypeFactory()));
            final ScriptRunnerContext context = new ScriptRunnerContext(Collections.unmodifiableList(contextFactories));
            context.setSupressOutput(false);
            context.setOutputStreamWrapper(new BufferedOutputStream(cmdStream));
            return context;
        } catch (final Exception e) {
            throw new Exception(e);
        }
    }
}

```
##Connecting to a database and running a command
Now, while using the wrapper you can call out to  any file.  The demo passes in arguments to SQLcl and in this demo, we are using named connections with saved encrypted passwords. There have been two created

```
package oracle.dbtools;
/**
 * Demo for running a script in sqlcl with any command.
 */
public class SQLCLIntegrationDemo {
    public static void main(String[] args) {
        SQLclRunner runner = new SQLclRunner();
        String results = runner.runSqlcl("@/Users/bamcgill/sandbox/liquibase/integrate/lbcreatechangelog.sql;", "-name", "cicd-dev", "-s");
        System.out.println(results);
        results = runner.runSqlcl("@/Users/bamcgill/sandbox/liquibase/integrate/lbupdate.sql;", "-name", "cicd-prod", "-s");
        System.out.println(results);
    }
}

```

##Demo Results
In case you don't have time to run them, here is the run through
Look at source database

```
CICD@jdbc:oracle:thin:@localhost:8521/freepdb1🍻🍺 >show connection
COMMAND_PROPERTIES:
 type: STORE
 name: cicd-dev
 user: cicd
CONNECTION:
 CICD@jdbc:oracle:thin:@localhost:8521/freepdb1 
CONNECTION_IDENTIFIER:
 jdbc:oracle:thin:@localhost:8521/freepdb1
CONNECTION_DB_VERSION:
 Oracle Database 23ai Free Release 23.0.0.0.0 - Develop, Learn, and Run for Free
 Version 23.5.0.24.07
NOLOG:
 false
PRELIMAUTH:
 false
CICD@jdbc:oracle:thin:@localhost:8521/freepdb1🍻🍺 >tables

TABLES                     
__________________________ 
OOW_DEMO_EVENT_LOG         
OOW_DEMO_HIST_GEN_LOG      
OOW_DEMO_ITEMS             
OOW_DEMO_PREFERENCES       
OOW_DEMO_REGIONS           
OOW_DEMO_SALES_HISTORY     
OOW_DEMO_STORE_PRODUCTS    
OOW_DEMO_STORES            

8 rows selected. 
```

Look at target database before update

```
CICD@jdbc:oracle:thin:@localhost:9521/freepdb1🍻🍺 >show connection
COMMAND_PROPERTIES:
 type: STORE
 name: cicd-prod
 user: cicd
CONNECTION:
 CICD@jdbc:oracle:thin:@localhost:9521/freepdb1 
CONNECTION_IDENTIFIER:
 jdbc:oracle:thin:@localhost:9521/freepdb1
CONNECTION_DB_VERSION:
 Oracle Database 23ai Free Release 23.0.0.0.0 - Develop, Learn, and Run for Free
 Version 23.5.0.24.07
NOLOG:
 false
PRELIMAUTH:
 false
CICD@jdbc:oracle:thin:@localhost:9521/freepdb1🍻🍺 >tables

no rows selected
CICD@jdbc:oracle:thin:@localhost:9521/freepdb1🍻🍺 >
```

##Running the demo

```
java -jar -classpath ... oracle.dbtools.SQLCLIntegrationDemo


--Starting Liquibase at 2024-09-07T00:11:35.245821 (version [local build] #0 built at 2024-08-14 18:40+0000)
Changelog created and written out to file oow_demo_stores_table.xml 

Operation completed successfully.


DDL Option SEGMENT_ATTRIBUTES was set to OFF
DDL Option STORAGE was set to OFF
--Starting Liquibase at 2024-09-07T00:11:38.589070 (version [local build] #0 built at 2024-08-14 18:40+0000)
Running Changeset: oow_demo_stores_table.xml::cbace20ebfbe0a9e3b34735a1e5881e578c72dfa::(CICD)-Generated

Table "OOW_DEMO_STORES" created.



UPDATE SUMMARY
Run:                          1
Previously run:               0
Filtered out:                 0
-------------------------------
Total change sets:            1

Liquibase: Update has been successful. Rows affected: 1


Operation completed successfully.



Process finished with exit code 0

```

## Liquibase artifacts
After the completion, there will be 4 tables

```
CICD@jdbc:oracle:thin:@localhost:9521/freepdb1🍻🍺 >tables

TABLES                       
____________________________ 
DATABASECHANGELOG_ACTIONS    
DATABASECHANGELOG            
DATABASECHANGELOGLOCK        
OOW_DEMO_STORES              

CICD@jdbc:oracle:thin:@localhost:9521/freepdb1🍻🍺 >
```

You can see the changelings run 

```
CICD@jdbc:oracle:thin:@localhost:9521/freepdb1🍻🍺 >select * from DATABASECHANGELOG;

ID                                          AUTHOR              FILENAME                     DATEEXECUTED                       ORDEREXECUTED EXECTYPE    MD5SUM                                DESCRIPTION                                                    COMMENTS    TAG    LIQUIBASE    CONTEXTS    LABELS    DEPLOYMENT_ID    
___________________________________________ ___________________ ____________________________ _______________________________ ________________ ___________ _____________________________________ ______________________________________________________________ ___________ ______ ____________ ___________ _________ ________________ 
cbace20ebfbe0a9e3b34735a1e5881e578c72dfa    (CICD)-Generated    oow_demo_stores_table.xml    06-SEP-24 23.11.46.470315000                   1 EXECUTED    9:21a16b87e12612a9becb5fa775210c5a    createSxmlObject objectName=OOW_DEMO_STORES, ownerName=CICD                       DEV                                5664302856       

CICD@jdbc:oracle:thin:@localhost:9521/freepdb1🍻🍺 >
```
and the actions which took place.

```
CICD@jdbc:oracle:thin:@localhost:9521/freepdb1🍻🍺 >select * from DATABASECHANGELOG_ACTIONS;

ID                                             SEQUENCE SQL                                                                                 SXML    AUTHOR              FILENAME                     DEPLOYMENT_ID    STATUS    
___________________________________________ ___________ ___________________________________________________________________________________ _______ ___________________ ____________________________ ________________ _________ 
cbace20ebfbe0a9e3b34735a1e5881e578c72dfa              0 CREATE TABLE "OOW_DEMO_STORES" 
   (	"ID" NUMBER,
	"ROW_VERSION_NUMBER" NUMBER,
            (CICD)-Generated    oow_demo_stores_table.xml    5664302856       RAN       

CICD@jdbc:oracle:thin:@localhost:9521/freepdb1🍻🍺 >
```