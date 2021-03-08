# Variables
# Please fill in the xxxxxx with your account values

variable "region" {
  # sample: eu-frankfurt-1
  default = "xxxxxx"
}

variable "admin_password" {
  #admin password for a user with the dba role in the database you want to use
  default = "xxxxxx"
}

variable "tenancy_ocid" {
  # OCID of your OCI Account Tenancy
  default = "ocid1.tenancy.oc1..aaaaaaaambnyexdtahy6ug7dy2ngnfnthvvbpfgmgmg3slb73f52wkbudvwq"
}

variable "compartment_ocid" {
  # OCID of your compartment you wish to use
  default = "ocid1.compartment.oc1..aaaaaaaasoku6xtelb2cghtj4htqika77vwnzir422c5yhdd732hndvezx4a"
}

variable "vnc_ocid" {
  # OCID of your VCN
  default = "ocid1.vcn.oc1.eu-frankfurt-1.amaaaaaau3i6vkyabtnid66v43jlpocat66ct3l23xj7bh2mlykkifecjk5q"
}

variable "route_ocid" {
  # OCID of your VCN
  default = "ocid1.routetable.oc1.eu-frankfurt-1.aaaaaaaa6et6xjxkwpm3mfxqqj6djlebjaczbahcaw64rhremjpjcienf3oa"
}

variable "cidr_block" {
  # CIDR Block for the public subnet
  # example: "10.0.1.0/24"
  default = "10.0.1.0/24"
}

variable "adb_ocid" {
  # OCID of your Autonomous Database you wish to use
  default = "xxxxxx"
}

variable "database_name" {
  # Name of the autonomous database you wish to use
  default = "xxxxxx"
}

variable "domain_name" {
  # Your domain name you wish to use and own
  default = "xxxxxx"
}


## These Variables are not used at this time

variable "ssh_public_key" {
  default = "xxxxxx"  
}

variable "ssh_private_key" {
  default = "xxxxxx"
}