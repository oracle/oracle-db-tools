## SQL 2 sql statements
time curl -X "POST" "http://localhost:9090/ords/hr/_/sql" \
     -H "Content-Type: application/sql" \
     -u HR:oracle \
     -d $'select * from dual;'

