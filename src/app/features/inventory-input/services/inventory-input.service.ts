import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResponse } from '../../master-product/response/PageResponse';
import { InventoryInputDTO, InventoryInputPlanResponse, InventoryInputActualResponse, InventoryInputSearchParams, InventoryInputCorrectionResponse } from '../models/inventory-input.model';
import { Product, Repository } from '../../master-product/model/product.model';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class InventoryInputService {
    private apiUrl = environment.apiUrl;

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

    getInventoryInputActualById(id: number): Observable<InventoryInputActualResponse> {
        return this.http.get<InventoryInputActualResponse>(`${this.apiUrl}/inventory-input/inventory-input-actual/${id}`);
    }

    getInventoryInputCorrectionById(id: number): Observable<InventoryInputCorrectionResponse> {
        return this.http.get<InventoryInputCorrectionResponse>(`${this.apiUrl}/inventory-input/inventory-input-correction/${id}`);
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

    getDeliveryDestinations(limit: number = 100): Observable<any> {
        return this.http.get(`${this.apiUrl}/delivery-destinations`, {
            params: { page: '0', limit: limit.toString() }
        });
    }
    getSupplierDestinations(limit: number = 100): Observable<any> {
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

    createInventoryInputPlan(data: InventoryInputPlanResponse): Observable<any> {
        return this.http.post(`${this.apiUrl}/inventory-input/inventory-input-plan`, data);
    }

    updateInventoryInputPlan(id: number, data: InventoryInputPlanResponse): Observable<any> {
        return this.http.put(`${this.apiUrl}/inventory-input/inventory-input-plan/${id}`, data);
    }

    deleteInventoryInputPlan(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/inventory-input/inventory-input-plan/${id}`);
    }

    createInventoryInputActual(data: InventoryInputActualResponse): Observable<any> {
        return this.http.post(`${this.apiUrl}/inventory-input/inventory-input-actual`, data);
    }

    updateInventoryInputActual(id: number, data: InventoryInputActualResponse): Observable<any> {
        return this.http.put(`${this.apiUrl}/inventory-input/inventory-input-actual/${id}`, data);
    }

    deleteInventoryInputActual(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/inventory-input/inventory-input-actual/${id}`);
    }

    updateInventoryInputCorrection(id: number, data: InventoryInputCorrectionResponse): Observable<any> {
        return this.http.put(`${this.apiUrl}/inventory-input/inventory-input-correction/${id}`, data);
    }

    updateInventoryInputStatus(id: number, isClosed: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/inventory-input/inventory-input/status/${id}`, { isClosed });
    }
}
