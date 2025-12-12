import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-dashboard-home',
  imports: [MatCardModule, RouterModule, CommonModule],
  standalone: true,
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.scss',
})
export class DashboardHome {
  currentDate = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '/');

  menuSections = [
    {
      title: "マスタ",
      items: [
        { label: "商品", path: "/dashboard/master-product" }
      ]
    },
    {
      title: "入庫",
      items: [
        { label: "入庫一覧", path: "/incoming/list" },
        { label: "入庫予定入力", path: "/incoming/schedule" },
        { label: "入庫実績登録", path: "/incoming/actual" }
      ]
    },
    {
      title: "出庫",
      items: [
        { label: "出庫一覧", path: "/outgoing/list" },
        { label: "出庫予定入力", path: "/outgoing/schedule" },
        { label: "出庫実績登録", path: "/outgoing/actual" }
      ]
    },
    {
      title: "在庫",
      items: [
        { label: "在庫一覧", path: "/inventory/list" }
      ]
    }
  ];
}
