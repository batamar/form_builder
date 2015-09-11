/* ----------------------- Login ----------------------- */

FlowComponents.define('login', function () {});

Template.login.events({
  'submit #login_form': function(event, template) {
    event.preventDefault();

    var email = template.find('[name="email"]').value;
    var password = template.find('[name="password"]').value;

    Meteor.loginWithPassword(email, password, function(error) {
      if (typeof(error) != 'undefined') {
        alert('Хэрэглэгчийн нэр эсвэл нууц үг буруу байна');
      } else {
        FlowRouter.go('/');
      }
    });
  }
});


/* ----------------------- Register ----------------------- */

var registerComp = FlowComponents.define('register', function () {});

registerComp.action.register = function (email, password) {
  Accounts.createUser({
    email: email,
    password: password
  },
  function(error){
    if(error){
      alert(error.reason);
    } else {
      FlowRouter.go('/');
    }
  });
};

Template.register.events({
  'submit form': function(event){
    event.preventDefault();

    var email = $('[name=email]').val();
    var password = $('[name=password]').val();

    FlowComponents.callAction('register', email, password);
  }
});
