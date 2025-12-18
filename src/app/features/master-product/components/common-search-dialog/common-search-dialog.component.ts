import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-common-search-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule],
    templateUrl: './common-search-dialog.component.html',
    styleUrls: ['./common-search-dialog.component.scss']
})
export class CommonSearchDialogComponent {
    suppliers = [
        { code: '000001', name: '株式会社アサヒパッケージング' },
        { code: '000002', name: '有限会社イイダオフセット' },
        { code: '000003', name: '和泉産業株式会社' },
        { code: '000004', name: '有限会社イッコー' },
        { code: '000005', name: 'エイコー' },
        { code: '000006', name: '株式会社エコ21' },
        { code: '000005', name: 'エイコー' },
        { code: '000006', name: '株式会社エコ21' },
        { code: '000007', name: 'エイコー' },
        { code: '000007', name: 'エイコー' },
    ];

    constructor(public dialogRef: MatDialogRef<CommonSearchDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {

     }

    close(): void {
        this.dialogRef.close();
    }
}
