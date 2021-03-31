# SQLcl

![SQLcl logo](images/sql-command-line-200.png)

SQLcl is the core scripting library for Oracle SQL Developer.  That library has been factored out and wrappered with a command line to bring SQLcl.

# SQLcl Download

The tool can be downloaded from Oracle.com here: [http://www.oracle.com/technetwork/developer-tools/sqlcl/overview/index.html](http://www.oracle.com/technetwork/developer-tools/sqlcl/overview/index.html)

# Scripting

SQLcl scripting is based on Java's [JSR-223](https://jcp.org/aboutJava/communityprocess/final/jsr223/index.html) which allows scripting languages to be executed from the Java VM.  There are a number of languages that can be plugged in with the NashHorn Javascript engine being included in Java.  A list of languages can be found [here](https://en.wikipedia.org/wiki/List_of_JVM_languages) 

More Here: [Scripting](SCRIPTING.md)

# Java

SQLcl is written in java and those java classes can also be leveraged directly. This can facilite running sql scripts from existing java programs. There are a lot of features that can be leveraged and this will be exapanding in the /java/ folder.

More Here: [Java](java/README.md)
