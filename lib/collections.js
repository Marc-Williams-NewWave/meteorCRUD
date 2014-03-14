Users = new Meteor.Collection("users", {idGeneration : 'MONGO'});
ContactsFS = new CollectionFS('users', {autopublish: false});
