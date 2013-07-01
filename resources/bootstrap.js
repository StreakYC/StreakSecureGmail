/**
  This is the bootstrapping code that sets up the scripts to be used in the
   plugin. It does the following:

  1) Sets up data DOM elements that allow strings to be shared to injected scripts.
  2) Injects the scripts necessary to load the Gmail API into the Gmail script environment.
*/

if (top.document == document) { // Only run this script in the top-most frame (there are multiple frames in Gmail)
	// Loads a script
    var headID = document.getElementsByTagName('head')[0];
    var newScript = document.createElement('script');
    newScript.type = 'text/javascript';
    newScript.src = chrome.extension.getURL('combined.js');
    headID.appendChild(newScript);
}
