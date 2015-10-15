load('../lib/helpers.js');

var ret = helpers.exec('ls -l');

ctx.write("Return Code:\n");
ctx.write(ret.rc + "\n");

ctx.write("STDOUT:\n");
ctx.write(ret.stdout + "\n");

ctx.write("STDERR:\n");
ctx.write(ret.stderr + "\n");
