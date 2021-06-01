# Sample template/directory structure for database and APEX CICD

This directory structure is a sample structure that can be used for CICD with the Oracle Database and APEX

## DIrectory Overview


```
Repository Top Level
    JenkinsFile (if using jenkins)
    README.md
    version.txt
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
    APEX (or Apps)
        FXXX.xml
        FXXX
            ...
        FYYY.xml
        FYYY
            ...
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

