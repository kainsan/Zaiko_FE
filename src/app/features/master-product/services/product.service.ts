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
export class ProductService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  getProducts(page: number, limit: number): Observable<PageResponse<MasterProductDTO>> {
    return this.http.get<PageResponse<MasterProductDTO>>(this.apiUrl + '/master-product', {
      params: {
        page,
        limit
      }
    });
  }

  searchProducts(searchParams: ProductSearchParams): Observable<PageResponse<MasterProductDTO>> {
    let params = new HttpParams();
    if (searchParams.productCodeFrom) params = params.set('productCodeFrom', searchParams.productCodeFrom);
    if (searchParams.productCodeTo) params = params.set('productCodeTo', searchParams.productCodeTo);
    if (searchParams.name1) params = params.set('name1', searchParams.name1);
    if (searchParams.upcCd1) params = params.set('upcCd1', searchParams.upcCd1);
    if (searchParams.upcCd2) params = params.set('upcCd2', searchParams.upcCd2);
    if (searchParams.categoryCode1) params = params.set('categoryCode1', searchParams.categoryCode1);
    if (searchParams.categoryCode2) params = params.set('categoryCode2', searchParams.categoryCode2);
    if (searchParams.categoryCode3) params = params.set('categoryCode3', searchParams.categoryCode3);
    if (searchParams.categoryCode4) params = params.set('categoryCode4', searchParams.categoryCode4);
    if (searchParams.categoryCode5) params = params.set('categoryCode5', searchParams.categoryCode5);
    if (searchParams.repositoryId) params = params.set('repositoryId', searchParams.repositoryId);
    if (searchParams.locationId) params = params.set('locationId', searchParams.locationId);
    if (searchParams.isSet) params = params.set('isSet', searchParams.isSet);
    if (searchParams.page) params = params.set('page', searchParams.page);
    if (searchParams.pageSize) params = params.set('pageSize', searchParams.pageSize);

    return this.http.get<PageResponse<MasterProductDTO>>(this.apiUrl + '/master-product/search', { params });
  }

  loadMoreProducts(searchParams: ProductSearchParams): Observable<PageResponse<MasterProductDTO>> {
    let params = new HttpParams();
    if (searchParams.productCodeFrom) params = params.set('productCodeFrom', searchParams.productCodeFrom);
    if (searchParams.productCodeTo) params = params.set('productCodeTo', searchParams.productCodeTo);
    if (searchParams.name1) params = params.set('name1', searchParams.name1);
    if (searchParams.upcCd1) params = params.set('upcCd1', searchParams.upcCd1);
    if (searchParams.upcCd2) params = params.set('upcCd2', searchParams.upcCd2);
    if (searchParams.categoryCode1) params = params.set('categoryCode1', searchParams.categoryCode1);
    if (searchParams.categoryCode2) params = params.set('categoryCode2', searchParams.categoryCode2);
    if (searchParams.categoryCode3) params = params.set('categoryCode3', searchParams.categoryCode3);
    if (searchParams.categoryCode4) params = params.set('categoryCode4', searchParams.categoryCode4);
    if (searchParams.categoryCode5) params = params.set('categoryCode5', searchParams.categoryCode5);
    if (searchParams.repositoryId) params = params.set('repositoryId', searchParams.repositoryId);
    if (searchParams.locationId) params = params.set('locationId', searchParams.locationId);

    return this.http.get<PageResponse<MasterProductDTO>>(this.apiUrl, {
      params: {
        ...params,
        page: searchParams.page?.toString() || '0',
        pageSize: searchParams.pageSize?.toString() || '50'
      }
    });
  }

  getProductById(productId: number): Observable<MasterProductDTO> {
    return this.http.get<MasterProductDTO>(`${this.apiUrl}/master-product/${productId}`);
  }

  getUnitNames(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/unit-name`).pipe(
      map(response => response.content || [])
    );
  }

  updateProduct(productId: number, productData: any): Observable<any> {
    console.log(productData);
    return this.http.post(`${this.apiUrl}/master-product/${productId}`, productData);
  }
}
