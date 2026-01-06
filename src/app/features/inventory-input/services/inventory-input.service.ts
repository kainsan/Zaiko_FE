import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResponse } from '../../master-product/response/PageResponse';
import { InventoryInputDTO, InventoryInputSearchParams } from '../models/inventory-input.model';

@Injectable({
    providedIn: 'root'
})
export class InventoryInputService {
    private apiUrl = 'http://localhost:8080/api';

    constructor(private http: HttpClient) { }

    getInventoryInputs(page: number, limit: number): Observable<PageResponse<InventoryInputDTO>> {
        return this.http.get<PageResponse<InventoryInputDTO>>(this.apiUrl + '/inventory-input', {
            params: {
                page: page.toString(),
                limit: limit.toString()
            }
        });
    }

    searchInventoryInputs(searchParams: InventoryInputSearchParams): Observable<PageResponse<InventoryInputDTO>> {
        let params = new HttpParams();

        Object.entries(searchParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '' && value !== 'ALL') {
                params = params.set(key, value.toString());
            }
        });

        return this.http.get<PageResponse<InventoryInputDTO>>(`${this.apiUrl}/inventory-input/search`, { params });
    }

    downloadCsv(searchParams: InventoryInputSearchParams): Observable<Blob> {
        let params = new HttpParams();

        Object.entries(searchParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '' && value !== 'ALL') {
                params = params.set(key, value.toString());
            }
        });

        return this.http.get(`${this.apiUrl}/inventory-input/download-csv`, {
            params,
            responseType: 'blob'
        });
    }
}
