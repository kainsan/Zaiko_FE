import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SearchProductComponent } from '../components/search-component/search-product.component';
import { ListProductComponent, ProductType } from '../components/list-product-component/list-product.component';
import { ProductSearchParams } from '../request/ProductSearchRequest';
import { ProductDetailModalComponent } from '../components/product-detail-modal/product-detail-modal.component';
import { ProductService } from '../services/product.service';
import { Product } from '../model/product.model';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-master-product',
  imports: [RouterModule, CommonModule, SearchProductComponent, ListProductComponent, ProductDetailModalComponent, MatSidenavModule],
  standalone: true,
  templateUrl: './master-product.html',
  styleUrls: ['./master-product.scss'],
})
export class MasterProduct implements OnInit {
  currentPage: number = 0;
  pageSize: number = 50;
  currentDate = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '/');

  products = signal<Product[]>([]);
  selectedProduct = signal<Product | null>(null);
  isSearchVisible = signal<boolean>(true);
  searchProducts = signal<Product[]>([]);
  selectedTypeFromList: ProductType = 'ALL';
  currentSearchParams: ProductSearchParams = {};

  constructor(
    private productService: ProductService,
  ) { }
  ngOnInit(): void {
    this.productService.getProducts(this.currentPage, this.pageSize).subscribe(data => {
      this.products.set(data);
    });
  }

  onSelectedTypeChange(type: ProductType) {
    this.selectedTypeFromList = type;
  }

  openProductDetail(product: Product): void {
    this.selectedProduct.set(product);
  }

  closeProductDetail(): void {
    this.selectedProduct.set(null);
  }

  toggleSearch(): void {
    this.isSearchVisible.set(!this.isSearchVisible());
  }

  handleSearchResults(searchProducts: Product[]): void {
    this.products.set(searchProducts);
    this.currentPage = 0; // Reset page on new search
  }

  handleSearchParams(params: ProductSearchParams): void {
    this.currentSearchParams = params;
  }

  handleLoadMore(): void {
    this.currentPage++;
    const params = {
      ...this.currentSearchParams,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.productService.searchProducts(params).subscribe(newProducts => {
      this.products.update(current => [...current, ...newProducts]);
    });
  }
}
