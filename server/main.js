Meteor.publish('users', function() {
    return Users.find({});
});

Meteor.publish('listUserFiles', function(filter) {
    return ContactsFS.find({ complete: filter.completed }, { // publish only complete or only incomplete, depending on client setting
        sort:   { handledAt: 1 }, // sort by handledAt time
        fields: { _id: 1, filename: 1, handledAt: 1}, // publish only the filename, handledAt, and _id fields
        limit:  filter.limit // limit the number of files published, depending on client setting
    })
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