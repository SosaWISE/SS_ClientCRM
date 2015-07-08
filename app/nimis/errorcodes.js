define("src/nimis/errorcodes", [], function() {
  "use strict";

  return {
    "-1": "Error",
    "-20": "Unhandled Exception",
    "-21": "Handled Exception",

    "0": "Info",

    "401": "Not Authorized",
    "404": "Url Not Found",

    "20200": "Unhandled Exception",

    "60100": "Unverified Address",

    "70110": "Item was not found",
    "70120": "Duplicate item found",
    "70130": "Null exception occurred",
    "70140": "Argument Validation Failed",
    "70150": "Invalid Equipment Move",

    "80100": "Account Onboarding Failed",
    "80200": "Signal History not Found",
    "80220": "System Already in Two-Way Test Mode",
    "80300": "Account Onboarding SUCCESSFUL!!!!!",
    "80405": "Missing Payment Information.  DAH!!!",
    "80510": "Alarm.Com Account Missing Email",

    "90300": "Monitronics Dispatch Agency Not Found in Their System",

    "990000": "Connection Refused",
    "990001": "Error processing response",
    "990002": "Request Error",
    "990003": "Request Timeout Error",
    "990004": "Error in setter callback",

  };
});