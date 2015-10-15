/*  rebuild the sql that was passed in as args*/
var sql="";
for(var i=1;i<args.length;i++){
  sql = sql + " " + args[i];
}
/* print the rebuilt sql */
ctx.write(sql + "\n\n");

/*  Run it */
var ret = util.executeReturnListofList(sql,null);

/* Loop all the rows*/
for (var i = 0; i < ret.size(); i++) {
    ctx.write('>ROW \n'); 
    /* loop the columns in the row */
    for( var ii=0;ii<ret[i].size();ii++) {
        /*  ROW 0 in the array is the column headers */
        ctx.write("\t" + ret[0][ii] + " : " + ret[i][ii] + "\n");
    } 
}

ctx.write('\n\n');
