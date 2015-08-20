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
inDocumentRoutes.route('/update/:formId', {
  subscriptions: function(params) {
    this.register('formList', Meteor.subscribe('formList'));
    this.register('fieldList', Meteor.subscribe('fieldList', [params.formId]));
  },

  action: function() {
    BlazeLayout.render('mainLayout', {content: 'formCU'});
  },

  name: 'formUpdate'
});


// form submit
inDocumentRoutes.route('/submission/:formId', {
  subscriptions: function(params, queryParams) {
    this.register('formDetail', Meteor.subscribe('formDetail', params.formId));
    this.register('fieldList', Meteor.subscribe('fieldList', [params.formId]));
    this.register('submission', Meteor.subscribe('submissionDetail', queryParams));
  },

  action: function() {
    BlazeLayout.render('mainLayout', {content: 'formSubmit'});
  },

  name: 'formSubmit'
});


// form submission detail
inDocumentRoutes.route('/submission/detail/:formId', {
  subscriptions: function(params, queryParams) {
    this.register('formDetail', Meteor.subscribe('formDetail', params.formId));
    this.register('fieldList', Meteor.subscribe('fieldList', [params.formId]));
    this.register('submission', Meteor.subscribe('submissionDetail', queryParams));
  },

  action: function() {
    BlazeLayout.render('mainLayout', {content: 'formSubmissionDetail'});
  },

  name: 'formSubmissionDetail'
});


// form submission delete
inDocumentRoutes.route('/submission/delete/:formId', {
  subscriptions: function(params, queryParams) {
    this.register('formDetail', Meteor.subscribe('formDetail', params.formId));
    this.register('fieldList', Meteor.subscribe('fieldList', [params.formId]));
    this.register('submission', Meteor.subscribe('submissionDetail', queryParams));
  },

  action: function() {
    BlazeLayout.render('mainLayout', {content: 'formSubmissionDelete'});
  },

  name: 'formSubmissionDelete'
});


// form submit list
inDocumentRoutes.route('/submission-list/:formId', {
  subscriptions: function(params) {
    this.register('formDetail', Meteor.subscribe('formDetail', params.formId));
    this.register('fieldList', Meteor.subscribe('fieldList', [params.formId]));
    this.register('submission', Meteor.subscribe('submissionList', params.formId));
  },

  action: function() {
    BlazeLayout.render('mainLayout', {content: 'formSubmissionList'});
  },

  name: 'formSubmissionList'
});
