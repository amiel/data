var get = Ember.get, set = Ember.set;
var store, Record, tryToFind, notFoundCalled;

module("unit/store/rejection - Handling errors in find", {
  setup: function() {
    store = createStore({
      adapter: DS.Adapter.extend({
        find: function(store, type, id) {
          tryToFind = true;
          return Ember.RSVP.reject(new Error("Cannot find"));
        }
      })
    });

    Record = DS.Model.extend({
      title: DS.attr('string'),
      isEmpty: true, // Force the store to fetch again

      notFound: function() {
        notFoundCalled = true;
      },
    });

    Record.reopenClass({ toString: function() { return 'Record'; } });
  },

  teardown: function() {
    Ember.run(store, 'destroy');
  }
});


test("rethrows the original error", function() {
  store.getById = Ember.K;

  try {
    store.find(Record, 2).then(undefined, async(function(error) {
      // does not get here
      equal(error.message, 'Cannot find', 'correct error should be "Cannot find"');
    }));
  } catch (error) {
    equal(error.message, 'Cannot find', 'correct error should be "Cannot find"');
  }
});

// Test existing functionality
test("calls notFound if the record exists", function() {
  store.push(Record, {
    id: 1,
    title: 'toto'
  });

  notFoundCalled = false;

  try {
    store.find(Record, 1).then(undefined, async(function(error) {
      // We are not actually getting here
      equal(notFoundCalled, true, 'expected notFound to be called on the record');
      equal(error.message, 'Cannot find', 'expected error to be "Cannot find"');
    }));
  } catch (error) {
    // this seems to work
    equal(notFoundCalled, true, 'expected notFound to be called on the record');
    equal(error.message, 'Cannot find', 'expected error to be "Cannot find"');
  }
});


