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


// PostgreSQL
const {Client} = require("pg");
const client = new Client({
	host: config.db.hostname,
	port: config.db.port,
	user: config.db.user,
	password: config.db.password,
	database : config.db.database
});

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

client.connect((err) => {
	if(err) {
		console.error("PG Connexion error - ", err.stack);
	} else {
		console.log("PG connected");
	}
})

// Home
myRouter.route('/')
// Todo : Renvoyer vers une page Web documentant l'API DuduTracker
// all answer all methods 
.all(function(req,res){ 
   res.json({message : "Welcome on DuduTracker API", methode : req.method});
});

//Return players hands
myRouter.get('/playerHands/:playerName', function(req,res){
    var limit = 1000;
	var offset = 0;

	if(req.query.maxResultat) {
		if(limit <=1000) {
			limit = req.query.maxResultat;
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

// Return the last game
myRouter.get('/lastGame', function(req,res){
    var limit = 1000;
	var offset = 0;
	
	if(req.query.maxResultat) {
		if(limit <=1000) {
			limit = req.query.maxResultat;
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

myRouter.route('/hands')
// GET
.get(function(req,res){ 
    /*var query = 'SELECT "Hand" FROM "Hands" WHERE "PlayerName"=' + req.params.playerName + ";";
    console.log(query);*/
    res.json({Results: 'API Not implemented' + req});

	/*client.query(query, (errQ, resQ) => {
		if(errQ) {
			console.log("SQL error - " + errQ);
		} else {
			if(resQ.rowCount > 0) {
				res.json({PlayerName : resQ.rows[0].PlayerName});
			} else
			{
				res.json({Error : "No hands found for player " + req.params.playerName});
			}
		}
	})*/
})
//POST
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
      res.json({message : "Update one hand", methode : req.method});
})
//DELETE
.delete(function(req,res){ 
res.json({message : "Delete one hand", methode : req.method});  
})
// POST
//.post(function(req,res){ 
//	  res.json({message : "POST player #" + req.params.player_id});
	  /* INSERT INTO public."Players" (
"PlayerName") VALUES (
%(PlayerName)s::name)
 returning "PlayerID";
	   */
//})
// PUT
.put(function(req,res){ 
	res.json({message : "PUT player #" + req.params.player_id});
})
// DELETE
.delete(function(req,res){ 
	res.json({message : "DELETE player #" + req.params.player_id});
});

//Define players routes
// Goute to GET players begining by 
myRouter.route('/players/:playerName')
//GET
.get(function(req,res){
	var limit = 1000;
	var offset = 0;
	
	if(req.query.maxResultat) {
		if(limit <=1000) {
			limit = req.query.maxResultat;
		};
	}
	
	if(req.query.offset) {
		offset = req.query.offset; 
	}
	
    var query = 'SELECT "PlayerName" FROM "Players" WHERE "PlayerName" LIKE \'' + req.params.playerName + '%\' LIMIT ' + limit + ' OFFSET ' + offset + ';';
    console.log(query)

	client.query(query, (errQ, resQ) => {
		if(errQ) {
			console.log("SQL error - " + errQ);
			res.json({Error : "Select player error" + errQ});
		} else {
			if(resQ.rowCount > 0) {
				res.json({results : resQ.rows});
			} else
			{
				res.json({error : "No players found"});
			}
		}
	})	
})
// Route to GET players of list of gameID 
myRouter.route('/players/gameIDs/:gameIDs')
//GET
.get(function(req,res){
	var limit = 1000;
    var offset = 0;
    var strGameIDs = "";
	
	if(req.query.maxResultat) {
		if(limit <=1000) {
			limit = req.query.maxResultat;
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
				res.json({results : resQ.rows});
			} else
			{
				res.json({error : "No players found"});
			}
		}
	})	
})
// Define route to returns player list
myRouter.route('/players')
// GET
.get(function(req,res){
	var limit = 1000;
	var offset = 0;
	
	if(req.query.maxResultat) {
		if(limit <=1000) {
			limit = req.query.maxResultat;
		};
	}
	
	if(req.query.offset) {
		offset = req.query.offset; 
	}
	
	var query = 'SELECT "PlayerName" FROM "Players" ' + ' LIMIT ' + limit + ' OFFSET ' + offset + ';';
	client.query(query, (errQ, resQ) => {
		if(errQ) {
			console.log("SQL error - " + errQ);
			res.json({Error : "Select player error" + errQ});
		} else {
			if(resQ.rowCount > 0) {
				res.json({results : resQ.rows});
			} else
			{
				res.json({error : "No players found"});
			}
		}
	})	
})
//POST
.post(function(req,res){
	addPlayer(req.body.name, function(result){
			res.json(result);
	});
})
//PUT
.put(function(req,res){ 
      res.json({message : "Update one player", methode : req.method});
})
//DELETE
.delete(function(req,res){ 
res.json({message : "Delete one player", methode : req.method});  
}); 

// Use our defined router
app.use(myRouter);  

// Start server 
app.listen(port, hostname, function(){
	console.log("Server started on http://"+ hostname +":"+port); 
});

var http = require('http');

// Chargement du fichier index.html affiché au client
var server = http.createServer(function(req, res) {
    /*fs.readFile('./index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });*/
});

// Chargement de socket.io
var io = require('socket.io').listen(server);

// Quand un client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {
    console.log('Un client est connecté !');
});

server.listen(8081);

