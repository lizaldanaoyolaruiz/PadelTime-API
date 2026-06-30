import Blockout from "../models/Blockout";
import Schedule from "../models/Schedule";
import {
  getBlockedHoursPerWeek,
  getTotalWeeklyMinutes,
} from "../utils/timeHelpers";

async function getScheduleWithMetrics(complexId) {
  let schedule = await Schedule.findOne({ complexId });
  if (!schedule) {
    schedule = await Schedule.create({ complexId });
  }
  const blockout = await Blockout.find({ complexId, isActive: true });
  const weeklyHours = getTotalWeeklyMinutes(
    schedule.openingDays,
    schedule.openTime,
    schedule.closeTime,
  );
  const blockedHours = getBlockedHoursPerWeek(
    blockout,
    schedule.openingDays,
    schedule.openTime,
    schedule.closeTime,
  );
  const efficiency =
    weeklyHours > 0 ? ((weeklyHours - blockedHours) / weeklyHours) * 100 : 0;

  return {
    schedule,
    blockout,
    metrics: {
      weeklyHours: Math.round(weeklyHours),
      blockedHours: Math.round(blockedHours),
      efficiency: Math.round(efficiency),
    },
  };
}

async function updateSchedule(complexId, updateData, userId) {
  const schedule = await Schedule.findOneAndUpdate(
    { complexId },
    { ...updateData, updatedBy: userId },
    { new: true, upsert: true },
  );
  return schedule;
}

export { getScheduleWithMetrics, updateSchedule };
