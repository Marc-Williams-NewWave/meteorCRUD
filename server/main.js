Meteor.publish('users', function() {
    return Users.find({});
});

Meteor.startup(function(){
	Apm.connect('CjwQdohh83iq9dtWc', '2cfdc412-531b-490b-bb13-99befa9ab7fe');
	Meteor.Mailgun.config({
		username: 'postmaster@metoermailgun.com',
		password: 'aliveWithHandz'
	});
});
	
	Meteor.methods({
		removeAllUsers : function() {
			console.log("Clearing Users....");
			return Users.remove({});
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