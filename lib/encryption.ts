import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_HEX = process.env.NIK_ENCRYPTION_KEY;

function getKey(): Buffer {
  if (!KEY_HEX || KEY_HEX.length !== 64) {
    throw new Error(
      "NIK_ENCRYPTION_KEY tidak ditemukan atau tidak valid. " +
        "Generate dengan: openssl rand -hex 32"
    );
  }
  return Buffer.from(KEY_HEX, "hex");
}

/**
 * Enkripsi NIK menggunakan AES-256-GCM.
 * @returns string format: iv:authTag:ciphertext (hex-encoded)
 */
export function encryptNIK(nik: string): string {
  const key = getKey();
  const iv = randomBytes(12); // 96-bit IV untuk GCM
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(nik, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

/**
 * Dekripsi NIK yang telah dienkripsi.
 * @param encryptedString format: iv:authTag:ciphertext (hex-encoded)
 */
export function decryptNIK(encryptedString: string): string {
  const key = getKey();
  const parts = encryptedString.split(":");
  if (parts.length !== 3) {
    throw new Error("Format data NIK terenkripsi tidak valid.");
  }
  const [ivHex, authTagHex, ciphertextHex] = parts;

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const ciphertext = Buffer.from(ciphertextHex, "hex");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");
}
