import { Component } from '@angular/core';
import { MotoresPage } from './features/motores/motores-page/motores-page';
import { ToastContainer } from './shared/toast/toast-container';

@Component({
  selector: 'app-root',
  imports: [MotoresPage, ToastContainer],
  template: `
    <header class="app-header">
      <div class="container">
        <h1>Portal de Motores Elétricos</h1>
      </div>
    </header>
    <main class="container">
      <app-motores-page />
    </main>
    <app-toast-container />
  `,
})
export class App {}
