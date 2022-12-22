import { Injectable } from '@nestjs/common';
import { RefPagoDTO } from './dto/ref-pago.dto';
import { REFERENCIA } from './dto/reference.dto';

@Injectable()
export class RefPagoService {

    
    calculateCondensedDate(refPago: RefPagoDTO) {
        const ANIO_RESTA = 2000;
        const NUMMULTANIO = 372;
        const NUMMULTMES = 31;

        const RESULTANIO = (refPago.year - ANIO_RESTA) * NUMMULTANIO;
        const RESULTMES = (refPago.month - 1) * NUMMULTMES;
        const RESULTDIA = refPago.day - 1;
        const FECCONDENSADA = RESULTANIO + RESULTMES + RESULTDIA;
        return {
            statusCode: 200,
            message: ["OK"],
            data: {
                condensedDate: FECCONDENSADA
            }
        }

    }
    
    calculateImpCondensed(reference: string) {
        var CARACTER = null;
        const DIGITO = 0;
        var J = 0;
        const COUNT = 0;
        var LONG = reference.length;
        const V_7 = 7;
        const V_3 = 3;
        const V_1 = 1;
        var V_CONT = 1;
        var V_SUM = 0;

        for (let i = 1; i <= reference.length; i++) {
            J = J - 1
            CARACTER = parseInt(reference.substring(LONG - 1, LONG))
            LONG--
            switch (V_CONT) {
                case 1:
                    V_SUM += CARACTER * V_7;
                    break
                case 2:
                    V_SUM += CARACTER * V_3;
                    break
                case 3:
                    V_SUM += CARACTER * V_1;
                    break
                case 4:
                    V_CONT = 1;
                    break
            }

            V_CONT++
        }
        return {
            statusCode: 200,
            message: ["OK"],
            data: {
                verifiedDigit: V_SUM % 10
            }
        }

    }

    checkedDigitCalculation(reference: string) {
        var L_CARACTER = null;
        var L_DIGITO = 0;
        var L_D23 = 23;
        var L_D19 = 19;
        var L_D17 = 17;
        var L_D13 = 13;
        var L_D11 = 11;
        var L_COUNT = 0;
        var J = 0;
        var Y = 0;
        var L_SUMAREF = 0;
        var Y_AUX = 0;  


        var digits = 
            {"0":0,"1":1,"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"A":10,"B":11,"C":12,"D":13,"E":14,"F":15,"G":16,"H":17,"I":18,"J":19,"K":20,"L":21,"M":22,"N":23,"O":24,"P":25,"Q":26,"R":27,"S":28,"T":29,"U":30,"V":31,"W":32,"X":33,"Y":34,"Z":35}
        

        var REFERENCIAS:REFERENCIA[] = []
        var ref:REFERENCIA={};

        for (let i = 1; i <= reference.length; i++) {
            J ++
            L_CARACTER = reference.substring(i-1,i)
            L_COUNT++

            L_DIGITO = digits[L_CARACTER]

            if(i<= 5){

                switch(L_COUNT){
                    case 1:
                        ref.D1 =(L_DIGITO*L_D17);
                        break
                    case 2:
                        ref.D2 =(L_DIGITO*L_D13);
                        break
                    case 3:
                        ref.D3 =(L_DIGITO*L_D11);
                        break
                    case 4:
                        ref.D4 =(L_DIGITO*L_D23);
                        break

                    case 5:
                        ref.D5 =(L_DIGITO*L_D19);
                        break
                }
                L_COUNT = 0;

              
            }

            if(i >=6 && i <=10){

                switch(L_COUNT){
                    case 1:
                        ref.D6 =(L_DIGITO*L_D17);
                        break
                    case 2:
                        ref.D7 =(L_DIGITO*L_D13);
                        break
                    case 3:
                        ref.D8 =(L_DIGITO*L_D11);
                        break
                    case 4:
                        ref.D9 =(L_DIGITO*L_D23);
                        break

                    case 5:
                        ref.D10 =(L_DIGITO*L_D19);
                        break
                }
                L_COUNT = 0;
              
            }
            if(i >=11 && i <=15){

                switch(L_COUNT){
                    case 1:
                        ref.D11 =(L_DIGITO*L_D17);
                        break
                    case 2:
                        ref.D12 =(L_DIGITO*L_D13);
                        break
                    case 3:
                        ref.D13 =(L_DIGITO*L_D11);
                        break
                    case 4:
                        ref.D14 =(L_DIGITO*L_D23);
                        break

                    case 5:
                        ref.D15 =(L_DIGITO*L_D19);
                        break
                }
                L_COUNT = 0;
              
            }
            if(i >=16 && i <=20){

                switch(L_COUNT){
                    case 1:
                        ref.D16 =(L_DIGITO*L_D17);
                        break
                    case 2:
                        ref.D17 =(L_DIGITO*L_D13);
                        break
                    case 3:
                        ref.D18 =(L_DIGITO*L_D11);
                        break
                    case 4:
                        ref.D19 =(L_DIGITO*L_D23);
                        break

                    case 5:
                        ref.D20 =(L_DIGITO*L_D19);
                        break
                }
                L_COUNT = 0;
              
            }

            if(i >=21 && i <=25){

                switch(L_COUNT){
                    case 1:
                        ref.D21 =(L_DIGITO*L_D17);
                        break
                    case 2:
                        ref.D22 =(L_DIGITO*L_D13);
                        break
                    case 3:
                        ref.D23 =(L_DIGITO*L_D11);
                        break
                    case 4:
                        ref.D24 =(L_DIGITO*L_D23);
                        break

                    case 5:
                        ref.D25 =(L_DIGITO*L_D19);
                        break
                }
                L_COUNT = 0;
              
            }

            if(i >=26 && i <=30){

                switch(L_COUNT){
                    case 1:
                        ref.D26 =(L_DIGITO*L_D17);
                        break
                    case 2:
                        ref.D27 =(L_DIGITO*L_D13);
                        break
                    case 3:
                        ref.D28 =(L_DIGITO*L_D11);
                        break
                    case 4:
                        ref.D29 =(L_DIGITO*L_D23);
                        break

                    case 5:
                        ref.D30 =(L_DIGITO*L_D19);
                        break
                }
                L_COUNT = 0;
              
            }
            if(i >=31 && i <=35){

                switch(L_COUNT){
                    case 1:
                        ref.D30 =(L_DIGITO*L_D17);
                        break
                    case 2:
                        ref.D31 =(L_DIGITO*L_D13);
                        break
                    case 3:
                        ref.D32 =(L_DIGITO*L_D11);
                        break
                    case 4:
                        ref.D33 =(L_DIGITO*L_D23);
                        break

                    case 5:
                        ref.D34 =(L_DIGITO*L_D19);
                        break
                }
                L_COUNT = 0;
              
            }
            if(i >=36 && i <=39){

                switch(L_COUNT){
                    case 1:
                        ref.D36 =(L_DIGITO*L_D17);
                        break
                    case 2:
                        ref.D37 =(L_DIGITO*L_D13);
                        break
                    case 3:
                        ref.D38 =(L_DIGITO*L_D11);
                        break
                    case 4:
                        ref.D39 =(L_DIGITO*L_D23);
                        break
                }
                L_COUNT = 0;
              
            }
            console.log('====================================');
            console.log(ref);
            console.log('====================================');
        
            REFERENCIAS[J]= ref
 
                 
          
        }

        REFERENCIAS.forEach(item => {
            Y++
            L_SUMAREF += REFERENCIAS[Y][`D${Y}`]||0
        });
        return {
            statusCode: 200,
            message: ["OK"],
            data: {
                verifiedDigit:(L_SUMAREF%97)+1
            }
        }

    }

    checkedDigitCalculationHSBC(reference: string) {
        var L_DIGITVERIF = 0;
        var V_TEXT_LENGT = 0
        var L_D23 = 23;
        var L_D19 = 19;
        var L_D17 = 17;
        var L_D13 = 13;
        var L_D11 = 11;
        var V_MULTI = 1;
        var L_SUMAREF = 0;
        var V_CADENA_P = 0
        var V_CONT = 0;

        V_TEXT_LENGT = reference.length;
        V_CONT = V_TEXT_LENGT;
        for (let i = 1; i <= V_TEXT_LENGT; i++) {
            V_CADENA_P = parseInt(reference.substring(V_CONT - 1, V_CONT))
            switch (V_MULTI) {
                case 1:
                    L_SUMAREF += (V_CADENA_P * L_D11)
                    break;
                case 2:
                    L_SUMAREF += (V_CADENA_P * L_D13)

                    break
                case 3:
                    L_SUMAREF += (V_CADENA_P * L_D17)
                    break
                case 4:
                    L_SUMAREF += (V_CADENA_P * L_D19)

                    break;
                case 5:
                    L_SUMAREF += (V_CADENA_P * L_D23)

                    break;
                case 6:
                    V_MULTI = 1
                    break;
            }
            V_CONT--
            V_MULTI++
        }
        L_DIGITVERIF = (L_SUMAREF % 97) + 1

        return {
            statusCode: 200,
            message: ["OK"],
            data: {
                verifiedDigit: L_DIGITVERIF < 10 ? `0${L_DIGITVERIF}` : `${L_DIGITVERIF}`

            }
        }

    }

    checkedDigitCalculationScotia(reference: string) {
        var L_DIGITVERIF = 0;
        var V_TEXT_LENGT = 0; 
        var L_D23        = 23;
        var L_D19        = 19;
        var L_D17        = 17;
        var L_D13        = 13;
        var L_D11        = 11;  
        var V_MULTI      = 1;
        var L_SUMAREF    = 0;  
        var V_CADENA_P   =0;  
        var V_CONT       =0;

        V_TEXT_LENGT = reference.length
        V_CONT = V_TEXT_LENGT

        for (let i = 1; i <= V_TEXT_LENGT; i++) {
            V_CADENA_P =  parseInt(reference.substring(V_CONT - 1, V_CONT))

            switch (V_MULTI) {
                case 1:
                    L_SUMAREF += (V_CADENA_P * L_D11)
                    break;
                case 2:
                    L_SUMAREF += (V_CADENA_P * L_D13)

                    break
                case 3:
                    L_SUMAREF += (V_CADENA_P * L_D17)
                    break
                case 4:
                    L_SUMAREF += (V_CADENA_P * L_D19)

                    break;
                case 5:
                    L_SUMAREF += (V_CADENA_P * L_D23)

                    break;
                case 6:
                    V_MULTI = 1
                    break;
            }
            V_CONT--
            V_MULTI++

        }

        L_DIGITVERIF = (L_SUMAREF % 97) + 1

        return {
            statusCode: 200,
            message: ["OK"],
            data: {
                verifiedDigit: L_DIGITVERIF < 10 ? `0${L_DIGITVERIF}` : `${L_DIGITVERIF}`
            }
        }


    }

}
