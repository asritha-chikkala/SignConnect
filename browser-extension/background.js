// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "signSelectedText",
    title: "🤟 Sign with SignConnect",
    contexts: ["selection"]
  });
});

// Handle right-click actions
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "signSelectedText") {
    const selectedText = info.selectionText;
    
    chrome.tabs.sendMessage(tab.id, {
      action: "signText",
      text: selectedText
    }).catch(() => {
      // Inject content script if not present
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      }).then(() => {
        chrome.tabs.sendMessage(tab.id, {
          action: "signText",
          text: selectedText
        });
      }).catch((err) => {
        console.error("Failed to inject:", err);
      });
    });
  }
});

// Keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === "sign-selected-text") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "signSelected"
        }).catch(() => {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ["content.js"]
          });
        });
      }
    });
  }
});