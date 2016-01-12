prompt set sqlformat ansiconsole
set sqlformat ansiconsole
select 1234567890 from dual;

prompt set sqlformat ansiconsole default
set sqlformat ansiconsole default
select 1234567890 from dual;

prompt set sqlformat ansiconsole ##.##E00
set sqlformat ansiconsole ##.##E00
select 1234567890 from dual;

prompt set sqlformat ansiconsole #,##0.00;(#,##0.00)
set sqlformat ansiconsole #,##0.00;(#,##0.00)
select 1234567890,-1234567890 from dual;

prompt set sqlformat ansiconsole #,##0.00;@|red -#,##0.00|@
set sqlformat ansiconsole #,##0.00;@|red -#,##0.00|@
select 1234567890,-1234567890 from dual;

prompt set sqlformat ansiconsole #,##0.00;@|underline -#,##0.00|@
set sqlformat ansiconsole #,##0.00;@|underline -#,##0.00|@
select 1234567890,-1234567890 from dual;
