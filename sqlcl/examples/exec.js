load('https://raw.githubusercontent.com/oracle/Oracle_DB_Tools/master/sqlcl/lib/helpers.js');

/* execute the host command and grab the returned object */
var ret = helpers.exec('ls -l');

ctx.write("Return Code:\n");
ctx.write(ret.rc + "\n");

ctx.write("STDOUT:\n");
ctx.write(ret.stdout + "\n");

ctx.write("STDERR:\n");
ctx.write(ret.stderr + "\n");
