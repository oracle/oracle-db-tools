// SQLCL's Command Registry
var CommandRegistry = Java.type("oracle.dbtools.raptor.newscriptrunner.CommandRegistry");

// CommandListener for creating any new command
var CommandListener =  Java.type("oracle.dbtools.raptor.newscriptrunner.CommandListener")
var AudioSystem     =  Java.type("javax.sound.sampled.AudioSystem");
var File     =  Java.type("java.io.File");

function play(sound){
   try {
        var path = new File(sound);
        var audioInputStream = AudioSystem.getAudioInputStream(path);
        var clip = AudioSystem.getClip();
        clip.open(audioInputStream);
        clip.start();
    } catch( ex) {
        ctx.write("Error with playing sound.\n");
        ex.printStackTrace();
    }
}


// Broke the .js out from the Java.extend to be easier to read
var cmd = {};

// Called to attempt to handle any command
cmd.handle = function (conn,ctx,cmd) {
   return false;
}

// fired before ANY command
cmd.begin = function (conn,ctx,cmd) {

}

// fired after ANY Command
cmd.end = function (conn,ctx,cmd) {
  if ( ctx.getProperty("sqldev.last.err.message") ) {    
  
    //  
    //  GET FILES and customize
    // 
  
  
      play("chew_roar.wav");
    } else {
    
    //  
    //  GET FILES and customize
    // 
      play("R2.wav");
    }
}

// Actual Extend of the Java CommandListener

var SoundCommand = Java.extend(CommandListener, {
		handleEvent: cmd.handle ,
        beginEvent:  cmd.begin  , 
        endEvent:    cmd.end    
});

// Registering the new Command
CommandRegistry.addForAllStmtsListener(SoundCommand.class);


