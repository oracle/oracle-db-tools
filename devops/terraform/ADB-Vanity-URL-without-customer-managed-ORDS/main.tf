#
# Start

# Get ADs

# <tenancy-ocid> is the compartment OCID for the root compartment.
# Use <tenancy-ocid> for the compartment OCID.

data "oci_identity_availability_domains" "ads" {
  compartment_id = var.tenancy_ocid
}

data "oci_database_autonomous_database" "autonomous_database" {
    #Required
    autonomous_database_id = var.adb_ocid
}

# Create a public subnet

resource "oci_core_subnet" "vcn-public-subnet"{

  # Required
  compartment_id = var.compartment_ocid
  vcn_id = var.vcn_ocid
  cidr_block = "10.0.11.0/24"
 
  # Optional
  #route_table_id = module.vcn.ig_route_id
  security_list_ids = [oci_core_security_list.public-security-list.id]
  display_name = "adb-public-subnet"
}

# Create a public security list and some rules

resource "oci_core_security_list" "public-security-list"{

# Required
  compartment_id = var.compartment_ocid
  vcn_id = var.vcn_ocid

# Optional
  display_name = "security-list-for-public-adb-subnet"

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

# Create DHCP Options

resource "oci_core_dhcp_options" "dhcp-options"{

  # Required
  compartment_id = var.compartment_ocid
  vcn_id = var.vcn_ocid
  #Options for type are either "DomainNameServer" or "SearchDomain"
  options {
      type = "DomainNameServer"  
      server_type = "VcnLocalPlusInternet"
  }
  
  # Optional
  display_name = "default-dhcp-options"
}

# Load Balancer

resource "oci_load_balancer_load_balancer" "vanity_load_balancer" {

    compartment_id = var.compartment_ocid
    display_name = "LB1"
    shape = "10Mbps-Micro"
    subnet_ids = [oci_core_subnet.vcn-public-subnet.id]


}

resource "oci_load_balancer_certificate" "ssl_certificate" {
    #Required
    certificate_name = var.certificate_certificate_name
    load_balancer_id = oci_load_balancer_load_balancer.vanity_load_balancer.id

    #Optional
    ca_certificate = var.certificate_ca_certificate
    #passphrase = var.certificate_passphrase
    private_key = var.certificate_private_key
    public_certificate = var.certificate_public_certificate

    lifecycle {
        create_before_destroy = true
    }
}


resource "oci_load_balancer_backend_set" "vanity_backend_set_ssl" {
    #Required
    health_checker {
        #Required
        protocol = "HTTP"

        #Optional
        interval_ms = "10000"
        port = "443"
        retries = "3"
        timeout_in_millis = "3000"
        url_path = "/"
        return_code = "302"

    }
    load_balancer_id = oci_load_balancer_load_balancer.vanity_load_balancer.id
    name = "adb_backendset_ssl"
    policy = "ROUND_ROBIN"

    ssl_configuration {

        #Optional
        certificate_name = oci_load_balancer_certificate.ssl_certificate.certificate_name
        verify_peer_certificate = "false"
    }


}

resource "oci_load_balancer_listener" "vanity_listener_ssl" {
    #Required
    default_backend_set_name = oci_load_balancer_backend_set.vanity_backend_set_ssl.name
    load_balancer_id = oci_load_balancer_load_balancer.vanity_load_balancer.id
    name = "adb_backend_Listener_ssl"
    port = "443"
    protocol = "HTTP"

    ssl_configuration {

        #Optional
        certificate_name = oci_load_balancer_certificate.ssl_certificate.certificate_name
        verify_peer_certificate = "false"

    }


}

resource "oci_load_balancer_backend" "adb_backend" {
    #Required
    backendset_name = oci_load_balancer_backend_set.vanity_backend_set_ssl.name
    ip_address = data.oci_database_autonomous_database.autonomous_database.private_endpoint_ip
    load_balancer_id = oci_load_balancer_load_balancer.vanity_load_balancer.id
    port = 443

}