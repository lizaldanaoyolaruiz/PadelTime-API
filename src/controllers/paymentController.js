import Booking from '../models/Booking.js';
import { getPayment } from '../services/mpService.js';
import { sendBookingConfirmationEmail } from '../services/emailService.js';
import { decrypt } from '../utils/encryption.js';

const processPaymentNotification = async (bookingId, paymentId) => {
  const booking = await Booking.findById(bookingId)
    .populate('court', 'name type')
    .populate({ path: 'complex', select: '+mpAccessToken name location city' })
    .populate('player', 'name email');

  if (!booking) {
    console.error(`[Webhook] Booking not found: ${bookingId}`);
    return;
  }

  if (booking.status === 'confirmed' || booking.status === 'cancelled') return;

  const accessToken = decrypt(booking.complex?.mpAccessToken);
  if (!accessToken) {
    console.error(`[Webhook] No mpAccessToken for complex: ${booking.complex?._id}`);
    return;
  }

  const payment = await getPayment(accessToken, paymentId);

  if (payment.external_reference !== bookingId) {
    console.error(`[Webhook] external_reference mismatch for payment ${paymentId}`);
    return;
  }

  booking.paymentId = paymentId;

  if (payment.status === 'approved') {
    booking.status = 'confirmed';
    await booking.save();

    if (booking.player?.email) {
      await sendBookingConfirmationEmail(booking).catch((err) =>
        console.error('[Webhook] Confirmation email failed:', err.message)
      );
    }
  } else if (payment.status === 'rejected') {
    booking.status = 'cancelled';
    await booking.save();
  }
};

export const handleWebhook = async (req, res) => {
  res.sendStatus(200);

  try {
    const { type, data } = req.body;
    if (type !== 'payment' || !data?.id) return;

    await processPaymentNotification(req.params.bookingId, data.id.toString());
  } catch (error) {
    console.error('[Webhook] Processing error:', error.message);
  }
};
