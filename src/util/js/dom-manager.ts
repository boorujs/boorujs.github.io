export class DOMManager {
    get<T extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap>(
        id: string, query?: string
    ): HTMLElementTagNameMap[T] {
        const el = document.getElementById(id);
        if (query) return el?.querySelector(query) as HTMLElementTagNameMap[T];
        else return el as HTMLElementTagNameMap[T];
    }

    /* create<T extends keyof HTMLElementTagNameMap>(
        tagName: T,
        options: {
            attributes?: Record<string, string>;
            properties?: {
                [K in keyof HTMLElementTagNameMap[T]]?: HTMLElementTagNameMap[T][K];
            };
            events?: {
                [type: string]: (event: Event) => void;
            };
        }
    ): HTMLElementTagNameMap[T] {

    } */
}
