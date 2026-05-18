import crypto from 'crypto';

const generateApiKey = () => {
  // 32 random bytes → hex string → "nxb_" prefix laga do
  return 'nxb_' + crypto.randomBytes(32).toString('hex');
};

export default generateApiKey;