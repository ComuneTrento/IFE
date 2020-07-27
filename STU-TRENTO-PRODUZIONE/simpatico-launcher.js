$(document).ready(function () {
  var body_element = document.getElementsByTagName('body')[0];
  var dom_content_loaded_event; // The custom event that will be created

  if (document.createEvent) {
    dom_content_loaded_event = document.createEvent("HTMLEvents");
    dom_content_loaded_event.initEvent("simpaticoEvent", true, true);
  } else {
    dom_content_loaded_event = document.createEventObject();
    dom_content_loaded_event.eventType = "simpaticoEvent";
  }

  dom_content_loaded_event.eventName = "simpaticoEvent";

  if (document.createEvent) {
    body_element.dispatchEvent(dom_content_loaded_event);
  } else {
    body_element.fireEvent("on" + dom_content_loaded_event.eventType, dom_content_loaded_event);
  }
});
