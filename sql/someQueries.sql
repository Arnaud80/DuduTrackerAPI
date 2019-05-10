SELECT "PlayerName" FROM "Players" WHERE "PlayerName"='A BanDerA' LIMIT 1000 OFFSET 0;
SELECT "PlayerName" FROM "Players" WHERE "PlayerName" LIKE 'Arn%' LIMIT 1000 OFFSET 0;

SELECT * FROM "Hands" WHERE "PlayerName"='Arnaud80200';
SELECT * FROM "Hands" WHERE "Hand" LIKE '%[%';
SELECT * FROM "Hands" WHERE "Hand" LIKE '     ';
SELECT * FROM "Hands" WHERE "GameID"='105828036256832';
SELECT * FROM "Games" WHERE "GameID"='105553159240192';
SELECT "GameID" FROM "Games" WHERE "Players";

SELECT a.countHands, "Hand" as "lastHand" FROM "Hands",
(SELECT COUNT(*) as countHands FROM "Hands" WHERE "PlayerName"='Arnaud80200') AS a
WHERE "PlayerName"='Arnaud80200' AND "GameID"='106652636478432';

SELECT * FROM "Games" ORDER BY "Date" DESC LIMIT 1;

SELECT COUNT(*) FROM "Hands" WHERE "PlayerName"='Arnaud80200';

/*
DELETE FROM "Hands" WHERE "Hand" LIKE '%[%';
DELETE FROM "Games" WHERE "GameID" IN (SELECT "GameID" FROM "Hands" WHERE "Hand"='     ');
DELETE FROM "Games" WHERE "GameID" IN ('1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20');
DELETE FROM "Games" WHERE "GameID"='105828036256832';*/