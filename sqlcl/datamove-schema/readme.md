# datamove-schema scripts

A set of scripts to datapump a schema from a local database to an ADW cloud database.

*Only tested with Oracle XE 18 (18.4.0.0.0) (local) and Oracle Database 19c (19.5.0.0.0) (ADW)* 

## Typical Usage:
* edit dms-setup.sql to supply required information
* SQL> cd \<datamove-schema\>
* SQL> @@dms-datamove

## The scripts
* @@dms-datamove  - Controller script that runs the following in sequence
* @@dms-setup     - Define required variables for the run
* @@dms-precheck  - Perform preflight checks (TODO)
* @@dms-dpexp     - Perform data pump export on local database
* @@dms-dpxfer    - Transfer data pump files to object storage
* @@dms-dpimp     - Import data pump from object storage to autonomous cloud db
* @@dms-postcheck - Perform post run checks
* @@dms-teardown  - Undefine used

## License
This project is licensed under the terms of the MIT license.
