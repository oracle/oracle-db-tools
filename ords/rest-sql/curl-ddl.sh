## SQL-EMP-DDL
curl -X "POST" "http://localhost:9090/ords/hr/_/sql" \
     -H "Content-Type: application/sql" \
     -u HR:oracle \
     -d $'set ddl SEGMENT_ATTRIBUTES off
set ddl storage off
set ddl pretty on 
ddl emp'

