import OpenAI from 'openai';
import Complex from '../models/Complex.js';
import { generarSystemPrompt } from '../config/chatbotPrompt.js';

export const chatbot = async (req, res) => {
  const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  });

  try {
    const { message, history = [] } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
    }

    const complejos = await Complex.find({ status: { $in: ['approved', 'pending'] } })
      .select('name city location price openTime closeTime whatsapp instagram mercadopagoActive depositPercentage')
      .limit(20)
      .lean();

    const complejoFormateado = complejos.length
      ? complejos.map(c => {
          const lineas = [
            `📍 ${c.name} — ${c.city}${c.location ? `, ${c.location}` : ''}`,
            `   💰 Precio: $${c.price}/hora | Horario: ${c.openTime} a ${c.closeTime}`,
            `   💳 Mercado Pago: ${c.mercadopagoActive ? `Activo (seña ${c.depositPercentage}%)` : 'No disponible'}`,
          ];
          if (c.whatsapp) lineas.push(`   📱 WhatsApp: ${c.whatsapp}`);
          if (c.instagram) lineas.push(`   📸 Instagram: ${c.instagram}`);
          return lineas.join('\n');
        }).join('\n\n')
      : 'No hay complejos disponibles por el momento.';

    const fechaHora = new Date().toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    const systemPrompt = generarSystemPrompt({ complejos: complejoFormateado, fechaHora });

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10),
      { role: 'user', content: message },
    ];

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 350,
      temperature: 0.6,
    });

    const reply = response.choices[0]?.message?.content || 'Lo siento, no pude procesar tu consulta.';

    res.json({ reply });
  } catch (err) {
    console.error('Error en chatbot:', err.message);
    res.status(500).json({
      error: 'Error al procesar el mensaje.',
      reply: 'Lo siento, tuve un problema técnico. Intentá de nuevo en un momento. 🙏',
    });
  }
};
