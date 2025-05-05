import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {Keypair} from '@solana/web3.js';
@Injectable({
  providedIn: 'root'
})
export class DecryptionService {

  constructor() { }

  public getKeyPairFromSecretKey(secretKey: string): Keypair {
    return Keypair.fromSecretKey(this.base64ToUint8Array(secretKey));
  }

  public async decryptPrivateKey(encryptedBase64: string): Promise<string> {
    const encryptedBytes = this.base64ToUint8Array(encryptedBase64);
    const nonce = encryptedBytes.slice(0, 12);
    const ciphertextWithTag = encryptedBytes.slice(12);
    const fullCiphertext = new Uint8Array(ciphertextWithTag.length);
    fullCiphertext.set(ciphertextWithTag);

    const passphraseKey = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(environment.walletCryptoPassphrase));

    const key = await crypto.subtle.importKey(
      'raw',
      passphraseKey,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    try {
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: nonce,
          tagLength: 128
        },
        key,
        fullCiphertext
      );

      return new TextDecoder().decode(decrypted);
    } catch (err) {
      console.error('Decryption failed:', err);
      return '';
    }
  }


  private base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

}
