export class ListResultDTO<T> {
    readonly data: T[];
    readonly count?: number;
    readonly page?: number;
    readonly pageSize?: number;
    readonly pageCount?: number;

    constructor(
        data,
        count,
        page,
        pageSize
    ){
        this.data = data;
        this.count = count;
        this.page = page ?? 1;
        this.pageSize = pageSize ?? 10;
        this.pageCount = this.count > 0 ? Math.ceil(this.count / this.pageSize) : 0;
    }
}
