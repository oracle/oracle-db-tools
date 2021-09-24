# Variables
# Please fill in the xxxxxx with your account values

variable "region" {
  # sample: eu-frankfurt-1
  default = "xxxxxx"
}

variable "tenancy_ocid" {
  # OCID of your OCI Account Tenancy
  default = "xxxxxx"
}

variable "vcn_ocid" {
# if using an existing VCN, add the OCID here:
# Assumption is that the vcn cidr = "10.0.0.0/16"
# If using a different CIDR, you will need to make the changes in the terraform file
#
  default = "xxxxxx"

}

variable "compartment_ocid" {
# OCID of the compartment the existing VCN is in
  default = "xxxxxx"
}

variable "adb_ocid" {
  # OCID of your Autonomous Database you wish to use
  default = "xxxxxx"
}


# Cert Variables

variable "certificate_certificate_name"{

    default = "xxxxxx"

}

variable "certificate_ca_certificate" {

    default = "xxxxxx"

}

variable "certificate_private_key" {

    default = "xxxxxx"

}
    
variable "certificate_public_certificate" {

    default = "xxxxxx"

}