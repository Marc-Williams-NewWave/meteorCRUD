Meteor.publish('users', function() {
    return Users.find({});
});


var mysql = Meteor.require('mysql');
var amqp = Meteor.require('amqp');

// var amConn = amqp.createConnection({host: 'localhost'});
var amConn = new amqp.Connection();
amConn.connect();

var db_config = {
	host	: 'localhost',
	user 	: 'root',
	password: '',	
	port 	: '3306',
	database: 'meteor_java',
};

var connection;


handleDisconnect = function(mongoArray){
	console.log("handling disconnect...")
	connection = mysql.createConnection(db_config);                                                
	console.log("INSIDE handleDisconnect *********** " + mongoArray.length + " ***********");

  	connection.connect(function(err) {              
    if(err) {                                     
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); 
    } else {
    	console.log("~~~~~~~~~~~~ MySQL connection Restablished ~~~~~~~~~~~~~");
    	clearTable();

    		for(var i = 0; i < mongoArray.length; i++){
			var mysqlID = mongoArray[i]._id + "";
			var firstName = mongoArray[i].firstName;
			var lastName = mongoArray[i].lastName;
			var accountBalance = mongoArray[i].accountBalance;
			var bio = mongoArray[i].userBio;
			var info = mongoArray[i].moreInfo;

			// alert("USER INFO: " + mysqlID + " | " + firstName + " | " + lastName + " | " + accountBalance + " | " + bio + " | " + info);

			Meteor.call('logUsers', mysqlID, firstName, lastName, accounting.unformat(accountBalance), bio, info);
		}

    }                                    
  });
  }                                     

Meteor.startup(function(){
	Apm.connect('CjwQdohh83iq9dtWc', '2cfdc412-531b-490b-bb13-99befa9ab7fe');
	
	console.log("db_config -> " + db_config);
	connection = mysql.createConnection(db_config);
	
// 	//receive 
// amConn.on('ready', function(){
//     amConn.queue('task_queue', {autoDelete: false, durable: true}, function(queue){

//         console.log(' [*] Waiting for messages. To exit press CTRL+C');

//         queue.subscribe({ack: true, prefetchCount: 1}, function(msg){
//             var body = msg.data.toString('utf-8');
//             console.log(" [x] Received { %s }", body);
//             setTimeout(function(){
//                 console.log(" [x] Done");
//                 queue.shift(); // basic_ack equivalent
//             }, (body.split('.').length - 1) * 1000);
//         });
//     });
// });



	Meteor.Mailgun.config({
		username: 'postmaster@metoermailgun.com',
		password: 'aliveWithHandz'
	});
	

mysqlStartup = function(mysqlElement, db_config){
	console.log(db_config);
	var connection = mysql.createConnection(db_config);
}




connection.query('create schema if not exists meteor');
var createUserTable = "CREATE TABLE IF NOT EXISTS meteor_user(userID varchar(45), firstName VARCHAR(45) NULL, lastName VARCHAR(45) NULL, accountBalance DECIMAL NULL, userBio VARCHAR(45) NULL, info VARCHAR(45) NULL, PRIMARY KEY (userID), UNIQUE INDEX idUsers_UNIQUE (userID ASC))";

connection.query(createUserTable, function(err, result){
	// callback(result);
});

var selectFromPersons = "SELECT * FROM meteor_user";
connection.query(selectFromPersons, function(err, results){
	if(err){
	} else{ 
	console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++");
	console.dir(results);
	console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++");	
	}
	
});

});

//////////////////////////////////////////////////////////////////////// 
	callback = function(x){
		console.dir("Message from callback " + x);
		for(var i = 0; i < x.length; i++){
			console.dir(i + " -->>> " + x[i].userdID + " | " +  x[i].firstName + " | " +  x[i].lastName + " | " +  x[i].accountBalance + " | " +  x[i].userBio);
		}

	}
//////////////////////////////////////////////////////////////////////// 

	allUsers = function(client){
		return client.query("SELECT * FROM meteor_user");
	}

	clearTable = function(client){
		console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ clearing meteor_users table ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
		client.query("DELETE FROM meteor_user");
	}
	tableUpdate = function(client, id, fName, lName, accountBalance, userBio, userInfo){
		console.log("updating user in MySQL...");
		var u = {fn : fName, ln : lName, ID : id, bal : accountBalance, bio : userBio, moreInfo : userInfo};
		var x = id + "";
		client.query('UPDATE meteor_user SET firstName = ? , lastName = ? , accountBalance = ? , userBio = ?, info = ? WHERE userID = ?', [u.fn, u.ln, u.bal, u.bio, u.moreInfo,  x]);

		}

	mysqlReconnect = function(mongoArray){
		console.log("INSIDE mysqlReconnect *********** " + mongoArray.length + " ***********");
		handleDisconnect(mongoArray);
		allUsers(connection);
	}	

	// tableDelete = function(client, id){
	// 	var mysqlID = id + "";
	// 	console.log("id to delete is " + mysqlID);
	// 	client.query("DELETE from meteor_user WHERE userID = '" + id + "'");
	// }

	dropConnection = function(client){
		client.end();
		console.log("MySQL connection terminated");
	}

	tableReady = function(client, id, fName, lName, accBalance, bio, info){
		client.query("INSERT INTO meteor_user (userID, firstName, lastName, accountBalance, userBio, info) VALUES ('" + id + "', '"+ fName + "', '"+ lName + "', '"+ accBalance + "', '"+ bio + "', '" + info + "')",
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
			clearTable(connection);
			return Users.remove({});
		} , 

		useQueue : function(message){
			console.log("message on server side -> " + message);
			var amConn = new amqp.Connection({host: 'localhost'});
			amConn.connect(); 
	
		//send
		amConn.on('ready', function(){
    	amConn.queue('task_queue', {autoDelete: true, durable: true}, function(queue){
        amConn.publish('task_queue', message, {deliveryMode: 2});
        console.log(" [x] Sent { %s }", message);
    });
});



	
		} ,

		emptyMysqlTable : function(){
			clearTable(connection);
		} ,

		mySQLDisconnect : function(){
			dropConnection(connection);
		} ,

		mySQLConnect : function(mongoArray){
			console.log("calling reconnection... ");
			mysqlReconnect(mongoArray);
		} ,

		// returnAllUsers : function(){
		// connection.query("SELECT * FROM Users", function(err, results){
		// 	if(err){
		// 		console.log("whoops -> " + err);
		// 	} else {
		// 		// console.log("The result is: " + results[0].firstName);
		// 		 // results;
		// 		 mon = results;
		// 		 callback(results);
		// 		 return mon;
		// 	}

		// 	// json = JSON.stringify(results);
		// 	// json = results;
		// 	// console.log("THE JSON is --->>>>>> " + json);
		// 	// return json;
			
		// // })
		// // 	console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
		// // 	console.log("results - " + mon[0].firstName);
		// // 	console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
		// // 	return mon[0];
		// ;
		// 	// return allUsers(connection);
		// } ,

		// deleteUser: function(id){
		// 	console.log("from deleteUser id is " + id);
		// 	tableDelete(connection, id);
		// } ,

		logUsers : function(id, fName, lName, accBalance, bio, info){
			// tableReady(connection, id, fName, lName, accBalance, bio, info);
		} ,

		updateUsers : function(id, fName, lName, accBalance, bio, info){
			console.log("updating user...");
			console.log("~~~~~~~~~~ " + id + " ~~~~~~~~~~~~~~");

			// tableUpdate(connection, id, fName, lName, accBalance, bio, info);
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