/**
 * Convert VAPID base64 string to Uint8Array for PushManager
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check if Web Push is supported in the current browser/device
 */
export function isPushNotificationSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

/**
 * Check if this device is already subscribed or granted permission
 */
export function isDeviceAlreadySubscribed(): boolean {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (localStorage.getItem("pwa_push_subscribed") === "true") return true;
  return false;
}

/**
 * Get current notification permission
 */
export function getNotificationPermission(): NotificationPermission {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "default";
  }
  return Notification.permission;
}

/**
 * Detect client device details
 */
function getDeviceInfo() {
  if (typeof window === "undefined") return { deviceType: "desktop", os: "", browser: "", userAgent: "" };
  const ua = navigator.userAgent;
  const isMobile = /android|iphone|ipod/i.test(ua);
  const isTablet = /ipad|tablet/i.test(ua);
  const deviceType = isMobile ? "mobile" : isTablet ? "tablet" : "desktop";

  let os = "Other";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/linux/i.test(ua)) os = "Linux";

  let browser = "Other";
  if (/edg/i.test(ua)) browser = "Edge";
  else if (/samsungbrowser/i.test(ua)) browser = "Samsung";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua)) browser = "Safari";

  return { deviceType, os, browser, userAgent: ua };
}

/**
 * Subscribe user to Push Notifications
 */
export async function subscribeToPush(userId?: string): Promise<{ success: boolean; error?: string; subscription?: PushSubscription }> {
  try {
    if (!isPushNotificationSupported()) {
      return { success: false, error: "Push notifications are not supported on this browser/device." };
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      return { success: false, error: "VAPID public key is missing." };
    }

    // 1. Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { success: false, error: "Notification permission was not granted." };
    }

    // 2. Ensure Service Worker is registered and ready
    let registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      registration = await navigator.serviceWorker.register("/sw.js");
    }
    await navigator.serviceWorker.ready;

    // 3. Check existing subscription or create new
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as BufferSource,
      });
    }

    // 4. Send subscription to server
    const deviceInfo = getDeviceInfo();
    const res = await fetch("/api/pwa/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        userId: userId || null,
        ...deviceInfo,
      }),
    });

    const data = await res.json();
    if (!data.success) {
      return { success: false, error: data.message || "Failed to save subscription on server" };
    }

    // Mark as subscribed on device so we never bother them again
    try {
      localStorage.setItem("pwa_push_subscribed", "true");
    } catch { /* silent */ }

    return { success: true, subscription };
  } catch (error: unknown) {
    console.error("Push subscribe error:", error);
    const message = error instanceof Error ? error.message : "Failed to subscribe to push notifications";
    return { success: false, error: message };
  }
}

/**
 * Unsubscribe user from Push Notifications
 */
export async function unsubscribeFromPush(): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isPushNotificationSupported()) {
      return { success: false, error: "Not supported" };
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      await fetch("/api/pwa/push/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint }),
      });
    }

    try {
      localStorage.removeItem("pwa_push_subscribed");
    } catch { /* silent */ }

    return { success: true };
  } catch (error: unknown) {
    console.error("Push unsubscribe error:", error);
    const message = error instanceof Error ? error.message : "Failed to unsubscribe";
    return { success: false, error: message };
  }
}
