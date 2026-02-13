import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResponse } from '../../master-product/response/PageResponse';
import { InventoryOutputListItem, InventoryOutputPlanResponse, InventoryOutputActualResponse, InventoryOutputSearchParams, InventoryOutputCorrectionResponse } from '../models/inventory-output.model';
import { Product, Repository } from '../../master-product/model/product.model';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class InventoryOutputService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getInventoryOutputs(page: number, limit: number): Observable<PageResponse<InventoryOutputListItem>> {
        return this.http.get<PageResponse<InventoryOutputListItem>>(this.apiUrl + '/inventory-output', {
            params: {
                page: page.toString(),
                limit: limit.toString()
            }
        });
    }

    getInventoryOutputById(id: number): Observable<InventoryOutputPlanResponse> {
        return this.http.get<InventoryOutputPlanResponse>(`${this.apiUrl}/inventory-output/inventory-output-plan/${id}`);
    }

    getInventoryOutputActualById(id: number): Observable<InventoryOutputActualResponse> {
        return this.http.get<InventoryOutputActualResponse>(`${this.apiUrl}/inventory-output/inventory-output-actual/${id}`);
    }

    getInventoryOutputCorrectionById(id: number): Observable<InventoryOutputCorrectionResponse> {
        return this.http.get<InventoryOutputCorrectionResponse>(`${this.apiUrl}/inventory-output/inventory-output-correction/${id}`);
    }

    searchInventoryOutputs(searchParams: InventoryOutputSearchParams): Observable<PageResponse<InventoryOutputListItem>> {
        const page = searchParams.page ?? 0;
        const limit = searchParams.pageSize ?? 50;

        const body: Record<string, any> = {};

        Object.entries(searchParams).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '' || value === 'ALL' || key === 'page' || key === 'pageSize') {
                return;
            }

            body[key] =
                value instanceof Date ? value.toISOString().substring(0, 10) : value;
        });

        return this.http.post<PageResponse<InventoryOutputListItem>>(
            `${this.apiUrl}/inventory-output/search`,
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

    getRoutes(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/routes`);
    }

    getCourses(params: { routeCode: string }): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/courses`, { params });
    }

    createInventoryOutputPlan(data: InventoryOutputPlanResponse): Observable<any> {
        return this.http.post(`${this.apiUrl}/inventory-output/inventory-output-plan`, data);
    }

    updateInventoryOutputPlan(id: number, data: InventoryOutputPlanResponse): Observable<any> {
        return this.http.put(`${this.apiUrl}/inventory-output/inventory-output-plan/${id}`, data);
    }

    deleteInventoryOutputPlan(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/inventory-output/inventory-output-plan/${id}`);
    }

    createInventoryOutputActual(data: InventoryOutputActualResponse): Observable<any> {
        return this.http.post(`${this.apiUrl}/inventory-output/inventory-output-actual`, data);
    }

    updateInventoryOutputActual(id: number, data: InventoryOutputActualResponse): Observable<any> {
        return this.http.put(`${this.apiUrl}/inventory-output/inventory-output-actual/${id}`, data);
    }

    deleteInventoryOutputActual(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/inventory-output/inventory-output-actual/${id}`);
    }

    updateInventoryOutputCorrection(id: number, data: InventoryOutputCorrectionResponse): Observable<any> {
        return this.http.put(`${this.apiUrl}/inventory-output/inventory-output-correction/${id}`, data);
    }

    updateInventoryOutputStatus(id: number, isClosed: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/inventory-output/inventory-output/status/${id}`, { isClosed });
    }
}
