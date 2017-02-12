import {
  Component,
  PipeTransform,
  Injectable,
  Pipe,
  animate,
  transition,
  style,
  trigger,
  ChangeDetectorRef,
  state
} from '@angular/core';
import {NavController, ModalController, ViewController, NavParams, Platform} from 'ionic-angular';
import {Storage} from '@ionic/storage/es2015/storage';
import {RevertService} from './revert.service';

@Component({
  selector: 'quixx',
  templateUrl: 'quixx.html',
  animations: [
    trigger('state', [
      state('true', style({
        backgroundColor: 'black',
        color: 'white'})),
      transition('* => void', animate('400ms', style({
        transform: 'translateX(-100%)',
        opacity: 0
      }))),
      transition('0 => 1', animate('400ms', style({
        backgroundColor: 'black',
        color: 'white'
      }))),
    ]),
    trigger('lineFinished', [
      state('true', style({
        backgroundColor: 'gray',
        color: 'white'})),
    ]),
  ]
})
export class QuixxPage {

  public players: Array<Player> = [];
  public gameFinished :boolean = false;
  constructor(public navCtrl: NavController, public modalController: ModalController, public platform: Platform,
              public storage: Storage, public changeDetectorRef: ChangeDetectorRef) {
    platform.backButton.subscribe(() => {
      storage.set('quixx', JSON.stringify(this.players));
    });
    platform.pause.subscribe(() => {
      storage.set('quixx', JSON.stringify(this.players));
    });
    platform.resume.subscribe(() => {
      this.players = [];
      storage.get('quixx').then((arr: any ) => JSON.parse(arr).forEach((player: Player) => this.players.push(Player.revive(player))));
    });
    storage.get('quixx').then((players: any ) => {
      this.players = [];
      if(players){
        JSON.parse(players).forEach((player: Player) => this.players.push(Player.revive(player)));
      }
      if(this.players.length == 0){
        let thomas = new PlayerFactory().createPlayer("Thomas");
        thomas.green.elements[0].toggleSelect();
        thomas.green.elements[2].toggleSelect();
        thomas.green.elements[3].toggleSelect();
        thomas.green.elements[4].toggleSelect();
        thomas.green.elements[5].toggleSelect();
        this.players.push(thomas);
        let rebecca = new PlayerFactory().createPlayer("Rebecca");
        rebecca.green.elements[0].toggleSelect();
        rebecca.blue.elements[6].toggleSelect();
        rebecca.blue.elements[7].toggleSelect();
        rebecca.yellow.elements[2].toggleSelect();
        this.players.push(rebecca);
      }
    }).catch((err) => {
      this.players = [];
      storage.remove('quixx');
    });
  }

  public reset() {
    let tmpPlayers = [];
    this.players.forEach((player: Player) => tmpPlayers.push(new PlayerFactory().createPlayer(player.name)));
    this.players = tmpPlayers;
    this.gameFinished = false;
    RevertService.getInstance().reset();
  }

  public addPlayer() {
    this.players.push(new PlayerFactory().createPlayer('Player ' + (this.players.length + 1)));
  }

  public removePlayer(player: Player) {
    this.players.splice(this.players.indexOf(player), 1);
  }

  public openModal(quixxLine: QuixxLine) {
    let modal = this.modalController.create(QuixxLineModalContentPage, quixxLine, {
        showBackdrop: false,
        enableBackdropDismiss: true
      }
    );
    modal.present();
  }

  public isRedFinished(): boolean {
    return this.players.some((player) => player.red.getMaxSelectedIndex() == 10);
  }

  public isYellowFinished(): boolean {
    return this.players.some((player) => player.yellow.getMaxSelectedIndex() == 10);
  }

  public isGreenFinished(): boolean {
    return this.players.some((player) => player.green.getMaxSelectedIndex() == 10);
  }

  public isBlueFinished(): boolean {
    return this.players.some((player) => player.blue.getMaxSelectedIndex() == 10);
  }

  private numberOfFinishedLines(): number {
    return (this.isRedFinished()?1:0) + (this.isYellowFinished()?1:0) + (this.isGreenFinished()?1:0) + (this.isBlueFinished()?1:0);
  }

  public isGameFinished(): boolean {
    return this.gameFinished || this.numberOfFinishedLines() >=2 || this.players.some((player) => player.faults.every((fault) => fault));
  }

  public undo(){
    RevertService.getInstance().undo();
  }
}

export class PlayerFactory {
  public createPlayer(name: string): Player {
    let lineFactory = new QuixxLineFactory();
    return new Player(name, lineFactory.createRedLine(), lineFactory.createYellowLine(), lineFactory.createGreenLine(),
      lineFactory.createBlueLine(), [false, false, false, false]);
  }
}

export class QuixxLineFactory {

  public createRedLine(): QuixxLine{
    let elements = [];
    [2,3,4,5,6,7,8,9,10,11,12].forEach((num) => elements.push(new QuixxElement(num, false)));
    return new QuixxLine('#fbb6b6', elements);
  }

  public createYellowLine(): QuixxLine{
    let elements = [];
    [2,3,4,5,6,7,8,9,10,11,12].forEach((num) => elements.push(new QuixxElement(num, false)));
    return new QuixxLine('lightyellow', elements);
  }

  public createGreenLine(): QuixxLine{
    let elements = [];
    [2,3,4,5,6,7,8,9,10,11,12].reverse().forEach((num) => elements.push(new QuixxElement(num, false)));
    return new QuixxLine('lightgreen', elements);
  }

  public createBlueLine(): QuixxLine{
    let elements = [];
    [2,3,4,5,6,7,8,9,10,11,12].reverse().forEach((num) => elements.push(new QuixxElement(num, false)));
    return new QuixxLine('lightblue', elements);
  }

}

export class Player {

  constructor(public name: string, public red: QuixxLine, public yellow: QuixxLine, public green: QuixxLine,
    public blue: QuixxLine, public faults: Array<boolean>){
  }

  public static revive(data: any): Player {
    return new Player(data.name, QuixxLine.revive(data.red), QuixxLine.revive(data.yellow), QuixxLine.revive(data.green),
      QuixxLine.revive(data.blue), data.faults);
  }

  public getPoints = (): number => this.red.getPoints() + this.yellow.getPoints() + this.green.getPoints() + this.blue.getPoints() + this.faults.map((fault) => (fault)? -5: 0).reduce((prev, next) => prev + next);
  public hasBonus = (): boolean => this.getPoints() >= 63;
}

@Component({
  template: `
<ion-header>
  <ion-navbar [style.background-color]="quixxLine.name">
    <ion-buttons end>
      <button ion-button (click)="dismiss()">
        <ion-icon name="md-close"></ion-icon>
      </button>
    </ion-buttons>
  </ion-navbar>
</ion-header>
<ion-content [style.background-color]="quixxLine.name">
  <button ion-button *ngFor="let element of quixxLine.elements; let lst = last" (click)="element.toggleSelect(); dismiss()" [outline]="!element.isSelected" color="dark" [disabled]="quixxLine.isDisabled(element) || (lst && quixxLine.getNumberOfSelectedElements() < 5)">
    {{element.getValue()}}
  </button>
</ion-content>
`
})
export class QuixxLineModalContentPage {
  quixxLine;

  constructor(
    public platform: Platform,
    public params: NavParams,
    public viewCtrl: ViewController
  ) {
    this.quixxLine= this.params.data;
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}

@Pipe({
  name: 'elementFilter',
  pure: false
})
@Injectable()
export class QuixxElementFilterPipe implements PipeTransform {
  transform(items: QuixxElement[], startNumber: number): any {
    // filter items array, items which match and return true will be kept, false will be filtered out
    return items.filter((item, index) => index > startNumber);
    //return items.filter((item, index) => index > startNumber && index < (startNumber + 5));
  }
}

export class QuixxLine {
  constructor(public name: string, public elements: Array<QuixxElement>){
  }
  public getNumberOfSelectedElements = (): number => this.elements.filter((element) => element.isSelected).length;
  public getPoints = (): number => this.elements.filter((element) => element.isSelected).map((element, index) => index + 1).reduce((prev, next) => prev+next, 0) + ((this.elements[this.elements.length -1].isSelected) ? this.getNumberOfSelectedElements() + 1 : 0);
  public getMaxSelectedIndex(): number {
    let element = this.elements.reduce((prev, next) => (next.isSelected)?next: prev);
    if(element.isSelected){
      return this.elements.indexOf(element);
    } else {
      return -1;
    }
  }
  public isDisabled = (quixxElement: QuixxElement): boolean => {
    let element = this.elements.reduce((prev, next) => (next.isSelected)?next: prev);
    return this.elements.indexOf(quixxElement) < this.elements.indexOf(element);
  };
  public getColorClass = (): string => 'quixx-background-' + this.name;
  public static revive(data: any): QuixxLine{
    let elementsTmp = [];
    data.elements.forEach((element: any) => elementsTmp.push(QuixxElement.revive(element)));
    return new QuixxLine(data.name, elementsTmp);
  }
}

export class QuixxElement {
  constructor(public num: number, public isSelected: boolean){
  }

  public toggleSelect (): void {
    this.isSelected = !this.isSelected;
    RevertService.getInstance().push(this);
  };
  public undoToggleSelect(): void {
    this.isSelected = !this.isSelected;
  };
  public getValue = (): number => this.num;

  public static revive(data: any): QuixxElement {
    return new QuixxElement(data.num, data.isSelected);
  }
}
