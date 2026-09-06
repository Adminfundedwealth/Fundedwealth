export declare function normalizeColumns(rows?: Array<Record<string, unknown>>): Set<string>;
export declare function getTableColumns(db: any, tableName: string): Promise<Set<string>>;
export declare function getTerminalTraderOwnerClauses(columns: Set<string>, userId: string): Array<{ column: string; value: string; type: string }>;
export declare function getAccountOwnerClauses(columns: Set<string>, userId: string, traderId: string | null): Array<{ column: string; value: string; type: string }>;
export declare function resolveUserTraderId(db: any, userId: string): Promise<string | null>;
export declare function fetchUserLiveAccounts(db: any, userId: string, traderId: string | null): Promise<any[]>;
export declare function resolveUserAccountOwnership(db: any, userId: string, accountId: string): Promise<{ rows?: any[] }>;
