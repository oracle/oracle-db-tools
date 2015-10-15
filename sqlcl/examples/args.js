/* loop over all args passed in and print them */
for(var arg in args) {
   ctx.write(arg + ":" + args[arg]);
   ctx.write("\n");
}
