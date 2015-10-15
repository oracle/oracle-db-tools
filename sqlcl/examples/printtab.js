var sql="";
for(var i=1;i<args.length;i++){
  sql = sql + " " + args[i];
}
ctx.write(sql + "\n\n");


var ret = util.executeReturnListofList(sql,null);

for (var i = 0; i < ret.size(); i++) {
    ctx.write('>ROW \n'); 
    for( var ii=0;ii<ret[i].size();ii++) {
        ctx.write("\t" + ret[0][ii] + " : " + ret[i][ii] + "\n");
    } 
}

ctx.write('\n\n');
