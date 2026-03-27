export interface PostreSqlUri {
    port: number;
    host: string;
    database?: string | undefined;
    user?: string | undefined;
    password?: string | undefined;
    ssl: boolean;
}