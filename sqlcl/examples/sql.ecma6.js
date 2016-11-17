/* Look up a single value to use in a bind later */
var user = util.executeReturnOneCol('select user from dual');

var binds = {};
binds.name = 'EMPLOYEES';
binds.who = user;

ctx.write('Using Binds:'+ binds + '\n');

ctx.write(`
  ***************************************************************
  *****    SIMPLE LOOP OF LIST OF LIST                ***********
  ***************************************************************\n`);

var ret = util.executeReturnListofList(`select object_name,object_type
                                          from  all_objects
                                         where object_name = :name
					   and owner = :who `,binds);

for (var i = 0; i < ret.length; i++) {
    ctx.write( ` ${ret[i][1]} \t  ${ret[i][0]} \n`);
}

ctx.write('\n\n');

ctx.write(`
  ***************************************************************
  *****    SIMPLE LOOP OF LIST OF NAMES WITH BINDS     **********
  ***************************************************************\n`);

ret = util.executeReturnList(`select object_name,object_type
                                from  all_objects
			       where object_name = :name
			         and owner = :who `,binds);

for (i = 0; i < ret.length; i++) {
    ctx.write( ` ${ret[i].OBJECT_TYPE} \t  ${ret[i].OBJECT_NAME}  \n`);
}
