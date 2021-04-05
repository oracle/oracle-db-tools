Database CI/CD Flows

Creating Developer Instances/Testing Clones
Using Autonomous Database

Clones of development/uat/production (full or metadata only)

create new and apply full repo

Testing clones


clone and apply changes/latest (full or metadata only)

to test - applying the repo to a clone with a changelog
DevOps Cloud Control

https://hwra0uayubam3eq-dcc.adb.us-ashburn-1.oraclecloudapps.com/ords/r/dcc/devops-cloud-control/login?session=617104147646245&tz=-10:00


Terraform

https://registry.terraform.io/providers/hashicorp/oci/latest/docs/resources/database_autonomous_database
PLSQL OCI SDK

https://docs.oracle.com/en-us/iaas/pl-sql-sdk/doc/dbms_cloud_oci_db_database.html#ADSDK-GUID-6D4375F1-8572-41E1-9B80-EA004407CEC3

OCI CLI

https://docs.oracle.com/en-us/iaas/tools/oci-cli/2.22.1/oci_cli_docs/cmdref/db/autonomous-database/create.html
Using OCI DB VMs
Create a new VM from a backup
Terraform

https://registry.terraform.io/providers/hashicorp/oci/latest/docs/resources/database_db_system

(source=DB_BACKUP)

source - (Optional) The source of the database: Use NONE for creating a new database. Use DB_BACKUP for creating a new database by restoring from a backup. Use DATABASE for creating a new database from an existing database, including archive redo log data. The default is NONE.
PLSQL OCI SDK

https://docs.oracle.com/en-us/iaas/pl-sql-sdk/doc/dbms_cloud_oci_db_database.html#ADSDK-GUID-CA3B1ED2-1E9E-4890-9F2F-98C871CC71F4

https://docs.oracle.com/en-us/iaas/pl-sql-sdk/doc/database_t.html#ADSDK-GUID-5E53FFB6-FD4D-4E9F-8074-5A98D9CFA961
OCI CLI

https://docs.oracle.com/en-us/iaas/tools/oci-cli/2.22.1/oci_cli_docs/cmdref/db/database/create-database-from-backup.html
Clone a VM DB
OCI CLI

https://docs.oracle.com/en-us/iaas/tools/oci-cli/2.22.1/oci_cli_docs/cmdref/db/database/create-from-database.html
Terraform

https://registry.terraform.io/providers/hashicorp/oci/latest/docs/resources/database_db_system

(source=DB_BACKUP)

source - (Optional) The source of the database: Use NONE for creating a new database. Use DB_BACKUP for creating a new database by restoring from a backup. Use DATABASE for creating a new database from an existing database, including archive redo log data. The default is NONE.


Create a new DB VM
Terraform

https://registry.terraform.io/providers/hashicorp/oci/latest/docs/resources/database_database
Using OCI ExaCS
Sparse Cloning

create pluggable database SPARSE_COPY 
  from MASTER_COPY tempfile reuse 
create_file_dest='+SPRC3' snapshot copy 
keystore identified by "TDE_WALLET_PASSWORD";

DB-APIs via ORDS

https://docs.oracle.com/en/database/oracle/oracle-database/21/dbrst/api-pluggable-database-lifecycle-management.html
Using Multi-tenancy
DB-APIs via ORDS

https://docs.oracle.com/en/database/oracle/oracle-database/21/dbrst/api-pluggable-database-lifecycle-management.html
Using REST-Enabled SQL Service

https://docs.oracle.com/en/database/oracle/oracle-rest-data-services/20.4/aelig/rest-enabled-sql-service.html#GUID-BA9F9457-ED3A-48A4-828A-CC8CBEA9A2AB
Using SQL*Plus

create pluggable database MASTER_COPY
from MASTER_COPY tempfile reuse
keystore identified by "TDE_WALLET_PASSWORD";

xxxx
Reusable Instance - Guaranteed Restore Points/Flashback Database
Flashback Database must be enabled

(This is enabled by default in the cloud)

SQL> select flashback_on from v$database;         

FLASHBACK_ON
------------------ 
YES

To enable Flashback Database the database must be stopped (This is enabled by default in the cloud)

$ srvctl stop database –d mydb
SQL> startup mount;
SQL> alter database flashback on;
SQL> alter database open;
$ srvctl start database –d mydb


You can only rewind with Flashback Database
Setting a Guaranteed Restore Point

To set a guaranteed restore point you must:

Define the DB_RECOVERY_FILE_DEST_SIZE and the DB_RECOVERY_FILE_DEST upfront (This should be already done in the cloud).

SQL> alter system set db_recovery_file_dest_size=10G;
System altered. 

SQL> alter system set db_recovery_file_dest='+RECOC1';
System altered.

No shutdown is necessary to adjust these values.
Set a Guaranteed Restore Point

SQL> create restore point GRP1 guarantee flashback database;
Restore point created.

Check the existing restore points

SQL> select con_id, name, time, guarantee_flashback_database from v$restore_point order by 1,2;
CON_ID             NAME           TIME                                         GUARANTEE
----------         ----------     --------------------------------             --------
0                  GRP1           02-Apr-21 02.03.07.000000000 PM              YES

Using a Guaranteed Restore Point

Revert to the restore point you have created upfront.

$ srvctl stop database –d mydb –o abort
SQL> startup mount
SQL> flashback database to restore point GRP1;
SQL> alter database open resetlogs;
SQL> exit            
$ srvctl stop database –d mydb –o abort            
$ srvctl start database –d mydb

Drop the restore point

SQL> drop restore point GRP1;

Reusable Instance - RMAN duplicate/clone

COVID Prod Clone details
Reusable Instance - Datapump

https://docs.oracle.com/en/database/oracle/sql-developer/20.4/rptug/sql-developer-concepts-usage.html#GUID-90026D05-9F09-4FE6-82AF-711F717562DF

https://docs.oracle.com/en/database/oracle/oracle-database/21/arpls/DBMS_DATAPUMP.html#GUID-AEA7ED80-DB4A-4A70-B199-592287206348
Docker/Virtual Machines

Create new instance of same version and apply latest release from git/repo
ACFS/gDBClone

gDBClone Powerful Database Clone/Snapshot Management Tool (Doc ID 2099214.1)

create clone of dev/uat/prod on ACFS


