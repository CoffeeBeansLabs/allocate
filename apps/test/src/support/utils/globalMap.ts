// globalMap.ts

export class GlobalMap {
    private static instance: GlobalMap;
    private static map: Map<string, string> = new Map<string, string>();

    private constructor() { }

    public static getInstance(): GlobalMap {
        if (!GlobalMap.instance) {
            GlobalMap.instance = new GlobalMap();
        }
        return GlobalMap.instance;
    }

    public addField(key: string, value: string): void {
        if (GlobalMap.map.has(key)) {
            const oldValue = GlobalMap.map.get(key);
            console.log(`Overwriting field: ${key}. Old value: ${oldValue}, New value: ${value}`);
        } else {
            console.log(`Adding new field: ${key} with value: ${value}`);
        }
        GlobalMap.map.set(key, value);
    }

    public getField(key: string): string | undefined {
        return GlobalMap.map.get(key);
    }

    public hasField(key: string): boolean {
        return GlobalMap.map.has(key);
    }
}

export const globalMap = GlobalMap.getInstance();