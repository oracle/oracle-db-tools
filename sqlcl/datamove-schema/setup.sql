/* 
The MIT License (MIT)

Copyright (c) 2021, Oracle and/or its affiliates. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

prompt Starting setup

-- This is a script to define variables for datamove
-- Edit this script to set variables as required
-- N.B: DO NOT RELY on auto uppercase. Many of these values get passed as parameters to dbms_datapump which require an exact match.

-- SOURCE INFO (local with accessable data pump dir/path)
-- ======================================================
-- The source connect string. The password will be prompted for if not entered.
define dm_source = 'sys@localhost:1521/XEPDB1 as SYSDBA';
-- The schema to export
define dm_schema_exp = 'HR';
-- The datapump directory for export (Path MUST be accessible to running sqlcl)
-- FOR FUTURE EXPANSION the same value is used on both exp & imp so need to split if we really want to allow user to specify
define dm_data_pump_dir = 'DATA_PUMP_DIR';

--pre declaration for calculated data pump path / files - calculated in dms-dpexp
define dm_data_pump_path = 'uninitialized'; -- Pulled from all_directories based on data pump dir
define dm_data_pump_file = 'uninitialized'; -- will be <SCHEMA>.DMP
define dm_data_pump_log  = 'uninitialized'; -- will be <SCHEMA>-EXP.LOG

-- TRANSFER INFO FOR OBJECT STORAGE USING OCI
-- ==========================================
-- The oci profile for uploading the datapump files to object storage
define dm_oci_profile = 'freedb';
-- The url to an object storage bucket, file(s) will be replaced if they exist
define dm_oci_bucket = 'https://objectstorage.us-phoenix-1.oraclecloud.com/n/oraclefreedb/b/transfer';


-- TARGET INFO (autonomous connection and dbms_cloud credential for object storage)
-- ================================================================================
-- The path for the wallet zip file
define dm_cloud_config = 'd:\work\Wallet_ADW20210622.zip';
-- DBMS_CLOUD credential with permissions to object storage (exact match - no auto uppercase - make sure you do)
define dm_credential = 'SWIFTCRED2'; -- TODO: Swift credential!? Why doesn't oci one work (v19 adw maybe 21 is only one that does that?)  
-- The target database connect string.  The password will be prompted for if not entered.
define dm_target = 'ADMIN@ADW20210622_high';
-- The target schema
define dm_schema_imp = 'DM_SCHEMA';

prompt Exiting setup
