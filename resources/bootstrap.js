/**
  This is the bootstrapping code that sets up the scripts to be used in the
   plugin. It does the following:

  1) Sets up data DOM elements that allow strings to be shared to injected scripts.
  2) Injects the scripts necessary to load the Gmail API into the Gmail script environment.
*/

if (top.document == document) {
  // Only run this script in the top-most frame (there are multiple frames in Gmail)
  // Loads a script
  var headID = document.getElementsByTagName("head")[0];
  var newScript = document.createElement("script");
  newScript.type = "text/javascript";
  newScript.src = chrome.extension.getURL("combined.js");
  headID.appendChild(newScript);
}

const makelink = function(text, url) {
  var a = document.createElement("a");
  a.appendChild(document.createTextNode(text));
  a.title = text;
  a.href = url;
  return a;
}

const HASMODELBEENCLOSEDKEY = "StreakSecureGmail.hasClosedDeprecatedModal";

InboxSDK.load(2, "sdk_StreakSecureGma_b14155ddf3").then(function(sdk) {

  const track = (eventName, extraProps = {}) => {
    sdk.Logger.event("secureGmail." + eventName, {
      ...extraProps,
      email: sdk.User.getEmailAddress()
    })
  }
 
  track("extensionLoaded");
  
  if(!!sessionStorage.getItem(HASMODELBEENCLOSEDKEY)) {
    return
  }
  // Log user being shown deprecation modal (a most-likely unique user email)

  var div = document.createElement("div");
  div.style.width = '400px';
  div.style.whiteSpace = 'pre-wrap';

  const content1 = document.createTextNode("On August 15, 2018, the Secure Gmail Chrome extension will be discontinued and no longer available to download.\n\nSince Gmail recently launched a similar tool feature called ");
  div.appendChild(content1)
  const link1 = makelink("Confidential Mode", "https://support.google.com/mail/answer/7674059");
  div.appendChild(link1);
  const content2 = document.createTextNode(", there’s been less of a need for our extension.  We highly encourage you to transition to this new Gmail feature as soon as possible to ensure you can continue sending confidential emails. You should also ");
  div.appendChild(content2);
  const link2 = makelink("uninstall", "https://support.google.com/chrome_webstore/answer/2664769");
  div.appendChild(link2);
  const content3 = document.createTextNode(" the Secure Gmail extension.\n\nLooking forward, the Streak team will continue to focus on improving our core product - the ");
  div.appendChild(content3);
  const link3 = makelink("Streak CRM for Gmail", "http://www.streak.com");
  div.appendChild(link3);
  const content4 = document.createTextNode(". It offers workflow management but also power tools like email tracking, scheduled emails, and mail merge all from within Gmail.");
  div.appendChild(content4);

  const modalView = sdk.Widgets.showModalView({
    el: div,
    title: 'Secure Gmail Deprecated',
    buttons: [
      {
        type: "PRIMARY_ACTION",
        color: "blue",
        text: "Try Streak for Free",
        onClick: function(e) {
          track("deprecationModal.linkClicked");
          window.open(
            "http://www.streak.com?utm_medium=gmail&utm_source=inboxsdk&utm_campaign=inappmodal"
          );
        },
      },
      {
        text: "No, take me back to Gmail",
        onClick: function(e) {
          sessionStorage.setItem(HASMODELBEENCLOSEDKEY, true);
          e.modalView.close();
        },
      }
    ]
  });

  modalView.on('destroy', () => {
    track("deprecationModal.closed");
  });
});
