# Oracle Database Tools - DevOPs - Terraform - ORDS with DBCS

This project is a terraform script to help create and setup ORDS with DBCS instances (VM, Bare Metal and ExaCS)

It creates the following:
- VCN and Public Subnet
- Security Lists for access over 443 and 8080
- A Load Balancer
- A compute instance (full or micro)
- Installs ORDS, SQLcl and stages the APEX images
- Uses LetsEncrypt to get the certs for your customer domain
- Starts up ORDS connected to an DBCS instance on 443 with the certs installed

The Variables.tf file can be used to tell terraform what DBCS instance you are going to use.
