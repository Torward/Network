// Utilities for AR functionality

/**
 * Check if the device supports AR features
 * @returns Boolean indicating if AR is supported
 */
export function isARSupported(): boolean {
  // Check for WebXR support (AR)
  const isWebXRSupported = "xr" in navigator;

  // Check for device orientation support (fallback AR)
  const isDeviceOrientationSupported = "DeviceOrientationEvent" in window;

  // Check for camera access support
  const isCameraSupported =
    "mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices;

  return (
    isWebXRSupported || (isDeviceOrientationSupported && isCameraSupported)
  );
}

/**
 * Request necessary permissions for AR functionality
 * @returns Promise resolving to boolean indicating if permissions were granted
 */
export async function requestARPermissions(): Promise<boolean> {
  try {
    // Request camera access
    await navigator.mediaDevices.getUserMedia({ video: true });

    // Request device orientation permission if needed (iOS 13+)
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      const permission = await (
        DeviceOrientationEvent as any
      ).requestPermission();
      if (permission !== "granted") {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Error requesting AR permissions:", error);
    return false;
  }
}

/**
 * Initialize AR view with camera feed
 * @param videoElement HTML video element to display camera feed
 * @returns Promise resolving to boolean indicating success
 */
export async function initializeARCamera(
  videoElement: HTMLVideoElement,
): Promise<boolean> {
  try {
    if (!videoElement) return false;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });

    videoElement.srcObject = stream;
    await videoElement.play();

    return true;
  } catch (error) {
    console.error("Error initializing AR camera:", error);
    return false;
  }
}

/**
 * Stop AR camera feed
 * @param videoElement HTML video element displaying camera feed
 */
export function stopARCamera(videoElement: HTMLVideoElement): void {
  if (!videoElement || !videoElement.srcObject) return;

  const stream = videoElement.srcObject as MediaStream;
  const tracks = stream.getTracks();

  tracks.forEach((track) => track.stop());
  videoElement.srcObject = null;
}

/**
 * Calculate position for AR element based on device orientation
 * @param event DeviceOrientationEvent from device sensors
 * @param containerElement Container element for AR content
 * @returns Object with x, y coordinates for positioning AR content
 */
export function calculateARPosition(
  event: DeviceOrientationEvent,
  containerElement: HTMLElement,
): { x: number; y: number } {
  if (!containerElement || !event.beta || !event.gamma) {
    return { x: 0, y: 0 };
  }

  const { width, height } = containerElement.getBoundingClientRect();

  // Convert orientation data to position
  // Beta is front-to-back tilt in degrees, where front is positive
  // Gamma is left-to-right tilt in degrees, where right is positive
  const beta = event.beta; // -180 to 180 (front/back)
  const gamma = event.gamma; // -90 to 90 (left/right)

  // Map orientation to screen coordinates
  // Adjust sensitivity as needed
  const sensitivity = 10;
  const x = width / 2 + gamma * sensitivity;
  const y = height / 2 + beta * sensitivity;

  // Ensure coordinates stay within container bounds
  return {
    x: Math.max(0, Math.min(width, x)),
    y: Math.max(0, Math.min(height, y)),
  };
}

/**
 * Record AR interaction for achievement tracking
 * @param userId User ID to record the interaction for
 * @param interactionType Type of AR interaction
 */
export function recordARInteraction(
  userId: string,
  interactionType: "profile_view" | "photo_view" | "ar_post",
): void {
  // In a real app, this would send data to the backend
  console.log(
    `Recording AR interaction: ${interactionType} for user ${userId}`,
  );

  // For demo purposes, we'll store in localStorage
  try {
    const arInteractions = JSON.parse(
      localStorage.getItem("ar_interactions") || "{}",
    );
    if (!arInteractions[userId]) {
      arInteractions[userId] = {};
    }

    if (!arInteractions[userId][interactionType]) {
      arInteractions[userId][interactionType] = 0;
    }

    arInteractions[userId][interactionType]++;
    localStorage.setItem("ar_interactions", JSON.stringify(arInteractions));

    // If this is a profile view, also increment the total count for achievement tracking
    if (interactionType === "profile_view") {
      const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
      userData.arProfileViews = (userData.arProfileViews || 0) + 1;
      localStorage.setItem("user_data", JSON.stringify(userData));
    }
  } catch (error) {
    console.error("Error recording AR interaction:", error);
  }
}

/**
 * Get AR-related user statistics
 * @param userId User ID to get statistics for
 * @returns Object containing AR usage statistics
 */
export function getARStatistics(userId: string): {
  profileViews: number;
  photoViews: number;
  arPosts: number;
} {
  try {
    const arInteractions = JSON.parse(
      localStorage.getItem("ar_interactions") || "{}",
    );
    const userInteractions = arInteractions[userId] || {};

    return {
      profileViews: userInteractions.profile_view || 0,
      photoViews: userInteractions.photo_view || 0,
      arPosts: userInteractions.ar_post || 0,
    };
  } catch (error) {
    console.error("Error getting AR statistics:", error);
    return { profileViews: 0, photoViews: 0, arPosts: 0 };
  }
}
