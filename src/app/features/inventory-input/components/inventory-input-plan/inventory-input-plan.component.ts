import { Component, EventEmitter, Input, OnChanges, OnInit, Output, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InventoryInputPlanHeaderComponent } from '../inventory-input-plan-header/inventory-input-plan-header.component';
import { InventoryInputPlanListComponent } from '../inventory-input-plan-list/inventory-input-plan-list.component';
import { InventoryInputService } from '../../services/inventory-input.service';
import { InventoryInputPlanDetail, InventoryInputPlanResponse } from '../../models/inventory-input.model';
import { RepositoriesService } from '../../../master-product/services/repostories.service';
import { Repository } from '../../../master-product/model/product.model';
import { Location } from '../../../master-product/model/product.model';
import { Observable } from 'rxjs/internal/Observable';

@Component({
    selector: 'app-inventory-input-plan',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InventoryInputPlanHeaderComponent,
        InventoryInputPlanListComponent
    ],
    templateUrl: './inventory-input-plan.component.html',
    styleUrls: ['./inventory-input-plan.component.scss']
})
export class InventoryInputPlanComponent implements OnInit, OnChanges {
    @Input() inventoryInputId: number | null = null;
    @Output() back = new EventEmitter<void>();
    locations = signal<Location[]>([]);
    inventoryForm!: FormGroup;

    constructor(
        private fb: FormBuilder,
        private inventoryInputService: InventoryInputService,
        private repositoriesService: RepositoriesService
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        if (this.inventoryInputId) {
            this.loadData(this.inventoryInputId);
        }
    }

    public getLocationByRepositoryId(repositoryId: number): Observable<Location[]> {
        return this.repositoriesService.getLocationsByRepository(repositoryId);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['inventoryInputId']?.currentValue) {
            this.loadData(changes['inventoryInputId'].currentValue);
        }
    }

    private initializeForm(inventoryInputData?: InventoryInputPlanResponse): void {
        this.inventoryForm = this.fb.group({
            header: this.fb.group({
                inventoryInputId: [inventoryInputData?.inventoryInputPlanHeader && inventoryInputData?.inventoryInputPlanHeader.inventoryInputId
                    ? inventoryInputData?.inventoryInputPlanHeader.inventoryInputId : null],
                companyId: [null],
                inputPlanDate: [''],
                inputActualDate: [''],
                createSlipType: ['0'], // Default to Auto
                slipNo: [{ value: '', disabled: false }], // Default to disabled
                planSupplierSlipNo: [''],
                actualSupplierSlipNo: [''],
                planSlipNote: [''],
                actualSlipNote: [''],
                planSupplierDeliveryDestinationId: [null],
                actualSupplierDeliveryDestinationId: [null],
                planSupplierId: [null],
                actualSupplierId: [null],
                productOwnerId: [null],
                planRepositoryId: [null],
                actualRepositoryId: [null],
                inputStatus: [''],
                sumPlanQuantity: [null],
                sumActualQuantity: [null],
                isClosed: [''],
                freeItem1: [''],
                freeItem2: [''],
                freeItem3: [''],
                contactStatus: [''],
                destinationCode: [''],
                departmentName: [''],
                planSupplierCode: [''],
                planSupplierName: [''],
                customerCode: [''],
                customerName: [''],
                repositoryCode: [''],
                repositoryName: ['']
            }),
            details: inventoryInputData?.inventoryInputPlanDetails && inventoryInputData.inventoryInputPlanDetails.length > 0
                ? this.fb.array(inventoryInputData?.inventoryInputPlanDetails.map(x => this.createDetailFormGroup(x))) : this.fb.array([])
        });

        // Subscribe to createSlipType changes
        this.inventoryForm.get('header.createSlipType')?.valueChanges.subscribe(value => {
            const slipNoControl = this.inventoryForm.get('header.slipNo');
            if (value === '1') { // Manual
                slipNoControl?.enable();
            } else { // Auto
                slipNoControl?.disable();
            }
        });
        if (!inventoryInputData?.inventoryInputPlanHeader.inventoryInputId) {
            this.inventoryForm.get('header.planRepositoryId')?.valueChanges.subscribe((e: number | null) => {
                if (e) {
                    this.getLocationByRepositoryId(e).subscribe(res => {
                        if (res) {
                            (this.inventoryForm.get('details') as FormArray).controls.forEach(el => {
                                el.get('repositoryId')?.setValue(e);

                            })
                        }
                    });
                } else {
                    (this.inventoryForm.get('details') as FormArray).controls.forEach(el => {
                        el.get('repositoryId')?.setValue(e);
                        el.get('localtions')?.setValue([]);
                    })
                }
            });
        }
    }

    private loadData(id: number): void {
        this.inventoryInputService.getInventoryInputById(id).subscribe({
            next: (data: InventoryInputPlanResponse) => {
                // Patch header data
                const headerData = { ...data.inventoryInputPlanHeader };
                if (headerData.inputPlanDate) {
                    headerData.inputPlanDate = new Date(headerData.inputPlanDate) as any;
                }
                this.inventoryForm.get('header')?.patchValue(headerData);
                // Clear and populate details FormArray
                const detailsArray = this.inventoryForm.get('details') as FormArray;
                detailsArray.clear();
                data.inventoryInputPlanDetails.forEach(detail => {
                    detailsArray.push(this.createDetailFormGroup(detail));
                });
            },
            error: (err) => console.error('Error loading data:', err)
        });
    }

    private createDetailFormGroup(detail?: InventoryInputPlanDetail): FormGroup {
        let datetimeMng = detail?.datetimeMng ? new Date(detail.datetimeMng) : '';

        return this.fb.group({
            datetimeMng: [{ value: datetimeMng, disabled: detail?.isDatetimeMng === '0' }],
            planDetailId: [detail?.planDetailId || null],
            inventoryInputId: [detail?.inventoryInputId || null],
            companyId: [detail?.companyId || null],
            productId: [detail?.productId || null],
            repositoryId: [detail?.repositoryId || null],
            locationId: [detail?.locationId || null],
            numberMng: [{ value: detail?.numberMng || '', disabled: detail?.isNumberMng === '0' }],
            csPlanQuantity: [{ value: detail?.csPlanQuantity || null, disabled: !detail?.productId || detail?.isPackCsInput === '0' }],
            blPlanQuantity: [{ value: detail?.blPlanQuantity || null, disabled: !detail?.productId || detail?.isPackBlInput === '0' }],
            psPlanQuantity: [{ value: detail?.psPlanQuantity || null, disabled: !detail?.productId || detail?.isPieceInput === '0' }],
            totalPlanQuantity: [detail?.totalPlanQuantity || 0],
            inventoryProductType: [detail?.inventoryProductType || ''],
            detailNote: [detail?.detailNote || ''],
            freeItem1: [detail?.freeItem1 || ''],
            freeItem2: [detail?.freeItem2 || ''],
            freeItem3: [detail?.freeItem3 || ''],
            productCode: [detail?.productCode || ''],
            productName: [detail?.productName || ''],
            detailRepositoryCode: [detail?.detailRepositoryCode || ''],
            detailRepositoryName: [detail?.detailRepositoryName || ''],
            locationCode: [detail?.locationCode || ''],
            packCsUnitName: [detail?.packCsUnitName || ''],
            packBlUnitName: [detail?.packBlUnitName || ''],
            pieceUnitName: [detail?.pieceUnitName || ''],
            datetimeMngType: [detail?.datetimeMngType || '0'],
            isDatetimeMng: [detail?.isDatetimeMng || '0'],
            isNumberMng: [detail?.isNumberMng || '0'],
            isPackCsInput: [detail?.isPackCsInput || '0'],
            isPackBlInput: [detail?.isPackBlInput || '0'],
            isPieceInput: [detail?.isPieceInput || '0'],
            totalQuantityInput: [detail?.totalQuantityInput || 0],
            standardInfo: [detail?.standardInfo || ''],
            totalActualQuantity: [detail?.totalActualQuantity || 0],
            packCsAmount: [detail?.packCsAmount || 0],
            packBlAmount: [detail?.packBlAmount || 0]
        });
    }

    addDetail(): void {
        const detailsArray = this.inventoryForm.get('details') as FormArray;
        detailsArray.push(this.createDetailFormGroup());
    }

    removeDetail(index: number): void {
        const detailsArray = this.inventoryForm.get('details') as FormArray;
        detailsArray.removeAt(index);
    }

    onBack(): void {
        this.back.emit();
    }

    onRepositoryChanged(repo: Repository): void {
        this.detailsFormArray.controls.forEach(control => {
            control.patchValue({
                detailRepositoryCode: repo.repositoryCode,
                detailRepositoryName: repo.repositoryName,
                locationCode: '',
                repositoryId: repo.repositoryId,
                locationId: null
            });
        });
    }

    get headerFormGroup(): FormGroup {
        return this.inventoryForm.get('header') as FormGroup;
    }

    get detailsFormArray(): FormArray {
        return this.inventoryForm.get('details') as FormArray;
    }

}
