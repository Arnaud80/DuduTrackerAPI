SELECT "PlayerName" FROM "Players" WHERE "PlayerName"='A BanDerA' LIMIT 1000 OFFSET 0;
SELECT "PlayerName" FROM "Players" WHERE "PlayerName" LIKE 'Arn%' LIMIT 1000 OFFSET 0;

SELECT * FROM "Hands" WHERE "PlayerName"='A BanDerA';
SELECT * FROM "Hands" WHERE "Hand" LIKE '%[%';
SELECT * FROM "Hands" WHERE "Hand" LIKE '     ';
SELECT * FROM "Hands" WHERE "GameID"='105828036256832';
SELECT * FROM "Games" WHERE "GameID"='105553159240192';
SELECT "GameID" FROM "Games" WHERE "Players";

SELECT COUNT(*) FROM "Hands" WHERE "PlayerName"='Arnaud80200';

/*
DELETE FROM "Hands" WHERE "Hand" LIKE '%[%';
DELETE FROM "Games" WHERE "GameID" IN (SELECT "GameID" FROM "Hands" WHERE "Hand"='     ');
DELETE FROM "Games" WHERE "GameID"='105828036256832';*/