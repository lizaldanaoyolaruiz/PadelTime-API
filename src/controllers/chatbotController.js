import OpenAI from 'openai';
import crypto from 'crypto';
import Complex from '../models/Complex.js';
import Court from '../models/Court.js';
import Booking from '../models/Booking.js';
import Blockout from '../models/Blockout.js';
import { generarSystemPrompt } from '../config/chatbotPrompt.js';

const sessions = new Map();
const SESSION_TTL = 30 * 60 * 1000;

function getOrCreateSession(clientSessionId) {
  if (clientSessionId && sessions.has(clientSessionId)) {
    const s = sessions.get(clientSessionId);
    clearTimeout(s.timer);
    s.timer = setTimeout(() => sessions.delete(clientSessionId), SESSION_TTL);
    return { sessionId: clientSessionId, session: s };
  }
  const sessionId = clientSessionId || crypto.randomUUID();
  const s = {
    history: [],
    timer: setTimeout(() => sessions.delete(sessionId), SESSION_TTL),
  };
  sessions.set(sessionId, s);
  return { sessionId, session: s };
}

// English days for court.schedule keys
const DAY_MAP_EN = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
// Spanish days for Blockout.dayOfWeek field
const DAY_MAP_ES = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

function addOneHour(time) {
  const [h, m] = time.split(':').map(Number);
  return `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function cleanWhatsappNumber(raw) {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `549${digits}`;
  if (digits.startsWith('0') && digits.length === 11) return `54${digits.slice(1)}`;
  if (digits.startsWith('54')) return digits;
  return digits;
}

function timeToMinutes(t) {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

function getNowArgentina() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date());
  const get = type => parts.find(p => p.type === type).value;
  const hour   = parseInt(get('hour'));
  const minute = parseInt(get('minute'));
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    hour,
    minute,
    totalMinutes: hour * 60 + minute,
  };
}

function slotOverlapsBlockout(slotStart, slotEnd, blockout) {
  const sS = timeToMinutes(slotStart);
  const sE = timeToMinutes(slotEnd);
  const bS = timeToMinutes(blockout.startTime);
  const bE = timeToMinutes(blockout.endTime);
  return sS < bE && sE > bS;
}

async function buscarAlternativas({ complexId, date, dayEN, blockouts, courts, excludeTime, openMin, closeMin, complex }) {
  const alternativas = [];
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
  const whatsappNum  = cleanWhatsappNumber(complex.whatsapp);
  const fechaFormateada = new Date(`${date}T12:00:00`).toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  // Fetch all bookings for that day at once
  const allBookings = await Booking.find({
    complex: complexId,
    date,
    status: { $in: ['pending', 'confirmed'] },
  }).select('court startTime').lean();

  const openHour  = Math.floor(openMin / 60);
  const closeHour = Math.floor(closeMin / 60);

  const nowAR = getNowArgentina();

  for (let h = openHour; h < closeHour && alternativas.length < 3; h++) {
    const slotStart = `${String(h).padStart(2, '0')}:00`;
    const slotEnd   = `${String(h + 1).padStart(2, '0')}:00`;

    if (slotStart === excludeTime) continue;

    // No sugerir horarios pasados para el día de hoy
    if (date === nowAR.date && h * 60 < nowAR.totalMinutes) continue;

    const globallyBlocked = blockouts.some(b => !b.courtId && slotOverlapsBlockout(slotStart, slotEnd, b));
    if (globallyBlocked) continue;

    const courtBlockedIds = new Set(
      blockouts
        .filter(b => b.courtId && slotOverlapsBlockout(slotStart, slotEnd, b))
        .map(b => b.courtId.toString())
    );

    const bookedAtSlot = new Set(
      allBookings
        .filter(bk => bk.startTime === slotStart)
        .map(bk => bk.court.toString())
    );

    const freeCourts = courts.filter(c => {
      const id = c._id.toString();
      if (bookedAtSlot.has(id) || courtBlockedIds.has(id)) return false;
      const courtOpen  = c.schedule?.[dayEN]?.start || '00:00';
      const courtClose = c.schedule?.[dayEN]?.end   || '24:00';
      const sMin = timeToMinutes(slotStart);
      const eMin = timeToMinutes(slotEnd);
      return sMin >= timeToMinutes(courtOpen) && eMin <= (timeToMinutes(courtClose) || 24 * 60);
    });

    if (freeCourts.length > 0) {
      const canchas = freeCourts.map(c => {
        const bookingUrl = `${FRONTEND_URL}/confirmacion?courtId=${c._id}&complexId=${complexId}&date=${date}&startTime=${slotStart}&endTime=${slotEnd}`;
        const waText = whatsappNum
          ? encodeURIComponent(`Hola! Quiero reservar ${c.name} el ${fechaFormateada} de ${slotStart} a ${slotEnd}. ¿Tienen disponibilidad?`)
          : null;
        return {
          courtId:      c._id.toString(),
          nombre:       c.name,
          tipo:         c.type === 'crystal' ? 'Cristal' : 'Panorámica',
          precio:       c.pricePerHour,
          linkReserva:  bookingUrl,
          linkWhatsApp: whatsappNum ? `https://wa.me/${whatsappNum}?text=${waText}` : null,
        };
      });

      alternativas.push({
        horario:      slotStart,
        horarioLabel: `${slotStart} - ${slotEnd}`,
        canchas,
      });
    }
  }

  return alternativas;
}

async function executeVerificarDisponibilidad({ complexId, date, startTime, courtType }) {
  try {
    // Rechazar fechas u horarios ya transcurridos
    const nowAR = getNowArgentina();
    if (date < nowAR.date || (date === nowAR.date && timeToMinutes(startTime) < nowAR.totalMinutes)) {
      return {
        error: 'fecha_pasada',
        mensaje: 'No se pueden verificar ni reservar fechas u horarios ya transcurridos.',
      };
    }

    const complex = await Complex.findById(complexId)
      .select('name whatsapp openTime closeTime')
      .lean();
    if (!complex) return { error: 'Complejo no encontrado' };

    const endTime = addOneHour(startTime);

    // 1. Complex opening hours
    const openMin  = timeToMinutes(complex.openTime  || '00:00');
    const closeMin = timeToMinutes(complex.closeTime || '00:00') || 24 * 60;
    const startMin = timeToMinutes(startTime);
    const endMin   = timeToMinutes(endTime) || 24 * 60;
    const isWithinHours = startMin >= openMin && endMin <= closeMin;

    // 2. Get enabled courts
    const query = { complex: complexId, enabled: true };
    if (courtType && courtType !== 'any') query.type = courtType;
    const courts = await Court.find(query).lean();

    const dateObj  = new Date(`${date}T12:00:00`);
    const dayEN    = DAY_MAP_EN[dateObj.getDay()];
    const dayES    = DAY_MAP_ES[dateObj.getDay()];

    // Courts with schedule active for that day
    const scheduledCourts = courts.filter(c => c.schedule?.[dayEN]?.enabled !== false);

    // Courts whose own schedule covers this slot
    const openCourts = scheduledCourts.filter(c => {
      const courtOpen  = c.schedule?.[dayEN]?.start || complex.openTime || '00:00';
      const courtClose = c.schedule?.[dayEN]?.end   || complex.closeTime || '00:00';
      const coMin = timeToMinutes(courtOpen);
      const ccMin = timeToMinutes(courtClose) || 24 * 60;
      return startMin >= coMin && endMin <= ccMin;
    });

    // 3. Blockouts active for this date/day
    const blockouts = await Blockout.find({
      complexId,
      isActive: true,
      $or: [
        { recurrence: 'daily' },
        { recurrence: 'weekly', dayOfWeek: dayES },
        { recurrence: 'once', date },
      ],
    }).lean();

    // Determine blocked courts at this slot
    let allCourtsBlocked = false;
    const blockedCourtIds = new Set();
    let motivoBloqueo = null;

    for (const b of blockouts) {
      if (slotOverlapsBlockout(startTime, endTime, b)) {
        if (!b.courtId) {
          allCourtsBlocked = true;
          motivoBloqueo = b.name || null;
          break;
        } else {
          blockedCourtIds.add(b.courtId.toString());
          if (!motivoBloqueo) motivoBloqueo = b.name || null;
        }
      }
    }

    // 4. Booked courts at this slot
    const bookedCourtIds = await Booking.distinct('court', {
      complex: complexId,
      date,
      startTime,
      status: { $in: ['pending', 'confirmed'] },
    });

    // 5. Available courts
    let available = [];
    if (isWithinHours && !allCourtsBlocked) {
      available = openCourts.filter(c => {
        const id = c._id.toString();
        return (
          !bookedCourtIds.some(bid => bid.toString() === id) &&
          !blockedCourtIds.has(id)
        );
      });
    }

    // 6. Reason for unavailability
    let razonNoDisponible = null;
    if (available.length === 0) {
      if (scheduledCourts.length === 0) {
        // All courts have that day disabled in their schedule
        razonNoDisponible = 'cancha_cerrada';
      } else if (!isWithinHours || openCourts.length === 0) {
        // Outside complex hours or outside all courts' operating hours for that slot
        razonNoDisponible = 'fuera_de_horario';
      } else if (allCourtsBlocked || blockedCourtIds.size > 0) {
        razonNoDisponible = 'bloqueado_mantenimiento';
      } else {
        razonNoDisponible = 'todo_ocupado';
      }
    }

    // 7. Suggest alternatives when unavailable
    let alternativasSugeridas = [];
    if (available.length === 0) {
      alternativasSugeridas = await buscarAlternativas({
        complexId, date, dayEN, blockouts,
        courts: scheduledCourts,
        excludeTime: startTime,
        openMin, closeMin,
        complex,
      });
    }

    // 8. Build response
    const FRONTEND_URL    = process.env.FRONTEND_URL || 'http://localhost:5173';
    const whatsappNum     = cleanWhatsappNumber(complex.whatsapp);
    const fechaFormateada = new Date(`${date}T12:00:00`).toLocaleDateString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long',
    });

    const disponibles = available.map(c => {
      const bookingUrl = `${FRONTEND_URL}/confirmacion?courtId=${c._id}&complexId=${complexId}&date=${date}&startTime=${startTime}&endTime=${endTime}`;
      const waText = whatsappNum
        ? encodeURIComponent(
            `Hola! Quiero reservar ${c.name} (${c.type === 'crystal' ? 'cristal' : 'panorámica'}) el ${fechaFormateada} de ${startTime} a ${endTime}. ¿Tienen disponibilidad?`
          )
        : null;
      return {
        courtId:     c._id.toString(),
        nombre:      c.name,
        tipo:        c.type === 'crystal' ? 'Cristal' : 'Panorámica',
        precio:      c.pricePerHour,
        linkReserva: bookingUrl,
        linkWhatsApp: whatsappNum ? `https://wa.me/${whatsappNum}?text=${waText}` : null,
      };
    });

    const alternativasOpciones = alternativasSugeridas.length > 0
      ? { complejo: complex.name, fechaFormateada, slots: alternativasSugeridas }
      : null;

    return {
      disponibles,
      fecha: date,
      fechaFormateada,
      horario: `${startTime} - ${endTime}`,
      complejo: complex.name || 'Complejo',
      whatsapp: complex.whatsapp || null,
      totalDisponibles: available.length,
      razonNoDisponible,
      motivoBloqueo,
      horarioComplejo: `${complex.openTime || '—'} a ${complex.closeTime || '—'}`,
      alternativasSugeridas: alternativasSugeridas.map(a => ({ horario: a.horario, canchasDisponibles: a.canchas.length })),
      alternativasOpciones,
    };
  } catch (err) {
    return { error: 'No se pudo verificar la disponibilidad', detalles: err.message };
  }
}

const chatbotTools = [
  {
    type: 'function',
    function: {
      name: 'verificar_disponibilidad',
      description:
        'Verifica canchas disponibles en un complejo para una fecha y hora específica. También valida horarios del complejo y bloqueos de mantenimiento. Llamá esta función cuando el usuario quiera reservar o pregunte por disponibilidad con complejo, fecha y hora definidos.',
      parameters: {
        type: 'object',
        properties: {
          complexId: {
            type: 'string',
            description: 'ID del complejo (campo "ID:" del listado del sistema)',
          },
          date: {
            type: 'string',
            description: 'Fecha en formato YYYY-MM-DD',
          },
          startTime: {
            type: 'string',
            description: 'Hora de inicio en formato HH:MM (24hs)',
          },
          courtType: {
            type: 'string',
            enum: ['crystal', 'panoramic', 'any'],
            description: 'Tipo de cancha preferida. Usar "any" si no especificó.',
          },
        },
        required: ['complexId', 'date', 'startTime'],
      },
    },
  },
];

export const chatbot = async (req, res) => {
  const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  });

  try {
    const { message, sessionId: clientSessionId } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
    }

    const { sessionId, session } = getOrCreateSession(clientSessionId);

    const complejos = await Complex.find({ status: { $in: ['approved', 'pending'] } })
      .select('_id name city location price openTime closeTime whatsapp instagram mercadopagoActive depositPercentage')
      .limit(20)
      .lean();

    const complejoFormateado = complejos.length
      ? complejos
          .map(c => {
            const lineas = [
              `ID: ${c._id} | ${c.name} — ${c.city}${c.location ? `, ${c.location}` : ''}`,
              `   💰 Precio: $${c.price}/hora | Horario: ${c.openTime} a ${c.closeTime}`,
              `   💳 Mercado Pago: ${c.mercadopagoActive ? `Activo (seña ${c.depositPercentage}%)` : 'No disponible'}`,
            ];
            if (c.whatsapp)  lineas.push(`   📱 WhatsApp: ${c.whatsapp}`);
            if (c.instagram) lineas.push(`   📸 Instagram: ${c.instagram}`);
            return lineas.join('\n');
          })
          .join('\n\n')
      : 'No hay complejos disponibles por el momento.';

    const fechaHora = new Date().toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const systemPrompt = generarSystemPrompt({ complejos: complejoFormateado, fechaHora });

    session.history.push({ role: 'user', content: message });

    const messages = [
      { role: 'system', content: systemPrompt },
      ...session.history.slice(-20),
    ];

    let reply              = '';
    let bookingOptions     = null;
    let alternativasOpciones = null;

    const firstResponse = await groq.chat.completions.create({
      model:       'llama-3.3-70b-versatile',
      messages,
      tools:       chatbotTools,
      tool_choice: 'auto',
      max_tokens:  500,
      temperature: 0.6,
    });

    const firstChoice = firstResponse.choices[0];

    if (firstChoice.message.tool_calls?.length > 0) {
      const toolCall  = firstChoice.message.tool_calls[0];
      const args      = JSON.parse(toolCall.function.arguments);
      const toolResult = await executeVerificarDisponibilidad(args);

      if (toolResult.disponibles?.length > 0) {
        bookingOptions = toolResult;
      } else if (toolResult.alternativasOpciones) {
        alternativasOpciones = toolResult.alternativasOpciones;
      }

      const messagesWithTool = [
        ...messages,
        firstChoice.message,
        {
          role:        'tool',
          tool_call_id: toolCall.id,
          content:     JSON.stringify(toolResult),
        },
      ];

      const secondResponse = await groq.chat.completions.create({
        model:       'llama-3.3-70b-versatile',
        messages:    messagesWithTool,
        max_tokens:  400,
        temperature: 0.6,
      });

      reply = secondResponse.choices[0]?.message?.content || 'Lo siento, no pude procesar tu consulta.';
    } else {
      reply = firstChoice.message?.content || 'Lo siento, no pude procesar tu consulta.';
    }

    session.history.push({ role: 'assistant', content: reply });
    if (session.history.length > 20) {
      session.history = session.history.slice(-20);
    }

    res.json({ reply, bookingOptions, alternativasOpciones, sessionId });
  } catch (err) {
    console.error('Error en chatbot:', err.message);
    res.status(500).json({
      error: 'Error al procesar el mensaje.',
      reply: 'Lo siento, tuve un problema técnico. Intentá de nuevo en un momento. 🙏',
    });
  }
};
