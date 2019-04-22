
// Author : Arnaud DUHAMEL
// Application name : DuDuTrakcerAPI
// Version 0.1.0
// Last Update : 24/02/2019


// Release : 23/02/2019
// Inititialisation de l'API
// Mise en place des routes Hands et Players et de leur fonctions GET, POST, PUT et DELETE

// Release : 24/02/2019
// Mise en place de la connexion postgreSQL
// Développement de la route GET player by ID
// Développement de la route GET players avec gestion du nombre de résultat max et offset (Début des résultats)

// Release : 05/03/2019
// Développement de la route POST Game
// Développement des function addPlayer, addGame et addHand

// Release : 24/03/2019
// Enregistrement des players et hands dans la fonction de callback de addGame


// TODO :
// Mise en place de l'authentification API
// Développement du catch d'erreur connexion BDD interrompu par le serveur
// Retravailler le nom des variables pour les rendre homogène dans leurs syntaxes
//


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

function addGame(gameID, gameType, TimeStamp, table_name, button_pos, nbPlayer, maxPlayer, flop, turn, river, callback) {
	var query = 'INSERT INTO "Games" ("GameID", "Date", "Button", "NumberOfPlayer", "TotalNumberOfPlayer", "Flop", "Turn", "River", "GameType", "TableName") VALUES (' + gameID + ', \'' + TimeStamp + '\', ' + button_pos + ', ' + nbPlayer + ', ' + maxPlayer + ', \'' + flop + '\', \'' + turn + '\', \'' + river + '\', \'' + gameType + '\', \'' + table_name + '\');';
	//console.log(query);
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
.post(function(req,res){
    req.body.gameType=req.body.gameType.replace("\\","'");
    handPlayers=JSON.parse(req.body.handPlayers)
    
    // On insert en base le Game
    addGame(req.body.game_num, req.body.gameType, req.body.TimeStamp, req.body.table_name, req.body.button_pos, req.body.nbPlayer, req.body.maxPlayer, req.body.flop, req.body.turn, req.body.river, function(result){
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
            		//
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
myRouter.route('/players/:player_id')
//GET
.get(function(req,res){
	var query = 'SELECT "PlayerName" FROM "Players" WHERE "PlayerID"=' + req.params.player_id + ";";
	client.query(query, (errQ, resQ) => {
		if(errQ) {
			console.log("SQL error - " + errQ);
		} else {
			if(resQ.rowCount > 0) {
				res.json({PlayerName : resQ.rows[0].PlayerName});
			} else
			{
				res.json({Error : "Player not found "});
			}
		}
	})
})
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
