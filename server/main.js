Meteor.publish('users', function() {
    return Users.find({});
});

var mysql = Meteor.require('mysql');

var db_config = {
	host	: 'localhost',
	user 	: 'root',
	password: '',	
	port 	: '3306'
};


startConnect = function(config){
	var bridge = mysql.createConnection(config);
	return bridge;
}

var connection = startConnect(db_config);


mysql.createConnection(db_config);

Meteor.startup(function(){
	Apm.connect('CjwQdohh83iq9dtWc', '2cfdc412-531b-490b-bb13-99befa9ab7fe');
	Meteor.Mailgun.config({
		username: 'postmaster@metoermailgun.com',
		password: 'aliveWithHandz'
	});

connection.connect(function(err){
	console.log("---------- MySQL connection established ----------");
});
connection.query('create schema if not exists meteor');
connection.query('use meteor');
var createUserTable = "CREATE TABLE IF NOT EXISTS Users(userID varchar(45), firstName VARCHAR(45) NULL, lastName VARCHAR(45) NULL, accountBalance DECIMAL NULL, userBio VARCHAR(45) NULL, info VARCHAR(45) NULL, PRIMARY KEY (userID), UNIQUE INDEX idUsers_UNIQUE (userID ASC))";

connection.query(createUserTable, function(err, result){
	callback(result);
});

var selectFromPersons = "select * from Users";
connection.query(selectFromPersons, function(err, results){
	console.log(results);
});

});
	callback = function(x){
		console.dir(x);
	}

	allUsers = function(client){
		return client.query("SELECT * FROM Users");
	}

	clearTable = function(client){
		console.log("clearing Users table")
		client.query("DELETE FROM Users");
	}
	tableUpdate = function(client, id, fName, lName, accountBalance, userBio){
		console.log("updating user in MySQL...");

		// client.query("UPDATE Users SET firstName = + '" + fName + "' AND SET lastName = '" + lName + "' WHERE userID = '" + id + "'");

		client.query('UPDATE Users SET firstName = ? AND lastName = ? WHERE userID = ?', [fName, lName, id]);

		}

	tableDelete = function(client, fName, lName){
		client.query("DELETE from Users WHERE firstName = + '" + fName + "' AND lastName = '" + lName + "'");
	}

	dropConnection = function(client){
		console.log("MySQL connection terminated");
		client.destroy();
	}

	reconnection = function(client){
		client.connect(function(err) {
			console.log("MySQL connection established");
		});
	}

	tableReady = function(client, id, fName, lName, accBalance, bio, info){
		client.query("INSERT INTO Users (userID, firstName, lastName, accountBalance, userBio, info) VALUES ('" + id + "', '"+ fName + "', '"+ lName + "', '"+ accBalance + "', '"+ bio + "', '" + info + "')",
			function(err, results){
				if(err) {
					console.log("Error -> " + err.message);
					throw err;
				}
				console.dir(results);
				console.log("Inserted " + results.affectedRows + " row.");
			});

		
	};

	Meteor.methods({
		removeAllUsers : function() {
			// console.log("Clearing Users....");
			clearTable(connection);
			return Users.remove({});
		} ,

		mySQLDisconnect : function(){
			dropConnection(connection);
		} ,

		mySQLConnect : function(){
			reconnection(connection);
		} ,

		returnAllUsers : function(){
			return allUsers(connection);
		} ,

		deleteUser: function(fName, lName){
			console.log("firstName -> " + fName);
			console.log("lastName -> " + lName);
			tableDelete(connection, fName, lName);
		} ,

		logUsers : function(id, fName, lName, accBalance, bio, info){
			tableReady(connection, id, fName, lName, accBalance, bio, info);
		} ,

		updateUsers : function(id, fName, lName, accBalance, bio, info){
			console.log("updating user...");
			tableUpdate(connection, id, fName, lName, accBalance, bio, info);
		} ,

		sendEmail : function(to, from, subject, text){
			check([to, from, subject, text], [String]);

			this.unblock();

			console.log("sending email...");
			console.log("To: " + to);
			console.log("From: " + from);
			console.log("Subject: " + subject);
			console.log("Text: " + text);

			Meteor.Mailgun.send({
				to: to,
				from: from,
				subject: subject,
				text: text
			});
			console.log("Email Sent!");
		} 
	});