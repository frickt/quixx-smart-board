import {Injectable} from '@angular/core';
import {QuixxElement} from './quixx';

@Injectable()
export class RevertService {
  private stack: Array<QuixxElement> = [];
  private static instance: RevertService = new RevertService();

  private constructor( ) {
  }

  public static getInstance(): RevertService {
    return this.instance;
  }

  push(quixxElement: QuixxElement) {
    this.stack.push(quixxElement);
  }

  undo(): void {
    if(this.stack.length > 0){
      this.stack.pop().undoToggleSelect();
    }
  }

  reset() {
    this.stack = [];
  }
}
