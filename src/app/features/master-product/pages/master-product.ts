import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SearchProductComponent } from '../components/search-component/search-product.component';
import { ListProductComponent } from '../components/list-product-component/list-product.component';

@Component({
  selector: 'app-master-product',
  imports: [RouterModule, CommonModule, SearchProductComponent, ListProductComponent],
  templateUrl: './master-product.html',
  styleUrls: ['./master-product.scss'],
})
export class MasterProduct {
    currentDate = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '/');
}
