import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComerLotsEntity } from './entity/comer-lots.entity';
import * as fs from 'fs'
import * as xlsx from 'xlsx'

@Injectable()
export class ExpExel2Service {

    constructor(
        @InjectRepository(ComerLotsEntity) private entity: Repository<ComerLotsEntity>
    ) { }


    async createFileExcel2(eventId:number) { 
        let query = await this.entity.query(` SELECT	CAT.CVMAN MANDATO, 
                        LOT.LOTE_PUBLICO LOTE,
                        LOT.PRECIO_FINAL COSTO,
                        CLI.RFC RFC, 
                        SUM(GEN.MONTO_APP_IVA + GEN.IVA) C1TOTAL,
                        LOT.ID_ESTATUSVTA C1ESTATUS, 
                        (LOT.PRECIO_FINAL - SUM(GEN.MONTO_APP_IVA + GEN.IVA)) C1DIFERENCIA
                    FROM		sera.CAT_TRANSFERENTE CAT
                    inner join  sera.COMER_LOTES LOT on LOT.NO_TRANSFERENTE = CAT.NO_TRANSFERENTE
                    left outer join sera.COMER_PAGOSREFGENS GEN on LOT.ID_LOTE = GEN.ID_LOTE
                    right outer join  sera.COMER_CLIENTES CLI on CLI.ID_CLIENTE = LOT.ID_CLIENTE
                    right outer join sera.COMER_PAGOREF CREF on CREF.ID_PAGO= GEN.ID_PAGO
                    WHERE		LOT.ID_EVENTO       = ${eventId} 
                    GROUP BY CAT.CVMAN, LOT.LOTE_PUBLICO,  LOT.PRECIO_FINAL, CLI.RFC, LOT.ID_ESTATUSVTA
                    ORDER BY LOT.LOTE_PUBLICO;  `)
        
        const workSheet = xlsx.utils.json_to_sheet(query);
        const workBook = xlsx.utils.book_new();
        let name = `src/files/excel2.xlsx`
        xlsx.utils.book_append_sheet(workBook, workSheet, "getQueryToExcel")
        await xlsx.write(workBook, { bookType: 'xlsx', type: 'buffer' })
        await xlsx.write(workBook, { bookType: 'xlsx', type: 'binary' })
        await xlsx.writeFile(workBook, name)
        var f = fs.readFileSync(name, { encoding: 'base64' })
        return {  file: { name: `excel2.xlsx`, base64: query.length > 0 ? f : '' }, preview:query }
        

    }

} 
