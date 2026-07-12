let avatarIframe = null;
let isVisible = false;
let hideTimeout = null;

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
  console.log('🎯 Showing avatar for:', text);
  
  if (avatarIframe) {
    avatarIframe.remove();
    avatarIframe = null;
    clearTimeout(hideTimeout);
  }

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
  
  setTimeout(() => {
    if (avatarIframe) {
      avatarIframe.parentNode.insertBefore(closeBtn, avatarIframe);
    }
  }, 100);

  closeBtn.addEventListener('click', hideAvatar);

  isVisible = true;

  // ✅ Calculate time based on text length
  const wordCount = text.split(/\s+/).length;
  const signTime = Math.min(Math.max(wordCount * 1.2, 3), 15);
  
  console.log(`📝 ${wordCount} words, signing for ${signTime} seconds`);
  
  hideTimeout = setTimeout(() => {
    hideAvatar();
  }, signTime * 1000);
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

// Keyboard shortcut to close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isVisible) {
    hideAvatar();
  }
});

// Animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes signconnectFadeIn {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }
`;
document.head.appendChild(style);