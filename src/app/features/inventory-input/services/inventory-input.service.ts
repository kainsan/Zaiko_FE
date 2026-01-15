import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResponse } from '../../master-product/response/PageResponse';
import { InventoryInputDTO, InventoryInputPlanResponse, InventoryInputSearchParams } from '../models/inventory-input.model';
import { Product, Repository } from '../../master-product/model/product.model';

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

    getInventoryInputById(id: number): Observable<InventoryInputPlanResponse> {
        return this.http.get<InventoryInputPlanResponse>(`${this.apiUrl}/inventory-input/inventory-input-plan/${id}`);
    }

    searchInventoryInputs(searchParams: InventoryInputSearchParams): Observable<PageResponse<InventoryInputDTO>> {
        const page = searchParams.page ?? 0;
        const limit = searchParams.pageSize ?? 50;

        const body: Record<string, any> = {};

        Object.entries(searchParams).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '' || value === 'ALL' || key === 'page' || key === 'pageSize') {
                return;
            }

            body[key] =
                value instanceof Date ? value.toISOString().substring(0, 10) : value; // yyyy-MM-dd
        });

        return this.http.post<PageResponse<InventoryInputDTO>>(
            `${this.apiUrl}/inventory-input/search`,
            body,
            {
                params: {
                    page: String(page),
                    limit: String(limit)
                }
            }
        );
    }

    // downloadCsv(searchParams: InventoryInputSearchParams): Observable<Blob> {
    //     const params: any = {};

    //     for (const key in searchParams) {
    //         const value = (searchParams as any)[key];
    //         if (value !== undefined && value !== null && value !== '' && value !== 'ALL') {
    //             params[key] = value;
    //         }
    //     }

    //     return this.http.get(`${this.apiUrl}/inventory-input/download-csv`, {
    //         params,
    //         responseType: 'blob'
    //     });
    // }

    getDeliveryDestinations(limit: number = 100): Observable<any> {
        return this.http.get(`${this.apiUrl}/delivery-destinations`, {
            params: { page: '0', limit: limit.toString() }
        });
    }
    getSupplierDestinations(limit: number = 100): Observable<any>{
       return this.http.get(`${this.apiUrl}/supplier-delivery-destinations`, {
            params: { page: '0', limit: limit.toString() }
        });
    }

    getCustomers(limit: number = 100): Observable<any> {
        return this.http.get(`${this.apiUrl}/customers`, {
            params: { page: '0', limit: limit.toString() }
        });
    }

    getProducts(limit: number = 100): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/master-product`, {
            params: { page: '0', limit: limit.toString() }
        });
    }

    getSuppliers(limit: number = 100): Observable<any> {
        return this.http.get(`${this.apiUrl}/suppliers`, {
            params: { page: '0', limit: limit.toString() }
        });
    }

    getRepositories(): Observable<Repository[]> {
        return this.http.get<Repository[]>(`${this.apiUrl}/repositories`);
    }

}
