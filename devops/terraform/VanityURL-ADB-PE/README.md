# Oracle Database Tools - DevOPs - Terraform - Vanity URLs

This project is a terraform script to help register a Vanity URL on an ADB instance in OCI.

It creates the following:
- VCN and Public Subnet
- Security Lists for access over 443 and 8080
- A Load Balancer
- A compute instance (full or micro)
- Installs ORDS, SQLcl and stages the APEX images
- Uses LetsEncrypt to get the certs for your customer domain
- Starts up ORDS connected to an ADB instance on 443 with the certs installed

The Variables.tf file can be used to tell terraform what ADB instance you are going to use and what your custom domain is named.

## Two Versions

There are 2 terraform files in the directory. You can only have one when running.

completeSetupFullVM is for full compute instance for ORDS

shape = "VM.Standard.E3.Flex"

completeSetupMicroVM is for always free compute for ORDS

shape = "VM.Standard.E2.1.Micro"

both files use an always free load balancer but can be changed

shape = "10Mbps-Micro"

## IP Addresses and Domain Name Providers

You will need to update your domain register to point to the public IPs of the load balancer as this script runs. There is a sleep point for 210 seconds in the setup terraform script where you can perform this procedure. You can increase this timeout if needed.

## SSH Keys

In the setup terraform script, you will need to supply the path to the SSH keys you wish to use. Find the **private_key** and **ssh_authorized_keys** attributes and set as appropriate.
For example, if I was using the OCI cloud shell and had my keys there, my path would be similar to:

ssh_authorized_keys = file("/home/bspendol/terraform/compute.pub")

private_key = file("/home/bspendol/terraform/compute.ppk")

## Setting up the PAR URLs for the static files

In the terraform scripts, you will see entries for
APEX_PAR_URL
ORDS_CONF_PAR_URL

The first one needs to be replaced with an OCI Object Store PAR for where you have staged the apex install zip
The second one needs to be replaced with an OCI Object Store PAR for where you have staged the ords_conf.zip file that is contained in this project.