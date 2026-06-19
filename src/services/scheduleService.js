// src/services/scheduleService.js

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Obtener el token JWT del localStorage (o de donde lo guardes)
const getToken = () => localStorage.getItem('token');

// Headers con autenticación
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

// ============================================
// 1. Obtener todas las canchas con horarios y bloqueos
// ============================================
export const fetchCourtsSchedule = async (complexId) => {
  const res = await fetch(`${API_URL}/courts/schedule?complexId=${complexId}`, {
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Error al obtener horarios de las canchas');
  return res.json();
};

// ============================================
// 2. Actualizar horarios y estado de una cancha
// ============================================
export const updateCourtSchedule = async (courtId, data) => {
  const res = await fetch(`${API_URL}/courts/${courtId}/schedule`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al actualizar la cancha');
  return res.json();
};

// ============================================
// 3. Obtener configuración global del complejo
// ============================================
export const fetchGlobalConfig = async (complexId) => {
  const res = await fetch(`${API_URL}/complex/${complexId}/config`, {
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Error al obtener configuración global');
  return res.json();
};

// ============================================
// 4. Actualizar configuración global del complejo
// ============================================
export const updateGlobalConfig = async (complexId, data) => {
  const res = await fetch(`${API_URL}/complex/${complexId}/config`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al actualizar configuración global');
  return res.json();
};

// ============================================
// 5. Bloqueos (ya los tienes, pero los agrupamos aquí)
// ============================================
export const createBlockout = async (blockData) => {
  const res = await fetch(`${API_URL}/blockouts`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(blockData)
  });
  if (!res.ok) throw new Error('Error al crear bloqueo');
  return res.json();
};

export const updateBlockout = async (blockId, data) => {
  const res = await fetch(`${API_URL}/blockouts/${blockId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al actualizar bloqueo');
  return res.json();
};

export const deleteBlockout = async (blockId) => {
  const res = await fetch(`${API_URL}/blockouts/${blockId}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Error al eliminar bloqueo');
  return res.json();
};
/*
import Blockout from "../models/Blockout";
import Schedule from "../models/Schedule";
import { getBlockedHoursPerWeek, getTotalWeeklyMinutes } from "../utils/timeHelpers";

async function getScheduleWithMetrics (complexId)  {
    let schedule = await Schedule.findOne({complexId})
    if (!schedule) {
        schedule = await Schedule.create({complexId})
    }
    const blockout = await Blockout.find({complexId, isActive : true})
    const weeklyHours = getTotalWeeklyMinutes(schedule.openingDays, schedule.openTime, schedule.closeTime)
    const blockedHours = getBlockedHoursPerWeek(blockout, schedule.openingDays, schedule.openTime, schedule.closeTime)
    const efficiency = weeklyHours > 0 ? ((weeklyHours - blockedHours) / weeklyHours) * 100 : 0

    return{ 
        schedule,
        blockout,
        metrics: {
            weeklyHours: Math.round(weeklyHours),
            blockedHours: Math.round(blockedHours),
            efficiency: Math.round(efficiency),
        },
    };
};

async function updateSchedule(complexId, updateData, userId) {
    const schedule = await Schedule.findOneAndUpdate(
        {complexId},
        {...updateData, updatedBy: userId},
        {new: true, upsert: true}
    )
    return schedule
}

export{
    getScheduleWithMetrics,
    updateSchedule   
}  */