import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, inject, input, output, signal, untracked } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Fabricante } from '../../../core/models/fabricante';
import { ApiError, FREQUENCIAS, Motor, MotorInput, POLOS } from '../../../core/models/motor';
import { FabricantesService } from '../../../core/services/fabricantes.service';
import { MotoresService } from '../../../core/services/motores.service';
import { ToastService } from '../../../shared/toast/toast.service';

function inteiro(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  if (valor === null || valor === '') return null;
  return Number.isInteger(Number(valor)) ? null : { inteiro: true };
}

// Mesmas regras do back-end, para dar retorno imediato ao usuário.
// (O servidor valida de novo: o front nunca é a única barreira.)
@Component({
  selector: 'app-motor-form',
  imports: [ReactiveFormsModule],
  templateUrl: './motor-form.html',
  styleUrl: './motor-form.css',
})
export class MotorForm {
  private readonly fb = inject(FormBuilder);
  private readonly motoresService = inject(MotoresService);
  private readonly fabricantesService = inject(FabricantesService);
  private readonly toast = inject(ToastService);

  /** Motor em edição; null = cadastro de um novo. */
  readonly motor = input<Motor | null>(null);
  readonly salvo = output<Motor>();
  readonly cancelado = output<void>();

  readonly frequencias = FREQUENCIAS;
  readonly polos = POLOS;
  readonly fabricantes = signal<Fabricante[]>([]);
  readonly carregandoFabricantes = signal(true);
  readonly salvando = signal(false);
  readonly enviado = signal(false);

  readonly form = this.fb.group({
    codigo: ['', [Validators.required, Validators.maxLength(30)]],
    modelo: ['', [Validators.required, Validators.maxLength(80)]],
    fabricante_id: [null as number | null, Validators.required],
    potencia_cv: [null as number | null, [Validators.required, Validators.min(0.01), Validators.max(999999.99)]],
    tensao: ['', [Validators.required, Validators.maxLength(30)]],
    frequencia_hz: [60 as number | null, Validators.required],
    polos: [4 as number | null, Validators.required],
    rotacao_rpm: [null as number | null, [Validators.required, Validators.min(1), Validators.max(100000), inteiro]],
    carcaca: ['', Validators.maxLength(20)],
    grau_protecao: ['', Validators.maxLength(10)],
    preco: [null as number | null, [Validators.min(0), Validators.max(9999999999.99)]],
  });

  constructor() {
    this.fabricantesService
      .listar()
      .pipe(finalize(() => this.carregandoFabricantes.set(false)))
      .subscribe({
        next: (lista) => this.fabricantes.set(lista),
        error: () => this.toast.erro('Não foi possível carregar os fabricantes.'),
      });

    // Sempre que o motor de entrada muda, recarrega o formulário.
    effect(() => {
      const motor = this.motor();
      untracked(() => this.preencher(motor));
    });
  }

  get editando(): boolean {
    return this.motor() !== null;
  }

  salvar(): void {
    this.enviado.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dados = this.paraApi();
    const motor = this.motor();
    const requisicao = motor
      ? this.motoresService.atualizar(motor.id, dados)
      : this.motoresService.criar(dados);

    this.salvando.set(true);
    requisicao.pipe(finalize(() => this.salvando.set(false))).subscribe({
      next: (salvo) => {
        this.toast.sucesso(motor ? 'Motor atualizado com sucesso.' : 'Motor cadastrado com sucesso.');
        this.salvo.emit(salvo);
      },
      error: (err: HttpErrorResponse) => this.tratarErroServidor(err),
    });
  }

  /** Mensagem de erro do campo, ou null se ele estiver válido / ainda não tocado. */
  erro(campo: string): string | null {
    const control = this.form.get(campo);
    if (!control || !control.invalid || !(control.touched || this.enviado())) return null;

    const e = control.errors ?? {};
    if (e['servidor']) return e['servidor'];
    if (e['required']) return 'Campo obrigatório.';
    if (e['maxlength']) return `Máximo de ${e['maxlength'].requiredLength} caracteres.`;
    if (e['inteiro']) return 'Informe um número inteiro.';
    if (e['min']) return campo === 'preco' ? 'Não pode ser negativo.' : 'Deve ser maior que zero.';
    if (e['max']) return `Valor máximo: ${e['max'].max}.`;
    return 'Valor inválido.';
  }

  private preencher(motor: Motor | null): void {
    this.enviado.set(false);
    if (!motor) {
      this.form.reset({ frequencia_hz: 60, polos: 4 });
      return;
    }
    this.form.reset({
      codigo: motor.codigo,
      modelo: motor.modelo,
      fabricante_id: motor.fabricante_id,
      potencia_cv: motor.potencia_cv,
      tensao: motor.tensao,
      frequencia_hz: motor.frequencia_hz,
      polos: motor.polos,
      rotacao_rpm: motor.rotacao_rpm,
      carcaca: motor.carcaca ?? '',
      grau_protecao: motor.grau_protecao ?? '',
      preco: motor.preco,
    });
  }

  // Normaliza os valores do formulário para o formato do contrato da API.
  private paraApi(): MotorInput {
    const v = this.form.getRawValue();
    const textoOuNull = (texto: string | null) => (texto?.trim() ? texto.trim() : null);
    return {
      codigo: v.codigo!.trim(),
      modelo: v.modelo!.trim(),
      fabricante_id: Number(v.fabricante_id),
      potencia_cv: Number(v.potencia_cv),
      tensao: v.tensao!.trim(),
      frequencia_hz: Number(v.frequencia_hz),
      polos: Number(v.polos),
      rotacao_rpm: Number(v.rotacao_rpm),
      carcaca: textoOuNull(v.carcaca),
      grau_protecao: textoOuNull(v.grau_protecao),
      preco: v.preco === null || (v.preco as unknown) === '' ? null : Number(v.preco),
    };
  }

  // Leva os erros do servidor para os campos correspondentes, quando possível.
  private tratarErroServidor(err: HttpErrorResponse): void {
    const corpo = err.error as ApiError | null;

    if (err.status === 409) {
      this.marcarErro('codigo', 'Já existe um motor com este código.');
      this.toast.erro('Código já cadastrado.');
      return;
    }

    if (err.status === 400 && corpo?.details?.length) {
      // As mensagens da API começam pelo nome do campo: "potencia_cv deve ser maior que zero".
      for (const detalhe of corpo.details) {
        this.marcarErro(detalhe.split(' ')[0], detalhe);
      }
      this.toast.erro(corpo.error, corpo.details);
      return;
    }

    if (err.status === 404) {
      this.toast.erro('Este motor não existe mais. Atualize a lista.');
      return;
    }

    this.toast.erro(err.status === 0 ? 'API indisponível. Tente novamente.' : 'Erro ao salvar o motor.');
  }

  private marcarErro(campo: string, mensagem: string): void {
    const control = this.form.get(campo);
    if (!control) return;
    control.setErrors({ ...control.errors, servidor: mensagem });
    control.markAsTouched();
  }
}
