# Sample template/directory structure for database and NodeJS CICD

This directory structure is a sample structure that can be used for CICD with the Oracle Database and NodeJS



## Directory Overview

The following structure would be used as a guide. The Database directory would be populated via liquibase and SQLcl. Using the -split option, liquibase would create folders for each type of database object (table, function, procedure, etc). The APEX directory would be populated with either an export via SQLcl or liquibase.


```
Repository Top Level
    README.md
    version.txt
    docker
        Dockerfile
    Database
        controler.xml
        Tables
            ...
        Procedures
            ...
        Functions
            ...
        Indexes
            ...
        (all db objects)
    node-app
        package.json
        index.js
    etc folder
        presetup
            ...
        postsetup
            ...
        mainsetup
            ...
    ut
        utPLSQL
            scripts
            ...
    static
        html
            ...
        css
            ...
        js
            ...
        images
            ...
```

