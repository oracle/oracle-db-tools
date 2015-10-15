/* Look up a single value to use in a bind later */
var user = util.executeReturnOneCol('select user from dual');

/* simple string or number binds can be a js object */
var binds = {};
binds.name = 'EMP';
binds.who = user;

ctx.write('Using Binds:'+ binds + '\n');

ctx.write('***************************************************************\n');
ctx.write('*****    SIMPLE LOOP OF LIST OF LIST                ***********\n');
ctx.write('***************************************************************\n');


var ret = util.executeReturnListofList('select object_name,object_type from  all_objects where object_name = :name and owner = :who ',binds);

for (var i = 0; i < ret.length; i++) {
    ctx.write( ret[i][1]  + "\t" + ret[i][0] + "\n");
}

ctx.write('\n\n');

ctx.write('***************************************************************\n');
ctx.write('*****    SIMPLE LOOP OF LIST OF NAMES WITH BINDS     **********\n');
ctx.write('***************************************************************\n');


ret = util.executeReturnList('select object_name,object_type from  all_objects where object_name = :name and owner = :who ',binds);

for (i = 0; i < ret.length; i++) {
    ctx.write( ret[i].OBJECT_TYPE  + "\t" + ret[i].OBJECT_NAME+ "\n");
}
