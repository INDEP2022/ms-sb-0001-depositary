import { ListResultDTO } from "./listresult.dto";

export class ResponseDataDTO<T>  extends ListResultDTO<T>{
    readonly statusCode: number;
    readonly message: [string];

    constructor(
        queryParams,
        count,
        data,
        statusCode,
        message
    ){
        super(data,count,queryParams.page,queryParams.pageSize);
        this.statusCode = statusCode;
        this.message = message;
    }
}
