import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { InventoryInputPlanHeaderComponent } from '../../components/inventory-input-plan-header/inventory-input-plan-header.component';
import { InventoryInputPlanListComponent } from '../../components/inventory-input-plan-list/inventory-input-plan-list.component';

@Component({
    selector: 'app-inventory-input-plan',
    standalone: true,
    imports: [
        CommonModule,
        InventoryInputPlanHeaderComponent,
        InventoryInputPlanListComponent
    ],
    templateUrl: './inventory-input-plan.component.html',
    styleUrls: ['./inventory-input-plan.component.scss']
})
export class InventoryInputPlan implements OnInit {
    inventoryInputId: string | null = null;

    constructor(private route: ActivatedRoute) { }

    ngOnInit(): void {
        this.inventoryInputId = this.route.snapshot.paramMap.get('id');
        // console.log('Inventory Input ID:', this.inventoryInputId);
        // Logic to fetch data based on ID would go here
    }
}
