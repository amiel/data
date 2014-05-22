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
  },

  teardown: function() {
    Ember.run(store, 'destroy');
  }
});


// This test doesn't fail without my change yet. For some reason there is still
// a record.
test("rethrows the original error", function() {
  store.unloadAll(Record);

  try {
    store.find(Record, 2).then(undefined, async(function(error) {
      // Same thing, not getting here
      equal(error.message, 'Cannot find', 'correct error should be "Cannot find"');
    }));
  } catch (e) {
    // this seems to work
    equal(e.message, 'Cannot find', 'expected error to be "Cannot find"');
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
    store.find(Record, 1).then(async(function(record) {
      console.log("test"); // not called
    }), async(function(record) {
      console.log("fail"); // also not called
      equal(notFoundCalled, true, 'expected notFound to be called on the record');
    }));
  } catch (e) {
    // this seems to work
    equal(notFoundCalled, true, 'expected notFound to be called on the record');
    equal(e.message, 'Cannot find', 'expected error to be "Cannot find"');
  }
});


