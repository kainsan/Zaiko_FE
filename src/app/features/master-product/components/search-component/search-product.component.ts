// src/app/admin/master-product/components/search-product.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'search-product', // <--- Đây là tên thẻ bạn sẽ dùng
  standalone: true,               // <--- QUAN TRỌNG: Để true để dùng như React
  imports: [CommonModule, MatSelectModule, FormsModule],        // Import các module cần thiết riêng cho component này
  templateUrl: "./search-product-component.html",
  styleUrls: ['./search-product.component.scss']
})
export class SearchProductComponent {
  selectedWarehouse: string = '';
  selectedLocation: string = '';
}
