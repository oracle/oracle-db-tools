/*  
*  Function to take in a filename and add or create it to a map
*  with bind variables
*/
function addBindToMap(map,bindName,fileName){
     /*  conn is the actual JDBC connection */
     var b = conn.createBlob();

     var out = b.setBinaryStream(1);

     var path = java.nio.file.FileSystems.getDefault().getPath(fileName);

     /* slurp the file over to the blob */
     java.nio.file.Files.copy(path, out);
     out.flush();

     if ( map == null ) {
         /* java objects as binds needs a hashmap */
         var HashMap = Java.type("java.util.HashMap");
         map = new HashMap();
     }
     /* put the bind into the map */
     map.put("b",b);
 return map;
}


/* File name */
var file = "/Users/klrice/workspace/raptor_common/10_5.log";

/* load binds */
binds = addBindToMap(null,"b",file);

/* add more binds */
binds.put("path",file);

/* exec the insert and pass binds */
var ret = util.execute("insert into k(path,blob_content,when) values(:path , :b, sysdate)",binds);

/* print the results */
sqlcl.setStmt("select path,dbms_lob.getlength(blob_content) from k order by when desc;");

sqlcl.run();

