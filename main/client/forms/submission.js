SubmissionMixin = {
  prototype: {},
  state: {},
};

// formId
SubmissionMixin.prototype.formId = function() {
  return FlowRouter.getParam('formId');
};

// form obj
SubmissionMixin.prototype.formObj = function() {
  return FormBuilder.Collections.Forms.findOne({ _id: this.formId() });
};

SubmissionMixin.state.formObj = function() {
  return this.formObj();
};

// is ready
SubmissionMixin.state.isReady = function() {
  return FlowRouter.subsReady();
};

/* ----------------------- Form submission detail mixin ----------------------- */

SubmissionDetailMixin = {
  state: {},
};

// submission object
SubmissionDetailMixin.state.object = function() {
  return FormBuilder.Collections.Submissions.findOne({
    _id: FlowRouter.getQueryParam('subId'),
  });
};

/* ----------------------- Form submission delete ----------------------- */

var submissionDeleteComponent = FlowComponents.define(
  'submissionDelete',
  function() {}
);

// extend from submission mixins
submissionDeleteComponent.extend(SubmissionDetailMixin);
submissionDeleteComponent.extend(SubmissionMixin);

submissionDeleteComponent.state.templateNameToSearch = function() {
  var formObj = this.formObj();
  return 'SDelC' + formObj.code;
};

submissionDeleteComponent.action.onSubmit = function() {
  var formId = this.formId();
  var submissionId = FlowRouter.getQueryParam('subId');

  Meteor.call('submissionDelete', submissionId, function() {
    toastr.success('Ажилттай устлаа', 'Мэдэгдэл');
    FlowRouter.go('submissionList', { formId: formId });
  });
};

Template.submissionDelete.events({
  'submit form': function(evt) {
    evt.preventDefault();
    FlowComponents.callAction('onSubmit');
  },
});

/* ----------------------- Form submission detail ----------------------- */

var submissionDetailComponent = FlowComponents.define(
  'submissionDetail',
  function() {}
);

// extend from submission mixins
submissionDetailComponent.extend(SubmissionDetailMixin);
submissionDetailComponent.extend(SubmissionMixin);

submissionDetailComponent.state.templateNameToSearch = function() {
  var formObj = this.formObj();
  return 'SDetC' + formObj.code;
};

/* ----------------------- Form submission list ----------------------- */

var submissionList = Components.define('submissionList', function() {
  Session.set('submissionLimit', 10);
  this._generatePagination = function(page, total, limit, adjacents) {
    var lastPage, lpm, num, pagination, r1, r2;
    pagination = [];
    lastPage = Math.ceil(total / limit);
    lpm = lastPage - 1;
    if (lastPage > 0) {
      if (lastPage < 7 + adjacents * 2) {
        pagination = (function() {
          var i, ref, results;
          results = [];
          for (
            num = i = 1, ref = lastPage;
            1 <= ref ? i <= ref : i >= ref;
            num = 1 <= ref ? ++i : --i
          ) {
            results.push(num);
          }
          return results;
        })();
      } else {
        if (page < 1 + adjacents * 3) {
          r2 = 4 + adjacents * 2;
          pagination = (function() {
            var i, ref, results;
            results = [];
            for (
              num = i = 1, ref = r2;
              1 <= ref ? i <= ref : i >= ref;
              num = 1 <= ref ? ++i : --i
            ) {
              results.push(num);
            }
            return results;
          })();
          pagination = pagination.concat([-1, lpm, lastPage]);
        } else if (lastPage - adjacents * 2 > page && page > adjacents * 2) {
          r1 = page - adjacents;
          r2 = page + adjacents;
          pagination = (function() {
            var i, ref, ref1, results;
            results = [];
            for (
              num = i = ref = r1, ref1 = r2;
              ref <= ref1 ? i <= ref1 : i >= ref1;
              num = ref <= ref1 ? ++i : --i
            ) {
              results.push(num);
            }
            return results;
          })();
          pagination = pagination.concat([-1, lpm, lastPage]);
          pagination = [1, 2, -1].concat(pagination);
        } else {
          r1 = lastPage - (1 + adjacents * 3);
          pagination = (function() {
            var i, ref, ref1, results;
            results = [];
            for (
              num = i = ref = r1, ref1 = lastPage;
              ref <= ref1 ? i <= ref1 : i >= ref1;
              num = ref <= ref1 ? ++i : --i
            ) {
              results.push(num);
            }
            return results;
          })();
          pagination = [1, 2, -1].concat(pagination);
        }
      }
    }

    return pagination;
  };
});

submissionList.extend(SubmissionMixin);

submissionList.state.templateNameToSearch = function() {
  var formObj = this.formObj();
  return 'SLC' + formObj.code;
};

submissionList.state.pagination = function() {
  var limit = Session.get('submission' + 'Limit'),
    currentPage = Session.get('submission' + 'Offset') || 1,
    count = Counts.get('submission' + '_counter');

  return {
    pageable: count > limit,
    pages: this._generatePagination(currentPage, count, limit, 3),
    current: currentPage,
  };
};

submissionList.state.equal = function(a, b) {
  return a === b;
};
// main list
submissionList.state.objects = function() {
  FlowRouter.watchPathChange();

  // querystring param filters
  var params = FlowRouter.current().queryParams;
  params.formId = this.formId();

  var filterQueries = FormBuilder.LibHelpers.submissionListQuery(params);

  return FormBuilder.Collections.Submissions.find(filterQueries);
};
Template.registerHelper('formatDate', function(date) {
  return moment(date).format('YYYY-MM-DD');
});

Template.submissionList.onCreated(function() {
  this.autorun(function() {
    var offset;
    if (!Session.get('submission' + 'Offset')) {
      offset = 1;
    } else {
      offset = Session.get('submission' + 'Offset');
    }
    var skip = Session.get('submission' + 'Limit') * (offset - 1);
    Meteor.subscribe(
      'submissionList',
      FlowRouter.getParam('formId'),
      Session.get('submission' + 'Limit'),
      skip
    );
  });
});

Template.submissionList.events({
  'click #pagination li a': function(event) {
    event.preventDefault();

    if (!$(event.target).hasClass('active')) {
      var page = parseInt($(event.target).text());

      if (page) {
        Session.set('submission' + 'Offset', page);
        $('#pagination li.active').removeClass('active');
        return $(event.target)
          .parent()
          .addClass('active');
      }
    }
  },
});
