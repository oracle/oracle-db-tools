var dbUser = util.executeReturnOneCol('select user from dual');

if ( dbUser == 'KLRICE' ) {
 sqlcl.setStmt('set sqlprompt "@|red _USER|@@@|green _CONNECT_IDENTIFIER|@@|blue  🍻🍺  >|@"');
} else {
 sqlcl.setStmt('set sqlprompt "@|blue  _USER|@@@|green _CONNECT_IDENTIFIER|@@|blue 🍼 >|@"');
}

sqlcl.run();
