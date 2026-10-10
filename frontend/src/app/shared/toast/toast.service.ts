import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  tipo: 'sucesso' | 'erro';
  mensagem: string;
  detalhes?: string[];
}

// Avisos visuais globais. Qualquer componente pode chamar sucesso()/erro().
@Injectable({ providedIn: 'root' })
export class ToastService {
  private proximoId = 1;
  readonly toasts = signal<Toast[]>([]);

  sucesso(mensagem: string): void {
    this.adicionar({ tipo: 'sucesso', mensagem });
  }

  erro(mensagem: string, detalhes?: string[]): void {
    this.adicionar({ tipo: 'erro', mensagem, detalhes }, 6000);
  }

  fechar(id: number): void {
    this.toasts.update((lista) => lista.filter((t) => t.id !== id));
  }

  private adicionar(toast: Omit<Toast, 'id'>, duracaoMs = 3500): void {
    const id = this.proximoId++;
    this.toasts.update((lista) => [...lista, { ...toast, id }]);
    setTimeout(() => this.fechar(id), duracaoMs);
  }
}
