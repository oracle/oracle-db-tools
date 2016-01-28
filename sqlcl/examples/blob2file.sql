script
// issue the sql
var  ret = util.executeReturnList('select id,file_name,file_content from images',null);

// loop the results
for (i = 0; i < ret.length; i++) {
   // debug is nice
    ctx.write( ret[i].ID  + "\t" + ret[i].FILE_NAME+ "\n");
   // get the blob stream

     var blobStream =  ret[i].FILE_CONTENT.getBinaryStream(1);

   // get the path/file handle to write to
     var path = java.nio.file.FileSystems.getDefault().getPath(ret[i].FILE_NAME);

   // dump the file stream to the file
     java.nio.file.Files.copy(blobStream,path);
}
/
