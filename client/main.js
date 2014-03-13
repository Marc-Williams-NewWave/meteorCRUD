Meteor.subscribe("users");

if (Meteor.isClient) {

Router.map(function() {
  this.route('home', {path: '/'});
  this.route('userTable');
  this.route('userBio', {template: 'userBio'});
  this.route('profilePage', {path: '/userTable/:_id'});
})

Session.setDefault('updating_user', null);

	Template.userTable.users = function () {
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

	Template.userTable.events({
		'click #saveBtn': function(){
			var fName = $('#firstName').val();
			var lName = $('#lastName').val();
			var accBalance = accounting.formatColumn([$('#accountBalance').val()], "$ ");
			var bio = $('#userBio').val();

			if(Session.get('updating_user')){
				updateUser(Session.get('updating_user'),fName, lName, accBalance, bio, "");
			} else {
				insertUser(fName, lName, accBalance, bio, "");				
			}
			Session.set('updating_user', null);
		} ,

		'click #cleanSlate': function(){
			Meteor.call('removeAllUsers');
		} , 

		'click .deleteUser': function(){
			if(confirm('Are you sure you want to remove this user?')){
				Users.remove(this._id);
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

	// 'click #sendMessage' : function(){
	// 	// alert('calling email');
	// 	Meteor.call('sendEmail', 'marc.williams7@gmail.com', 'marc.williams7@gmail.com', 'Test Mail', 'Hey did this work!?');
	// }
});

Template.nameSpace.events({
	'click #moreBtn' : function(){
		$('#moreInfoSection').toggle();
	} ,

	'submit #infoForm' : function(e){a
		var input = $('#addInfo')[0].value;
		var user = Users.findOne({_id:this._id});
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

	var generateTemplate = function(templateName){
		var fragment = Meteor.render(function() {
			return Template[templateName]();
		});

		return fragment;
	}

	var updateUser = function(id,fName, lName, accBalance, bio, info){
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
	}
}