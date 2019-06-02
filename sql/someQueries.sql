SELECT "PlayerName" FROM "Players" WHERE "PlayerName"='A BanDerA' LIMIT 1000 OFFSET 0;
SELECT "PlayerName" FROM "Players" WHERE "PlayerName" LIKE 'Arn%' LIMIT 1000 OFFSET 0;

SELECT * FROM "Hands" WHERE "PlayerName"='Arnaud80200' ORDER BY "GameID" ASC;
SELECT * FROM "Hands" WHERE "Hand" LIKE '%[%';
SELECT * FROM "Hands" WHERE "Hand" LIKE '     ';
SELECT * FROM "Hands" WHERE "GameID"='105553174092032';
SELECT * FROM "PreFlopActions" WHERE "GameID"='105553173406464';
SELECT * FROM "FlopActions" WHERE "GameID"='105553173406464';
SELECT * FROM "TurnActions" WHERE "GameID"='105553174092032';
SELECT * FROM "RiverActions" WHERE "GameID"='105553174092032';
SELECT * FROM "Games" WHERE "GameID"='2';
SELECT "GameID" FROM "Games" WHERE "Players";

SELECT "Players" FROM "Games" WHERE "GameID"='107202394399648';

SELECT a.countHands, "Hand" as "lastHand" FROM "Hands",
(SELECT COUNT(*) as countHands, MAX("GameID") AS maxGameID FROM "Hands" WHERE "PlayerName"='Arnaud80200') AS a
WHERE "PlayerName"='Arnaud80200' AND "GameID"=a.maxGameID;

/* REQUESTS TO DETERMINE VPIP */
SELECT COUNT(DISTINCT "GameID") FROM "PreFlopActions" WHERE "PlayerName"='j3r0m301' AND ("Action"='calls'  OR "Action"='bets' OR "Action"='raises'  OR "Action"='all-In');
SELECT COUNT(*) FROM "Hands" WHERE "PlayerName"='Arnaud80200' AND ("PreFlopAction"='calls'  OR "PreFlopAction"='bets' OR "PreFlopAction"='raises' OR "PreFlopAction"='all-In');
SELECT COUNT(*) FROM "Hands" WHERE "PlayerName"='Arnaud80200';

/* REQUESTS TO DETERMINE PFR */
SELECT "PlayerName", COUNT(DISTINCT "GameID") FROM "PreFlopActions" WHERE "PlayerName"='Arnaud80200' AND ("Action"='bets' OR "Action"='raises'  OR "Action"='all-In') GROUP BY "PlayerName";
SELECT "GameID", "PreFlopAction" FROM "Hands" WHERE "PlayerName"='Arnaud80200' AND ("PreFlopAction"='bets' OR "PreFlopAction"='raises'  OR "PreFlopAction"='all-In');
SELECT COUNT(*) FROM "Hands" WHERE "PlayerName"='Arnaud80200' AND ("PreFlopAction"='bets' OR "PreFlopAction"='raises'  OR "PreFlopAction"='all-In');
SELECT COUNT(*) FROM "Hands" WHERE "PlayerName"='Arnaud80200';


WITH
A AS (SELECT COUNT(*) AS "TotalHand" FROM "Hands" WHERE "PlayerName"='Arnaud80200'),
B AS (SELECT COUNT(*) AS "VP" FROM "Hands" WHERE "PlayerName"='Arnaud80200' AND ("PreFlopAction"='calls'  OR "PreFlopAction"='bets' OR "PreFlopAction"='raises'))
SELECT (B."VP"::REAL)/(A."TotalHand") AS VP FROM A,B;
/* END - REQUESTS TO DETERMINE VP */

SELECT A."TotalHand" / B."VP" AS VP FROM ((SELECT COUNT(*) AS "TotalHand" FROM "Hands" WHERE "PlayerName"='loccitto' AS A),
(SELECT COUNT(*) AS "VP" FROM "Hands" WHERE "PlayerName"='loccitto' AND ("PreFlopAction"='calls'  OR "PreFlopAction"='bets' OR "PreFlopAction"='raises') AS B));

/* SELECT 3BET */
SELECT COUNT(*) FROM "PreFlopActions" WHERE "PlayerName"='superdany83' AND "Action" LIKE '%-bets';
SELECT "Action" FROM "PreFlopActions" WHERE "PlayerName"='superdany83' AND "Action" LIKE '%-bets';
SELECT "PlayerName", "Action" FROM "PreFlopActions" WHERE "PlayerName"<>'Arnaud80200' AND "Action" LIKE '%-bets';

/* SELECT AF FLOP, TURN, RIVER */
SELECT "PlayerName", COUNT(DISTINCT "GameID") FROM "FlopActions" WHERE "PlayerName"='Arnaud80200' AND ("Action" LIKE '%bets' OR "Action"='raises'  OR "Action"='all-In') GROUP BY "PlayerName";
SELECT "PlayerName", COUNT(DISTINCT "GameID") FROM "FlopActions" WHERE "PlayerName"='Arnaud80200' AND ("Action"='calls' OR "Action"='checks') GROUP BY "PlayerName";
SELECT * FROM "FlopActions" WHERE "PlayerName"='Arnaud80200' AND "Action" LIKE '%bets';

SELECT "PlayerName", COUNT(DISTINCT "GameID") FROM "TurnActions" WHERE "PlayerName"='Mon3yMast3r' AND ("Action" LIKE '%bets' OR "Action"='raises'  OR "Action"='all-In') GROUP BY "PlayerName";
SELECT "PlayerName", COUNT(DISTINCT "GameID") FROM "TurnActions" WHERE "PlayerName"='Mon3yMast3r' AND ("Action"='calls' OR "Action"='checks') GROUP BY "PlayerName";

SELECT "PlayerName", COUNT(DISTINCT "GameID") FROM "RiverActions" WHERE "PlayerName"='Mon3yMast3r' AND ("Action" LIKE '%bets' OR "Action"='raises'  OR "Action"='all-In') GROUP BY "PlayerName";
SELECT "PlayerName", COUNT(DISTINCT "GameID") FROM "RiverActions" WHERE "PlayerName"='Mon3yMast3r' AND ("Action"='calls' OR "Action"='checks') GROUP BY "PlayerName";

/* Table 1*/
SELECT UNNEST("Players") FROM "Games" WHERE "GameID"='105553169121056';

SELECT  "Players[]"
FROM "Hands"
WHERE some_id = ANY(ARRAY[1, 2])

/* Table 2*/
SELECT "PlayerName", COUNT ("Hand") FROM "Hands"
WHERE "PlayerName" IN(SELECT "PlayerName" FROM "Hands" WHERE "GameID"='105553169121056')
GROUP BY "PlayerName";
 
/* Join Table 1 et 2*/
SELECT A."PlayerName", "Hand", "Count" FROM 
(SELECT UNNEST("Players") AS "PlayerName" FROM "Games" WHERE "GameID"='3') AS A
LEFT JOIN
(SELECT "PlayerName", COUNT ("Hand") AS "Count" FROM "Hands"
WHERE "PlayerName" IN(SELECT UNNEST("Players") AS "PlayerName" FROM "Games" WHERE "GameID"='3')
GROUP BY "PlayerName") AS B
ON A."PlayerName" = B."PlayerName"
LEFT JOIN
(SELECT "PlayerName", "Hand" FROM "Hands" WHERE "GameID"='3') AS C
ON B."PlayerName" = C."PlayerName"

/* Return last Hand with player stats (count hand, VPIP, PFR, 3BET) */
SELECT A."PlayerName", "Hand", "Count", D."VPIP", E."PFR", F."_3BET", G."AFLOP", H."CFLOP", I."ATURN", J."CTURN", K."ARIVER", L."CRIVER" FROM 
(SELECT UNNEST("Players") AS "PlayerName" FROM "Games" WHERE "GameID"='105553177658848') AS A
LEFT JOIN
(SELECT "PlayerName", COUNT ("Hand") AS "Count" FROM "Hands"
WHERE "PlayerName" IN(SELECT UNNEST("Players") AS "PlayerName" FROM "Games" WHERE "GameID"='105553177658848')
GROUP BY "PlayerName") AS B
ON A."PlayerName" = B."PlayerName"
LEFT JOIN
(SELECT "PlayerName", "Hand" FROM "Hands" WHERE "GameID"='3') AS C
ON A."PlayerName" = C."PlayerName"
LEFT JOIN
(SELECT "PlayerName", COUNT(DISTINCT "GameID") AS "VPIP" FROM "PreFlopActions" 
WHERE "PlayerName" IN(SELECT UNNEST("Players") AS "PlayerName" FROM "Games" WHERE "GameID"='105553177658848')
AND ("Action"='calls' OR "Action"='bets' OR "Action"='raises'  OR "Action"='all-In')
GROUP BY "PlayerName") AS D
ON A."PlayerName" = D."PlayerName"
LEFT JOIN
(SELECT "PlayerName", COUNT(DISTINCT "GameID") AS "PFR" FROM "PreFlopActions"
WHERE "PlayerName" IN(SELECT UNNEST("Players") AS "PlayerName" FROM "Games" WHERE "GameID"='105553177658848')
AND ("Action"='bets' OR "Action"='raises' OR "Action"='all-In')
GROUP BY "PlayerName") AS E
ON A."PlayerName" = E."PlayerName"
LEFT JOIN
(SELECT "PlayerName", COUNT(DISTINCT "GameID") AS "_3BET" FROM "PreFlopActions"
WHERE "PlayerName" IN(SELECT UNNEST("Players") AS "PlayerName" FROM "Games" WHERE "GameID"='105553177658848')
AND "Action" LIKE '%-bets'
GROUP BY "PlayerName") AS F
ON A."PlayerName" = F."PlayerName"
LEFT JOIN
(SELECT "PlayerName", COUNT(DISTINCT "GameID") AS "AFLOP" FROM "FlopActions"
WHERE "PlayerName" IN(SELECT UNNEST("Players") AS "PlayerName" FROM "Games" WHERE "GameID"='105553177658848')
AND ("Action" LIKE '%bets' OR "Action"='raises'  OR "Action"='all-In')
GROUP BY "PlayerName") AS G
ON A."PlayerName" = G."PlayerName"
LEFT JOIN
(SELECT "PlayerName", COUNT(DISTINCT "GameID") AS "CFLOP" FROM "FlopActions"
WHERE "PlayerName" IN(SELECT UNNEST("Players") AS "PlayerName" FROM "Games" WHERE "GameID"='105553177658848')
GROUP BY "PlayerName") AS H
ON A."PlayerName" = H."PlayerName"
LEFT JOIN
(SELECT "PlayerName", COUNT(DISTINCT "GameID") AS "ATURN" FROM "TurnActions"
WHERE "PlayerName" IN(SELECT UNNEST("Players") AS "PlayerName" FROM "Games" WHERE "GameID"='105553177658848')
AND ("Action" LIKE '%bets' OR "Action"='raises'  OR "Action"='all-In')
GROUP BY "PlayerName") AS I
ON A."PlayerName" = I."PlayerName"
LEFT JOIN
(SELECT "PlayerName", COUNT(DISTINCT "GameID") AS "CTURN" FROM "TurnActions"
WHERE "PlayerName" IN(SELECT UNNEST("Players") AS "PlayerName" FROM "Games" WHERE "GameID"='105553177658848')
GROUP BY "PlayerName") AS J
ON A."PlayerName" = J."PlayerName"
LEFT JOIN
(SELECT "PlayerName", COUNT(DISTINCT "GameID") AS "ARIVER" FROM "RiverActions"
WHERE "PlayerName" IN(SELECT UNNEST("Players") AS "PlayerName" FROM "Games" WHERE "GameID"='105553177658848')
AND ("Action" LIKE '%bets' OR "Action"='raises'  OR "Action"='all-In')
GROUP BY "PlayerName") AS K
ON A."PlayerName" = K."PlayerName"
LEFT JOIN
(SELECT "PlayerName", COUNT(DISTINCT "GameID") AS "CRIVER" FROM "RiverActions"
WHERE "PlayerName" IN(SELECT UNNEST("Players") AS "PlayerName" FROM "Games" WHERE "GameID"='105553177658848')
GROUP BY "PlayerName") AS L
ON A."PlayerName" = L."PlayerName"



/* SELECT the last hand of one player in the Game
SELECT *
FROM "Hands" LEFT JOIN "Games" ON ("Games"."GameID" = "Hands"."GameID")
WHERE "Hands"."PlayerName"='Mon3yMast3r'
AND "Games"."GameID"=(SELECT "GameID" FROM "Games" ORDER BY "Date" DESC LIMIT 1);

//WHERE "PlayerName" IN('Arnaud80200')

SELECT * FROM "Games" ORDER BY "Date" DESC LIMIT 10;

SELECT COUNT(*) FROM "Hands" WHERE "PlayerName"='Arnaud80200';

/*
DELETE FROM "Hands" WHERE "Hand" LIKE '%[%';
DELETE FROM "Games" WHERE "GameID" IN (SELECT "GameID" FROM "Hands" WHERE "Hand"='     ');
DELETE FROM "Games" WHERE "GameID" IN ('1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20');
DELETE FROM "Games";
DELETE FROM "Games" WHERE "GameID"='105828036256832';

INSERT INTO "Hands" ("GameID", "PlayerName", "Hand", "PreFlopAction", "PreFlopAmount", "FlopAction", "FlopAmount", "TurnAction", "TurnAmount", "RiverAction", "RiverAmount",  "ResultAmount") VALUES (1, 'Arnaud80200', '9s,9h', 'raises', '0.06', 'calls', '0.03', 'calls', '0.02', 'calls', '0.17', '0');
*/