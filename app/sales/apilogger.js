define("src/sales/apilogger", [
  "src/dataservice",
  "src/core/notify",
  "howie",
], function(
  dataservice,
  notify,
  howie
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
    if (!howie.fetch("config").logErrors || !msgObj) {
      notify.warn("Error NOT logged. Error logging is disabled.", null, 15);
      return false;
    }

    msgObj.MessageTypeId = typeId;
    // msgObj = {
    //   MessageTypeId: typeId,
    //   Header: "",
    //   Message: "",
    //   Version: "",
    //   ComputerName: "",
    //   SourceView: "",
    // };

    dataservice.base.save({
      link: "logerror",
      data: msgObj,
    }, null, function(err, resp) {
      if (err) {
        console.warn(err.Message);
        notify.error(err);
      } else {
        notify.info("Error logged - MessageID: " + resp.Value, null, 15);
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
