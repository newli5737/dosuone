export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export declare function paginate(page?: number, limit?: number): {
    skip: number;
    take: number;
    page: number;
    limit: number;
};
export declare function paginationMeta(page: number, limit: number, total: number): PaginationMeta;
