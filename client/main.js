Meteor.subscribe("users");

if (Meteor.isClient) {

Router.map(function() {
  this.route('home', {path: '/'});
  this.route('userTable');
  this.route('userBio', {template: 'userBio'});
  this.route('profilePage', {path: '/userTable/:_id'});
})

Session.setDefault('updating_user', null);
// Session.setDefault('myFilter', {completed: true, limit: 30});

// Deps.autorun(function(){
// 	var filter = Session.get('myFilter');
// 	Meteor.subscribe('listUserFiles', filter);
// })
	Template.userTable.users = function () {
		// listOfUsers = Meteor.call('returnAllUsers');
		return Users.find({});
	}

	Template.home.events({
		'click #removeAll' : function(){
		Meteor.call('removeAllUsers');
		Router.go('userTable');
			}
		}
	);

	Template.profilePage.oneGuy = function(){
		return Users.findOne({_id: Session.get('updating_user')});
	}

	Template.nameSpace.oneGuy = function(){
		return Users.findOne({_id: Session.get('updating_user')});
	}

	Template.bankTeller.oneGuy = function(){
		return Users.findOne({_id: Session.get('updating_user')});
	}

	Template.mailer.user = function(){
		return Users.findOne({_id: Session.get('updating_user')});
	}

	Template.userTable.events({
		'click #saveBtn': function(e){
			var fName = $('#firstName').val();
			var lName = $('#lastName').val();
			var accBalance = accounting.formatColumn([$('#accountBalance').val()], "$ ");
			var bio = $('#userBio').val();
			e.preventDefault();

			if(Session.get('updating_user')){
				updateUser(Session.get('updating_user'),fName, lName, accBalance, bio, "");
			} else {
				insertUser(fName, lName, accBalance, bio, "");				
			}

			$('#firstName').val('');
			$('#lastName').val('');
			$('#accountBalance').val('');
			$('#userBio').val('');

			Session.set('updating_user', null);
		} ,

		'click #cleanSlate': function(){
			Meteor.call('removeAllUsers');
		} , 

		'click .deleteUser': function(){
			if(confirm('Are you sure you want to remove this user?')){
				var user = Users.findOne({_id:this._id});
				Users.remove(this._id);
				Meteor.call('deleteUser', user.firstName, user.lastName);
			}
		} ,
		
		'click .viewBioPage' : function(){
			Session.set('updating_user', this._id);
			Router.go('profilePage');
			Session.set('updating_user', null);
		} ,

		'click .updateUser' : function(){
			Session.set('updating_user', this._id);
			var oneUser = Users.findOne({_id: this._id});
			$('#firstName').val(oneUser.firstName);
			$('#lastName').val(oneUser.lastName);
			$('#accountBalance').val(accounting.unformat(oneUser.accountBalance));
			$('#userBio').val(oneUser.userBio);

		} ,

		'click #goHome' : function(){
			Router.go('home');
		} , 

		'click #offlineMode' : function(){
			if(confirm('Are you sure you want to disconnect from Meteor server? This will cease live updates')){
				Meteor.call('mySQLDisconnect');
			}
			Meteor.disconnect();
		} ,

		'click #onlineMode' : function(){
				Meteor.call('mySQLConnect');
				Meteor.reconnect();
				alert('You are now back online');
		}
	});

Template.profilePage.events({
	'click #displayName' : function(){
		$('#displayArea').html( generateTemplate('nameSpace') );
	} ,

	'click #displayBalance' : function(){
		var user = Users.findOne({_id: this._id});
		$('#displayArea').html( generateTemplate('bankTeller') );
	} ,

	'click #displayBiography' : function(){
		var user = Users.findOne({_id: this._id});
		$('#displayArea').text(user.userBio);
	} , 

	'click #displayEmail' : function(){
		var user = Users.findOne({_id: this._id});
		$('#displayArea').html( generateTemplate('mailer') );
	} , 

	'click #tablePage' : function(){
		Router.go('userTable');
	} 
});

Template.nameSpace.events({
	'click #moreBtn' : function(){
		$('#moreInfoSection').toggle();
	} ,

	'submit #infoForm' : function(e){a
		var input = $('#addInfo')[0].value;
		var user = Users.findOne({_id:this._id});
		alert("inside subit #infoForm -> " + this._id);
		updateUser(this._id, user.firstName, user.lastName, user.accountBalance, user.userBio, input);
		e.preventDefault();
	}
});

	Template.bankTeller.events({
		'click #showATM' : function(){
			$('#displayButtons').toggle();
		} ,

		'click #depositAmount' : function(e){
		var user = Users.findOne({_id: this._id});
		var userBalance = accounting.unformat(user.accountBalance);
		var amount = $('#amount')[0].value;
		var newBalance = accounting.formatColumn([+userBalance + +amount], "$ ");
		updateUser(this._id, user.firstName, user.lastName, newBalance, user.userBio, user.moreInfo);
		e.preventDefault();
		} ,

		'click #withdrawAmount' : function(e){
		var user = Users.findOne({_id: this._id});
		var userBalance = accounting.unformat(user.accountBalance);
		var amount = $('#amount')[0].value;
		var newBalance = accounting.formatColumn([+userBalance - +amount], "$ ");
		
		if(amount > userBalance){
			if(confirm('If you withdraw ' + accounting.formatMoney(amount) + ' your account will be overdrawn. Are you sure want to continue?')){
				updateUser(this._id, user.firstName, user.lastName, newBalance, user.userBio, user.moreInfo);
				}
			} else {
				updateUser(this._id, user.firstName, user.lastName, newBalance, user.userBio, user.moreInfo);
			}
			e.preventDefault();
		}
	});

	Template.mailer.events({
		'click #sendMessage' : function(){
			var user = Users.findOne({_id: this._id});
			var to = $('#toField').val();
			var from = user.firstName + "." + user.lastName + "@meteormail.com"
			var subject = $('#subjectField').val();
			var text = $('#messageBox')[0].value;
			
			Meteor.call('sendEmail', to, from, subject, text);
		}
	})

	var generateTemplate = function(templateName){
		var fragment = Meteor.render(function() {
			return Template[templateName]();
		});

		return fragment;
	}

	var updateUser = function(id,fName, lName, accBalance, bio, info){
		alert("user update?");
		//needs to be completed
		// Meteor.call('updateUsers');
		alert("inside updateUser -> " + id);
	Users.update(id, 
		{$set: {firstName : fName,
		 lastName : lName, 
		 accountBalance : accBalance, 
		 userBio : bio,
		 moreInfo : info
		}});
	}

	var insertUser = function(fName, lName, accBalance, bio, info) {		
		Users.insert({firstName: fName, 
			lastName: lName, 
			accountBalance: accBalance,
			 userBio: bio,
			 moreInfo : info
			});
			var newguy = latestGuy();
			var mysqlID = newguy._id;
			alert("mysqlID is " + mysqlID);
			// Meteor.call('logUsers', mysqlID, fName, lName, accounting.unformat(accBalance), bio, info);
	}

	var latestGuy = function(){
		var latestUser = Users.find({}, {sort: {_id : -1} , limit: 1}).fetch()[0];
		alert("latestUser id is " + latestUser._id);


		return latestUser;
		// alert("Latest user is " + latestUser.fName + latestUser.lName + latestUser._id);
	}
}