import {NgModule, ErrorHandler} from '@angular/core';
import {IonicApp, IonicModule, IonicErrorHandler} from 'ionic-angular';
import {MyApp} from './app.component';
import {QuixxPage, QuixxElementFilterPipe, QuixxLineModalContentPage} from '../pages/quixx/quixx';
import {Storage} from '@ionic/storage/es2015/storage';

@NgModule({
  declarations: [
    MyApp,
    QuixxPage,
    QuixxLineModalContentPage,
    QuixxElementFilterPipe
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    QuixxPage,
    QuixxLineModalContentPage
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}, Storage]
})
export class AppModule {}
