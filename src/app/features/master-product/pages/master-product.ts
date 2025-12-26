import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SearchProductComponent } from '../components/search-component/search-product.component';
import { ListProductComponent, ProductType } from '../components/list-product-component/list-product.component';
import { ProductSearchParams } from '../request/ProductSearchRequest';
import { ProductDetailModalComponent } from '../components/product-detail-modal/product-detail-modal.component';
import { ProductService } from '../services/product.service';
import { Product, MasterProductDTO } from '../model/product.model';
import { MatSidenavModule } from '@angular/material/sidenav';
import { PageResponse } from '../response/PageResponse';

@Component({
  selector: 'app-master-product',
  imports: [RouterModule, CommonModule, SearchProductComponent, ListProductComponent, ProductDetailModalComponent, MatSidenavModule],
  standalone: true,
  templateUrl: './master-product.html',
  styleUrls: ['./master-product.scss'],
})
export class MasterProduct implements OnInit {
  currentPage = signal<number>(0);
  pageSize: number = 50;
  totalPages = signal<number>(0);
  currentDate = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '/');

  products = signal<MasterProductDTO[]>([]);
  selectedProduct = signal<MasterProductDTO | null>(null);
  isSearchVisible = signal<boolean>(true);
  selectedTypeFromList: ProductType = 'ALL';
  currentSearchParams: ProductSearchParams = {};

  constructor(
    private productService: ProductService,
  ) { }

  ngOnInit(): void {
    this.refreshProducts();
  }

  refreshProducts(): void {
    const params = {
      ...this.currentSearchParams,
      page: this.currentPage(),
      pageSize: this.pageSize
    };

    this.productService.searchProducts(params).subscribe(response => {
      this.products.set(response.content);
      this.totalPages.set(response.page.totalPages);
    });
  }

  onSelectedTypeChange(type: ProductType) {
    this.selectedTypeFromList = type;
  }

  openProductDetail(product: MasterProductDTO): void {
    console.log(product)
    this.selectedProduct.set(product);
  }

  openAddProduct(): void {
    const newProduct: MasterProductDTO = {
      productEntity: {
        isSet: '0',
        isDateTimeMng: '0',
        isNumberMng: '0',
        isReplenishMng: '0',
        isVarious: '0',
        tax: '0',
        cartonWeight: 0,
        cartonVolume: 0,
        cartonVertical: 0,
        cartonHorizontal: 0,
        cartonHigh: 0,
        pieceWeight: 0,
        pieceVolume: 0,
        pieceVertical: 0,
        pieceHorizontal: 0,
        pieceHigh: 0,
        packCsAmount: 0,
        packBlAmount: 0,
        leadTime: 0
      },
      category1Entity: null,
      category2Entity: null,
      category3Entity: null,
      category4Entity: null,
      category5Entity: null,
      repositoryEntity: null,
      locationEntity: null,
      packCsUnitName: null,
      packBlUnitName: null,
      pieceUnitName: null,
      supplierEntity: null
    };
    this.selectedProduct.set(newProduct);
  }

  closeProductDetail(): void {
    this.selectedProduct.set(null);
  }

  toggleSearch(): void {
    this.isSearchVisible.set(!this.isSearchVisible());
  }

  handleSearchResults(response: PageResponse<MasterProductDTO>): void {
    this.products.set(response.content);
    this.totalPages.set(response.page.totalPages);
    this.currentPage.set(0); // Reset page on new search
  }

  handleSearchParams(params: ProductSearchParams): void {
    this.currentSearchParams = params;
  }

  handleLoadMore(): void {
    this.currentPage.set(this.currentPage() + 1);
    const params = {
      ...this.currentSearchParams,
      page: this.currentPage(),
      pageSize: this.pageSize
    };

    this.productService.searchProducts(params).subscribe(response => {
      this.products.update(current => [...current, ...response.content]);
      this.totalPages.set(response.page.totalPages);
    });
  }
}
