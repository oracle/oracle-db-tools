/*  execute a sql and get the first column of the first row as a return*/
var dbUser = util.executeReturnOneCol('select user from dual');


/*  based on the connect user change my SQL prompt*/
if ( dbUser == 'KLRICE' ) {
 sqlcl.setStmt('set sqlprompt "@|red _USER|@@@|green _CONNECT_IDENTIFIER|@@|blue  🍻🍺  >|@"');
} else {
 sqlcl.setStmt('set sqlprompt "@|blue  _USER|@@@|green _CONNECT_IDENTIFIER|@@|blue 🍼 >|@"');
}

sqlcl.run();
