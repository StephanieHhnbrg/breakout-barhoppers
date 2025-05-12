export interface SignupResponse {
  name: string;
  mail: string;
  barId: string;
  accessToken: string;
  walletAddress: string;
  encryptedPrivateKey: string;
  firstSignIn: boolean;
}
