# Start

# Get ADs

data "oci_identity_availability_domains" "ads" {
  compartment_id = var.tenancy_ocid
}

# Create an Internet Gateway

resource "oci_core_internet_gateway" "internet_gateway" {
    #Required
    compartment_id = var.compartment_ocid
    vcn_id = var.vnc_ocid

    #Optional
    enabled = "true"
    display_name = "IG1"

}

# Create a public subnet

resource "oci_core_subnet" "vcn-public-subnet"{

  # Required
  compartment_id = var.compartment_ocid
  vcn_id = var.vnc_ocid
  cidr_block = var.cidr_block # example: "10.0.1.0/24"
 
  # Optional
  route_table_id = var.route_ocid
  security_list_ids = [oci_core_security_list.public-security-list.id]
  display_name = "public-subnet"
}

# Create a public security list and some rules

resource "oci_core_security_list" "public-security-list"{

# Required
  compartment_id = var.compartment_ocid
  vcn_id = var.vnc_ocid

# Optional
  display_name = "security-list-for-public-subnet"

  egress_security_rules {
      stateless = false
      destination = "0.0.0.0/0"
      destination_type = "CIDR_BLOCK"
      protocol = "all" 
  }
ingress_security_rules { 
      stateless = false
      source = "0.0.0.0/0"
      source_type = "CIDR_BLOCK"
      # Get protocol numbers from https://www.iana.org/assignments/protocol-numbers/protocol-numbers.xhtml TCP is 6
      protocol = "6"
      tcp_options { 
          min = 22
          max = 22
      }
    }
ingress_security_rules { 
      stateless = false
      source = "0.0.0.0/0"
      source_type = "CIDR_BLOCK"
      # Get protocol numbers from https://www.iana.org/assignments/protocol-numbers/protocol-numbers.xhtml TCP is 6
      protocol = "6"
      tcp_options { 
          min = 80
          max = 80
      }
    }
ingress_security_rules { 
      stateless = false
      source = "0.0.0.0/0"
      source_type = "CIDR_BLOCK"
      # Get protocol numbers from https://www.iana.org/assignments/protocol-numbers/protocol-numbers.xhtml TCP is 6
      protocol = "6"
      tcp_options { 
          min = 8080        
          max = 8080
      }
    }    
ingress_security_rules { 
      stateless = false
      source = "0.0.0.0/0"
      source_type = "CIDR_BLOCK"
      # Get protocol numbers from https://www.iana.org/assignments/protocol-numbers/protocol-numbers.xhtml TCP is 6
      protocol = "6"
      tcp_options { 
          min = 443        
          max = 443
      }
    }     
  ingress_security_rules { 
      stateless = false
      source = "0.0.0.0/0"
      source_type = "CIDR_BLOCK"
      # Get protocol numbers from https://www.iana.org/assignments/protocol-numbers/protocol-numbers.xhtml ICMP is 1  
      protocol = "1"
  
      # For ICMP type and code see: https://www.iana.org/assignments/icmp-parameters/icmp-parameters.xhtml
      icmp_options {
        type = 3
        code = 4
      } 
    }   
  
  ingress_security_rules { 
      stateless = false
      source = "10.0.0.0/16"
      source_type = "CIDR_BLOCK"
      # Get protocol numbers from https://www.iana.org/assignments/protocol-numbers/protocol-numbers.xhtml ICMP is 1  
      protocol = "1"
  
      # For ICMP type and code see: https://www.iana.org/assignments/icmp-parameters/icmp-parameters.xhtml
      icmp_options {
        type = 3
      } 
    }

}

# Create some keys

resource "tls_private_key" "public_private_key_pair" {
  algorithm   = "RSA"
}

# Create a compute instance

resource "oci_core_instance" "ords_compute_instance" {
    # Required
    availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
    compartment_id = var.compartment_ocid
    #shape = "VM.Standard.E2.1.Micro"
    shape = "VM.Standard.E3.Flex"
	  shape_config {
		  memory_in_gbs = "20"
		  ocpus = "1"
    }
    source_details {
        source_id = "ocid1.image.oc1.eu-frankfurt-1.aaaaaaaaf6gm7xvn7rhll36kwlotl4chm25ykgsje7zt2b4w6gae4yqfdfwa"
        source_type = "image"
    }

    # Optional
    display_name = "ORDS1"
    create_vnic_details {
        assign_public_ip = true
        subnet_id = oci_core_subnet.vcn-public-subnet.id
    }
    metadata = {
        ssh_authorized_keys = tls_private_key.public_private_key_pair.public_key_openssh
        block_storage_sizes_in_gbs = "20"
    } 
    preserve_boot_volume = false
}


# Load Balancer

resource "oci_load_balancer_load_balancer" "vanity_load_balancer" {

    compartment_id = var.compartment_ocid
    display_name = "LB1"
    shape = "10Mbps-Micro"
    subnet_ids = [oci_core_subnet.vcn-public-subnet.id]

depends_on = [
    oci_core_instance.ords_compute_instance,
  ]

}

resource "oci_load_balancer_backend" "vanity_backend" {

    backendset_name = oci_load_balancer_backend_set.vanity_backend_set.name
    ip_address = oci_core_instance.ords_compute_instance.private_ip
    load_balancer_id = oci_load_balancer_load_balancer.vanity_load_balancer.id
    port = "8080"

}

resource "oci_load_balancer_backend" "vanity_backend_ssl" {

    backendset_name = oci_load_balancer_backend_set.vanity_backend_set_ssl.name
    ip_address = oci_core_instance.ords_compute_instance.private_ip
    load_balancer_id = oci_load_balancer_load_balancer.vanity_load_balancer.id
    port = "443"

}

resource "oci_load_balancer_backend_set" "vanity_backend_set" {
    #Required
    health_checker {
        #Required
        protocol = "TCP"

        #Optional
        interval_ms = "10000"
        port = "8080"
        retries = "3"
        timeout_in_millis = "3000"
    }
    load_balancer_id = oci_load_balancer_load_balancer.vanity_load_balancer.id
    name = "ords_backendset"
    policy = "ROUND_ROBIN"

}

resource "oci_load_balancer_backend_set" "vanity_backend_set_ssl" {
    #Required
    health_checker {
        #Required
        protocol = "TCP"

        #Optional
        interval_ms = "10000"
        port = "443"
        retries = "3"
        timeout_in_millis = "3000"
    }
    load_balancer_id = oci_load_balancer_load_balancer.vanity_load_balancer.id
    name = "ords_backendset_ssl"
    policy = "ROUND_ROBIN"

}

resource "oci_load_balancer_listener" "vanity_listener" {
    #Required
    default_backend_set_name = oci_load_balancer_backend_set.vanity_backend_set.name
    load_balancer_id = oci_load_balancer_load_balancer.vanity_load_balancer.id
    name = "ORDS_BackendListener"
    port = "80"
    protocol = "TCP"

}

resource "oci_load_balancer_listener" "vanity_listener_ssl" {
    #Required
    default_backend_set_name = oci_load_balancer_backend_set.vanity_backend_set_ssl.name
    load_balancer_id = oci_load_balancer_load_balancer.vanity_load_balancer.id
    name = "ORDS_BackendListener_ssl"
    port = "443"
    protocol = "TCP"

}


# OS Stuff


resource "null_resource" "remote-exec" {

        provisioner "remote-exec" {
        connection {
        agent       = false
        timeout     = "10m"
        host        = oci_core_instance.ords_compute_instance.public_ip
        user        = "opc"
        private_key = tls_private_key.ssh.private_key_pem
        }
    
        inline = [
        "sudo yum install ords -y",
        "sudo yum install sqlcl -y",
        "sudo firewall-cmd --permanent --zone=public --add-port=8080/tcp",
        "sudo firewall-cmd --permanent --zone=public --add-port=443/tcp",        
        "sudo firewall-cmd --reload",
        ]
    
    }

depends_on = [
    oci_core_instance.ords_compute_instance,
    oci_load_balancer_listener.vanity_listener,
  ]

}


#@apxsilentins.sql tablespace_apex tablespace_files tablespace_temp images
#      password_apex_pub_user password_apex_listener password_apex_rest_pub_user
#      password_internal_admin