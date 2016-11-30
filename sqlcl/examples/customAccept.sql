script
  // turn on Substitutions manually
  // normally this is done when the accept /scan/ var/define commands are used
  ctx.setSubstitutionOn(true);
  var answer=null;

  // silly loop
  while(answer != '42' ) {
     // prompt and return the input.
     // last false flag is for hide for use with things like passwords not to echo
     answer = ctx.getPromptedFieldProvider().getPromptedField(ctx, 'The answer to the ultimate question?', false);
     if ( answer != '42' ) {
        ctx.write("Your Guess : " + answer + " is WRONG\n");
     }
     out.flush();
  }

// put the answer into the map of things to Substitution
ctx.getMap().put("ANSWER",answer);
/

prompt
prompt running:  select ^ANSWER from dual;
prompt

select ^ANSWER from dual;
