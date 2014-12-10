define('src/scrum/repository', [
  'src/core/notify',
  'ko',
], function(
  notify,
  ko
) {
  "use strict";

  function Repository(options) {
    var _this = this;
    if (options) {
      ko.utils.extend(_this, options);
    }

    if (!_this.sorter) {
      throw new Error('missing sorter');
    }
    if (!_this.metadata) {
      throw new Error('missing metadata');
    }

    // reverse the metadata, but don't modify the original
    _this.reversedMetadata = reverseArray(_this.metadata);
    delete _this.metadata;

    _this.list = ko.observableArray();
    _this.map = {};
    _this.structureMap = {};
  }

  Repository.prototype.update = function(item) {
    var _this = this,
      reversedMetadata = _this.reversedMetadata,
      map = _this.map,
      structureMap = _this.structureMap,
      id = item.ID,
      prevItem = map[id],
      list;

    if (prevItem) {
      if (prevItem.Version > item.Version) {
        // we already have a newer version
        return;
      }

      // remove old
      delete map[id];
      list = structureMap[prevItem.mapId].list;
      list.remove(prevItem);

      // copy over Tasks
      if (!item.Tasks) {
        item.Tasks = prevItem.Tasks;
      }
    }

    // cache mapId on item
    item.mapId = createMapId(reversedMetadata, item);
    // build structure
    ensureStructure(reversedMetadata, structureMap, _this.list, item);
    // add to list
    map[id] = item;
    list = structureMap[item.mapId].list;
    insert(list, item, _this.sorter);
  };

  function reverseArray(list) {
    var i = list.length,
      index = 0,
      results = new Array(i);
    while (i--) {
      results[index++] = list[i];
    }
    return results;
  }

  function ensureIDs(reversedMetadata, item) {
    var field, i = reversedMetadata.length;
    while (i--) {
      field = reversedMetadata[i].field;
      // use null instead of undefined or 0
      if (!item[field]) {
        item[field] = null;
      }
    }
  }

  function createMapId(reversedMetadata, item) {
    ensureIDs(reversedMetadata, item);

    var field, i = reversedMetadata.length,
      mapId = '';
    while (i--) {
      field = reversedMetadata[i].field;
      mapId = appendField(mapId, item[field]);
    }
    return mapId;
  }

  function appendField(text, value) {
    if (text !== '') {
      text += '_';
    }
    return text + value;
  }

  function ensureStructure(reversedMetadata, map, parentList, item) {
    ensureIDs(reversedMetadata, item);

    var metadata, i = reversedMetadata.length,
      mapId = '',
      obj, id;

    function addObj(id) {
      var tempMapId = appendField(mapId, id),
        obj = map[tempMapId];
      if (!obj) {
        // create if not found
        map[tempMapId] = obj = createObj(id);
        insert(parentList, obj, metadata.sorter);
      }
      return obj;
    }

    while (i--) {
      metadata = reversedMetadata[i];
      id = item[metadata.field];
      // add start values
      if (Array.isArray(metadata.values)) {
        metadata.values.forEach(addObj);
      }
      obj = addObj(id);
      mapId = appendField(mapId, id);
      // set new parent list
      parentList = obj.list;
    }
  }

  function createObj(id) {
    return {
      id: id,
      getItem: function() {
        //@TODO: lookup item by id...
      },
      list: ko.observableArray(),
    };
  }

  function insert(list, item, sorter) {
    // list.push(item);
    // return;

    if (!list().some(function(b, index) {
      if (sorter(item, b) > 0) {
        // insert item
        list.splice(index, 0, item);
        return true;
      }
    })) {
      // add to end
      list.push(item);
    }
  }

  //
  Repository.createObj = createObj;

  return Repository;
});
