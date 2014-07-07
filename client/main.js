Meteor.subscribe("users");

if (Meteor.isClient) {

Router.map(function() {
  this.route('home', {path: '/'});
  
  this.route('userTable');
  
  this.route('userBio', {template: 'userBio'});
  
  this.route('profilePage', {
    path:   'profilePage/:_id',
    action: function(){
      this.render();
    }
  });
  
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

    var clearCommand = "CLEAR";
    var commandObj = {"command":clearCommand};
    var message = JSON.stringify(commandObj);

    alert(message);

    Meteor.call("useQueue", message);




      // Meteor.call('removeAllUsers');

    } , 

    'click .deleteUser': function(){
      if(confirm('Are you sure you want to remove this user?')){
        var user = Users.findOne({_id:this._id});
        // var id = this._id;
        // alert(id);
        // removeUser(this._id);
        removeUser(user);
        Users.remove(this._id);
      }
    } ,
    
    'click .viewBioPage' : function(){
      Session.set('updating_user', this._id);
      // Router.go('profilePage');
      // Router.go('home');
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
        Meteor.disconnect();
      }
      
    } ,

    'click #onlineMode' : function(){
        
      // Meteor.call('returnAllUsers', function(err, response){
     //   var x = " " + response;
     //   // alert("(from client) response is " + x[0].firstName);
     //   console.log("--->>>>> " + x);
     //   });
     //   // var b = Session.get('allUsers');
     //   // alert("b is " + b);
      
      // Meteor.reconnect();

      // mysqlCatchUp(Users.find({}).fetch());

      var message = "Hello World!";
      Meteor.call('useQueue', message);

        // Meteor.call('mySQLConnect');
        // Meteor.reconnect();
        // alert('You are now back online');
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

  var removeUser = function(user){
    // var x = id + "";
    // alert("in dU id = " + x);
    // alert("id is " + id);
    // var user = Users.findOne({_id:id});
    alert(user._id + "");

    var userID = user._id + "";
    var unformattedMoney = accounting.unformat(user.accountBalance);

    var deleteCommand = "DELETE";
    var placeHold = "";
    var userObj = {"command":deleteCommand, "userID":userID, "firstName":user.firstName, "lastName":user.lastName, "accountBalance":unformattedMoney,"userBio":user.userBio,"moreInfo":user.moreInfo};
    var message = JSON.stringify(userObj);

    Meteor.call("useQueue", message);
    


    // Meteor.call('deleteUser', x);

  }

  var updateUser = function(id,fName, lName, accBalance, bio, info){
  Users.update(id, 
    {$set: {firstName : fName,
     lastName : lName, 
     accountBalance : accBalance, 
     userBio : bio,
     moreInfo : info
    }});
  var mysqlID = id+ "";
  alert("MYSQLID ~~~~~~~~~~ " + id + " ~~~~~~~~~~~~~~");

  var unformattedMoney = accounting.unformat(accBalance);
  var updateCommand = "UPDATE";
  var userObj = {"command":updateCommand, "userID":mysqlID, "firstName":fName, "lastName":lName, "accountBalance":unformattedMoney,"userBio":bio,"moreInfo":info};

  // alert(unformattedMoney + " <-----> " + updateCommand + " <-----> " + JSON.stringify(userObj));
  var message = JSON.stringify(userObj);
  Meteor.call('useQueue', message);

  Meteor.call('updateUsers', id, fName, lName, accounting.unformat(accBalance), bio, info);
  }


  var insertUser = function(fName, lName, accBalance, bio, info) {    
    var mysqlID = Users.insert({firstName: fName, 
      lastName: lName, 
      accountBalance: accBalance,
       userBio: bio,
       moreInfo : info
      });

    var unformattedMoney = accounting.unformat(accBalance);
    mysqlID = mysqlID + "";
    var createCommand = "CREATE";
    var userObj = {"command":createCommand, "userID":mysqlID, "firstName":fName, "lastName":lName, "accountBalance":unformattedMoney,"userBio":bio,"moreInfo":info};
    var message = JSON.stringify(userObj);
    Meteor.call('useQueue', message);

    alert("~~~~~~~~~~ " + mysqlID + " ~~~~~~~~~~~~~~");
      Meteor.call('logUsers', mysqlID, fName, lName, unformattedMoney, bio, info);
  }

  var mysqlCatchUp = function (mongoArray){
    alert("Catching Up... User count = " + mongoArray.length);

    //reconnet to sql server
    alert("Attempting to call mysqlConnect");
    // Meteor.call('emptyMysqlTable');

    Meteor.call('mySQLConnect', mongoArray); 
    // for(var i = 0; i < mongoArray.length; i++){
    //  var mysqlID = mongoArray[i]._id + "";
    //  var firstName = mongoArray[i].firstName;
    //  var lastName = mongoArray[i].lastName;
    //  var accountBalance = mongoArray[i].accountBalance;
    //  var bio = mongoArray[i].userBio;
    //  var info = mongoArray[i].moreInfo;

    //  // alert("USER INFO: " + mysqlID + " | " + firstName + " | " + lastName + " | " + accountBalance + " | " + bio + " | " + info);

    //  Meteor.call('logUsers', mysqlID, firstName, lastName, accounting.unformat(accountBalance), bio, info);
    // }
  }

  // var latestGuy = function(){
  //  var latestUser = Users.find({}, {sort: {_id : -1} , limit: 1}).fetch()[0];
  //  alert("latestUser id is " + latestUser._id);


  //  return latestUser;
  //  // alert("Latest user is " + latestUser.fName + latestUser.lName + latestUser._id);
  // }
}