import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Fabricante } from '../models/fabricante';

@Injectable({ providedIn: 'root' })
export class FabricantesService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/fabricantes`;

  listar(): Observable<Fabricante[]> {
    return this.http.get<Fabricante[]>(this.url);
  }
}
