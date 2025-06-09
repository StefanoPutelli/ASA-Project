/**
 * Encrypts a 32-byte plaintext string with a 32-byte key using XOR and returns a hex-encoded string.
 *
 * Both plaintext and key must encode to exactly 32 bytes.
 *
 * @param plaintext - The string to encrypt (must be 32 bytes when encoded in UTF-8).
 * @param key - The key to use for encryption (must be 32 bytes when encoded in UTF-8).
 * @returns The encrypted data encoded as a hex string.
 */
export function encrypt(plaintext: string, key: string): string {
  const plaintextBuffer = Buffer.from(plaintext, 'utf8');
  const keyBuffer = Buffer.from(key, 'utf8');
  if (plaintextBuffer.length !== 32 || keyBuffer.length !== 32) {
    throw new Error('Plaintext and key must be exactly 32 bytes long when encoded in UTF-8.');
  }

  const encrypted = Buffer.alloc(32);
  for (let i = 0; i < 32; i++) {
    encrypted[i] = plaintextBuffer[i] ^ keyBuffer[i];
  }

  return encrypted.toString('hex');
}

/**
 * Decrypts a hex-encoded ciphertext (that was generated using a 32-byte key with XOR encryption)
 * back into its original plaintext string.
 *
 * The ciphertext must decode to exactly 32 bytes and the key must encode to 32 bytes.
 *
 * @param ciphertextHex - The hex string to decrypt.
 * @param key - The key used for decryption (must be 32 bytes when encoded in UTF-8).
 * @returns The decrypted plaintext string.
 */
export function decrypt(ciphertextHex: string, key: string): string {
  const ciphertext = Buffer.from(ciphertextHex, 'hex');
  const keyBuffer = Buffer.from(key, 'utf8');

  if (ciphertext.length !== 32 || keyBuffer.length !== 32) {
    throw new Error('Ciphertext must decode to 32 bytes and key must be 32 bytes long when encoded in UTF-8.');
  }

  const decrypted = Buffer.alloc(32);
  for (let i = 0; i < 32; i++) {
    decrypted[i] = ciphertext[i] ^ keyBuffer[i];
  }

  return decrypted.toString('utf8');
}

