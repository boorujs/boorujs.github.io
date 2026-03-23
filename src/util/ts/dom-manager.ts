export class DOMManager {
    get<T extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap>(
        id: string, query?: string
    ): HTMLElementTagNameMap[T] {
        const el = document.getElementById(id);
        if (query) return el?.querySelector(query) as HTMLElementTagNameMap[T];
        else return el as HTMLElementTagNameMap[T];
    }

    create<T extends keyof HTMLElementTagNameMap>(
        tagName: T,
        options: {
            properties?: {
                [K in keyof HTMLElementTagNameMap[T]]?:
                    HTMLElementTagNameMap[T][K];
            };
            attributes?: Record<string, string>;
            on?: {
                [T in keyof HTMLElementEventMap]?: (
                    this: HTMLElementTagNameMap[T],
                    event: HTMLElementEventMap[T]
                ) => any;
            };
            once?: {
                [T in keyof HTMLElementEventMap]?: (
                    this: HTMLElementTagNameMap[T],
                    event: HTMLElementEventMap[T]
                ) => any;
            };
            children: (string | Node)[];
        }
    ): HTMLElementTagNameMap[T] {
        const element = document.createElement(tagName);

        Object.entries(options.attributes ?? {}).forEach(([key, value]) =>
            element.setAttribute(key, value)
        );
        Object.entries(options.properties ?? {}).forEach(([key, value]) =>
            element[key] = value
        );

        Object.entries(options.on ?? {}).forEach(([key, value]) =>
            element.addEventListener(key, value, false)
        );
        Object.entries(options.once ?? {}).forEach(([key, value]) =>
            element.addEventListener(key, value, true)
        );

        element.replaceChildren(...options.children);

        return element;
    }
}
