import { Component } from '@angular/core';
import { MotoresPage } from './features/motores/motores-page/motores-page';

@Component({
  selector: 'app-root',
  imports: [MotoresPage],
  template: `
    <header class="app-header">
      <div class="container">
        <h1>Portal de Motores Elétricos</h1>
      </div>
    </header>
    <main class="container">
      <app-motores-page />
    </main>
  `,
})
export class App {}
