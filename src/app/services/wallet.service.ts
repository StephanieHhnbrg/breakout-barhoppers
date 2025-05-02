import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair, Transaction,
} from '@solana/web3.js';
import {
  createAssociatedTokenAccountInstruction,
  createMint, getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from '@solana/spl-token';
import {Metaplex,keypairIdentity } from '@metaplex-foundation/js';
import {environment} from '../../environments/environment';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';


@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private connection: Connection;
  private publicKey: PublicKey | null = null;
  private payer = Keypair.generate();

  private metaplex: Metaplex | null = null;
  private mintAddress = new PublicKey(environment.mintAddressB58);
  private walletConnected$ = new BehaviorSubject<boolean>(false);
  private tokensUpdated$ = new BehaviorSubject<number>(0);
  private numberOfTokens = 0;

  private readonly TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
  private readonly NFT_URL = "https://raw.githubusercontent.com/StephanieHhnbrg/breakout-barhoppers/refs/heads/main/src/assets/";

  constructor() {
    this.connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    // this.connection = new Connection(`https://devnet.helius-rpc.com/?api-key=${environment.heliusApiKey}`, 'confirmed');
  }

  public async connectWallet(walletAddress: string) {
    this.publicKey = new PublicKey(walletAddress);
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

  async fetchNFTsByOwner(): Promise<any[]> {
    if (!this.metaplex || !this.publicKey) {
      throw new Error('Wallet not connected');
    }

    return await this.metaplex!.nfts().findAllByOwner({ owner: this.publicKey! });
  }

  async fetchTokenAccountsByOwner(): Promise<any> {
    if (!this.publicKey) {
      return [];
    }

    const tokens = await this.connection.getParsedTokenAccountsByOwner(this.publicKey, {
      programId: new PublicKey(this.TOKEN_PROGRAM_ID),
    });
    console.log("tokens: ");
    console.log(tokens.value);
    return tokens.value;
  }

  public async createQuestNft() {
    this.createNFT("Quest Explorer", this.NFT_URL + "nft_quests.png");
  }

  public async createBarNft() {
    this.createNFT("Pub Pioneer", this.NFT_URL + "nft_bars.png");
  }

  public async createFriendsNft() {
    this.createNFT("Social Butterflyrw", this.NFT_URL + "nft_friends.png");
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

}
