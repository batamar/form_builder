/* ----------------------- Routes ----------------------- */



var inDocumentRoutes = FlowRouter.group({
  prefix: '/forms',
});


// forms list
inDocumentRoutes.route('/', {
  subscriptions: function() {
    this.register('formList', Meteor.subscribe('formList'));
  },

  action: function() {
    BlazeLayout.render('mainLayout', {content: 'formList'});
  },

  name: 'forms'
});


// forms create
inDocumentRoutes.route('/create', {
  action: function() {
    BlazeLayout.render('mainLayout', {content: 'formCU'});
  },

  name: 'formCreate'
});


// forms update
inDocumentRoutes.route('/update/:id', {
  subscriptions: function(params) {
    this.register('formList', Meteor.subscribe('formList'));
  },

  action: function() {
    BlazeLayout.render('mainLayout', {content: 'formCU'});
  },

  name: 'formUpdate'
});


// form submit
inDocumentRoutes.route('/submit/:formId', {
  subscriptions: function(params) {
    this.register('formDetail', Meteor.subscribe('formDetail', params.formId));
    this.register('fieldList', Meteor.subscribe('fieldList', [params.formId]));
  },

  action: function() {
    BlazeLayout.render('mainLayout', {content: 'formSubmit'});
  },

  name: 'formSubmit'
});
