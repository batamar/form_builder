/* globals Components: true */

var Mixin = {
  prototype: {},
  state: {}
};

Mixin.created = function() {
  this._readyCallback = [];
};

Mixin.rendered = function () {
  var self = this;

  self.autorun(function() {
    if (self.get('isReady')) {
      Tracker.afterFlush(function () {
        _.each(self._readyCallback, function(cb) {
          cb();
        });
      });
    }
  });
};

Mixin.prototype.onReady = function(cb) {
  this._readyCallback.push(cb.bind(this));
};

Mixin.state.isReady = function() {
  return FlowRouter.subsReady.apply(FlowRouter, _.toArray(arguments));
};

Components = {
  define: function(name, func) {
    var comp = FlowComponents.define(name, func);
    comp.extend(Mixin);

    return comp;
  }
};
