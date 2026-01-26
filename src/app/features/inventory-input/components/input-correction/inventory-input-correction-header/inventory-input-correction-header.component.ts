import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InventoryInputPlanHeader } from '../../../models/inventory-input.model';
import { Product, Repository } from '../../../../master-product/model/product.model';
import { InventoryInputService } from '../../../services/inventory-input.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { InventorySearchDialogComponent } from '../../inventory-search-dialog/inventory-search-dialog.component';
import { ProductService } from '../../../../master-product/services/product.service';

@Component({
    selector: 'app-inventory-input-correction-header',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatInputModule,
        MatFormFieldModule
    ],
    templateUrl: './inventory-input-correction-header.component.html',
    styleUrls: ['./inventory-input-correction-header.component.scss']
})
export class InventoryInputCorrectionHeaderComponent implements OnInit, OnChanges {
    // Reactive Forms pattern (from pages)
    @Input() headerFormGroup?: FormGroup;
    @Input() isFormInvalid!: boolean;

    // ID-based pattern (from components)
    @Input() inventoryInputId?: number | null;
    @Input() repositories: Repository[] = [];

    @Output() back = new EventEmitter<void>();
    @Output() repositoryChanged = new EventEmitter<Repository>();
    @Output() save = new EventEmitter<void>();
    @Output() delete = new EventEmitter<void>();
    @Output() toggleCloseEvent = new EventEmitter<void>();

    headerData: InventoryInputPlanHeader | null = null;

    currentDate = new Date().toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replace(/\//g, '/');

    inputStatusMap: { [key: string]: string } = {
        '0': '未入庫',
        '1': '入庫残',
        '2': '入庫済'
    };


    constructor(
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private inventoryInputService: InventoryInputService,
        private productService: ProductService,
        private cdr: ChangeDetectorRef) { }

    ngOnInit(): void {
        if (this.inventoryInputId && !this.headerFormGroup) {
            this.loadData(this.inventoryInputId);
        }

        this.headerFormGroup?.get('destinationCode')?.valueChanges.subscribe(value => {
            if (!value) {
                this.headerFormGroup?.patchValue({
                    departmentName: '',
                    planSupplierCode: '',
                    planSupplierName: '',
                    planSupplierDeliveryDestinationId: null,
                    planSupplierId: null
                });
            }
        });

        this.headerFormGroup?.get('actualRepositoryId')?.valueChanges.subscribe(id => {
            const repo = this.repositories.find(r => r.repositoryId == id);
            if (repo) {
                this.repositoryChanged.emit(repo);
            }
        });

        // this.headerFormGroup?.get('isClosed')?.valueChanges.subscribe(value => {
        //     const actualSupplierSlipNoControl = this.headerFormGroup?.get('actualSupplierSlipNo');
        //     if (value === '1') {
        //         actualSupplierSlipNoControl?.disable();
        //     } else {
        //         actualSupplierSlipNoControl?.enable();
        //     }
        // });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['inventoryInputId']?.currentValue && !this.headerFormGroup) {
            this.loadData(changes['inventoryInputId'].currentValue);
        }
    }

    private loadData(id: number): void {
        this.inventoryInputService.getInventoryInputById(id).subscribe({
            next: (data) => {
                this.headerData = data.inventoryInputPlanHeader;
            },
            error: (err) => console.error('Error loading header data:', err)
        });
    }



    onBack(): void {
        this.back.emit();
    }

    // Helper to check if using Reactive Forms pattern
    get isReactiveForms(): boolean {
        return !!this.headerFormGroup;
    }

    openSearchDialog(type: 'supplierDelivery' | 'supplier' | 'customer'): void {
        let searchObservable;
        let searchType: 'supplier' | 'supplierDelivery' | 'customer';

        switch (type) {
            case 'supplierDelivery':
                searchType = 'supplierDelivery';
                searchObservable = this.inventoryInputService.getSupplierDestinations();
                break;
            case 'supplier':
                searchType = 'supplier';
                searchObservable = this.inventoryInputService.getSuppliers();
                break;
            case 'customer':
                searchType = 'customer';
                searchObservable = this.inventoryInputService.getCustomers();
                break;
            default:
                return;
        }

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

    private updateForm(type: string, result: any): void {
        if (!this.headerFormGroup) return;

        switch (type) {
            case 'supplierDelivery':
                this.headerFormGroup.patchValue({
                    // Destination fields
                    actualSupplierDeliveryDestinationId: result.supplierDeliveryDestinationId,
                    destinationCode: result.supplierDeliveryDestinationCode,
                    departmentName: result.destinationCode, // Name is in destinationCode per user JSON

                    // Supplier fields (derived from delivery selection)
                    actualSupplierId: result.supplierId,
                    supplierCode: result.supplierName, // Code is in supplierName per user JSON
                    supplierName: result.supplierDeliveryDepartName // Assuming Supplier Name == Destination Name
                });
                break;
            case 'supplier':
                this.headerFormGroup.patchValue({
                    actualSupplierId: result.supplierId,
                    supplierCode: result.supplierCode,
                    supplierName: result.supplierName
                });
                break;
            case 'customer':
                this.headerFormGroup.patchValue({
                    productOwnerId: result.customerId,
                    customerCode: result.customerCode,
                    customerName: result.customerName
                });
                break;
        }
    }

    toggleClose(): void {
        if (!this.headerFormGroup) return;
        const currentValue = this.headerFormGroup.get('isClosed')?.value;
        const id = this.inventoryInputId || this.headerFormGroup.get('inventoryInputId')?.value;

        if (currentValue === '1') {
            // Unclose - no confirmation needed
            this.updateStatus(id, '0');
        } else {
            // Close - show confirmation
            const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                width: '450px',
                panelClass: 'custom-dialog-container',
                data: {
                    title: '確認',
                    message: 'クローズ済みに変更します。\nよろしいですか？\nクローズ済みに変更するとクローズ解除するまで編集できません。'
                }
            });

            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    this.updateStatus(id, '1');
                }
            });
        }
    }

    private updateStatus(id: number, status: string): void {
        if (id) {
            this.inventoryInputService.updateInventoryInputStatus(id, status).subscribe({
                next: () => {
                    this.headerFormGroup?.patchValue({ isClosed: status });
                    const message = status === '1' ? 'クローズしました。' : 'クローズ解除しました。';
                    this.snackBar.open(message, '', {
                        duration: 3000,
                        panelClass: ['success-snackbar'],
                        horizontalPosition: 'start',
                        verticalPosition: 'bottom'
                    });
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.error('Error updating status:', err);
                    const message = status === '1' ? 'クローズに失敗しました。' : 'クローズ解除に失敗しました。';
                    this.snackBar.open(message, '', {
                        duration: 3000,
                        panelClass: ['error-snackbar'],
                        horizontalPosition: 'start',
                        verticalPosition: 'bottom'
                    });
                }
            });
        } else {
            this.headerFormGroup?.patchValue({ isClosed: status });
        }
    }

    onSave(): void {
        this.save.emit();
    }

    onDelete(): void {
        this.delete.emit();
    }
}
