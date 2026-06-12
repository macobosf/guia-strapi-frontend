import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Tarea } from '../models/tarea';

interface StrapiListResponse<T> {
  data: T[];
  meta: any;
}

interface StrapiSingleResponse<T> {
  data: T;
  meta: any;
}

@Injectable({
  providedIn: 'root'
})
export class TareaService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.strapiUrl}/tareas`;

  getAll(): Observable<Tarea[]> {
    return this.http
      .get<StrapiListResponse<Tarea>>(`${this.baseUrl}?sort=createdAt:desc`)
      .pipe(map(res => res.data));
  }

  create(tarea: Partial<Tarea>): Observable<Tarea> {
    return this.http
      .post<StrapiSingleResponse<Tarea>>(this.baseUrl, { data: tarea })
      .pipe(map(res => res.data));
  }

  update(documentId: string, tarea: Partial<Tarea>): Observable<Tarea> {
    return this.http
      .put<StrapiSingleResponse<Tarea>>(`${this.baseUrl}/${documentId}`, { data: tarea })
      .pipe(map(res => res.data));
  }

  delete(documentId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${documentId}`);
  }
}