/**
 * CRYPTO UTILITIES - Portable Encryptor
 * 
 * This module uses the browser's built-in Web Crypto API to perform
 * secure, client-side encryption and decryption.
 * 
 * Logic Overview:
 * 1. Key Derivation: We use PBKDF2 with SHA-256 to derive a 256-bit AES key from a user password.
 * 2. Encryption: We use AES-256-GCM (Galois/Counter Mode).
 *    - A random 12-byte IV (Initialization Vector) is generated for each encryption.
 *    - A random 16-byte salt is generated for PBKDF2.
 *    - The output file format: [Salt (16 bytes)][IV (12 bytes)][Ciphertext + Auth Tag]
 * 3. Security: No keys or plaintext ever leave the user's browser.
 */

const PBKDF2_ITERATIONS = 100000;
const SALT_SIZE = 16;
const IV_SIZE = 12;
const ALGORITHM = 'AES-GCM';

/**
 * Derives a crypto key from a raw password string.
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: ALGORITHM, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a file using AES-256-GCM.
 * Returns a Blob containing [Salt][IV][Ciphertext].
 */
export async function encryptFile(file: File, password: string): Promise<Blob> {
  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_SIZE));
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_SIZE));
  const key = await deriveKey(password, salt);

  const fileData = await file.arrayBuffer();
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    fileData
  );

  // Combine components into a single result
  // Format: [SALT][IV][ENCRYPTED_DATA]
  const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

  return new Blob([combined as any], { type: 'application/octet-stream' });
}

/**
 * Decrypts an encrypted file Blob using AES-256-GCM.
 */
export async function decryptFile(encryptedBlob: Blob, password: string): Promise<Uint8Array> {
  const data = new Uint8Array(await encryptedBlob.arrayBuffer());
  
  if (data.length < SALT_SIZE + IV_SIZE) {
    throw new Error('Invalid encrypted file format');
  }

  // Extract components
  const salt = data.slice(0, SALT_SIZE);
  const iv = data.slice(SALT_SIZE, SALT_SIZE + IV_SIZE);
  const ciphertext = data.slice(SALT_SIZE + IV_SIZE);

  const key = await deriveKey(password, salt);

  try {
    const decrypted = await window.crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      ciphertext
    );
    return new Uint8Array(decrypted);
  } catch (err) {
    throw new Error('Incorrect password or corrupted file');
  }
}

/**
 * Helper to download a file in the browser.
 */
export function downloadFile(data: Uint8Array | Blob, fileName: string) {
  const blob = data instanceof Blob ? data : new Blob([data as any]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
