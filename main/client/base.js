/* ----------------------- Base ----------------------- */

Template.menus.onRendered(function () {
  this.subscribe('formList');
});

Template.menus.helpers({
  forms: function () {
    return FormBuilder.Collections.Forms.find({isSub: false});
  }
});
