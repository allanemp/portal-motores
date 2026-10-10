import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  merge,
  of,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { Motor } from '../../../core/models/motor';
import { MotoresService } from '../../../core/services/motores.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { MotorForm } from '../motor-form/motor-form';
import { MotoresTable } from '../motores-table/motores-table';

// Página "inteligente": orquestra busca, estados de carregamento e ações.
@Component({
  selector: 'app-motores-page',
  imports: [ReactiveFormsModule, MotoresTable, MotorForm],
  templateUrl: './motores-page.html',
  styleUrl: './motores-page.css',
})
export class MotoresPage {
  private readonly motoresService = inject(MotoresService);
  private readonly toast = inject(ToastService);

  readonly busca = new FormControl('', { nonNullable: true });
  readonly motores = signal<Motor[]>([]);
  readonly carregando = signal(true);
  readonly erroCarregamento = signal(false);

  // Estado do formulário: fechado, novo (motor null) ou edição (motor preenchido).
  readonly formularioAberto = signal(false);
  readonly motorEmEdicao = signal<Motor | null>(null);
  readonly excluindoId = signal<number | null>(null);

  // Dispara uma nova consulta com o termo atual (ex.: após salvar ou excluir).
  private readonly recarregar$ = new Subject<void>();

  constructor() {
    const termoDigitado$ = this.busca.valueChanges.pipe(
      map((termo) => termo.trim()),
      debounceTime(300),
      distinctUntilChanged(),
    );

    merge(termoDigitado$, this.recarregar$.pipe(map(() => this.busca.value.trim())))
      .pipe(
        startWith(''),
        tap(() => {
          this.carregando.set(true);
          this.erroCarregamento.set(false);
        }),
        // switchMap cancela a requisição anterior se o usuário continuar digitando.
        switchMap((termo) =>
          this.motoresService.listar(termo).pipe(
            catchError(() => {
              this.erroCarregamento.set(true);
              return of([] as Motor[]);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((motores) => {
        this.motores.set(motores);
        this.carregando.set(false);
      });
  }

  recarregar(): void {
    this.recarregar$.next();
  }

  novo(): void {
    this.motorEmEdicao.set(null);
    this.formularioAberto.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  editar(motor: Motor): void {
    this.motorEmEdicao.set(motor);
    this.formularioAberto.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  fecharFormulario(): void {
    this.formularioAberto.set(false);
    this.motorEmEdicao.set(null);
  }

  aoSalvar(): void {
    this.fecharFormulario();
    this.recarregar();
  }

  excluir(motor: Motor): void {
    const confirmado = window.confirm(`Excluir o motor ${motor.codigo} (${motor.modelo})?\nEssa ação não pode ser desfeita.`);
    if (!confirmado) return;

    this.excluindoId.set(motor.id);
    this.motoresService
      .excluir(motor.id)
      .pipe(finalize(() => this.excluindoId.set(null)))
      .subscribe({
        next: () => {
          this.toast.sucesso(`Motor ${motor.codigo} excluído.`);
          if (this.motorEmEdicao()?.id === motor.id) this.fecharFormulario();
          this.recarregar();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 404) {
            this.toast.erro('Este motor já havia sido excluído.');
            this.recarregar();
          } else {
            this.toast.erro('Não foi possível excluir o motor.');
          }
        },
      });
  }
}
