define('src/apilogger', [
  'src/dataservice',
  'src/core/notify',
], function(
  dataservice,
  notify
) {
  "use strict";


  // public enum MessageTypeEnum : int
  // {
  //   [EnumMember()] Warning = 1,
  //   [EnumMember()] Critical = 2,
  //   [EnumMember()] Success = 3,
  //   [EnumMember()] Licensing = 4,
  //   [EnumMember()] CustomerPermit = 5,
  //   [EnumMember()] Exception = 6,
  // }


  function saveLog(typeId, msgObj) {
    if (!msgObj) {
      return false;
    }

    msgObj.MessageTypeId = typeId;
    // msgObj = {
    //   MessageTypeId: typeId,
    //   Header: '',
    //   Message: '',
    //   Version: '',
    //   ComputerName: '',
    //   SourceView: '',
    // };

    dataservice.base.save({
      link: 'logerror',
      data: msgObj,
    }, null, function(err, resp) {
      if (err) {
        console.warn(err.Message);
        notify.notify(err.Message);
      } else {
        notify.notify('warn', 'Error logged - ID: ' + resp.Value);
      }
    });
    return true;
  }

  return {
    error: function(msgObj) {
      return saveLog(6, msgObj);
    },
  };
});
