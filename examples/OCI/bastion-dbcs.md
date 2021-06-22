# Using Bastion as a Service for ADB/DBCS instances

## Setup
First we need some information from the ADB using the private endpoint. On the details page of the ADB using PE, find the Network section.


Make note of the Private Endpoint IP and the Private Endpoint URL.

Here our IP is 10.0.1.2 and the URL is tzuuetzj.adb.eu-frankfurt-1.oraclecloud.com


Create a bastion in OCI via the OCI Web Console at Identity & Security → Bastion



Click the Create Bastion button, use a public subnet and allow access from a CIDR block

View the details of the bastion and click the Create Session button

In the Create Session slider, set


Session Type = SSH port forwarding session

IP Address = IP of the ADB instance using a private endpoint (ie. 10.0.1.2) Remember, we noted this at the beginning when looking at our ADB Details page.

Port = 1522 for SQL*Net access or 443 for HTTPS access

Add SSH Key = Provide your own or use the generated one

Click the Create Session button

Once the session is created, use the pop out menu and select Copy SSH Command


The SSH Command will look similar to the following:

ssh -i <privateKey> -N -L <localPort>:10.0.1.2:22 -p 22 ocid1.bastionsession.oc1.eu-frankfurt-1.amaaaaaau3i6vkyaj75th3ccnduwcsdwgntqjs5hyaqdnktufbpv2lqqc6tq@host.bastion.eu-frankfurt-1.oci.oraclecloud.com

Change <privateKey> to be the matching private key to the public key you created the session with and change <localPort> to be the port on your local machine you want to use. If using 443, you will have to run the command as an administrator on most unix/linux based systems.

Before you run the command, you will need to alter your hosts file. Remember the Private Endpoint URL we noted on the ADB details page?

For SQL*Net Access:

Add the following entry if you want to connect via SQL*net

127.0.0.1 tzuuetzj.adb.eu-frankfurt-1.oraclecloud.com

you may have to comment out localhost here

127.0.0.1 tzuuetzj.adb.eu-frankfurt-1.oraclecloud.com #localhost

For HTTPS Access:

Add the following entry if you want to connect via HTTPS

127.0.0.1 tzuuetzj.adb.eu-frankfurt-1.oraclecloudapps.com

you may have to comment out localhost here

127.0.0.1 tzuuetzj.adb.eu-frankfurt-1.oraclecloudapps.com #localhost


You can now go ahead and connect via SQL*Net as you would an ADB on a public IP with the wallet.

If using HTTPS, you can get the URL via the tools subtab on the ADB details page.


Here our URL is https://tzuuetzj.adb.eu-frankfurt-1.oraclecloudapps.com/ords/sql-developer

We can put that in a browser to access Database Actions

