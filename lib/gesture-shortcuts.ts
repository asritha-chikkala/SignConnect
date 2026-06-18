// lib/gesture-shortcuts.ts

export interface GestureShortcut {
  id: string;
  sign: string;
  action: "open_url" | "show_alert" | "play_sound" | "copy_text" | "custom" | "open_map";
  target?: string;
  label: string;
  icon: string;
  description: string;
  requiresConfirmation?: boolean;
}

export const GESTURE_SHORTCUTS: GestureShortcut[] = [
  {
    id: "sos-hospital",
    sign: "HOSPITAL",
    action: "open_map",
    target: "hospital",
    label: "Find Nearest Hospital",
    icon: "🏥",
    description: "Opens Google Maps with nearby hospitals",
    requiresConfirmation: true,
  },
  {
    id: "sos-emergency",
    sign: "EMERGENCY",
    action: "show_alert",
    target: "🚨 EMERGENCY! Call 112 (India) / 911 (US) for immediate help.",
    label: "Emergency Alert",
    icon: "🚨",
    description: "Shows emergency contact information",
  },
  {
    id: "sos-police",
    sign: "POLICE",
    action: "open_map",
    target: "police",
    label: "Find Police Station",
    icon: "👮",
    description: "Opens Google Maps with nearby police stations",
    requiresConfirmation: true,
  },
  {
    id: "help-alert",
    sign: "HELP",
    action: "show_alert",
    target: "🆘 HELP! Contact your emergency contact or call 112.",
    label: "Help Alert",
    icon: "🆘",
    description: "Displays emergency help information",
  },
  {
    id: "copy-number",
    sign: "PHONE",
    action: "copy_text",
    target: "112",
    label: "Copy Emergency Number",
    icon: "📱",
    description: "Copies emergency number 112 to clipboard",
  },
  {
    id: "share-location",
    sign: "LOCATION",
    action: "custom",
    target: "shareLocation",
    label: "Share Location",
    icon: "📍",
    description: "Shares your current location (if allowed)",
    requiresConfirmation: true,
  },
  {
    id: "turn-light-on",
    sign: "LIGHT",
    action: "custom",
    target: "toggleFlashlight",
    label: "Toggle Flashlight",
    icon: "🔦",
    description: "Toggles device flashlight (mobile only)",
  },
];

// Helper: Show toast notification
function showToast(message: string): void {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("gesture-shortcut-toast", { 
      detail: { message, type: "success" } 
    });
    document.dispatchEvent(event);
  }
}

export function executeShortcut(shortcut: GestureShortcut): void {
  console.log(`🎯 Executing shortcut: ${shortcut.id} (${shortcut.label})`);
  
  switch (shortcut.action) {
    case "open_url":
      if (shortcut.target) {
        window.open(shortcut.target, "_blank");
      }
      break;
      
    case "open_map": {
      const query = shortcut.target === "hospital" 
        ? "hospitals+near+me" 
        : shortcut.target === "police" 
        ? "police+stations+near+me" 
        : shortcut.target || "hospital";
      const mapUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
      window.open(mapUrl, "_blank");
      break;
    }
      
    case "show_alert":
      alert(shortcut.target || "🚨 Emergency!");
      break;
      
    case "play_sound":
      if (shortcut.target) {
        try {
          const audio = new Audio(shortcut.target);
          audio.play().catch(() => console.log("Audio play failed"));
        } catch (e) {
          console.log("Sound not available");
        }
      }
      break;
      
    case "copy_text":
      if (shortcut.target) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(shortcut.target)
            .then(() => {
              showToast(`📋 Copied: ${shortcut.target}`);
            })
            .catch(() => {
              fallbackCopy(shortcut.target!);
            });
        } else {
          fallbackCopy(shortcut.target);
        }
      }
      break;
      
    case "custom":
      if (shortcut.target === "shareLocation") {
        shareLocation();
      } else if (shortcut.target === "toggleFlashlight") {
        toggleFlashlight();
      }
      break;
  }
}

function fallbackCopy(text: string): void {
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
    showToast(`📋 Copied: ${text}`);
  } catch (e) {
    alert(`Please copy this manually: ${text}`);
  }
}

function shareLocation(): void {
  if (typeof window === "undefined") return;
  
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser");
    return;
  }
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      
      if (navigator.share) {
        navigator.share({
          title: "My Location",
          text: "I'm here! Need help.",
          url: mapsUrl,
        }).catch(() => {
          copyToClipboard(mapsUrl);
        });
      } else {
        copyToClipboard(mapsUrl);
      }
    },
    () => {
      alert("Unable to get your location. Please enable location services.");
    }
  );
}

function copyToClipboard(text: string): void {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => showToast(`📍 Location copied to clipboard`))
      .catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function toggleFlashlight(): void {
  if (typeof window === "undefined") return;
  
  const mediaDevices = navigator.mediaDevices as any;
  if (!mediaDevices || !mediaDevices.getUserMedia) {
    alert("Camera access is not supported on this device.");
    return;
  }
  
  mediaDevices.getUserMedia({ 
    video: { facingMode: "environment" } 
  })
  .then((stream: MediaStream) => {
    const track = stream.getVideoTracks()[0];
    if (!track) {
      stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
      alert("No video track found");
      return;
    }
    
    try {
      const capabilities = track.getCapabilities?.() as any;
      if (capabilities && capabilities.torch) {
        // @ts-expect-error - torch is not in standard TypeScript types
        track.applyConstraints({ advanced: [{ torch: true }] });
        showToast("🔦 Flashlight ON");
        
        setTimeout(() => {
          try {
            // @ts-expect-error - torch is not in standard TypeScript types
            track.applyConstraints({ advanced: [{ torch: false }] });
            showToast("🔦 Flashlight OFF");
          } catch (e) {
            // Ignore
          }
          stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
        }, 3000);
      } else {
        stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
        alert("Flashlight control not available on this device");
      }
    } catch (e) {
      stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
      alert("Flashlight control failed");
    }
  })
  .catch(() => {
    alert("Camera access needed for flashlight control. Please grant camera permission.");
  });
}

// Check if any shortcut matches the gloss
export function checkForShortcuts(gloss: string[]): GestureShortcut | null {
  if (!gloss || gloss.length === 0) return null;
  
  const detectedSign = gloss.join(" ").toUpperCase();
  
  for (const shortcut of GESTURE_SHORTCUTS) {
    if (detectedSign.includes(shortcut.sign.toUpperCase())) {
      return shortcut;
    }
  }
  
  return null;
}

// Get all available shortcuts for display
export function getAllShortcuts(): GestureShortcut[] {
  return GESTURE_SHORTCUTS;
}