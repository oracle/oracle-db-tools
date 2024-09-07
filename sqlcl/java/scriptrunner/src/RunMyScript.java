import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.UnsupportedEncodingException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import oracle.dbtools.raptor.newscriptrunner.ScriptExecutor;
import oracle.dbtools.raptor.newscriptrunner.ScriptRunnerContext;
import oracle.dbtools.db.ResultSetFormatter;


public class RunMyScript {

  public static void main(String[] args) throws SQLException, UnsupportedEncodingException {
    Connection conn = DriverManager.getConnection("jdbc:oracle:thin:@//localhost:1521/XE", "klrice", "klrice");
    conn.setAutoCommit(false);

    // #create sqlcl
    ScriptExecutor sqlcl = new ScriptExecutor(conn);

    // #setup the context
    ScriptRunnerContext ctx = new ScriptRunnerContext();
		    
    // set the output max rows
		ResultSetFormatter.setMaxRows(10000);
    // #set the context
    sqlcl.setScriptRunnerContext(ctx);
    ctx.setBaseConnection(conn);
    
    // Capture the results without this it goes to STDOUT
    ByteArrayOutputStream bout = new ByteArrayOutputStream();
    BufferedOutputStream buf = new BufferedOutputStream(bout);
    sqlcl.setOut(buf);


    // # run a whole file 
    // adjust the path as it needs to be absolute
    sqlcl.setStmt("@/Users/klrice/workspace_commons/sqlcl-java/myfile.sql");
    sqlcl.run();


    String results = bout.toString("UTF8");
    results = results.replaceAll(" force_print\n", "");
    System.out.println(results);
  }

}
