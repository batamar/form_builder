/* ----------------------- Form LIST ----------------------- */


var formListComponet = FlowComponents.define('formList', function () {});

formListComponet.state.objects = function () {
  return FormBuilder.Collections.Forms.find();
};


/* ----------------------- Field generate ----------------------- */


ComponentFieldGenerate = {
  prototype: {},
  action: {},
  state: {}
};

// form id
ComponentFieldGenerate.state.formId = function () {
  return FlowRouter.getParam('formId');
};

// form object
ComponentFieldGenerate.state.object = function () {
  return FormBuilder.Collections.Forms.findOne({_id: this.get('formId')});
};

// form fields
ComponentFieldGenerate.state.fields = function () {
  return FormBuilder.Collections.Fields.find({formId: this.get('formId')}, {sort: {order: 1}});
};



/* ----------------------- Form CREATE && UPDATE ----------------------- */ 


var formCUComponet = Components.define('formCU', function () {
  var formId = this.get('formId');

  this.onReady(function() {
    /*
     * sort
     */

    var list = $('.field-list');

    list.sortable({
      handle: 'label',
      items: '.field',
      tolerance: '> div',
      opacity: 0.7,
      forcePlaceholderSize: true,
      update: function (e, ui) {
        list.sortable('disable');

        // collect by orders
        var orders = {};
        $('.field').each(function (index) {
          orders[$(this).data('id')] = index;
        });

        Meteor.call('updateFieldOrder', formId, orders, function (error) {
          if (error) {
            toastr.error(error.reason, 'Алдаа');
          } else {
            toastr.success('Мэдэгдэл', 'Амжилттай хадгаллаа');
          }

          list.sortable('enable');
        });
      }
    });

    if (formId) {
      this.set('af', {type: 'method-update', method: 'formUpdate'});

    } else {
      this.set('af', {type: 'method', method: 'formInsert'});
    }
  });
});

// extend from common field generate
formCUComponet.extend(ComponentFieldGenerate);



/* ----------------------- Form delete ----------------------- */ 


var formDeleteComponent = FlowComponents.define('formDelete', function () {
  this.formId = FlowRouter.getParam('formId');
});

formDeleteComponent.state.object = function () {
  return FormBuilder.Collections.Forms.findOne({_id: this.formId});
};

formDeleteComponent.action.onSubmit = function() {
  var formId = this.formId;

  Meteor.call('formDelete', formId, function () {
    toastr.success('Ажилттай устлаа', 'Мэдэгдэл');
    FlowRouter.go('forms');
  });
};

Template.formDelete.events({
  'submit form': function(evt) {
    evt.preventDefault();
    FlowComponents.callAction('onSubmit');
  }
});
