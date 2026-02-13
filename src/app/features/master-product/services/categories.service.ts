import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PageResponse } from '../response/PageResponse';
import { MasterProductDTO, Repository, Location } from '../model/product.model';
import { ProductSearchParams } from '../request/ProductSearchRequest';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getCategoriesByType(categoryType: string): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/categories`, {
      params: { categoryType }
    }).pipe(
      map(response => response.content || [])
    );
  }
}
