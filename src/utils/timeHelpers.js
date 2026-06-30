const parseTimeToMinutes = (timeStr) => {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const modifier = match[3].toUpperCase();
  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

const getTotalWeeklyMinutes = (openingDays, openTime, closeTime) => {
  const openMin = parseTimeToMinutes(openTime);
  const closeMIn = parseTimeToMinutes(closeTime);
  const dailyHours = closeMin - openMin;
  if (dailyHours <= 0) return 0;
  return dailyHours * openingDays.length;
};

const getBlockedMinutesForBlock = (block, openingDays) => {
  const start = parseTimeToMinutes(block.startTime);
  const end = parseTimeToMinutes(block.endTime);
  let durationMinutes = end - start;
  if (durationMinutes <= 0) return 0;
  const openDaysName = openingDays.map((d) => d.toLowerCase());

  if (block.recurrence === "daily") {
    return durationMinutes * openDaysName.length;
  }

  if (block.recurrence === "weekly" && block.dayOfWeek) {
    if (openDaysName.includes(block.dayOfWeek.toLowerCase())) {
      return durationMinutes;
    }
  }
  return 0;
};

export const getBlockedHoursPerWeek = (
  blockouts,
  openingDays,
  openTime,
  closeTime,
) => {
  const totalBlockedMinutes = blockouts.reduce((acc, block) => {
    return (
      acc + getBlockedMinutesForBlock(block, openingDays, openTime, closeTime)
    );
  }, 0);
  return totalBlockedMinutes / 60;
};

export { parseTimeToMinutes, getTotalWeeklyMinutes, getBlockedMinutesForBlock };
