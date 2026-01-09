import { Component, computed, EventEmitter, input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryInputDTO } from '../../models/inventory-input.model';

@Component({
  selector: 'list-inventory-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-inventory-input.component.html',
  styleUrls: ['./list-inventory-input.component.scss'],
})
export class ListInventoryInputComponent implements OnInit {
  inventoryInputs = input<InventoryInputDTO[]>([]);
  totalPages = input<number>(0);
  currentPage = input<number>(0);

  @Output() openDetail = new EventEmitter<any>();
  @Output() openPlan = new EventEmitter<any>();
  @Output() loadMore = new EventEmitter<void>();

  displayItems = computed(() => {
    return this.inventoryInputs();
  });

  constructor() {
  }

  ngOnInit(): void { }

  onOpenDetail(item: any): void {
    this.openDetail.emit(item);
  }

  onOpenPlan(item: InventoryInputDTO): void {
    this.openPlan.emit(item);
  }

  onDownloadCsv(): void {
    console.log('Downloading CSV...');
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case '0': return '未入';
      case '1': return '残';
      case '2': return '済';
      default: return '未入';
    }
  }

  isPlanDisabled(item: InventoryInputDTO): boolean {
    if (!item.inventoryInputEntity.inputPlanDate) {
      return true;
    } else
      return false;
  }

  isActualDisabled(item: InventoryInputDTO): boolean {
    if (!item.inventoryInputEntity.inputActualDate && item.inventoryInputEntity.inputPlanDate && item.inventoryInputEntity.isClosed == "0") {
      ;
      return false;
    }
    else if (!item.inventoryInputEntity.inputActualDate && item.inventoryInputEntity.inputPlanDate && item.inventoryInputEntity.isClosed == "1") {
      return true;
    }
    else if (item.inventoryInputEntity.inputActualDate && item.inventoryInputEntity.inputPlanDate && item.inventoryInputEntity.isClosed == "0") {
      return false;
    }
    else if (item.inventoryInputEntity.inputActualDate && item.inventoryInputEntity.inputPlanDate && item.inventoryInputEntity.isClosed == "1") {
      return true;
    }
    else if (item.inventoryInputEntity.inputActualDate && !item.inventoryInputEntity.inputPlanDate && item.inventoryInputEntity.isClosed == "0") {
      return true;
    }
    else if (item.inventoryInputEntity.inputActualDate && !item.inventoryInputEntity.inputPlanDate && item.inventoryInputEntity.isClosed == "1") {
      return true;
    }
    return false;
  }

  isCorrectionDisabled(item: InventoryInputDTO): boolean {
    return !item.inventoryInputEntity.inputActualDate;
  }
}
