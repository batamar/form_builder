/* ----------------------- default layout ----------------------- */

var defaultLayout = FlowComponents.define('defaultLayout', function (props) {
  this.set('content', props.content);

  this.onRendered(function () {
    Meteor.subscribe('formList');
  });
});


defaultLayout.state.forms = function () {
  return FormBuilder.Collections.Forms.find({isSub: false});
};
