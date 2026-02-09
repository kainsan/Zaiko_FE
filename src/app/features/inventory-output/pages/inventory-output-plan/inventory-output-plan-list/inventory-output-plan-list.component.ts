import { Component, EventEmitter, Input, Output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { InventoryOutputService } from '../../../services/inventory-output.service';
import { InventoryOutputSearchDialogComponent } from '../../../components/inventory-output-search-dialog/inventory-output-search-dialog.component';
import { Location, Repository } from '../../../../master-product/model/product.model'; // Reuse input search dialog for now

@Component({
    selector: 'app-inventory-output-plan-list',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatInputModule
    ],
    templateUrl: './inventory-output-plan-list.component.html',
    styleUrls: ['./inventory-output-plan-list.component.scss']
})
export class InventoryOutputPlanListComponent implements OnInit {
    @Input() detailsFormArray!: FormArray;
    @Output() addItem = new EventEmitter<void>();
    @Output() removeItem = new EventEmitter<number>();
    @Output() copyItem = new EventEmitter<number>();

    repositories = signal<Repository[]>([]);
    locationsMap: { [index: number]: Location[] } = {};

    public statusDateTimeMngType: Record<string, string> = {
        '0': '入',
        '1': '製',
        '2': '賞',
        '4': ' '
    };

    inventoryProductTypeOptions = [
        { value: '0', label: '0 良品' },
        { value: '1', label: '1 預り予定' },
        { value: '2', label: '2 MTとりおき' },
        { value: '3', label: '3 新ロット' },
        { value: '4', label: '4 廃棄・処分品' },
        { value: '5', label: '5 破損' },
        { value: '6', label: '6 不良品' },
        { value: '7', label: '7 サンプル' },
        { value: '8', label: '8 予備' }
    ];

    constructor(
        private dialog: MatDialog,
        private inventoryOutputService: InventoryOutputService
    ) { }

    ngOnInit(): void {
        this.loadRepositories();
        this.controls.forEach((group) => {
            const isMngCtrl = group.get('isNumberMng');
            const fromCtrl = group.get('numberMngFrom');
            const toCtrl = group.get('numberMngTo');

            if (!isMngCtrl || !fromCtrl || !toCtrl) return;


            const initiallyDisabled = isMngCtrl.value === '0';
            if (initiallyDisabled) {
                fromCtrl.disable({ emitEvent: false });
                toCtrl.disable({ emitEvent: false });
            } else {
                fromCtrl.enable({ emitEvent: false });
                toCtrl.enable({ emitEvent: false });
            }

            isMngCtrl.valueChanges.subscribe((value: any) => {
                const disabled = value === '0';

                if (disabled) {
                    fromCtrl.disable({ emitEvent: false });
                    toCtrl.disable({ emitEvent: false });
                } else {
                    fromCtrl.enable({ emitEvent: false });
                    toCtrl.enable({ emitEvent: false });
                }
            });
        });
    }

    private loadRepositories(): void {
        this.inventoryOutputService.getRepositories().subscribe({
            next: (data) => this.repositories.set(data),
            error: (err) => console.error('Error loading repositories:', err)
        });
    }

    get controls(): FormGroup[] {
        return this.detailsFormArray.controls as FormGroup[];
    }

    isDeleted(index: number): boolean {
        return this.controls[index].get('delFlg')?.value === '1';
    }

    onAdd(): void {
        this.addItem.emit();
    }

    onRemove(index: number): void {
        this.removeItem.emit(index);
    }

    onCopy(index: number): void {
        this.copyItem.emit(index);
    }

    openSearchDialog(group: FormGroup, type: string): void {
        let searchObservable: any;
        let searchType: 'product' | 'owner' = 'product';

        if (type === 'product') {
            searchType = 'product';
            searchObservable = this.inventoryOutputService.getProducts();
        } else if (type === 'owner') {
            searchType = 'owner';
            searchObservable = this.inventoryOutputService.getCustomers();
        } else {
            return;
        }

        searchObservable.subscribe((response: any) => {
            let items = response.content || (Array.isArray(response) ? response : []);

            if (searchType === 'product' && items.length > 0 && items[0].productEntity) {
                items = items.map((dto: any) => {
                    const product = { ...dto.productEntity } as any;
                    product.packCsUnitName = dto.packCsUnitName?.unitName || '';
                    product.packBlUnitName = dto.packBlUnitName?.unitName || '';
                    product.pieceUnitName = dto.pieceUnitName?.unitName || '';
                    product.packCsAmount = dto.productEntity?.packCsAmount || 0;
                    product.packBlAmount = dto.productEntity?.packBlAmount || 0;
                    product.totalPlanQuantity = dto.totalPlanQuantity;
                    return product;
                });
            }

            const dialogRef = this.dialog.open(InventoryOutputSearchDialogComponent, {
                width: '800px',
                height: '600px',
                panelClass: 'custom-dialog-container',
                data: {
                    searchType: searchType,
                    items: items
                }
            });

            dialogRef.afterClosed().subscribe(res => {
                if (!res) return;

                if (type === 'product') {
                    group.patchValue({
                        productId: res.productId,
                        productCode: res.productCode,
                        productName: res.name1,
                        // Update other product specific fields if needed
                        packCsUnitName: res.packCsUnitName,
                        packBlUnitName: res.packBlUnitName,
                        pieceUnitName: res.pieceUnitName,

                        // Set management flags
                        isDatetimeMng: res.isDatetimeMng,
                        isNumberMng: res.isNumberMng,
                        isPackCsInput: res.isPackCsInput,
                        isPackBlInput: res.isPackBlInput,
                        isPieceInput: res.isPieceInput
                    });
                }
                if (type === 'owner') {
                    group.patchValue({
                        ownerId: res.ownerId,
                        ownerName: res.ownerName,

                        // Set management flags
                        isDatetimeMng: res.isDatetimeMng,
                        isNumberMng: res.isNumberMng,
                        isPackCsInput: res.isPackCsInput,
                        isPackBlInput: res.isPackBlInput,
                        isPieceInput: res.isPieceInput
                    });
                }
            });
        });
    }

    onDetailRepositoryChange(index: number, event: any): void {
        const repoId = Number(event.target.value);
        const repo = this.repositories().find((r) => r.repositoryId === repoId);
        const formGroup = this.detailsFormArray.at(index);

        if (repo) {
            formGroup.patchValue({
                detailRepositoryCode: repo.repositoryCode,
                detailRepositoryName: repo.repositoryName,
                repositoryId: repo.repositoryId,
            });
        }
    }

    onLocationChange(index: number, event: any): void {
        const locationId = Number(event.target.value);
        const formGroup = this.detailsFormArray.at(index);
        const locations = this.locationsMap[index] || [];
        const selectedLocation = locations.find(loc => loc.locationId === locationId);

        if (selectedLocation) {
            formGroup.patchValue({
                locationCode: selectedLocation.locationCode
            });
        }
    }

    calculateTotalQuantityAndAmount(index: number): void {
        const formGroup = this.detailsFormArray.at(index);
        const csQty = Number(formGroup.get('csPlanQuantity')?.value) || 0;
        const blQty = Number(formGroup.get('blPlanQuantity')?.value) || 0;
        const psQty = Number(formGroup.get('psPlanQuantity')?.value) || 0;

        const packCsAmount = Number(formGroup.get('packCsAmount')?.value) || 0;
        const packBlAmount = Number(formGroup.get('packBlAmount')?.value) || 0;

        const saleCsPrice = Number(formGroup.get('saleCsPrice')?.value) || 0;
        const saleBlPrice = Number(formGroup.get('saleBlPrice')?.value) || 0;
        const salePiecePrice = Number(formGroup.get('salePiecePrice')?.value) || 0;

        const isPackCsInput = formGroup.get('isPackCsInput')?.value;
        const isPackBlInput = formGroup.get('isPackBlInput')?.value;
        const isPieceInput = formGroup.get('isPieceInput')?.value;

        // let totalPlanQuantity = Number(formGroup.get('totalPlanQuantity')?.value) || 0;
        let total = 0;
        if (isPackCsInput !== '0') {
            total += csQty * packCsAmount * packBlAmount;
        }
        if (isPackBlInput !== '0') {
            total += blQty * packBlAmount;
        }
        if (isPieceInput !== '0') {
            total += psQty;
        }

        //let amountTotal = Number(formGroup.get('amountTotal')?.value) || 0;
        let totalAmount = 0;
        if (isPackCsInput !== '0') {
            totalAmount += csQty * saleCsPrice;
        }
        if (isPackBlInput !== '0') {
            totalAmount += blQty * saleBlPrice;
        }
        if (isPieceInput !== '0') {
            totalAmount += psQty * salePiecePrice;
        }


        formGroup.patchValue({
            totalPlanQuantity: total,
            amountTotal: totalAmount
        }, { emitEvent: false });
    }

    onAddItem(): void {
        this.addItem.emit();
    }

    onRemoveItem(index: number): void {
        this.removeItem.emit(index);
    }

    onCopyItem(index: number): void {
        this.copyItem.emit(index);
    }

    trackByDetail(index: number, control: AbstractControl) {
        const id = control.get('planDetailId')?.value;
        return id != null ? id : index;
    }

    isCopyDisabled(control: AbstractControl): boolean {
        return control.invalid;
    }

    isDisabledRepository(index: number): boolean {
        const formGroup = this.detailsFormArray.at(index);
        const totalActualQuantity = Number(formGroup.get('totalActualQuantity')?.value) || 0;
        const totalPlanQuantity = Number(formGroup.get('totalPlanQuantity')?.value) || 0;

        if (totalActualQuantity === 0) {
            return false; // Enable
        }
        if (totalActualQuantity < totalPlanQuantity) {
            return true; // Disable
        }
        return true;
    }

    notDeliveryYet(control: AbstractControl): number {
        const totalPlanQuantity = Number(control.get('totalPlanQuantity')?.value) || 0;
        const totalActualQuantity = Number(control.get('totalActualQuantity')?.value) || 0;
        return totalPlanQuantity - totalActualQuantity;
    }
}
