## SQL-Pagination
curl -X "POST" "http://localhost:9090/ords/hr/_/sql" \
     -H "Content-Type: application/json" \
     -u HR:oracle \
     -d $'{
  "statementText": "select object_name from all_objects where ? = ?",
  "binds": [
    {
      "index": 1,
      "data_type": "NUMBER",
      "value": 20
    },
    {
      "index": 2,
      "data_type": "NUMBER",
      "value": 20
    }
  ],
  "$asof": {
    "$scn": "1273919"
  },
  "offset": 25,
  "limit": 5
}'

