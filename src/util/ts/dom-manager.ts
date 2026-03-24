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
                [E in keyof HTMLElementEventMap]?: (
                    this: HTMLElementTagNameMap[T],
                    event: HTMLElementEventMap[E]
                ) => any;
            };
            once?: {
                [E in keyof HTMLElementEventMap]?: (
                    this: HTMLElementTagNameMap[T],
                    event: HTMLElementEventMap[E]
                ) => any;
            };
            children?: (string | Node)[];
        }
    ): HTMLElementTagNameMap[T] {
        const element = document.createElement(tagName);

        if (options.attributes)
            Object.entries(options.attributes).forEach(([key, value]) =>
                element.setAttribute(key, value)
            );
        if (options.properties)
            Object.entries(options.properties).forEach(([key, value]) =>
                element[key as keyof typeof element] = value
            );

        if (options.on)
            Object.entries(options.on).forEach(([key, value]) =>
                element.addEventListener(key, value as EventListenerOrEventListenerObject, false)
            );
        if (options.once)
            Object.entries(options.once).forEach(([key, value]) =>
                element.addEventListener(key, value as EventListenerOrEventListenerObject, true)
            );

        if (options.children)
            element.replaceChildren(...options.children);

        return element;
    }
}
