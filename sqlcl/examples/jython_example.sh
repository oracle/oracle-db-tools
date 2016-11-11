# all files in sqlcl/lib/*

CP=SQLinForm.jar:commons-codec.jar:commons-logging.jar:httpclient.jar:httpcore.jar:httpmime.jar:jackson-annotations.jar:jackson-core.jar:jackson-databind.jar:javax.json.jar:jline.jar:jsch.jar:k.sh:ojdbc7.jar:oracle.dbtools-common.jar:oracle.dbtools.http.jar:oracle.dbtools.jdbcrest.jar:oracle.sqldeveloper.sqlcl.jar:oraclepki.jar:orai18n-mapping.jar:orai18n-utility.jar:orai18n.jar:orajsoda.jar:osdt_cert.jar:osdt_core.jar:xdb6.jar:xmlparserv2.jar

#jython till EOF
jython -Dpython.path=$CP <<EOF

#import various things
from java.sql import DriverManager
from oracle.dbtools.db import DBUtil
from oracle.dbtools.raptor.newscriptrunner import *

#plain ol jdbc connection
conn  = DriverManager.getConnection(
         'jdbc:oracle:thin:@//localhost:1521/orcl','klrice','klrice');

#get a DBUtil for later if needed
util  = DBUtil.getInstance(conn);
#create sqlcl
sqlcl = ScriptExecutor(conn);
#setup the context
ctx = ScriptRunnerContext()
#set the context
sqlcl.setScriptRunnerContext(ctx)
ctx.setBaseConnection(conn);
#change the format
sqlcl.setStmt('set sqlformat json');
sqlcl.run();
#run the sql
sqlcl.setStmt('select * from emp');
sqlcl.run();

EOF
