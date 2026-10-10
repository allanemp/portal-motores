import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Motor } from '../../../core/models/motor';

// Componente de apresentação: só exibe a lista e emite eventos.
// Não sabe buscar, salvar nem excluir (quem decide é a página).
@Component({
  selector: 'app-motores-table',
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './motores-table.html',
  styleUrl: './motores-table.css',
})
export class MotoresTable {
  readonly motores = input.required<Motor[]>();
  readonly excluindoId = input<number | null>(null);

  readonly editar = output<Motor>();
  readonly excluir = output<Motor>();
}
