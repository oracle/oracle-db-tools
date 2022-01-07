# Connect and Query Autonomous Database Using the Database Tool Connection Service





[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger)

Hi, Welcome to Oracle Databse Tools Connection Service. In this tutorial you will learn how to connect to our autonomous database without saving the username/password in code or environment variables. The only thing you need is the OCID from the database tool connection service and the SDK will do the rest for you. Here we have two examples of using both Python and Java to achieve this, enjoy. 




## Java

Dependencies: 
First, you'll need some dependencies. We need a few modules from the OCI Java SDK (to retrieve the connection and the secret content) and the OJDBC driver.
```sh
implementation 'com.oracle.oci.sdk:oci-java-sdk-common:2.8.1'
implementation 'com.oracle.oci.sdk:oci-java-sdk-databasetools:2.8.1'
implementation 'com.oracle.oci.sdk:oci-java-sdk-secrets:2.8.1'
implementation("com.oracle.database.jdbc:ojdbc11-production:21.1.0.0")
```

#### Step 1: Retrieving Database Connection Info
Next, create a class. I'm calling mine Demo.java. We'll need to pass in the OCID of the connection that we created earlier, and in the constructor, we'll set up a few clients to make calls to the SDK.
```sh
public class Demo {

    private final String connectionId;
    DatabaseToolsClient databaseToolsClient;
    SecretsClient secretsClient;

    public Demo(String connectionId) throws IOException {
        this.connectionId = connectionId;
        AbstractAuthenticationDetailsProvider provider = new ConfigFileAuthenticationDetailsProvider("DEFAULT");
        databaseToolsClient = DatabaseToolsClient.builder().build(provider);
        secretsClient = SecretsClient.builder().build(provider);
    }
}
```
Instead of returning the secrets directly, the SDK will return OCIDs pointing to the secret in the vault. Once the content is retrieved, we'll need to decode them from Base64, so create an instance of the Base64.Decoder.
```sh
Base64.Decoder decoder = Base64.getDecoder();
```

#### Step 2: Construct a request to get the DatabaseToolsConnection and use the client to send the request.
```sh

/* get database tools connection */
GetDatabaseToolsConnectionRequest connectionRequest =
        GetDatabaseToolsConnectionRequest.builder()
        .databaseToolsConnectionId(connectionId)
        .build();
GetDatabaseToolsConnectionResponse connectionResponse = databaseToolsClient
        .getDatabaseToolsConnection(connectionRequest);
DatabaseToolsConnectionOracleDatabase databaseToolsConnection =
        (DatabaseToolsConnectionOracleDatabase) connectionResponse
        .getDatabaseToolsConnection();
```

#### Step 3: Grab the credentials, construct requests from them and decode.
```sh
/* get connect string from dbtools connection */
String connectionString = databaseToolsConnection.getConnectionString();
System.out.printf("Connection String: %s %n", connectionString);

/* get username from dbtools connection */
String username = databaseToolsConnection.getUserName();
System.out.printf("Username: %s %n", username);

List<DatabaseToolsKeyStore> keyStores = databaseToolsConnection.getKeyStores();
KeyStoreType keyStoreType = keyStores.get(0).getKeyStoreType();
System.out.printf("KeyStore Type: %s %n", keyStoreType);

DatabaseToolsKeyStoreContentSecretId keyStoreSecretId =
        (DatabaseToolsKeyStoreContentSecretId) keyStores
        .get(0)
        .getKeyStoreContent();
String keyStoreContentSecretId = keyStoreSecretId.getSecretId();
GetSecretBundleRequest keyStoreContentRequest = GetSecretBundleRequest
        .builder()
        .secretId(keyStoreContentSecretId)
        .build();
GetSecretBundleResponse keyStoreContentResponse = secretsClient
        .getSecretBundle(keyStoreContentRequest);
Base64SecretBundleContentDetails keyStoreSecretContent =
        (Base64SecretBundleContentDetails) keyStoreContentResponse
        .getSecretBundle()
        .getSecretBundleContent();
String keyStoreSecret = keyStoreSecretContent.getContent();
byte[] keyStoreSecretBytes = decoder.decode(keyStoreSecret);


/* Grab the DB password secret OCID, construct a request, retrieve the secret and decode */
DatabaseToolsUserPasswordSecretId passwordSecretId =
        (DatabaseToolsUserPasswordSecretId) databaseToolsConnection
        .getUserPassword();
GetSecretBundleRequest passwordSecretBundleRequest =
        GetSecretBundleRequest.builder()
        .secretId(passwordSecretId.getSecretId())
        .build();
GetSecretBundleResponse passwordSecretBundleResponse = secretsClient
        .getSecretBundle(passwordSecretBundleRequest);
Base64SecretBundleContentDetails passwordSecretBundleContent =
        (Base64SecretBundleContentDetails) passwordSecretBundleResponse
        .getSecretBundle()
        .getSecretBundleContent();
byte[] decodedBytes = decoder.decode(passwordSecretBundleContent.getContent());
String password = new String(decodedBytes);
System.out.printf("Password: %s %n", password);
```

#### Step 4: Pass the database user credential and connect to database.

```sh
/* create datasource properties */
Properties info = new Properties();
info.put(OracleConnection.CONNECTION_PROPERTY_USER_NAME, username);
info.put(OracleConnection.CONNECTION_PROPERTY_PASSWORD, password); 
String dbUrl = "jdbc:oracle:thin:@" + connectionString;
```

Now we can create an "in-memory" wallet from the decoded bytes of our SSO secret contents and create an SSL context that we'll set on our DataSource in just a bit. Huge credit to Simon for [his examples](https://github.com/nomisvai/oracle-in-memory-wallet-samples) on GitHub!

```sh
/* create "in-memory" wallet */
TrustManagerFactory trustManagerFactory =
        TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
KeyManagerFactory keyManagerFactory =
        KeyManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
KeyStore keyStore = KeyStore.getInstance("SSO", new OraclePKIProvider());
keyStore.load(new ByteArrayInputStream(keyStoreSecretBytes), null);
keyManagerFactory.init(keyStore, null);
trustManagerFactory.init(keyStore);
SSLContext sslContext = SSLContext.getInstance("SSL");
sslContext.init(
        keyManagerFactory.getKeyManagers(),
        trustManagerFactory.getTrustManagers(),
        null);
```
Create the OracleDataSource, set the SSL context, URL, and connection properties.
```sh
/* create datasource */
OracleDataSource datasource = new OracleDataSource();
datasource.setSSLContext(sslContext);
datasource.setURL(dbUrl);
datasource.setConnectionProperties(info);
```
Finally, create a Connection and execute a query. 
```sh
/* get connection and execute query */
Connection connection = datasource.getConnection();
Statement statement = connection.createStatement();
ResultSet resultSet = statement.executeQuery("select sysdate from dual");
resultSet.next();
Date d = resultSet.getDate(1);
System.out.printf("Current Date from DB: %tc", d);
```

If all goes well, your output should look similar to the following when you use this class.
```sh
Connection String: (description= (...[redacted]) 
Username: [redacted] 
KeyStore Type: Sso 
Password: [redacted] 
Current Date from DB: Wed Nov 10 14:28:31 EST 2021
```



The Java code is available on: https://gist.github.com/recursivecodes

##### Author: 
Todd Sharp, Developer Evangelist for Oracle

