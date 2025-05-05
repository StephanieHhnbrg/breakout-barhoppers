import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair, Transaction, sendAndConfirmTransaction, Signer,
} from '@solana/web3.js';
import {
  createAssociatedTokenAccountInstruction,
  createMint, createTransferInstruction, getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from '@solana/spl-token';
import {Metaplex,keypairIdentity } from '@metaplex-foundation/js';
import {environment} from '../../environments/environment';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import {DecryptionService} from './decryption.service';


@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private connection: Connection;
  private publicKey: PublicKey | null = null;
  private signer: Signer | null = null;
  private payer: Keypair = Keypair.generate();

  private metaplex: Metaplex | null = null;
  private mintAddress = new PublicKey(environment.mintAddressB58);
  private walletConnected$ = new BehaviorSubject<boolean>(false);
  private tokensUpdated$ = new BehaviorSubject<number>(0);
  private numberOfTokens = 0;

  private readonly TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
  private readonly NFT_URL = "https://raw.githubusercontent.com/StephanieHhnbrg/breakout-barhoppers/refs/heads/main/src/assets/";

  constructor(private decryptionService: DecryptionService) {
    this.connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    // this.connection = new Connection(`https://devnet.helius-rpc.com/?api-key=${environment.heliusApiKey}`, 'confirmed');
  }

  public async connectWallet(walletAddress: string, privateKey: string) {
    this.publicKey = new PublicKey(walletAddress);
    this.signer = await this.createSignerFromDecryptedKey(privateKey);
    this.payer = this.decryptionService.getKeyPairFromSecretKey(environment.payerSecretKey);

    this.metaplex = Metaplex.make(this.connection)
      .use(keypairIdentity(this.payer));

    this.walletConnected$.next(true);

    try {
      this.chargeUpPayerAccount();
      this.initAccount();

    } catch (e) {
      console.error("Charging payer account without success: ", e);
    }

  }

  private async createSignerFromDecryptedKey(privateKey: string): Promise<Signer> {
    let decryptedHexKey = await this.decryptionService.decryptPrivateKey(privateKey);
    if (decryptedHexKey) {
      const byteArray = Uint8Array.from(
        decryptedHexKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
      );

      return Keypair.fromSecretKey(byteArray);
    }
    return new Keypair();
  }

  public getWalletAddress(): string {
    return this.publicKey ? this.publicKey.toBase58() : '';
  }

  public async chargeUpPayerAccount() {
    let airdropSignature = await this.connection.requestAirdrop(
    this.payer.publicKey,
    1e9
      );

    let latestBlockHash = await this.connection.getLatestBlockhash();
    await this.connection.confirmTransaction({
      signature: airdropSignature,
      ...latestBlockHash,
    });

    let balance = await this.connection.getBalance(this.payer.publicKey);
    console.log(`Balance: ${balance / LAMPORTS_PER_SOL} SOL`);
  }

  private async initAccount() {
    const associatedTokenAddress = await getAssociatedTokenAddress(
      this.mintAddress,
      this.publicKey!,
      false
    );

    const accountInfo = await this.connection.getAccountInfo(associatedTokenAddress);
    if (accountInfo === null) {


      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          this.payer.publicKey,
          associatedTokenAddress,
          this.publicKey!,
          this.mintAddress
        ));

      const signature = await this.connection.sendTransaction(transaction, [this.payer], {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      await this.connection.confirmTransaction(signature, 'confirmed');
    }
  }

  public disconnectWallet() {
    this.publicKey = null;
    this.metaplex = null;
    this.walletConnected$.next(false);
  }

  public getTokensUpdatedObservable(): Observable<number> {
    return this.tokensUpdated$.asObservable();
  }

  public getWalletConnectedObservable(): Observable<boolean> {
    return this.walletConnected$.asObservable();
  }

  public async fetchNFTsByOwner(): Promise<any[]> {
    if (!this.metaplex || !this.publicKey) {
      throw new Error('Wallet not connected');
    }

    return await this.metaplex!.nfts().findAllByOwner({ owner: this.publicKey! });
  }

  public async fetchTokenAccountsByOwner(): Promise<any> {
    if (!this.publicKey) {
      return [];
    }

    const tokens = await this.connection.getParsedTokenAccountsByOwner(this.publicKey, {
      programId: new PublicKey(this.TOKEN_PROGRAM_ID),
    });
    console.log("tokens: ");
    console.log(tokens.value);
    // TODO: update this.numberOfTokens
    return tokens.value;
  }

  public async createQuestNft() {
    await this.createNFT("Quest Explorer", this.NFT_URL + "nft_quests.png");
  }

  public async createBarNft() {
    await this.createNFT("Pub Pioneer", this.NFT_URL + "nft_bars.png");
  }

  public async createFriendsNft() {
    await this.createNFT("Social Butterfly", this.NFT_URL + "nft_friends.png");
  }


  private async createNFT(name: string, uri: string): Promise<PublicKey> {
    if (!this.metaplex || !this.publicKey) throw new Error('Metaplex not ready');

    const { nft } = await this.metaplex.nfts().create({
      name,
      uri,
      sellerFeeBasisPoints: 500,
      tokenOwner: this.publicKey
    });

    return nft.address;
  }

  public async setMintAddress(){
    this.mintAddress = await createMint(
      this.connection,
      this.payer,
      this.payer.publicKey,
      null,
      0
    );

    console.log("Mint address: ", this.mintAddress.toBase58());
  }

  public async addTokens(amount: number = 10) {
    if (!this.publicKey) {
      throw new Error('Wallet not connected');
    }

    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      this.connection,
      this.payer,
      this.mintAddress,
      this.publicKey!
    );

    await mintTo(
      this.connection,
      this.payer,
      this.mintAddress,
      tokenAccount.address,
      this.payer,
      amount
    );

    this.numberOfTokens += amount;
    this.tokensUpdated$.next(this.numberOfTokens);

    let balance = await this.connection.getBalance(this.payer.publicKey);
    console.log(`Balance: ${balance / LAMPORTS_PER_SOL} SOL`);
  }

  public async transferTokens(toWallet: PublicKey, amount: number = 50) {
    const fromTokenAccount = await getAssociatedTokenAddress(
      this.mintAddress,
      this.publicKey!
    );

    const toTokenAccount = await getAssociatedTokenAddress(
      this.mintAddress,
      toWallet,
    );

    const tx = new Transaction().add(
      createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        this.publicKey!,
        amount
      )
    );

    await sendAndConfirmTransaction(this.connection, tx, [this.signer!]);

    this.numberOfTokens -= amount;
    this.tokensUpdated$.next(this.numberOfTokens);
  }

}
