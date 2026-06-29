import crypto from 'crypto';

const algorithm = 'aes-256-gcm';

let _key = null;
const getKey = () => {
  if (_key) return _key;
  const raw = process.env.MP_ENCRYPTION_KEY;
  if (!raw) throw new Error('MP_ENCRYPTION_KEY no está definida en las variables de entorno.');
  _key = crypto.createHash('sha256').update(raw).digest();
  return _key;
};

export const encrypt = (text) => {
  if (!text) return null;
  const iv     = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, getKey(), iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted    += cipher.final('hex');

  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

export const decrypt = (payload) => {
  if (!payload) return null;
  if (!payload.includes(':')) return payload;
  try {
    const [ivHex, authTagHex, encrypted] = payload.split(':');
    const iv      = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, getKey(), iv);
    decipher.setAuthTag(authTag);

    let decrypted  = decipher.update(encrypted, 'hex', 'utf8');
    decrypted     += decipher.final('utf8');
    return decrypted;
  } catch {
    return null;
  }
};
