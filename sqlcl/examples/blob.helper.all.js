load('https://raw.githubusercontent.com/oracle/Oracle_DB_Tools/master/sqlcl/lib/helpers.js');

/* Clean out the table  */
sqlcl.setStmt("truncate table k");
sqlcl.run();

/* File name */ 
var files= helpers.exec('find . -maxdepth 1 -type f ').stdout.split('\n');

/* bind for reuse */
var binds = helpers.getBindMap();

for(f in files ) {
  //ctx.write("Loading : " + files[f] + "\n");
  /* load the blob */
  blob = helpers.getBlobFromFile(files[f]);

  /* assign the binds */
  binds.put("path",files[f]);
  binds.put("b",blob);

 /* Just do it */
  var ret = util.execute("insert into k(path,blob_content,when) values(:path , :b, sysdate)",binds);
}

/* print the results */
sqlcl.setStmt("select path,dbms_lob.getlength(blob_content) from k order by when desc;");
sqlcl.run();
