import crypto from 'crypto';
import pool from '../config/db.js';

const planLimits = {
  starter:  { limit: 10000,  days: 30 },
  business: { limit: 999999, days: 30 },
};

// Lemon Squeezy signature verify karo
const verifySignature = (payload, signature) => {
  const hmac = crypto.createHmac('sha256', process.env.LEMONSQUEEZY_WEBHOOK_SECRET);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(signature)
  );
};

export const handleWebhook = async (req, res) => {
    console.log('Headers:', req.headers);
  console.log('Signature:', req.headers['x-signature']);
  try {
    const signature = req.headers['x-signature'];

    if (!signature) {
      return res.status(401).json({ error: 'No signature' });
    }

    // Raw body verify karo
    const rawBody = JSON.stringify(req.body);
    const isValid = verifySignature(rawBody, signature);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    const eventName = event.meta?.event_name;

    console.log('Webhook received:', eventName);

    // Payment successful events
    if (
      eventName === 'order_created' ||
      eventName === 'subscription_created' ||
      eventName === 'subscription_payment_success'
    ) {
      await handlePaymentSuccess(event);
    }

    // Subscription cancelled
    if (eventName === 'subscription_cancelled') {
      await handleCancellation(event);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(500).json({ error: 'Webhook error' });
  }
};

const handlePaymentSuccess = async (event) => {
  try {
    // Customer email lo
    const email = event.data?.attributes?.user_email ||
                  event.meta?.custom_data?.email;

    // Plan identify karo — product name se
    const productName = event.data?.attributes?.first_order_item?.product_name ||
                        event.data?.attributes?.product_name || '';

    let plan = 'starter';
    if (productName.toLowerCase().includes('business')) {
      plan = 'business';
    }

    if (!email) {
      console.error('No email in webhook');
      return;
    }

    const planData = planLimits[plan];
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + planData.days);

    // Client ka plan update karo
    const [result] = await pool.query(
      `UPDATE clients 
       SET plan = ?,
           messages_limit = ?,
           messages_used = 0,
           is_active = 1,
           plan_expires_at = ?
       WHERE email = ?`,
      [plan, planData.limit, expiryDate, email]
    );

    if (result.affectedRows === 0) {
      console.error('Client not found:', email);
      return;
    }

    console.log(`Plan activated: ${email} → ${plan}`);

  } catch (error) {
    console.error('Payment handler error:', error.message);
  }
};

const handleCancellation = async (event) => {
  try {
    const email = event.data?.attributes?.user_email ||
                  event.meta?.custom_data?.email;

    if (!email) return;

    await pool.query(
      `UPDATE clients SET plan = 'trial', messages_limit = 100
       WHERE email = ?`,
      [email]
    );

    console.log(`Subscription cancelled: ${email}`);

  } catch (error) {
    console.error('Cancellation handler error:', error.message);
  }
};