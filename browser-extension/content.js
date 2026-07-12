let avatarIframe = null;
let isVisible = false;
let hideTimeout = null;
let floatingButton = null;

// Listen for messages from background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "signText") {
    showAvatar(request.text);
  } else if (request.action === "signSelected") {
    const selectedText = window.getSelection().toString();
    if (selectedText) {
      showAvatar(selectedText);
    }
  }
});

function showAvatar(text) {
  // Remove existing iframe
  if (avatarIframe) {
    avatarIframe.remove();
    avatarIframe = null;
    clearTimeout(hideTimeout);
  }

  // Create iframe with public embed page (no login required)
  avatarIframe = document.createElement('iframe');
  avatarIframe.src = `https://signconnect-qvx7.onrender.com/sign-embed?text=${encodeURIComponent(text)}`;
  avatarIframe.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 380px;
    height: 420px;
    border: none;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    z-index: 999999;
    background: #05060a;
    transition: all 0.3s ease;
  `;

  // Add close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.style.cssText = `
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(255,255,255,0.1);
    border: none;
    color: white;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 14px;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  closeBtn.title = 'Close';

  document.body.appendChild(avatarIframe);
  
  // Add close button after iframe is in DOM
  setTimeout(() => {
    if (avatarIframe) {
      avatarIframe.parentNode.insertBefore(closeBtn, avatarIframe);
    }
  }, 100);

  closeBtn.addEventListener('click', hideAvatar);

  isVisible = true;

  // Auto-hide after 15 seconds
  hideTimeout = setTimeout(() => {
    hideAvatar();
  }, 15000);
}

function hideAvatar() {
  if (avatarIframe) {
    avatarIframe.style.opacity = '0';
    setTimeout(() => {
      if (avatarIframe) {
        avatarIframe.remove();
        avatarIframe = null;
        isVisible = false;
      }
    }, 300);
  }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isVisible) {
    hideAvatar();
  }
});

// Floating button on text selection
document.addEventListener('mouseup', (e) => {
  const selectedText = window.getSelection().toString().trim();
  
  if (selectedText.length > 0 && selectedText.length < 500) {
    if (floatingButton) {
      floatingButton.remove();
      floatingButton = null;
    }

    floatingButton = document.createElement('div');
    floatingButton.textContent = '🤟';
    floatingButton.title = 'Sign with SignConnect';
    floatingButton.style.cssText = `
      position: fixed;
      bottom: ${e.clientY + 20}px;
      left: ${e.clientX + 20}px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, #22d3ee, #8b5cf6);
      border: none;
      color: white;
      font-size: 22px;
      cursor: pointer;
      z-index: 999998;
      box-shadow: 0 4px 16px rgba(34, 211, 238, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: signconnectFadeIn 0.2s ease;
    `;
    
    floatingButton.addEventListener('click', () => {
      const text = window.getSelection().toString();
      if (text) {
        showAvatar(text);
        if (floatingButton) {
          floatingButton.remove();
          floatingButton = null;
        }
      }
    });

    // Auto-hide floating button after 5 seconds
    setTimeout(() => {
      if (floatingButton) {
        floatingButton.remove();
        floatingButton = null;
      }
    }, 5000);

    document.body.appendChild(floatingButton);
  } else {
    if (floatingButton) {
      floatingButton.remove();
      floatingButton = null;
    }
  }
});

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes signconnectFadeIn {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }
`;
document.head.appendChild(style);