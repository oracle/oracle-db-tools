# Connect and Query Autonomous Database Using the Database Tool Connection Service





[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger)

Hi, Welcome to Oracle Databse Tools Connection Service. In this tutorial you will learn how to connect to our autonomous database without saving the username/password in code or environment variables. The only thing you need is the OCID from the database tool connection service and the SDK will do the rest for you. Here we have two examples of using both Python and Java to achieve this, enjoy. 



## Python
Dependencies: First we will need to import some dependencies from the database tools connection service, Python driver and OCI configuration. 

If you have never done so, you can use the following command to download related packages.
```sh 
pip install cx_Oracle oci base64
```
Next, download the free Oracle Instant Client Basic zip file from [Oracle Instant Client for Microsoft Windows (x64) 64-bit](https://www.oracle.com/database/technologies/instant-client/winx64-64-downloads.html). (If your Python is 32-bit, then you will need to download the 32-bit Basic package from here instead). Remember to install the matching VS Redistributable, as shown on the download page.

Then, extract the libraries to an accessible directory, for example the libraries could be in C:\oracle\instantclient_19_9. Once it's all done, we can start creating our Python applications!

#### Step 0: Import the Packages

```sh
import oci
import sys
import base64
import cx_Oracle
from oci.config import from_file 
from oci.database_tools import DatabaseToolsClient
from oci.database_tools.models import CreateDatabaseToolsConnectionOracleDatabaseDetails
```
#### Step 1: Validate the OCI identity.

```sh
config = from_file()
identity = oci.identity.IdentityClient(config)
user = identity.get_user(config["user"]).data
print(user)
```
#### Step 2: Get the secret ID and user name for your connection service.

```sh
database_tools_client = oci.database_tools.DatabaseToolsClient(config)
get_database_tools_connection_response = database_tools_client.get_database_tools_connection(database_tools_connection_id="ocid1.databasetoolsconnection.oc1.iad.amaaaaaaphbmcfya76e3gnukxvvbvtphf5d3a42cai77y333tpu7xniboyfq")
user_name = get_database_tools_connection_response.data.user_name
secret_id = get_database_tools_connection_response.data.user_password.secret_id
```
#### Step 3: Translate the secret to password.

```sh
def read_secret_value(secret_client, secret_id):
    print("Reading vaule of secret_id {}.".format(secret_id))   
    response = secret_client.get_secret_bundle(secret_id)
    base64_Secret_content = response.data.secret_bundle_content.content
    base64_secret_bytes = base64_Secret_content.encode('ascii')
    base64_message_bytes = base64.b64decode(base64_secret_bytes)
    secret_content = base64_message_bytes.decode('ascii')
    return secret_content
    
secret_client = oci.secrets.SecretsClient(config)
secret_content = read_secret_value(secret_client, secret_id)
```
#### Step 4: Pass the database user credential to Python Driver (cx_Oracle).
```sh
# Remember to replace the client URL below 
cx_Oracle.init_oracle_client("/Users/jiadongchen/Downloads/instantclient_19_8")
connection = cx_Oracle.connect(user=user_name, password=secret_content, dsn="ORDSADB_high")
print("Successfully connected to Oracle Database")
cursor = connection.cursor()
```
#### Step 5: Talk to autonomous database.
```sh
# Create a table
cursor.execute("""
    begin
        execute immediate 'drop table todoitem';
        exception when others then if sqlcode <> -942 then raise; end if;
    end;""")

cursor.execute("""
    create table todoitem (
        id number generated always as identity,
        description varchar2(4000),
        creation_ts timestamp with time zone default current_timestamp,
        done number(1,0),
        primary key (id))""")

# Insert some data
rows = [ ("Task 1", 0 ),
         ("Task 2", 0 ),
         ("Task 3", 1 ),
         ("Task 4", 0 ),
         ("Task 5", 1 ) ]

cursor.executemany("insert into todoitem (description, done) values(:1, :2)", rows)
print(cursor.rowcount, "Rows Inserted")

connection.commit()

# Now query the rows back
for row in cursor.execute('select description, done from todoitem'):
    if (row[1]):
        print(row[0], "is done")
    else:
        print(row[0], "is NOT done")
```
##### Done!
As a result, you should be able to see the result from your terminal like this:
```sh
Successfully connected to Oracle Database
5 Rows Inserted
Task 1 is NOT done
Task 2 is NOT done
Task 3 is done
Task 4 is NOT done
Task 5 is done
```


##### Author: 
Jiadong Chen, Product Manager of Oracle Database Tools


