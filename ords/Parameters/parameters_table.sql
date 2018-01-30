--------------------------------------------------------
--  DDL for Table PARAMETERS
--------------------------------------------------------
CREATE TABLE parameters (
    id      NUMBER(*,0),
    words   VARCHAR2(256 BYTE),
    when    DATE,
    age     NUMBER(*,0)
);
   
REM INSERTING into PARAMETERS

SET DEFINE OFF;

INSERT INTO parameters (
    id,
    words,
    when,
    age
) VALUES (
    1,
    'hello',
    TO_DATE('19-JAN-18','DD-MON-RR'),
    25
);

INSERT INTO parameters (
    id,
    words,
    when,
    age
) VALUES (
    2,
    'goodbye',
    TO_DATE('19-JAN-18','DD-MON-RR'),
    5
);

INSERT INTO parameters (
    id,
    words,
    when,
    age
) VALUES (
    3,
    'hola',
    TO_DATE('19-JAN-18','DD-MON-RR'),
    12
);

INSERT INTO parameters (
    id,
    words,
    when,
    age
) VALUES (
    4,
    'audios',
    TO_DATE('19-JAN-18','DD-MON-RR'),
    63
);