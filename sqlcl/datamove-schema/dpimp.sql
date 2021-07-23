-- dpimp.sql
/* 
The MIT License (MIT)

Copyright (c) 2021, Oracle and/or its affiliates. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

set escape off
set verify off
whenever sqlerror exit 
prompt dpimp starting ...

set cloudconfig &dm_cloud_config
connect &dm_target;

set serveroutput on

prompt Importing schema &dm_schema_imp ...
DECLARE
    s varchar2(1000); 
    h1 number;
    errorvarchar varchar2(100):= 'ERROR';
    tryGetStatus number := 0;
    jobname varchar2(500);
    job_status   VARCHAR2(500);

   -- new vars
    schemaexp   VARCHAR2(500) := '&dm_schema_exp';
    schemaimp   VARCHAR2(500) := '&dm_schema_imp';
    dpdir        VARCHAR2(512) := '&dm_data_pump_dir';
    dbver        VARCHAR2(32) := 'COMPATIBLE'; -- not sure if we need to specify downgrade version here or in import - Turloch says same version for both
    storageUrl   VARCHAR2(500) := '&dm_oci_bucket/o/&dm_data_pump_file';
    credential   VARCHAR2(200) := '&dm_credential';
BEGIN
    dbms_output.put_line('credential = '||credential);
    jobname:=DBMS_SCHEDULER.GENERATE_JOB_NAME('IMP_SD_');
    dbms_output.put_line('JOB_NAME: '||jobname);
--    dbms_output.put_line('/* STATUS */ select state from dba_datapump_jobs where job_name='''||jobname||''';');
    h1 := dbms_datapump.open (operation => 'IMPORT', job_mode => 'SCHEMA', job_name => jobname , version => dbver);
    tryGetStatus := 1;
    dbms_datapump.set_parallel(handle => h1, degree => 1); 
    --dbms_datapump.add_file(handle => h1, filename => 'IMPORT.LOG', directory => 'DATA_PUMP_DIR', filetype=>DBMS_DATAPUMP.KU$_FILE_TYPE_LOG_FILE); 
    dbms_datapump.add_file(handle => h1, filename => schemaimp
                                                     || '-IMP.LOG', directory => dpdir, filetype => 3);
    dbms_datapump.set_parameter(handle => h1, name => 'KEEP_MASTER', value => 1);
    dbms_datapump.metadata_filter(handle => h1, name => 'SCHEMA_EXPR', value => 'IN('''||schemaexp||''')');	
    DBMS_DATAPUMP.METADATA_REMAP(h1,'REMAP_SCHEMA',schemaexp,schemaimp);
--    dbms_datapump.add_file(handle => h1, filename => schemaexp || '.DMP', directory => dpdir, filetype => 1); 
    dbms_datapump.add_file(handle => h1, filename => storageUrl, directory => credential, filetype => dbms_datapump.ku$_file_type_uridump_file
); -- was ftype 5 
    -- /* for import from url replace the line above with */ dbms_datapump.add_file(handle => h1, filename => /*the url*/'https://theurl', directory => /*credential*/'THECREDENTIAL', filetype => 5); 
    dbms_datapump.set_parameter(handle => h1, name => 'INCLUDE_METADATA', value => 1); 
    dbms_datapump.set_parameter(handle => h1, name => 'DATA_ACCESS_METHOD', value => 'AUTOMATIC'); 
    dbms_datapump.set_parameter(handle => h1, name => 'SKIP_UNUSABLE_INDEXES', value => 0);
    dbms_datapump.start_job(handle => h1, skip_current => 0, abort_step => 0); 
    dbms_datapump.wait_for_job(handle => h1, job_state => job_status);
    errorvarchar := 'DataPump Import Status: '''
                    || job_status
                    || '''';
    dbms_output.put_line(errorvarchar);
EXCEPTION
When Others then 
    dbms_output.put_line(SQLERRM);
    dbms_output.put_line( dbms_utility.format_error_backtrace );
    IF ((S IS NOT NULL) AND (S!='COMPLETED')) THEN 
         DBMS_OUTPUT.PUT_LINE('WAIT_FOR_JOB JOB_STATE STATE='||s);
    END IF;
    DECLARE
        ind NUMBER;
        percent_done NUMBER;
        job_state VARCHAR2(30);
        le ku$_LogEntry;
        js ku$_JobStatus;
        jd ku$_JobDesc;
        sts ku$_Status;
    BEGIN 
        /* on error try getstatus */
        if ((errorvarchar = 'ERROR')AND(tryGetStatus=1)) then 
            dbms_datapump.get_status(h1,
            dbms_datapump.ku$_status_job_error +
            dbms_datapump.ku$_status_job_status +
            dbms_datapump.ku$_status_wip,-1,job_state,sts);
            js := sts.job_status;
    /* If any work-in-progress (WIP) or Error messages were received for the job,
     display them.*/
            if (bitand(sts.mask,dbms_datapump.ku$_status_wip) != 0)
            then
                le := sts.wip;
            else
                if (bitand(sts.mask,dbms_datapump.ku$_status_job_error) != 0)
                then
                    le := sts.error;
                else
                    le := null;
                end if;
            end if;
            if le is not null
            then
                ind := le.FIRST;
                if ind is not null 
                then
                    dbms_output.put_line('dbms_datapump.get_status('||h1||'...)');
                end if;
                while ind is not null loop
                    dbms_output.put_line(le(ind).LogText);
                    ind := le.NEXT(ind);
                end loop;
            end if;
        END IF;
    EXCEPTION 
    when others then null;
    END;
    BEGIN 
        IF ((errorvarchar = 'ERROR')AND(tryGetStatus=1)) THEN 
            DBMS_DATAPUMP.DETACH(h1);
        END IF;
    EXCEPTION 
    WHEN OTHERS THEN 
        NULL;
    END;
    --Raise;
END;
/

disconnect;

prompt dpimp exiting