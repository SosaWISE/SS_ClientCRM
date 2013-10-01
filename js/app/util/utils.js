define([
  'underscore',
  'moment'
], function(
  _,
  moment
) {
  "use strict";

  /** Initialize. */
  return {
    EndOfDay: function(day) {
      return moment(new Date(day))
        .add('days', 1)
        .add('seconds', -1)
        .toDate();
    },
    AddToDate: function(day, daysToAdd) {
      var result = new Date();

      result.setDate(day.getDate() + daysToAdd);

      /** Return result. */
      return result;
    },
    GetFirstTimeSlot: function(timeSlots) {
      return moment(timeSlots()[0].start()).format('MM-DD-YYYY');
    },
    HasProperties: function(obj) {
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          return true;
        }
      }
      return false;
    },
    InvokeFunctionIfExists: function(callback) {
      if (_.isFunction(callback)) {
        callback();
      }
    },
    MapMemoToArray: function(items) {
      var underlyingArray = [],
        prop;
      for (prop in items) {
        if (items.hasOwnProperty(prop)) {
          underlyingArray.push(items[prop]);
        }
      }
      return underlyingArray;
    },
    RegExEscape: function(text) {
      // Removes regEx characters from search filter boxes in our app
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    },

    RestoreFilter: function(filterData) {
      var stored = filterData.stored,
        filter = filterData.filter,
        dc = filterData.datacontext,
        filterList;

      // Create a list of the 5 filters to process
      filterList = [
        {
          raw: stored.favoriteOnly,
          filter: filter.favoriteOnly
        },
        {
          raw: stored.searchText,
          filter: filter.searchText
        },
        {
          raw: stored.speaker,
          filter: filter.speaker,
          fetch: dc.persons.getLocalById
        },
        {
          raw: stored.timeslot,
          filter: filter.timeslot,
          fetch: dc.timeslots.getLocalById
        },
        {
          raw: stored.track,
          filter: filter.track,
          fetch: dc.tracks.getLocalById
        }
      ];

      // For each filter, set the filter to the stored value, or get it from the DC
      _.each(filterList, function(map) {
        var rawProperty = map.raw, // POJO
          filterProperty = map.filter, // observable
          fetchMethod = map.fetch,
          obj;
        if (rawProperty && filterProperty() !== rawProperty) {
          if (fetchMethod) {
            obj = fetchMethod(rawProperty.id);
            if (obj) {
              filterProperty(obj);
            }
          } else {
            filterProperty(rawProperty);
          }
        }
      });
    },

    DateLongFormat: function(rawDate) {
      /** Init. */
      var result = '[Invalid Date]';

      /** Validate input. */
      if (moment(rawDate).isValid) {
        result = moment.utc(rawDate).format('MMMM Do, YYYY @ hh:mm a');
      }

      /** Return result. */
      return result;
    },

    DateWithFormat: function(rawDate, formatString) {
      /** Init. */
      var result = '[Invalid Date]';

      /** Validate input. */
      if (moment(rawDate).isValid) {
        result = moment.utc(rawDate).format(formatString);
      }

      /** Return result. */
      return result;
    },

    GetNowDateTime: function() {
      /** Init */
      var now = new Date();

      /** Return value. */
      return now;
    },

    inherits: function(ctor, superCtor) {
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true,
        },
      });
    },

    argsToArray: function(args, fromStart, fromEnd) {
      fromStart = fromStart || 0;
      var i = 0,
        length = (args.length - fromStart) - (fromEnd || 0),
        array = new Array(length);
      while (i < length) {
        array[i] = args[i + fromStart];
        i++;
      }
      return array;
    },

  };
});
