import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  template: `
    <div class="toasts" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class.toast-erro]="toast.tipo === 'erro'" role="status">
          <div class="body">
            <strong>{{ toast.mensagem }}</strong>
            @if (toast.detalhes?.length) {
              <ul>
                @for (d of toast.detalhes; track $index) {
                  <li>{{ d }}</li>
                }
              </ul>
            }
          </div>
          <button type="button" class="close" aria-label="Fechar" (click)="toastService.fechar(toast.id)">×</button>
        </div>
      }
    </div>
  `,
  styles: `
    .toasts {
      position: fixed;
      top: 1rem;
      right: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      z-index: 1000;
      max-width: min(380px, calc(100vw - 2rem));
    }
    .toast {
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      color: #fff;
      background: var(--success);
      box-shadow: 0 4px 12px rgb(0 0 0 / 0.15);
    }
    .toast-erro {
      background: var(--danger);
    }
    .body {
      flex: 1;
    }
    ul {
      margin: 0.35rem 0 0;
      padding-left: 1.1rem;
      font-size: 0.875rem;
    }
    .close {
      background: none;
      border: none;
      color: inherit;
      font-size: 1.25rem;
      line-height: 1;
      cursor: pointer;
    }
  `,
})
export class ToastContainer {
  protected readonly toastService = inject(ToastService);
}
