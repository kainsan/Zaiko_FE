import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PageResponse } from '../response/PageResponse';
import { MasterProductDTO, Repository, Location } from '../model/product.model';
import { ProductSearchParams } from '../request/ProductSearchRequest';

@Injectable({
  providedIn: 'root'
})
export class RepositoriesService {
  private apiUrl = 'http://localhost:8080/api';
  constructor(private http: HttpClient) { }


  getRepositories(): Observable<Repository[]> {
    return this.http.get<Repository[]>(`${this.apiUrl}/repositories`);
  }

  getLocationsByRepository(repositoryId: number): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.apiUrl}/repositories/${repositoryId}/locations`);
  }


}
