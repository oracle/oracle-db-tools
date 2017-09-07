## SQL Script
curl -X "POST" "http://localhost:9090/ords/hr/_/sql" \
     -H "Content-Type: application/sql" \
     -u HR:oracle \
     -d $'create table klrice_test( 
  id number,
  name varchar2(200)
);
insert into klrice_test values(1,\'hi\');
insert into klrice_test values(2,\'hi again\');
insert into klrice_test values(3,\'cya\');
select * from klrice_test;
rollback;

select * from klrice_test;
drop table klrice_test;'

