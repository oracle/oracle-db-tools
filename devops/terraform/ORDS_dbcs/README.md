# Oracle Database Tools - DevOPs - Terraform - ORDS with DBCS

## Prerequisites

- You must have an existing DBCS instance
- There must be an egress rule on the subnet where the DBCS instance lives for incoming 1521 traffic from the ORDS tier or future ORDS tier
- The variables.tf file needs to be completely filled out
- Filled out the ords_params.properties with your database connect info


## End Prerequisites

This project is a terraform script to help deploy ORDS on a VM/ExaCS DB instance in OCI.

It creates the following:
- A Public Subnet using an existing VCN
- Security Lists for access over 8080
- A compute instance (full or micro)
- Installs ORDS
- Starts up ORDS on 8080 with self signed certs installed

At this time, we cannot install APEX into this instance with this terraform script.


## Compute Versions for variables.tf file

**Micro**
```
    shape = "VM.Standard.E2.1.Micro"
```
**E4**
```
	shape = "VM.Standard.E4.Flex"
	shape_config {
		memory_in_gbs = "16"
		ocpus = "1"
	}
```

**A1**
```
	shape = "VM.Standard.A1.Flex"
	shape_config {
		memory_in_gbs = "24"
		ocpus = "4"
	}
```

**Number of Midtiers**

Change the number of mid-tiers with this variable
```
variable "number_of_midtiers" {
  # how many midtiers you want to create
  default = 1
}
```

## Linux Images

This template uses the Oracle Linux 7.9 image in frankfurt as of May 2021

```
    source_details {
        # Oracle Linux 7.9
        source_id = "ocid1.image.oc1.eu-frankfurt-1.aaaaaaaaajkxjdpgfzjl7tg3a7vzdvwnww6w5k47r5acwe4fqecowqwuoria"
        source_type = "image"
    }
```
You can use the OCI CLI/API commands to list the available images in your region.
Refer to the following link for the OCI CLI commands:

[OCI CLI Command for listing Linux Images](https://docs.oracle.com/en-us/iaas/tools/oci-cli/latest/oci_cli_docs/cmdref/compute/image/list.html)

For example:
```
cloudshell:~ (eu-frankfurt-1)$ oci compute image list --compartment-id ocid1.tenancy.oc1..aabbccddeeffgghhiitahy6ug7dy232490juedlkashjda9s8y32klrjbsdfvlokih --operating-system "Oracle Linux"
{
  "data": [
    {
      "agent-features": null,
      "base-image-id": null,
      "billable-size-in-gbs": 0,
      "compartment-id": null,
      "create-image-allowed": true,
      "defined-tags": {},
      "display-name": "Oracle-Linux-8.3-aarch64-2021.05.12-0",
      "freeform-tags": {},
      "id": "ocid1.image.oc1.eu-frankfurt-1.aaaaaaaafw77tp7hx2x2u3ogz427hqkgh3vln3znwlkzau3p7edrlb7x6tda",
      "launch-mode": "NATIVE",
      "launch-options": {
        "boot-volume-type": "PARAVIRTUALIZED",
        "firmware": "UEFI_64",
        "is-consistent-volume-naming-enabled": true,
        "is-pv-encryption-in-transit-enabled": true,
        "network-type": "PARAVIRTUALIZED",
        "remote-data-volume-type": "PARAVIRTUALIZED"
      },
      "lifecycle-state": "AVAILABLE",
      "listing-type": null,
      "operating-system": "Oracle Linux",
      "operating-system-version": "8",
      "size-in-mbs": 47694,
      "time-created": "2021-05-19T03:41:33.147000+00:00"
    },
    {
      "agent-features": null,
      "base-image-id": null,
      "billable-size-in-gbs": 0,
      "compartment-id": null,
      "create-image-allowed": true,
      "defined-tags": {},
      "display-name": "Oracle-Linux-8.3-Gen2-GPU-2021.05.12-0",
      "freeform-tags": {},
      "id": "ocid1.image.oc1.eu-frankfurt-1.aaaaaaaad7zlitmahc5w5m7hv47jiwooiy7vqethdsl4vexdc3sfcrzkvi3q",
      "launch-mode": "NATIVE",
      "launch-options": {
        "boot-volume-type": "PARAVIRTUALIZED",
        "firmware": "UEFI_64",
        "is-consistent-volume-naming-enabled": true,
        "is-pv-encryption-in-transit-enabled": true,
        "network-type": "PARAVIRTUALIZED",
        "remote-data-volume-type": "PARAVIRTUALIZED"
      },
      "lifecycle-state": "AVAILABLE",
      "listing-type": null,
      "operating-system": "Oracle Linux",
      "operating-system-version": "8",
      "size-in-mbs": 47694,
      "time-created": "2021-05-20T17:15:04.763000+00:00"
    }.....
```

## SSH Keys

In the setup terraform script, you will need to supply the path to the SSH keys you wish to use. Find the **private_key** and **ssh_authorized_keys** attributes and set as appropriate.
For example, if I was using the OCI cloud shell and had my keys there, my path would be similar to:

ssh_authorized_keys = file("/home/bspendol/terraform/compute.pub")

private_key = file("/home/bspendol/terraform/compute.ppk")

If you have an OCI Vault, you can use that for the keys.

```
data "oci_kms_decrypted_data" "private_key_decrypted" {
    #Required
    ciphertext = "${file(var.encrypted_private_key_path)}"
    crypto_endpoint = "${var.decrypted_data_crypto_endpoint}"
    key_id = "${var.kms_encryption_key_id}"
}
  
  
resource "oci_core_instance" "TFInstance1" {
  availability_domain = "${lookup(data.oci_identity_availability_domains.ADs.availability_domains[var.availability_domain - 1],"name")}"
  compartment_id      = "${var.compartment_ocid}"
  display_name        = "TFInstance"
  hostname_label      = "instance3"
  shape               = "${var.instance_shape}"
  subnet_id           = "${oci_core_subnet.ExampleSubnet.id}"
  
  source_details {
    source_type = "image"
    source_id   = "${var.instance_image_ocid[var.region]}"
  }
  
  extended_metadata {
    ssh_authorized_keys = "${var.ssh_public_key}"
  }
}
  
resource "null_resource" "remote-exec" {
      connection {
      agent       = false
      timeout     = "30m"
      host        = "${oci_core_instance.TFInstance1.public_ip}"
      user        = "${var.opc_user_name}"
      private_key = "${data.oci_kms_decrypted_data.private_key_decrypted.plaintext}"
    }
  
    inline = [
      "touch ~/IMadeAFile.Right.Here"
    ]
  
  }
```

Lastly, you can have the script create a public/private key pair and get the output post creation. Know that anyone who has access to the logs can see the key text.

```
resource "tls_private_key" "public_private_key_pair" {
  algorithm   = "RSA"
}
  
resource "oci_core_instance" "TFInstance1" {
  availability_domain = "${lookup(data.oci_identity_availability_domains.ADs.availability_domains[var.availability_domain - 1],"name")}"
  compartment_id      = "${var.compartment_ocid}"
  display_name        = "TFInstance"
  hostname_label      = "instance3"
  shape               = "${var.instance_shape}"
  subnet_id           = "${oci_core_subnet.ExampleSubnet.id}"
  
  source_details {
    source_type = "image"
    source_id   = "${var.instance_image_ocid[var.region]}"
  }
  
  extended_metadata {
    ssh_authorized_keys = "${tls_private_key.public_private_key_pair.public_key_openssh}"
  }
}
  
resource "null_resource" "remote-exec" {
  depends_on = ["oci_core_instance.TFInstance1"]
  
  provisioner "remote-exec" {
    connection {
      agent       = false
      timeout     = "30m"
      host        = "${oci_core_instance.TFInstance1.public_ip}"
      user        = "${var.opc_user_name}"
      private_key = "${tls_private_key.public_private_key_pair.private_key_pem}"
    }
  
    inline = [
      "touch ~/IMadeAFile.Right.Here"
    ]
  }
}
```

## Compartments

In the terraform script you will see the section:

```
# Create a compartment

resource "oci_identity_compartment" "tf-compartment" {
    # Required
    compartment_id = var.tenancy_ocid
    description = "Compartment for Terraform resources."
    name = "ORDS_Compartment"
}
```

You will want to change the name of the compartment to be of a compartment that has access to the Database or the same compartment of the database.