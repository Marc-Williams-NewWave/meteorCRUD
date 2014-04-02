Meteor.publish('users', function() {
    return Users.find({});
});

var mysql = Meteor.require('mysql');
var connection = mysql.createConnection({
	host	: 'localhost',
	user 	: 'root',
	password: '',	
	port 	: '3306'
});


// Meteor.publish('listUserFiles', function(filter) {
//     return ContactsFS.find({ complete: filter.completed }, { // publish only complete or only incomplete, depending on client setting
//         sort:   { handledAt: 1 }, // sort by handledAt time
//         fields: { _id: 1, filename: 1, handledAt: 1}, // publish only the filename, handledAt, and _id fields
//         limit:  filter.limit // limit the number of files published, depending on client setting
//     })
// });

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
// var createTable = "create table if not exists Users(userID int not null auto_increment, firstName varchar(255), lastName varchar(255), accountBalance decimal, userBio varchar(255), info varchar(255))";
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
	tableUpdate = function(client){
		client.query("UPDATE Users SET firstName='updatedName' WHERE firstName='Delta' AND lastName='002' ");
		}

	tableDelete = function(client, fName, lName){
		// fName = "updatedName";
		// lName = "002";
		client.query("DELETE from Users WHERE firstName = + '" + fName + "' AND lastName = '" + lName + "'");
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

		updateUsers : function(){
			console.log("updating Delta");
			tableUpdate(connection);
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