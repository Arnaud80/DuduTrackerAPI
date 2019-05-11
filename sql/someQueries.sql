SELECT "PlayerName" FROM "Players" WHERE "PlayerName"='A BanDerA' LIMIT 1000 OFFSET 0;
SELECT "PlayerName" FROM "Players" WHERE "PlayerName" LIKE 'Arn%' LIMIT 1000 OFFSET 0;

SELECT * FROM "Hands" WHERE "PlayerName"='Arnaud80200' ORDER BY "GameID" ASC;
SELECT * FROM "Hands" WHERE "Hand" LIKE '%[%';
SELECT * FROM "Hands" WHERE "Hand" LIKE '     ';
SELECT * FROM "Hands" WHERE "GameID"='105553169121056';
SELECT * FROM "Games" WHERE "GameID"='105553169121056';
SELECT "GameID" FROM "Games" WHERE "Players";

SELECT "Players" FROM "Games" WHERE "GameID"='105553181020192';

SELECT a.countHands, "Hand" as "lastHand" FROM "Hands",
(SELECT COUNT(*) as countHands, MAX("GameID") AS maxGameID FROM "Hands" WHERE "PlayerName"='Arnaud80200') AS a
WHERE "PlayerName"='Arnaud80200' AND "GameID"=a.maxGameID;

/* TO DELETE */
SELECT a.countHands, "Hand" as "lastHand" FROM "Hands",
(SELECT COUNT(*) as countHands FROM "Hands" WHERE "PlayerName" IN('Arnaud80200', 'chardon08')) AS a
WHERE "PlayerName"IN('Arnaud80200', 'chardon08') AND "GameID"='105553169121056';

/* Table 1*/
SELECT UNNEST("Players") FROM "Games" WHERE "GameID"='105553169121056';

SELECT  "Players[]"
FROM "Hands"
WHERE some_id = ANY(ARRAY[1, 2])

/* Table 2*/
SELECT "PlayerName", COUNT ("Hand") FROM "Hands"
WHERE "PlayerName" IN(SELECT "PlayerName" FROM "Hands" WHERE "GameID"='105553169121056')
GROUP BY "PlayerName";
 
 /*Join Table 1 et 2*/
SELECT A."PlayerName", "Hand", "Count" FROM 
(SELECT UNNEST("Players") AS "PlayerName" FROM "Games" WHERE "GameID"='105553169121056') AS A
LEFT JOIN
(SELECT "PlayerName", COUNT ("Hand") AS "Count" FROM "Hands"
WHERE "PlayerName" IN(SELECT UNNEST("Players") AS "PlayerName" FROM "Games" WHERE "GameID"='105553169121056')
GROUP BY "PlayerName") AS B
ON A."PlayerName" = B."PlayerName"
LEFT JOIN
(SELECT "PlayerName", "Hand" FROM "Hands" WHERE "GameID"='105553169121056') AS C
ON B."PlayerName" = C."PlayerName"

 

/* SELECT the last hand of one player in the Game
SELECT *
FROM "Hands" LEFT JOIN "Games" ON ("Games"."GameID" = "Hands"."GameID")
WHERE "Hands"."PlayerName"='chardon08'
AND "Games"."GameID"=(SELECT "GameID" FROM "Games" ORDER BY "Date" DESC LIMIT 1);

//WHERE "PlayerName" IN('Arnaud80200')

SELECT * FROM "Games" ORDER BY "Date" DESC LIMIT 10;

SELECT COUNT(*) FROM "Hands" WHERE "PlayerName"='Arnaud80200';

/*
DELETE FROM "Hands" WHERE "Hand" LIKE '%[%';
DELETE FROM "Games" WHERE "GameID" IN (SELECT "GameID" FROM "Hands" WHERE "Hand"='     ');
DELETE FROM "Games" WHERE "GameID" IN ('1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20');
DELETE FROM "Games" WHERE "GameID"='105828036256832';*/