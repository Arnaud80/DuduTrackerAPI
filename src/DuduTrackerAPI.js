var express = require('express');
var config = require('../config');

// Server params
var hostname = config.app.hostname; 
var port = config.app.port;

// Express app 
var app = express();

// Route manager 
var myRouter = express.Router(); 

// Body Parser
var bodyParser = require("body-parser"); 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Allow all Origin
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});


// PostgreSQL Initialization
const {Client} = require("pg");
const client = new Client({
	host: config.db.hostname,
	port: config.db.port,
	user: config.db.user,
	password: config.db.password,
	database : config.db.database
});

// Function addPlayer() to record new player in database
// name: string - Name of the player to record
// callback: The callback function used when the action is finish
function addPlayer(name, callback) {
	var query = 'INSERT INTO "Players" ("PlayerName") VALUES (\'' + name + '\');';
	//console.log(query);
	client.query(query, (errQ, resQ) => {
		if(errQ) {
			console.log("addPlayer() - SQL error - " + errQ);
			callback(errQ);
		} else {
			if(resQ.rowCount > 0) {
				callback(resQ);
			} else
			{
				console.log("addPlayer() - Error - " + errQ);
				callback(errQ);
			}
		}
	})
}

// Function addGame() to record new game in database
// gameID : 
// callback: The callback function used when the action is finish
function addGame(gameID, gameType, TimeStamp, table_name, button_pos, nbPlayer, maxPlayer, flop, turn, river, players, callback) {
    var query = 'INSERT INTO "Games" ("GameID", "Date", "Button", "NumberOfPlayer", "TotalNumberOfPlayer", "Flop", "Turn", "River", "GameType", "TableName", "Players") VALUES (' + 
                gameID + ', \'' + TimeStamp + '\', ' + button_pos + ', ' + nbPlayer + ', ' + maxPlayer + ', \'' + flop + '\', \'' + turn + '\', \'' + river + '\', \'' + gameType + '\', \'' + table_name + '\', \'' + players + '\');';
    console.log(query);
    
	client.query(query, (errQ, resQ) => {
		if(errQ) {
			console.log("addGame() - SQL error - " + errQ);
			callback(errQ);
		} else {
			if(resQ.rowCount > 0) {
				callback(resQ);
			} else
			{
				console.log("addGame() - Error - " + errQ);
				callback(errQ);
			}
		}
    })
}

// Function addHand() to record new hand in database
// gameID : 
// callback: The callback function used when the action is finish
function addHand(GameID, PlayerID, Hand, callback) {
	var query = 'INSERT INTO "Hands" ("GameID", "PlayerName", "Hand") VALUES (' + GameID + ', \'' + PlayerID + '\', \'' + Hand + '\');';
	//console.log(query);
	client.query(query, (errQ, resQ) => {
		if(errQ) {
			console.log("addHand() - SQL error - " + errQ);
			callback(errQ);
		} else {
			if(resQ.rowCount > 0) {
				callback(resQ);
			} else
			{
				console.log("addHand() - Error - " + errQ);
				callback(errQ);
			}
		}
	})
}

// Connexion to the postgreSQL Database
client.connect((err) => {
	if(err) {
		console.error("PG Connexion error - ", err.stack);
	} else {
		console.log("PG connected");
	}
})


/*
    Definitions of all routes provided by the API server
*/

// Home
myRouter.route('/')
// Todo : Renvoyer vers une page Web documentant l'API DuduTracker
// Answer all methods with the same message 
.all(function(req,res){ 
   res.json({message : "Welcome on DuduTracker API", methode : req.method});
});

/*
 Return players hands
 URL definition : http://<server>:<port>/playerHands/<playerName>?limit=<maxRes>&offset=<offset>
 limit=1000 by default
 offset=0 by default 
 Sample URL : http://localhost:8080/playerHands/Arnaud80200?limit=2&offset=0
 Return a json formated like that :
{
    "results": [
        {
            "Hand": "Qh,9h"
        },
        ...
        {
            "Hand": "9d,8d"
        }
    ],
    "count": 2
}
*/
myRouter.get('/playerHands/:playerName', function(req,res){
    var limit = 1000;
	var offset = 0;

	if(req.query.limit) {
		if(limit <=1000) {
			limit = req.query.limit;
		};
	}

	if(req.query.offset) {
		offset = req.query.offset; 
    }

    var query = 'SELECT "Hand" FROM "Hands" WHERE "PlayerName"=\'' + req.params.playerName + '\' AND "Hand"<>\'     \'' + ' LIMIT ' + limit + ' OFFSET ' + offset + ';';
	client.query(query, (errQ, resQ) => {
		if(errQ) {
			console.log("SQL error - " + errQ + " : " + query);
		} else {
			if(resQ.rowCount > 0) {
                res.json({results : resQ.rows, count: resQ.rowCount});
			} else
			{
				res.json({Error : "No hands found for player " + req.params.playerName});
			}
		}
	})
});

/*
 Return last game
 URL definition : http://<server>:<port>/lastGame/<playerName>?limit=<maxRes>&offset=<offset>
 limit=1000 by default
 offset=0 by default 
 Sample URL : http://localhost:8080/lastGame
 Return a json formated like that :
{
    "results": [
        {
            "GameID": "105553159240192",
            "Date": "2019-05-05T09:38:35.000Z",
            "Button": 6,
            "NumberOfPlayer": 6,
            "TotalNumberOfPlayer": 6,
            "Flop": "Ts,Tc,6c",
            "Turn": "Js",
            "River": "6h",
            "GameType": "€2 EUR NL Texas Hold'em",
            "TableName": "Saint-Denis ( Real Money )",
            "Players": [
                "xxfabluffxx",
                "lauset",
                "Xolare",
                "Arnaud80200",
                "SpineuRx",
                "Erszebeth"
            ]
        }
    ],
    "count": 1
}
*/
myRouter.get('/lastGame', function(req,res){
    var limit = 1000;
	var offset = 0;
	
	if(req.query.limit) {
		if(limit <=1000) {
			limit = req.query.limit;
		};
	}
	
	if(req.query.offset) {
		offset = req.query.offset; 
    }
    //SELECT "GameID", "Date", "Button", "NumberOfPlayer", "TotalNumberOfPlayer", "Flop", "Turn", "River", "GameType", "TableName" FROM "Games" ORDER BY "Date" DESC LIMIT 1;
    var query = 'SELECT "GameID", "Date", "Button", "NumberOfPlayer", "TotalNumberOfPlayer", "Flop", "Turn", "River", "GameType", "TableName", "Players" FROM "Games" ORDER BY "Date" DESC LIMIT 1;';
	client.query(query, (errQ, resQ) => {
		if(errQ) {
			console.log("SQL error - " + errQ + " : " + query);
		} else {
			if(resQ.rowCount > 0) {
                //res.json({results : resQ.rows});
                res.json({results : resQ.rows, count: resQ.rowCount});
			} else
			{
				res.json({Error : "No last game found"});
			}
		}
	})
});


// Defines routes for /hands
myRouter.route('/hands')
// GET
.get(function(req,res){ 
    res.json({results: 'API Not implemented' + req});
})
// Add hands
.post(function(req,res){
    req.body.gameType=req.body.gameType.replace("\\","'");
    handPlayers=JSON.parse(req.body.handPlayers)
    players=req.body.players.replace("[","{");
    players=players.replace("]","}");
    
    // On insert en base le Game
    addGame(req.body.game_num, req.body.gameType, req.body.TimeStamp, req.body.table_name, req.body.button_pos, req.body.nbPlayer, req.body.maxPlayer, req.body.flop, req.body.turn, req.body.river, players, function(result){
    	// Si le Game n'existe pas on insert la partie, les joueurs et les mains associées
    	// On fait ça dans la fonction de callback afin d'assurer l'insertion des Hands et Player après le GameID
        if(result.rowCount) {
        	// On boucle sur chaque joueurs de la partie
            Object.keys(handPlayers).forEach(function(key){
            	// On insert en base chaque joueur
            	addPlayer(key, function(result){
            		//
            	});
            	addHand(req.body.game_num, key, handPlayers[key], function(result){
            		io.emit('message', '');
            	});
            });
            res.json({success: "hand & players added for game " + req.body.game_num});
        } else {
        	console.log("Game already exist")
        	res.json({error: "Game already exist : " + req.body.game_num});
        }
    });
})
//PUT
.put(function(req,res){ 
    res.json({results: 'API Not implemented' + req});
})
//DELETE
.delete(function(req,res){ 
    res.json({results: 'API Not implemented' + req});  
})

//Define /players routes
/*
 Return players
 URL definition : http://<server>:<port>/players?beginby=Arn&limit=<maxRes>&offset=<offset>
 limit=1000 by default
 offset=0 by default 
 Sample URL : http://localhost:8080/players?beginby=Arn&offset=0&limit=2
 or http://localhost:8080/players for all players
 Return a json formated like that :
{
    "results": [
        {
            "PlayerName": "Arnamiras"
        },
        {
            "PlayerName": "Arnaque 2.0"
        }
    ],
    "count": 2
}
*/
myRouter.route('/players')
//GET
.get(function(req,res){
	var limit = 1000;
    var offset = 0;
    var query = "";
    
    beginby = req.query.beginby
    console.log(beginby)
	
	if(req.query.limit) {
		if(limit <=1000) {
			limit = req.query.limit;
		};
	}
	
	if(req.query.offset) {
		offset = req.query.offset; 
	}
    
    if(beginby=="") query = 'SELECT "PlayerName" FROM "Players" ' + ' LIMIT ' + limit + ' OFFSET ' + offset + ';';
    else query = 'SELECT "PlayerName" FROM "Players" WHERE "PlayerName" LIKE \'' + beginby + '%\' LIMIT ' + limit + ' OFFSET ' + offset + ';';
    console.log(query)

	client.query(query, (errQ, resQ) => {
		if(errQ) {
			console.log("SQL error - " + errQ);
			res.json({Error : "Select player error" + errQ});
		} else {
			if(resQ.rowCount > 0) {
				res.json({results : resQ.rows, count: resQ.rowCount});
			} else
			{
				res.json({error : "No players found"});
			}
		}
	})	
})
/*
To get detail of one player
RecordedHandsQty : 
*/
myRouter.route('/players/:playerName')
//GET
.get(function(req,res){
	var limit = 1000;
    var offset = 0;
    var query = "";
    
    playerName = req.params.playerName
	
	if(req.query.limit) {
		if(limit <=1000) {
			limit = req.query.limit;
		};
	}
	
	if(req.query.offset) {
		offset = req.query.offset; 
	}
    // SELECT COUNT(*) FROM "Hands" WHERE "PlayerName"='Arnaud80200';
    query = 'SELECT COUNT(*) FROM "Hands" WHERE "PlayerName"=\'' + playerName + '\';';
    console.log(query)
    
	client.query(query, (errQ, resQ) => {
		if(errQ) {
			console.log("SQL error - " + errQ);
			res.json({Error : "Select player error" + errQ});
		} else {
			if(resQ.rowCount > 0) {
				res.json({results : resQ.rows, count: resQ.rowCount});
			} else
			{
				res.json({error : "No players found"});
			}
		}
	})	
})

/*
 Return players of a list of game
 URL definition : http://<server>:<port>/players/gameIDs/<gameID_list>?limit=<maxRes>&offset=<offset>
 limit=1000 by default
 offset=0 by default 
 Sample URL : http://localhost:8080/players/gameIDs/106102884880960,105553159240192
 Return a json formated like that :
{
    "results": [
        {
            "Players": [
                "Arnaud80200",
                "titof-95",
                "INNPOKER",
                "NICO6899",
                "TITAN64",
                "DarkHeaven59",
                "ShaveMeImFamous",
                "LAGreekFolle",
                "pat213"
            ]
        },
        {
            "Players": [
                "xxfabluffxx",
                "lauset",
                "Xolare",
                "Arnaud80200",
                "SpineuRx",
                "Erszebeth"
            ]
        }
    ],
    "count": 2
}
*/
// Route to GET players of list of gameID 
myRouter.route('/players/gameIDs/:gameIDs')
//GET
.get(function(req,res){
	var limit = 1000;
    var offset = 0;
    var strGameIDs = "";
	
	if(req.query.limit) {
		if(limit <=1000) {
			limit = req.query.limit;
		};
	}
	
	if(req.query.offset) {
		offset = req.query.offset; 
	}
    
    gameIDs=req.params.gameIDs.split(',')

    for(var i=0; i<gameIDs.length;i++) {
        strGameIDs = strGameIDs + "\'" + gameIDs[i] + "\'";
        if(i!=gameIDs.length-1) strGameIDs += ",";
    }

    // SELECT "Players" FROM "Games" WHERE "GameID" IN('105553158104032', '106102884880960');
    var query = 'SELECT "Players" FROM "Games" WHERE "GameID" IN(' + strGameIDs + ') LIMIT ' + limit + ' OFFSET ' + offset + ';';
    console.log(query)

	client.query(query, (errQ, resQ) => {
		if(errQ) {
			console.log("SQL error - " + errQ);
			res.json({Error : "Select player error" + errQ});
		} else {
			if(resQ.rowCount > 0) {
				res.json({results : resQ.rows, count: resQ.rowCount});
			} else
			{
				res.json({error : "No players found"});
			}
		}
	})	
})

/*
To record new player
*/
.post(function(req,res){
	addPlayer(req.body.name, function(result){
			res.json(result);
	});
})
//PUT
.put(function(req,res){ 
    res.json({results: 'API Not implemented' + req});
})
//DELETE
.delete(function(req,res){ 
    res.json({results: 'API Not implemented' + req});  
}); 

// Use our defined router
app.use(myRouter);  

// Start server 
app.listen(port, hostname, function(){
	console.log("Server started on http://"+ hostname +":"+port); 
});

var http = require('http');

// Création du server utilisé pour socket.io
/*var server = http.createServer(function(req, res) {    
});*/
var server = http.createServer();
var io = require('socket.io').listen(server);

// Message of connexon to log the number of user in line
io.sockets.on('connection', function (socket) {
    console.log('Un client est connecté !');
});

server.listen(8081);
