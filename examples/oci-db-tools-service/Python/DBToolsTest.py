import oci
import sys
import base64
from oci.config import from_file 
from oci.database_tools import DatabaseToolsClient
from oci.database_tools.models import CreateDatabaseToolsConnectionOracleDatabaseDetails
import cx_Oracle


# Author: Jiadong Chen

config = from_file()
#verify your OCI credential
#identity = oci.identity.IdentityClient(config)
#user = identity.get_user(config["user"]).data
#print(user)

'''

# Step1 : Create your database connection service

database_tools_client = DatabaseToolsClient(config)
create_database_tools_connection_response = database_tools_client.create_database_tools_connection(
    create_database_tools_connection_details=CreateDatabaseToolsConnectionOracleDatabaseDetails(
        type="ORACLE_DATABASE",
        display_name="ORDSTEST1",
        user_name="ADMIN",
        connection_string = "(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.us-ashburn-1.oraclecloud.com))(connect_data=(service_name=g8c61bada8f9688_ordsadb_high.adb.oraclecloud.com))(security=(ssl_server_cert_dn=\"CN=adwc.uscom-east-1.oraclecloud.com, OU=Oracle BMCS US, O=Oracle Corporation, L=Redwood City, ST=California, C=US\")))",
        compartment_id="ocid1.compartment.oc1..aaaaaaaa6unvivswojxzuno2zt63fogpoyf2ctz5eo6onmcg5utzmov73g5a",
        user_password=oci.database_tools.models.DatabaseToolsUserPasswordSecretIdDetails(
            value_type="SECRETID",
            secret_id="ocid1.vaultsecret.oc1.iad.amaaaaaaphbmcfyaofygrsbc65l3uoygfqt25t2pm7kxjzjhcfgzro5qdkqq"),
        key_stores=[
            oci.database_tools.models.DatabaseToolsKeyStoreDetails(
                key_store_type="SSO",
                key_store_content=oci.database_tools.models.DatabaseToolsKeyStoreContentSecretIdDetails(
                    value_type="SECRETID",
                    secret_id="ocid1.vaultsecret.oc1.iad.amaaaaaaphbmcfyabo2b7yjyr6hjfuwqdzvdfg7y6a5j6rxmv2tlbv6gkgia"))]))

print(create_database_tools_connection_response.data)
'''

# Step 2: Get secret id and retrieve the password for PDB.


# Get the secret id and username
database_tools_client = oci.database_tools.DatabaseToolsClient(config)
get_database_tools_connection_response = database_tools_client.get_database_tools_connection(
    database_tools_connection_id="ocid1.databasetoolsconnection.oc1.iad.amaaaaaaphbmcfya76e3gnukxvvbvtphf5d3a42cai77y333tpu7xniboyfq")
user_name = get_database_tools_connection_response.data.user_name
secret_id = get_database_tools_connection_response.data.user_password.secret_id

# Intepret the secret id to password
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
#print("Decoded content of the secret is: {}.".format(secret_content))


#Step 3:  Pass the database user credential to Python Driver

cx_Oracle.init_oracle_client("/Users/jiadongchen/Downloads/instantclient_19_8")

# Connect to autonomous database by using the user_name and password from the response
connection = cx_Oracle.connect(user=user_name, password=secret_content, dsn="ORDSADB_high")

print("Successfully connected to Oracle Database")

cursor = connection.cursor()

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



