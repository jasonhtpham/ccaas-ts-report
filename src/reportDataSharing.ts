/*
 * SPDX-License-Identifier: Apache-2.0
 */
import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import { ReportData } from './reportData';

@Info({ title: 'ReportData', description: 'Smart contract for sharing report data with private data collection support' })
export class ReportDataContract extends Contract {

    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        const reportEntries: ReportData[] = [
            {
                docType: 'test',
                id: 'reportData1',
                data: 'test',
                price: 5,
                sharer: 'Org1',
            },
            {
                docType: 'Report:XBRL-JSON',
                id: 'frasers-fca-2024',
                data: '894d3bceefadc087d85c9a5c624bae261f325509a07b217ccc619e6f7767124d',
                price: 5000,
                sharer: 'Org2',
            },
        ];

        for (const entry of reportEntries) {
            await ctx.stub.putState(entry.id, Buffer.from(stringify(sortKeysRecursive(entry))));
            console.info(`Report data ${entry.id} initialized`);
        }
    }

    // ReportDataExists returns true when reportData with given ID exists in world state.
    @Transaction(false)
    @Returns('boolean')
    public async ReportDataExists(ctx: Context, id: string): Promise<boolean> {
        const reportDataJSON = await ctx.stub.getState(id);
        return reportDataJSON.length > 0;
    }

    @Transaction()
    public async CreateReportData(ctx: Context, _docType: string, _id: string, _data: string, _price: number, _sharer: string): Promise<void> {
        const exists = await this.ReportDataExists(ctx, _id);
        if (exists) {
            throw new Error(`The report data ${_id} already exists`);
        }

        const reportData: ReportData = {
            docType: _docType,
            id: _id,
            data: _data,
            price: _price,
            sharer: _sharer,
        };

        await ctx.stub.putState(_id, Buffer.from(stringify(sortKeysRecursive(reportData))));
    }

    @Transaction(false)
    public async ReadReportData(ctx: Context, id: string): Promise<string> {
        const reportDataJSON = await ctx.stub.getState(id);
        if (!reportDataJSON || reportDataJSON.length === 0) {
            throw new Error(`The report data ${id} does not exist`);
        }
        return reportDataJSON.toString();
    }

    // CreateReportDataPrivate issues a new reportData and stores it in a private collection.
    // @Transaction()
    // public async CreateReportDataPrivate(ctx: Context, collection: string, _docType: string, _id: string, _data: string, _price: number, _sharer: string): Promise<void> {
    //     const exists = await this.ReportDataExistsPrivate(ctx, collection, _id);
    //     if (exists) {
    //         throw new Error(`The private report data ${_id} already exists in collection ${collection}`);
    //     }

    //     const reportData: ReportData = {
    //         docType: _docType,
    //         id: _id,
    //         data: _data,
    //         price: _price,
    //         sharer: _sharer,
    //     };

    //     await ctx.stub.putPrivateData(collection, _id, Buffer.from(stringify(sortKeysRecursive(reportData))));
    // }

    // ReadReportDataPrivate reads a reportData from a private collection.
    // @Transaction(false)
    // public async ReadReportDataPrivate(ctx: Context, collection: string, id: string): Promise<string> {
    //     const reportDataJSON = await ctx.stub.getPrivateData(collection, id);
    //     if (!reportDataJSON || reportDataJSON.length === 0) {
    //         throw new Error(`The private report data ${id} does not exist in collection ${collection}`);
    //     }
    //     return reportDataJSON.toString();
    // }

    // UpdateReportDataPrivate updates an existing reportData in a private collection.
    // @Transaction()
    // public async UpdateReportDataPrivate(ctx: Context, collection: string, _docType: string, _id: string, _data: string, _price: number, _sharer: string): Promise<void> {
    //     const exists = await this.ReportDataExistsPrivate(ctx, collection, _id);
    //     if (!exists) {
    //         throw new Error(`The private report data ${_id} does not exist in collection ${collection}`);
    //     }

    //     const updatedReportData: ReportData = {
    //         docType: _docType,
    //         id: _id,
    //         data: _data,
    //         price: _price,
    //         sharer: _sharer,
    //     };

    //     await ctx.stub.putPrivateData(collection, _id, Buffer.from(stringify(sortKeysRecursive(updatedReportData))));
    // }

    // DeleteReportDataPrivate deletes a reportData from a private collection.
    // @Transaction()
    // public async DeleteReportDataPrivate(ctx: Context, collection: string, id: string): Promise<void> {
    //     const exists = await this.ReportDataExistsPrivate(ctx, collection, id);
    //     if (!exists) {
    //         throw new Error(`The private report data ${id} does not exist in collection ${collection}`);
    //     }
    //     await ctx.stub.deletePrivateData(collection, id);
    // }

    // ReportDataExistsPrivate checks if a reportData exists in a private collection.
    // @Transaction(false)
    // @Returns('boolean')
    // public async ReportDataExistsPrivate(ctx: Context, collection: string, id: string): Promise<boolean> {
    //     const reportDataJSON = await ctx.stub.getPrivateData(collection, id);
    //     return reportDataJSON && reportDataJSON.length > 0;
    // }

    @Transaction(false)
    @Returns('string')
    public async GetAllReportDatas(ctx: Context): Promise<string> {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue) as ReportData;
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}
