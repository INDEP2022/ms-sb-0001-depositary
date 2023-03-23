import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonEntity } from './entity/person.entity';
import * as fs from 'fs'
import * as xlsx from 'xlsx'

@Injectable()
export class ExpExel1Service {
    constructor(
        @InjectRepository(PersonEntity) private entity: Repository<PersonEntity>
    ) { }


    async createFileExcel(propertyNumber:number,paymentId:number){
        const query1 = await this.entity.query(`
                    SELECT B.NO_BIEN,
                    B.ESTATUS,ND.CVE_CONTRATO,ND.FEC_INI_CONTRATO
                FROM sera.NOMBRAMIENTOS_DEPOSITARIA ND,
                    sera.bien B 
                WHERE B.NO_BIEN = ND.NO_BIEN
                AND ND.NO_BIEN = ${propertyNumber} 
                AND ND.REVOCACION = 'N';
        `)
        const query2 = await this.entity.query(`
            SELECT NO_MOVIMIENTO,FECHA_REGISTRO,
            (case codigo when 100 then 'DEPOSITO EN EFECTIVO' end) descpago,
            REFERENCIA,CVE_BANCO,SUCURSAL, MONTO,ID_PAGO,IDORDENINGRESO
            FROM sera.PAGOREF_DEPOSITARIAS PAGOREF
            WHERE MONTO > 0 
            AND EXISTS (SELECT 1 
                            FROM sera.NOMBRAMIENTOS_DEPOSITARIA ND 
                            WHERE ND.NO_BIEN = 91133
                            AND ND.NO_BIEN = PAGOREF.NO_BIEN)   
            ORDER BY ID_PAGO DESC;
    
        `)
        const query3 = await this.entity.query(`
        SELECT ID_PAGOGENS,MONTO,IMP_SIN_IVA,IVA,MONTO_IVA,ABONO,PAGO_ACT,DEDUXCENT,DEDUVALOR,FECHA_PROCESO,
        (case status when 'P' then 'PAGADO' when 'A' then 'ABONO' when 'C' then 'COMPLEMENTO' end) ESTATUS, 
        OBSERV_PAGO,OBSERV_DEDU
      FROM sera.PAGOSGENS_DEPOSITARIAS
     WHERE NO_BIEN = ${propertyNumber}
       AND ID_PAGO = ${paymentId}
     ORDER BY ID_PAGOGENS DESC;
        `)

        const workSheet = xlsx.utils.json_to_sheet(query1);
        const workBook = xlsx.utils.book_new();

        const workSheet2 = xlsx.utils.json_to_sheet(query2);

        const workSheet3 = xlsx.utils.json_to_sheet(query3);
        let name = `src/files/excel1.xlsx`
        xlsx.utils.book_append_sheet(workBook, workSheet, "query1",true)
        await xlsx.write(workBook, { bookType: 'xlsx', type: 'buffer' })
        await xlsx.write(workBook, { bookType: 'xlsx', type: 'binary' })

        xlsx.utils.book_append_sheet(workBook, workSheet2, "query2",true)

        xlsx.utils.book_append_sheet(workBook, workSheet3, "query3",true)

        
        await xlsx.writeFile(workBook, name)
        
        var f = fs.readFileSync(name, { encoding: 'base64' })
        return { file: { name: `EXCEL1.xlsx`, base64: f} }
    }

}
