## SQL 2 sql statements
curl -X "POST" "http://localhost:9090/ords/hr/_/sql" \
     -H "Content-Type: application/sql" \
     -u HR:oracle \
     -d $'select count(1) abc from user_objects;

select * from dual;'

