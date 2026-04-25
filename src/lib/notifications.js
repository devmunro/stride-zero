import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const REMINDER_CHANNEL = "training-reminders";

/**
 * Parses an HH:MM reminder time string.
 *
 * @param {string} value Time text
 * @returns {{hour: number, minute: number}} Parsed time
 */
export function parseReminderTime(value) {
  const [hourText = "18", minuteText = "30"] = String(value).split(":");
  return {
    hour: Math.max(0, Math.min(23, Number(hourText) || 18)),
    minute: Math.max(0, Math.min(59, Number(minuteText) || 30)),
  };
}

/**
 * Syncs local reminder notifications to the latest profile state.
 *
 * @param {Object} profile Active profile
 * @param {Object} nextSession Upcoming session
 * @returns {Promise<{enabled: boolean, permissionGranted: boolean}>} Reminder result
 */
export async function syncDailyReminder(profile, nextSession) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!profile.reminderEnabled) {
    return { enabled: false, permissionGranted: false };
  }

  const permissions = await Notifications.getPermissionsAsync();
  let permissionGranted = permissions.granted || permissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

  if (!permissionGranted) {
    const requested = await Notifications.requestPermissionsAsync();
    permissionGranted = requested.granted || requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  }

  if (!permissionGranted) {
    return { enabled: true, permissionGranted: false };
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL, {
      name: "Training reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { hour, minute } = parseReminderTime(profile.reminderTime);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Stride Zero",
      body: nextSession ? `Your next session is ${nextSession.title}.` : "Your next guided run is ready when you are.",
      sound: false,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: Platform.OS === "android" ? REMINDER_CHANNEL : undefined,
    },
  });

  return { enabled: true, permissionGranted: true };
}
