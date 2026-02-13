import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PageResponse } from '../response/PageResponse';
import { MasterProductDTO, Repository, Location, Supplier } from '../model/product.model';
import { ProductSearchParams } from '../request/ProductSearchRequest';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SupplierService {
    private apiUrl = environment.apiUrl;
    constructor(private http: HttpClient) { }

    getSuppliers(): Observable<PageResponse<Supplier>> {
        return this.http.get<PageResponse<Supplier>>(`${this.apiUrl}/suppliers`, {
            params: {
                page: 0,
                size: 100
            }
        }).pipe(map((res: any) => res.content));
    }
    searchSupplierById(id: number): Observable<Supplier> {
        return this.http.get<Supplier>(`${this.apiUrl}/supplier/${id}`);
    }
}