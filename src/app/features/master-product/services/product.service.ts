import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { PageResponse } from '../response/PageResponse';

export interface Product {
  productId?: number;
  productCode?: string;
  name1?: string;
  isSet?: string;
  upcCd1?: string;
  upcCd2?: string;
  standardInfo?: string;
  name2?: string;
  name3?: string;
  name4?: string;
  name5?: string;
  categoryCode1?: string;
  freeItem1?: string | null;
  categoryCode2?: string;
  freeItem2?: string | null;
  categoryCode3?: string;
  freeItem3?: string | null;
  categoryCode4?: string;
  freeItem4?: string | null;
  categoryCode5?: string;
  freeItem5?: string | null;
  repositoryId?: number | null;
  locationId?: number | null;
  fifoType?: string | null;
  isDateTimeMng?: string | null;
  isNumberMng?: string | null;
  isPackCsInput?: string | null;
  isPackCsOutput?: string | null;

  companyId?: number;
  notes?: string | null;
  dateTimeMngType?: string;
  cartonWeight?: number;
  cartonWeightName?: string;
  cartonVolume?: number;
  cartonVolumeName?: string;
  cartonVertical?: number;
  cartonHorizontal?: number;
  cartonHigh?: number;
  pieceWeight?: number;
  pieceWeightName?: string | null;
  pieceVolume?: number;
  pieceVolumeName?: string | null;
  pieceVertical?: number;
  pieceHorizontal?: number;
  pieceHigh?: number;
  packCsUnitCode?: string;
  packCsAmount?: number;
  isPackBlInput?: string | null;
  isPackBlOutput?: string | null;
  packBlUnitCode?: string;
  packBlAmount?: number;
  isPieceInput?: string | null;
  isPieceOutput?: string | null;
  pieceUnitCode?: string;
  isReplenishMng?: string;
  minInventoryQuantity?: number | null;
  minInputQuantity?: number | null;
  isVarious?: string;
  supplierId?: number;
  leadTime?: number;
  tax?: string;


}


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api/master-product';

  constructor(private http: HttpClient) { }

  getProducts(page: number, limit: number) {
    return this.http.get<PageResponse<Product>>(this.apiUrl, {
      params: {
        page,
        limit
      }
    }).pipe(
      map(response => response.content)
    );
  }


  loadMoreProducts(page: number, size: number): Observable<Product[]> {
    return this.http.get<PageResponse<Product>>(this.apiUrl, {
      params: {
        page: page.toString(),
        limit: size.toString()
      }
    }).pipe(
      map(response => response.content)
    );
  }
}
