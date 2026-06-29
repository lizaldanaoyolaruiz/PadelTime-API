import https from 'https';

const mpRequest = (method, path, accessToken, body = null) => {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;

    const options = {
      hostname: 'api.mercadopago.com',
      path,
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `pt-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
      },
    };

    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode, body: raw });
        }
      });
    });

    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
};

export const createPreference = async (accessToken, { booking, complex, court }) => {
  const backendUrl = process.env.BACKEND_URL;
  const clientUrl = process.env.CLIENT_URL;

  const dateStr = new Date(booking.date).toISOString().split('T')[0];

  const body = {
    items: [
      {
        id: booking._id.toString(),
        title: `Seña reserva - ${complex.name}`,
        description: `${court.name} · ${dateStr} · ${booking.startTime}–${booking.endTime}`,
        quantity: 1,
        unit_price: booking.depositAmount,
        currency_id: 'ARS',
      },
    ],
    external_reference: booking._id.toString(),
    back_urls: {
      success: `${clientUrl}/booking/success?bookingId=${booking._id}`,
      failure: `${clientUrl}/booking/failure?bookingId=${booking._id}`,
      pending: `${clientUrl}/booking/pending?bookingId=${booking._id}`,
    },
    notification_url: `${backendUrl}/api/payments/webhook/${booking._id}`,
    statement_descriptor: 'PADELTIME',
    metadata: {
      booking_id: booking._id.toString(),
      complex_id: complex._id.toString(),
    },
  };

  const response = await mpRequest('POST', '/checkout/preferences', accessToken, body);

  if (response.status !== 201 && response.status !== 200) {
    throw new Error(`MP preference creation failed (${response.status}): ${JSON.stringify(response.body)}`);
  }

  return response.body;
};

export const searchPaymentsByReference = async (accessToken, externalReference) => {
  const response = await mpRequest('GET', `/v1/payments/search?external_reference=${externalReference}`, accessToken);
  if (response.status !== 200) throw new Error(`MP search failed (${response.status}): ${JSON.stringify(response.body)}`);
  return response.body;
};

export const getPayment = async (accessToken, paymentId) => {
  const response = await mpRequest('GET', `/v1/payments/${paymentId}`, accessToken);

  if (response.status !== 200) {
    throw new Error(`MP payment not found (${response.status}): ${paymentId}`);
  }

  return response.body;
};
