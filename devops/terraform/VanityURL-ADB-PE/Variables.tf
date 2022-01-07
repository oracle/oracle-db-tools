# Variables
# Please fill in the xxxxxx with your account values

variable "region" {
  # sample: eu-frankfurt-1
  default = "eu-frankfurt-1"
}

variable "tenancy_ocid" {
  # OCID of your OCI Account Tenancy
  default = "ocid1.tenancy.oc1..aaaaaaaambnyexdtahy6ug7dy2ngnfnthvvbpfgmgmg3slb73f52wkbudvwq"
}

variable "vcn_ocid" {
# if using an existing VCN, add the OCID here:
# Assumption is that the vcn cidr = "10.0.0.0/16"
# If using a different CIDR, you will need to make the changes in the terraform file
#
  default = "ocid1.vcn.oc1.eu-frankfurt-1.amaaaaaau3i6vkyaw7tkpopjkwxk47jbwqpwu2fq6gjwnnovib466hcccqga"

}

variable "compartment_ocid" {
# OCID of the compartment the existing VCN is in
  default = "ocid1.compartment.oc1..aaaaaaaahn7oa3rb35pazqtcdnx57ws4wigtk3okssgh7pity6fikicucx4a"
}

variable "adb_ocid" {
  # OCID of your Autonomous Database you wish to use
  default = "ocid1.autonomousdatabase.oc1.eu-frankfurt-1.antheljtu3i6vkya75htav6wclgcopcqmty2wadgobtbtm6yox34f5z4iz2a"
}


# Cert Variables

variable "certificate_certificate_name"{

    default = "xxxx"

}

variable "certificate_ca_certificate" {

    default = "xxxx"

}

variable "certificate_private_key" {

    default = "xxxx"

}
    
variable "certificate_public_certificate" {

    default = "xxxx"

}

variable "backend_port" {

    default = "xxxx"

}