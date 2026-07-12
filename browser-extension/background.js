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
    });
  }
});

// Handle keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === "sign-selected-text") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "signSelected"
      });
    });
  }
});