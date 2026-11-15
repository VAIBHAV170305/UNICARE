// Client-side Notification & Task Reminder Utility for UniCare

export interface AppNotification {
  id: string;
  title?: string;
  text: string;
  time: string;
  timestamp: number;
  read: boolean;
  type?: "task_reminder" | "health_alert" | "system";
  taskId?: string;
  dueTime?: string;
}

const STORAGE_KEY = "unicare_notifications_v1";
const TRIGGERED_KEY = "unicare_reminders_triggered_v1";

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  { 
    id: "notif-init-1", 
    title: "Daily Tasks", 
    text: "Time for your scheduled breathing & posture reset", 
    time: "10m ago", 
    timestamp: Date.now() - 10 * 60 * 1000, 
    read: false,
    type: "task_reminder"
  },
  { 
    id: "notif-init-2", 
    title: "Sleep Quality", 
    text: "Your deep sleep was 14% higher than last week", 
    time: "2h ago", 
    timestamp: Date.now() - 2 * 60 * 60 * 1000, 
    read: false,
    type: "health_alert"
  },
  { 
    id: "notif-init-3", 
    title: "Hydration Target", 
    text: "Hydration check: Log your afternoon water intake", 
    time: "5h ago", 
    timestamp: Date.now() - 5 * 60 * 60 * 1000, 
    read: true,
    type: "task_reminder"
  },
];

export function getStoredNotifications(): AppNotification[] {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
      return DEFAULT_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
}

export function saveStoredNotifications(notifs: AppNotification[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
    window.dispatchEvent(new Event("unicare_notification_update"));
  } catch (err) {
    console.error("Failed to save notifications:", err);
  }
}

export function addNotification(notif: {
  title?: string;
  text: string;
  type?: "task_reminder" | "health_alert" | "system";
  taskId?: string;
  dueTime?: string;
}) {
  const current = getStoredNotifications();
  const newNotif: AppNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: notif.title || "Task Reminder",
    text: notif.text,
    time: "Just now",
    timestamp: Date.now(),
    read: false,
    type: notif.type || "task_reminder",
    taskId: notif.taskId,
    dueTime: notif.dueTime,
  };

  const updated = [newNotif, ...current.slice(0, 24)]; // Keep latest 25
  saveStoredNotifications(updated);
  return newNotif;
}

export function markNotificationRead(id: string) {
  const current = getStoredNotifications();
  const updated = current.map(n => n.id === id ? { ...n, read: true } : n);
  saveStoredNotifications(updated);
}

export function markAllNotificationsRead() {
  const current = getStoredNotifications();
  const updated = current.map(n => ({ ...n, read: true }));
  saveStoredNotifications(updated);
}

export function deleteNotification(id: string) {
  const current = getStoredNotifications();
  const updated = current.filter(n => n.id !== id);
  saveStoredNotifications(updated);
}

// Gentle Web Audio API synthesizer chime (zero audio file dependencies)
export function playNotificationChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.15);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.35); // D6

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.4);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.8);
  } catch (e) {
    console.debug("AudioContext error:", e);
  }
}

// Request native browser desktop notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  if (Notification.permission === "granted") {
    return "granted";
  }
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch {
    return "denied";
  }
}

// Trigger native desktop notification with audio feedback
export function sendBrowserNotification(title: string, body: string) {
  playNotificationChime();
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: `unicare-task-${Date.now()}`,
      });
    } catch (err) {
      console.debug("Native notification error:", err);
    }
  }
}

// Evaluate reminders for tasks against current time (called periodically)
export function evaluateTaskReminders(tasks: Array<{
  id: string;
  title: string;
  dueTime?: string;
  completed: boolean;
  reminderEnabled?: boolean;
  reminderOffsetMins?: number;
}>): Array<{ taskTitle: string; dueTime: string }> {
  if (typeof window === "undefined") return [];

  const now = new Date();
  const currentHours = now.getHours();
  const currentMins = now.getMinutes();
  const currentTotalMins = currentHours * 60 + currentMins;

  // Track which task reminders were already triggered today
  const todayDateStr = now.toISOString().slice(0, 10);
  let triggeredSet = new Set<string>();
  try {
    const raw = localStorage.getItem(TRIGGERED_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === todayDateStr && Array.isArray(parsed.ids)) {
        triggeredSet = new Set(parsed.ids);
      }
    }
  } catch {
    triggeredSet = new Set();
  }

  const newlyTriggered: Array<{ taskTitle: string; dueTime: string }> = [];

  tasks.forEach(task => {
    // Only check active, uncompleted tasks with reminders enabled
    if (task.completed || task.reminderEnabled === false || !task.dueTime) return;

    // Parse task due time (HH:MM)
    const parts = task.dueTime.split(":");
    if (parts.length !== 2) return;
    const taskHours = parseInt(parts[0], 10);
    const taskMins = parseInt(parts[1], 10);
    if (isNaN(taskHours) || isNaN(taskMins)) return;

    const taskTotalMins = taskHours * 60 + taskMins;
    const offset = task.reminderOffsetMins || 0;
    const targetTriggerMins = taskTotalMins - offset;

    // Check if within 2 minutes window of target time and hasn't been triggered today
    const diff = currentTotalMins - targetTriggerMins;
    const reminderId = `${todayDateStr}-${task.id}-${offset}`;

    if (diff >= 0 && diff <= 2 && !triggeredSet.has(reminderId)) {
      triggeredSet.add(reminderId);

      const offsetLabel = offset > 0 ? ` (${offset}m before)` : "";
      const formattedTime = task.dueTime;

      // Add to notifications
      addNotification({
        title: "⏰ Task Reminder",
        text: `Time for: "${task.title}" scheduled for ${formattedTime}${offsetLabel}`,
        type: "task_reminder",
        taskId: task.id,
        dueTime: task.dueTime
      });

      // Send desktop alert and chime
      sendBrowserNotification(
        "⏰ UniCare Task Reminder",
        `Time for: "${task.title}" (${formattedTime})`
      );

      newlyTriggered.push({
        taskTitle: task.title,
        dueTime: formattedTime,
      });
    }
  });

  // Save triggered cache for today
  try {
    localStorage.setItem(TRIGGERED_KEY, JSON.stringify({
      date: todayDateStr,
      ids: Array.from(triggeredSet)
    }));
  } catch {
    // ignore
  }

  return newlyTriggered;
}
