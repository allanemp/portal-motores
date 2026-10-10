import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Motor, MotorInput } from '../models/motor';

// Único ponto do front que conhece as rotas de /motores.
@Injectable({ providedIn: 'root' })
export class MotoresService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/motores`;

  listar(search = ''): Observable<Motor[]> {
    const params = search ? new HttpParams().set('search', search) : undefined;
    return this.http.get<Motor[]>(this.url, { params });
  }

  buscar(id: number): Observable<Motor> {
    return this.http.get<Motor>(`${this.url}/${id}`);
  }

  criar(motor: MotorInput): Observable<Motor> {
    return this.http.post<Motor>(this.url, motor);
  }

  atualizar(id: number, motor: MotorInput): Observable<Motor> {
    return this.http.put<Motor>(`${this.url}/${id}`, motor);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
