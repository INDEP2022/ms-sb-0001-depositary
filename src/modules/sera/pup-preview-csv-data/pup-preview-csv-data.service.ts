import { Injectable } from '@nestjs/common';
import * as xlsx from 'xlsx'
import * as fs from 'fs'

@Injectable()
export class PupPreviewCsvDataService {


    async previewData(file: any) {
        const name = `src/files/${file.originalname}`
        await this.saveFile(file)
        const ABC = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

        const rows = xlsx.readFile(name)
        let flag = true;
        var data: any[] = []
        const shet = rows['SheetNames'][0]
        var titles = []
        if (shet) {
            const info = rows['Sheets'][shet]
            for (let i = 1; flag; i++) {
                var obj = {}
                for (let j = 0; j < ABC.length; j++) {
                    const key = `${ABC[j]}${i}`
                    const value = info[key] ? info[key]['v'] : null
                    if (value) {
                        if (i == 1) {
                            titles.push(value)
                            obj[value] = value
                        } else {
                            obj[titles[j]] = value
                        }
                    }
                }
                data.push(obj)
                if (!info['A' + (i + 1)]) {
                    flag = false
                }
            }
        } else {
            return []
        }
        return data
    }

    saveFile(file:any){
        return new Promise((res,rej)=>{
            const name = `src/files/${file.originalname}`
            const ws = fs.createWriteStream(name)
            ws.write(Buffer.from(file.buffer.data))
            ws.end(null, () => {
                res(true)
            })
        })
       

    }

}
