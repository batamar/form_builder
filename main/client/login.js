/* ----------------------- Login ----------------------- */

FlowComponents.define('login', function () {});

Template.login.events({
  'submit #login_form': function(event, template) {
    event.preventDefault();

    var username = template.find('[name="username"]').value;
    var password = template.find('[name="password"]').value;

    Meteor.loginWithPassword(username, password, function(error) {
      if (typeof(error) != 'undefined') {
        alert('Хэрэглэгчийн нэр эсвэл нууц үг буруу байна');
      }
    });
  }
});


/* ----------------------- Register ----------------------- */

var registerComp = FlowComponents.define('register', function () {});

registerComp.action.register = function (username, password) {
  Accounts.createUser({
    username: username,
    password: password
  },

  function(error){
    if(error){
      alert(error.reason);
    }
  });
};

Template.register.events({
  'submit form': function(event){
    event.preventDefault();

    var username = $('[name=username]').val();
    var password = $('[name=password]').val();

    FlowComponents.callAction('register', username, password);
  }
});
