## SQL-alias-restricted
curl -X "POST" "http://localhost:9090/ords/hr/_/sql" \
     -H "Content-Type: application/sql" \
     -u HR:oracle \
     -d $'spool xyz.log
alias'

