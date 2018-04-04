/*
    This is a javascript library to make some of the common things
    in SQLCL simplier.
*/

var helpers = {} ;

/* for complex type a java hashmap is needed for binds */
helpers.getBindMap = function(){
   var HashMap = Java.type("java.util.HashMap");
   map = new HashMap();
   return map;
};

/* create a temp blob and load it from a local to sqlcl file */
helpers.getBlobFromFile=function (fileName){
   try { 
     var b = conn.createBlob();
     var out = b.setBinaryStream(1);
     var path = java.nio.file.FileSystems.getDefault().getPath(fileName);
     java.nio.file.Files.copy(path, out);
     out.flush();
     return b;
  } catch(e){
    ctx.write(e);
  }
};

/* makes getting a DBUtil instance easier */
helpers.getDBUtil=function(){
   var DBUtil  = Java.type("oracle.dbtools.db.DBUtil");
   return DBUtil;
}

/* This converts the results of util.executeReturnList from a java List<HashMap> to a JSON object. */
helpers.resultsToJSON=function(ret){
   var data = [] ;
   for ( r in ret ) {
     /* loop all the columns in the row */
      var set = ret[r].keySet().iterator();;
      var row = {};
      while( set.hasNext() ) {
         var key = set.next();
         row[key] = ret[r][key];                
      } 
      data[data.length] = row;
   }
  return data;

}

/*
*  Runs the passed in command and returns an Object with
*   .rc      - the return code
*   .stdout  - STDOUT
*   .stderr  - STDERR 
*
*/
helpers.exec=function(cmd){
    var RunTime  = Java.type("java.lang.Runtime");
    var Scanner  = Java.type("java.util.Scanner");
    var p = RunTime.getRuntime().exec(cmd);

    var ret={};
        s = new Scanner(p.getInputStream()).useDelimiter("\\A");  
        ret.stdout = s.hasNext() ? s.next().trim() : "";
        s = new Scanner(p.getErrorStream()).useDelimiter("\\A");  
        ret.stderr = s.hasNext() ? s.next().trim() : "";
        
        p.waitFor();
        ret.rc = p.exitValue();
      p.destroy();
    return ret;
}



