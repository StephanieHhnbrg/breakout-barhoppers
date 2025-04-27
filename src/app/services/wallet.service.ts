import { Injectable } from '@angular/core';
import { Observable, Subject, Subscription} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class WalletService {

  private tokensUpdated$ = new Subject<number>();
  private numberOfTokens = 0;
  constructor() { }


  public getTokensUpdatedObservable(): Observable<number> {
    return this.tokensUpdated$.asObservable();
  }

  public getNumberOfTokens(): Observable<number> {
    this.numberOfTokens = 130;
    this.tokensUpdated$.next(this.numberOfTokens);
    return this.getTokensUpdatedObservable();
  }

  public addTokens(tokens: number): Subscription {
    this.numberOfTokens += tokens;
    this.tokensUpdated$.next(this.numberOfTokens);
    return new Subscription();
  }
}
