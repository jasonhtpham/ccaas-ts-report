/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class ReportData {
    @Property()
    public docType: string = 'Report';

    @Property()
    public id: string = '';

    @Property()
    public data: string = '';

    @Property()
    public price: number = 0;

    @Property()
    public sharer: string = '';
}
