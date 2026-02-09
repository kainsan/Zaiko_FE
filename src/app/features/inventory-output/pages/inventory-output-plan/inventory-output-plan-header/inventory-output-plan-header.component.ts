import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InventoryOutputPlanHeader } from '../../../models/inventory-output.model'; // Correct model import
import { Product, Repository } from '../../../../master-product/model/product.model';
import { InventoryOutputService } from '../../../services/inventory-output.service'; // Correct service import
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../../../inventory-input/components/confirm-dialog/confirm-dialog.component'; // Import from input for now
import { InventorySearchDialogComponent } from '../../../../inventory-input/components/inventory-search-dialog/inventory-search-dialog.component'; // Import from input for now
import { ProductService } from '../../../../master-product/services/product.service';

@Component({
    selector: 'app-inventory-output-plan-header',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatInputModule,
        MatFormFieldModule
    ],
    templateUrl: './inventory-output-plan-header.component.html',
    styleUrls: ['./inventory-output-plan-header.component.scss']
})
export class InventoryOutputPlanHeaderComponent implements OnInit {
    @Input() headerFormGroup?: FormGroup;
    @Input() isFormInvalid: boolean = false;
    @Input() inventoryInputId?: number | null; // InventoryOutputId
    @Input() routeCode?: string;
    @Output() back = new EventEmitter<void>();
    @Output() repositoryChanged = new EventEmitter<Repository>();
    @Output() save = new EventEmitter<void>();
    @Output() delete = new EventEmitter<void>();
    @Output() toggleCloseEvent = new EventEmitter<void>();

    headerData: InventoryOutputPlanHeader | null = null;
    repositories = signal<Repository[]>([]);
    routes = signal<any[]>([]);
    courses = signal<any[]>([]);

    inputStatusMap: { [key: string]: string } = {
        '0': '未出庫',
        '1': '出庫残',
        '2': '出庫済'
    };

    constructor(
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private inventoryOutputService: InventoryOutputService,
        private productService: ProductService
    ) { }

    ngOnInit(): void {
        this.loadRepositories();
        this.loadRoute();
        const routeCtrl = this.headerFormGroup?.get('routeCode');
          if (routeCtrl) {
            this.loadCourse(routeCtrl.value);
            routeCtrl.valueChanges.subscribe(routeCode => {
              this.loadCourse(routeCode);
            });
          }
        if (this.inventoryInputId && !this.headerFormGroup) {
        }

        this.headerFormGroup?.get('planRepositoryId')?.valueChanges.subscribe(id => {
            const repo = this.repositories().find(r => r.repositoryId == id);
            if (repo) {
                this.repositoryChanged.emit(repo);
            }
        });
    }

    // ngOnChanges(changes: SimpleChanges): void {
    //     this.loadCourse(changes['routeCode'].currentValue);
    // }

    private loadRepositories(): void {
        this.inventoryOutputService.getRepositories().subscribe({
            next: (data) => this.repositories.set(data),
            error: (err) => console.error('Error loading repositories:', err)
        });
    }

    private loadRoute(): void {
        this.inventoryOutputService.getRoutes().subscribe({
            next: (data) => this.routes.set(data),
            error: (err) => console.error('Error loading routes:', err)
        });
    }

    private loadCourse(routeCode: string): void {
        this.inventoryOutputService.getCourses({ routeCode }).subscribe({
            next: (data) => this.courses.set(data),
            error: (err) => console.error('Error loading courses:', err)
        });
    }

    onBack(): void {
        this.back.emit();
    }

    openSearchDialog(type: 'planCustomerDeliveryDestination' | 'supplier' | 'customer'): void {
        let searchObservable;
        let searchType: 'planCustomerDeliveryDestination' | 'supplier' | 'customer';

        switch (type) {
            case 'planCustomerDeliveryDestination':
                searchType = 'planCustomerDeliveryDestination';
                searchObservable = this.inventoryOutputService.getDeliveryDestinations();
                break;
            case 'supplier':
                searchType = 'supplier';
                searchObservable = this.inventoryOutputService.getSuppliers();
                break;
            default:
                return;
        }

        // Implementation of search dialog opening...
        // For now logging
        console.log('Open search dialog for', type);

        if (searchObservable) {
            searchObservable.subscribe((response: any) => {
                const items = response.content || (Array.isArray(response) ? response : []);
                const dialogRef = this.dialog.open(InventorySearchDialogComponent, {
                    width: '450px',
                    height: '600px',
                    panelClass: 'custom-dialog-container',
                    data: {
                        searchType: searchType,
                        items: items
                    }
                });

                dialogRef.afterClosed().subscribe(result => {
                    if (result) {
                        this.updateForm(type, result);
                    }
                });
            });
        }
    }

    private updateForm(type: string, result: any): void {
        if (!this.headerFormGroup) return;

        switch (type) {
            case 'planCustomerDeliveryDestination':
                this.headerFormGroup.patchValue({
                    planCustomerDeliveryDestinationId: result.deliveryDestinationId,
                    planDestinationCode: result.destinationCode,
                    planDestinationName: result.departmentName,
                    address1: result.address,
                    phoneNumber: result.tel,
                    faxNumber: result.fax,
                    postCode: result.zip,
                });
                break;
            case 'supplier':
                this.headerFormGroup.patchValue({
                    planCustomerId: result.supplierId,
                    planCustomerCode: result.supplierCode,
                    planCustomerName: result.supplierName
                });
                break;
            // ...
        }
    }

    toggleClose(): void {
        this.toggleCloseEvent.emit();
    }

    onSave(): void {
        this.save.emit();
    }

    onDelete(): void {
        this.delete.emit();
    }

    onManualDestinationChange(event: any): void {
        const isChecked = event.target.checked;
        this.headerFormGroup?.get('isManualDestination')?.setValue(isChecked ? '1' : '0');
    }
}
