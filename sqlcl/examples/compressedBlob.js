// Java imports
var GZIPOutputStream = Java.type('java.util.zip.GZIPOutputStream')
var FileInputStream = Java.type('java.io.FileInputStream')
var byteArr = Java.type("byte[]")
var HashMap = Java.type("java.util.HashMap");

/*
*  Function to take in a filename and add or create it to a map
*  with bind variables
*/
function addBindToMap(map,bindName,fileName){
    // non-compressed
     var b = conn.createBlob();
     var out = b.setBinaryStream(1);
     var path = java.nio.file.FileSystems.getDefault().getPath(fileName);
     java.nio.file.Files.copy(path, out);
     out.flush();

     // compressed
      var b2 = conn.createBlob();
      var compressedOut = new  GZIPOutputStream(b2.setBinaryStream(1));
    //
      var inStream = new FileInputStream(path.toFile());
      var buffer = new byteArr(1024);
      var len=0;
      var byte=0;
      while (  ( len = inStream.read(buffer) )   != -1) {
          compressedOut.write(buffer, 0, len);
          byte = byte + len;
      }
      compressedOut.flush();
      inStream.close();

     if ( map == null ) {
         map = new HashMap();
     }
     // put both in the bind map for comparison
     map.put("b",b);
     map.put("b2",b2);
 return map;
}


/* File name */
var file = "/Users/klrice/workspace/raptor_common/examples/f102.sql";

/* load binds */
binds = addBindToMap(null,"b",file);

/* add more binds */
binds.put("path",file);

/* exec the insert and pass binds */
var ret = util.execute("insert into k(path,blob_content,blob_compressed,when) values(:path , :b,:b2, sysdate)",binds);

/* print the results */
sqlcl.setStmt("select path,dbms_lob.getlength(blob_content) plain,dbms_lob.getlength(blob_compressed) compressed , round(100*(dbms_lob.getlength(blob_compressed)/dbms_lob.getlength(blob_content)),2) pct_of_original from k where path like '%f102%' order by when desc;");

sqlcl.run();
