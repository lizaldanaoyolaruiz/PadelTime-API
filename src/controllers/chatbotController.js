import OpenAI from 'openai';
import crypto from 'crypto';
import Complex from '../models/Complex.js';
import Court from '../models/Court.js';
import Booking from '../models/Booking.js';
import { generarSystemPrompt } from '../config/chatbotPrompt.js';

// Session store in-memory — 30 min TTL por inactividad
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

const DAY_MAP = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

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

async function executeVerificarDisponibilidad({ complexId, date, startTime, courtType }) {
  try {
    const query = { complex: complexId, enabled: true };
    if (courtType && courtType !== 'any') query.type = courtType;

    const courts = await Court.find(query).lean();
    const dayOfWeek = DAY_MAP[new Date(`${date}T12:00:00`).getDay()];
    const openCourts = courts.filter(c => c.schedule?.[dayOfWeek]?.enabled !== false);

    const bookedCourtIds = await Booking.distinct('court', {
      complex: complexId,
      date,
      startTime,
      status: { $in: ['pending', 'confirmed'] },
    });

    const available = openCourts.filter(
      c => !bookedCourtIds.some(id => id.toString() === c._id.toString())
    );

    const complex = await Complex.findById(complexId).select('name whatsapp').lean();
    const endTime = addOneHour(startTime);
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    const whatsappNum = cleanWhatsappNumber(complex?.whatsapp);

    const fechaFormateada = new Date(`${date}T12:00:00`).toLocaleDateString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long',
    });

    const disponibles = available.map(c => {
      const bookingUrl = `${FRONTEND_URL}/reservar?courtId=${c._id}&complexId=${complexId}&date=${date}&startTime=${startTime}&endTime=${endTime}`;
      const waText = whatsappNum
        ? encodeURIComponent(
            `Hola! Quiero reservar ${c.name} (${c.type === 'crystal' ? 'cristal' : 'panorámica'}) el ${fechaFormateada} de ${startTime} a ${endTime}. ¿Tienen disponibilidad?`
          )
        : null;
      return {
        courtId: c._id.toString(),
        nombre: c.name,
        tipo: c.type === 'crystal' ? 'Cristal' : 'Panorámica',
        precio: c.pricePerHour,
        linkReserva: bookingUrl,
        linkWhatsApp: whatsappNum ? `https://wa.me/${whatsappNum}?text=${waText}` : null,
      };
    });

    return {
      disponibles,
      fecha: date,
      fechaFormateada,
      horario: `${startTime} - ${endTime}`,
      complejo: complex?.name || 'Complejo',
      whatsapp: complex?.whatsapp || null,
      totalDisponibles: available.length,
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
        'Verifica canchas disponibles en un complejo para una fecha y hora específica y genera links de reserva. Llamá esta función cuando el usuario quiera reservar o pregunte por disponibilidad con complejo, fecha y hora definidos.',
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
            if (c.whatsapp) lineas.push(`   📱 WhatsApp: ${c.whatsapp}`);
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

    let reply = '';
    let bookingOptions = null;

    const firstResponse = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      tools: chatbotTools,
      tool_choice: 'auto',
      max_tokens: 500,
      temperature: 0.6,
    });

    const firstChoice = firstResponse.choices[0];

    if (firstChoice.message.tool_calls?.length > 0) {
      const toolCall = firstChoice.message.tool_calls[0];
      const args = JSON.parse(toolCall.function.arguments);
      const toolResult = await executeVerificarDisponibilidad(args);

      if (toolResult.disponibles?.length > 0) {
        bookingOptions = toolResult;
      }

      const messagesWithTool = [
        ...messages,
        firstChoice.message,
        {
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult),
        },
      ];

      const secondResponse = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: messagesWithTool,
        max_tokens: 400,
        temperature: 0.6,
      });

      reply =
        secondResponse.choices[0]?.message?.content || 'Lo siento, no pude procesar tu consulta.';
    } else {
      reply = firstChoice.message?.content || 'Lo siento, no pude procesar tu consulta.';
    }

    session.history.push({ role: 'assistant', content: reply });
    if (session.history.length > 20) {
      session.history = session.history.slice(-20);
    }

    res.json({ reply, bookingOptions, sessionId });
  } catch (err) {
    console.error('Error en chatbot:', err.message);
    res.status(500).json({
      error: 'Error al procesar el mensaje.',
      reply: 'Lo siento, tuve un problema técnico. Intentá de nuevo en un momento. 🙏',
    });
  }
};
