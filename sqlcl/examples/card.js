var CopyFormatter  = Java.type("oracle.dbtools.raptor.format.CopyFormatter")
var FormatRegistry = Java.type("oracle.dbtools.raptor.format.FormatRegistry")
var NLSUtils       = Java.type("oracle.dbtools.raptor.utils.NLSUtils");

var cmd = {};
	cmd.rownum = 0;
	cmd.start       = function() { 
	}
	cmd.startRow    = function() { 
		cmd.rownum++;
		ctx.write("ROW:" + cmd.rownum+ "\n");
	}

	cmd.printColumn = function(val,view,model) {
		try{
		 var v  = NLSUtils.getValue(conn,val);
		 ctx.write("\t" + v + "\n");
		} catch(e){
			ctx.write(e);
		}
	} 
	cmd.endRow = function () {

	} 
	cmd.end    = function () {

	}
    cmd.type = function() {
    	return "card";
  	}

    cmd.ext = function() {
    	return ".card";
  	}
// Actual Extend of the Java CommandListener
var CardFormat = Java.extend(CopyFormatter, {
		start: 		 cmd.start,
		startRow: 	 cmd.startRow,
		printColumn: cmd.printColumn,
		endRow: 	 cmd.endRow ,
        end: 		 cmd.end,
        getType: 	 cmd.type,
        getExt: 	 cmd.ext, 
        setTableName: function(){}

});

// Registering the new Command
FormatRegistry.registerFormater(new CardFormat());
