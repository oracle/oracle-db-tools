-- dpexp.sql data pump export 
/* 
The MIT License (MIT)

Copyright (c) 2021, Oracle and/or its affiliates. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

SET SERVEROUTPUT ON
SET ESCAPE OFF
SET VERIFY OFF

WHENEVER SQLERROR EXIT

prompt dpexp starting ...
-- TODO: Maybe move connect & initialize from source stuff to separate script (so this script can use the substitution values and rather than calcing log/file names twice)
connect &dm_source;

prompt Calculating data pump path and file name(s)...
column directory_path new_value dm_data_pump_path
select directory_path from all_directories where upper(directory_name) = '&dm_data_pump_dir';
column dpfil new_value dm_data_pump_file
select '&dm_schema_exp'||'.DMP' as dpfil from dual;
column dplog new_value dm_data_pump_log
select '&dm_schema_exp'||'-EXP.LOG' as dplog from dual;

prompt Exporting schema &dm_schema_exp ...
DECLARE
    h1           NUMBER;
    s            VARCHAR2(1000) := NULL;
    errorvarchar VARCHAR2(100) := 'ERROR';
    trygetstatus NUMBER := 0;
    success_with_info EXCEPTION;
    PRAGMA exception_init ( success_with_info, -31627 );
    jobname      VARCHAR2(500);
    job_status   VARCHAR2(500);
    
    -- new vars
    schemaname   VARCHAR2(500) := '&dm_schema_exp'; --DEFAULT 'TEST_SCHEMA';
    dpdir        VARCHAR2(512) := '&dm_data_pump_dir'; --DEFAULT 'DATA_PUMP_DIR';
    filepfx      VARCHAR2(32) := '&dm_schema_exp'; --DEFAULT 'EXPDAT';
    dbver        VARCHAR2(32) := 'COMPATIBLE'; -- not sure if we need to specify downgrade version here or in import - Turloch says same version for both
    -- temp vars for report query
    l_tabname varchar(512);
    l_tmp varchar(500);
BEGIN
    jobname := dbms_scheduler.generate_job_name('EXP_SD_');
    dbms_output.put_line('JOB_NAME: ' || jobname);
--    dbms_output.put_line('/* STATUS */ select state from dba_datapump_jobs where job_name='''
--                         || jobname
--                         || ''';');
    h1 := dbms_datapump.open(operation => 'EXPORT', job_mode => 'SCHEMA', job_name => jobname, version => dbver);

    trygetstatus := 1;
    --dbms_datapump.set_parameter(handle => h1, name => 'COMPRESSION', value => 'ALL');

    dbms_datapump.set_parallel(handle => h1, degree => 1);
--    dbms_datapump.add_file(handle => h1, filename => ''''
--                                                     || filepfx
--                                                     || '''.LOG', directory => dpdir, filetype => 3);
    dbms_datapump.add_file(handle => h1, filename => filepfx
                                                     || '-EXP.LOG', directory => dpdir, filetype => 3);

    dbms_datapump.set_parameter(handle => h1, name => 'KEEP_MASTER', value => 1);

    dbms_datapump.metadata_filter(handle => h1, name => 'SCHEMA_EXPR', value => 'IN('''
                                                                                || schemaname
                                                                                || ''')');

    dbms_datapump.add_file(handle => h1, filename => filepfx
                                                     || '.DMP', directory => dpdir, filesize => '500M', filetype => 1,
                          reusefile => 1);

    dbms_datapump.set_parameter(handle => h1, name => 'INCLUDE_METADATA', value => 1);

    dbms_datapump.set_parameter(handle => h1, name => 'DATA_ACCESS_METHOD', value => 'AUTOMATIC');

    dbms_datapump.set_parameter(handle => h1, name => 'ESTIMATE', value => 'BLOCKS');

    dbms_datapump.start_job(handle => h1, skip_current => 0, abort_step => 0);

    dbms_datapump.wait_for_job(handle => h1, job_state => job_status);
    errorvarchar := 'DataPump Export Status: '''
                    || job_status
                    || '''';
    dbms_output.put_line(errorvarchar);
-- add real status i.e.
--l_tabname := '&_USER..'||jobname;
--dbms_output.put_line('l_tabname = '||l_tabname);
--TODO think we are going to have to do dynamic execute immediate? (getting table not exist error - don't know if we can do select into with composed sql text)
--SELECT object_type_path into l_tmp FROM l_tabname where job_mode = 'SCHEMA' and name = jobname;
--dbms_output.put_line(l_tmp);

EXCEPTION
    WHEN OTHERS THEN
        dbms_output.put_line(sqlerrm);
        dbms_output.put_line(dbms_utility.format_error_backtrace);
        IF (
            ( s IS NOT NULL )
            AND ( s != 'COMPLETED' )
        ) THEN
            dbms_output.put_line('WAIT_FOR_JOB JOB_STATE STATE=' || s);
        END IF;

        DECLARE
            ind          NUMBER;
            percent_done NUMBER;
            job_state    VARCHAR2(30);
            le           ku$_logentry;
            js           ku$_jobstatus;
            jd           ku$_jobdesc;
            sts          ku$_status;
        BEGIN 
        /* on error try getstatus */
            IF (
                ( errorvarchar = 'ERROR' )
                AND ( trygetstatus = 1 )
            ) THEN
                dbms_datapump.get_status(h1, dbms_datapump.ku$_status_job_error + dbms_datapump.ku$_status_job_status + dbms_datapump.
                ku$_status_wip, -1, job_state, sts);

                js := sts.job_status;
    /* If any work-in-progress (WIP) or Error messages were received for the job,
     display them.*/
                IF ( bitand(sts.mask, dbms_datapump.ku$_status_wip) != 0 ) THEN
                    le := sts.wip;
                ELSE
                    IF ( bitand(sts.mask, dbms_datapump.ku$_status_job_error) != 0 ) THEN
                        le := sts.error;
                    ELSE
                        le := NULL;
                    END IF;
                END IF;

                IF le IS NOT NULL THEN
                    ind := le.first;
                    IF ind IS NOT NULL THEN
                        dbms_output.put_line('dbms_datapump.get_status('
                                             || h1
                                             || '...)');
                    END IF;

                    WHILE ind IS NOT NULL LOOP
                        dbms_output.put_line(le(ind).logtext);
                        ind := le.next(ind);
                    END LOOP;

                END IF;

            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        BEGIN
            IF (
                ( errorvarchar = 'ERROR' )
                AND ( trygetstatus = 1 )
            ) THEN
                dbms_datapump.detach(h1);
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;
    /*Raise;*/
END;
/

disconnect;
prompt dpexp exiting