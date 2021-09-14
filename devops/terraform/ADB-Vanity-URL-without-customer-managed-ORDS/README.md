# Oracle Database Tools - DevOPs - Terraform - Vanity URLs for Autonomous Oracle Database without customer managed Oracle REST Data Services

This project is a terraform script to help register a Vanity URL on an Autonomous Oracle Database instance in OCI without the need for creating and maintaining an ORDS instance on compute. Just provide your certs, the Autonomous Oracle Database OCID and off you go! 

All you need before you start is a VCN with an internet gateway and an ADB-S with a Private Endpoint pre-created. (You can use the VCN Quickstart to create a VCN in just 2 clicks)

It creates the following:
- A Public Subnet in an existing VCN
- Security Lists for access over 443
- A Load Balancer (always free 10Mbps-Micro)

**The IPs for the Public Subnet assume you have a VNC with a CIDR block of 10.0.0.0/16 and 10.0.11.0/24 is unused.**

When the script is finished, you can associate the public IP of the load balancer with your domain provider.

## The Variables (in the variables.tf file)

### Environment

**region**: What region you are in. Example would be us-ashburn-1

**tenancy_ocid**: The OCID of your tenancy

**vcn_ocid**: The OCID of the existing VCN you want to use

**compartment_ocid**: The OCID of an existing compartment where you want to place these resources

**adb_ocid**: The OCID of the existing ADB-S you want to use

**backend_port**: Port used for the Load Balancer to talk to the ADB-S. Is set to 443.

### Certificate Variables

**certificate_certificate_name**: A display name for the cert

**certificate_ca_certificate**: The text for the certificate, usually enclosed by -----BEGIN CERTIFICATE-----

**certificate_private_key**: The text for the certificate private key, usually enclosed by -----END RSA PRIVATE KEY-----
    
**certificate_public_certificate**: The text for the public certificate, usually enclosed by -----BEGIN CERTIFICATE-----

The text for the certificates/key are multi-line and need to be enclosed with EOT as in the example here:

```
variable "certificate_public_certificate" {

    default = <<-EOT
-----BEGIN CERTIFICATE-----
MIIGSDCCBTCgAwIBAgISA+V2MiuwZLh0jNru+kjD8LzMMA0GCSqGSIb3DQEBCwUA
MDIxCzAJBgNVBAYTAlVTMRYwFAYDVQQKEw1MZXQncyBFbmNyeXB0MQswCQYDVQQD
EwJSMzAeFw0yMTA4MjUxNjU2NDBaFw0yMTExMjMxNjU2MzlaMB8xHTAbBgNVBAMT
FGRpbm9zYXVyZm9vdGJhbGwuY29tMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIIC
CgKCAgEAzBfcuiZATNwQgaoM5F88jOR+lJ4oDPTNPc+eXy62Pqb5aJFiHtM4I+RX
ZFbRw5RCOle7+tMWK/pgHJGeQF7qXB4r0r24ByEQV+SRtn110xpbaG1RLBnmHkNu
/Mqdp1KRIcH+DOuaR56oybAehQEOnsfkyBXAqikLdAqWNfP1ONjxVdzrSi3XkrYL
Ct2wXiFoz/mmTjUtBFMYfkTxPBpJMisMhjS+j9iofEXNok94m592YH1/IAPiQ0yP
.....
MDIxCzAJBgNVBAYTAlVTMRYwFAYDVQQKEw1MZXQncyBFbmNyeXB0MQswCQYDVQQD
EwJSMzAeFw0yMTA4MjUxNjU2NDBaFw0yMTExMjMxNjU2MzlaMB8xHTAbBgNVBAMT
FGRpbm9zYXVyZm9vdGJhbGwuY29tMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIIC
CgKCAgEAzBfcuiZATNwQgaoM5F88jOR+lJ4oDPTNPc+eXy62Pqb5aJFiHtM4I+RX
-----END CERTIFICATE-----
EOT

}
```