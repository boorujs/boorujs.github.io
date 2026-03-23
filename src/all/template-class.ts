import { DOMManager } from "../util/ts/dom-manager.ts";
import { URLParameterManager } from "../util/ts/url-parameter-manager.ts";

const { get: getEl, create: createEl } = new DOMManager();
const url = new URLParameterManager();

interface AutocompleteResult {
    name: string;
    count: number;
    value: string;
}

interface SearchResult {
    thumbnail: string;
    preview: string;
    href: string;
    type: "static" | "animated" | "video";
    id: string | number;
    tags: { name: string; count: number; }[];
}

export abstract class Submodule {
    /** Method run when autocompletion is searched for. */
    abstract autocomplete(query: string): Promise<AutocompleteResult[]>;
    
    /** Method run when post results are searched for. */
    abstract search(query: string): Promise<SearchResult[]>;

    element = {
        input:        getEl<"input">("search-bar", ".input")!,
        clear:        getEl<"button">("search-bar", ".clear")!,
        autocomplete: getEl<"ul">("search-bar", ".autocomplete")!,
        submit:       getEl<"button">("search-bar", ".submit")!,
        results:      getEl<"ul">("search-results")!
    };

    constructor () {
        this.bindEvents();
    }

    bindEvents() {
        // window.addEventListener("load", ...) doesnt work for some reason
        this.displaySearchResults();

        window.addEventListener("error",
            event => window.alert([
                `In ${event.filename}:${event.lineno}:${event.colno}:`,
                event.message
            ].join("\n"))
        );

        window.addEventListener("popstate",
            () => this.displaySearchResults()
        );

        this.element.input.addEventListener("input",
            () => this.suggestAutocompletion()
        );

        this.element.input.addEventListener("keydown",
            event => event.key === "Enter" && this.submitSearch()
        );
        this.element.submit.addEventListener("click",
            () => this.submitSearch()
        );
    }

    async suggestAutocompletion() {
        const query = this.element.input.value;
        if (!query) {
            this.element.autocomplete.replaceChildren();
            return;
        }

        const results = await this.autocomplete(query);
        
        if (!results.length) {
            this.element.autocomplete.replaceChildren(
                createEl("li", {
                    properties: { className: "no-results" },
                    children: [ "No results!" ]
                })
            );
            return;
        }

        this.element.autocomplete
        .replaceChildren(...results.map(tag =>
            createEl("li", { children: [
                createEl("span", {
                    properties: { className: "name" },
                    children: [ tag.name ]
                }),
                createEl("span", {
                    properties: { className: "count" },
                    children: [ tag.count ]
                })
            ]})
        ));
    }

    async submitSearch() {
        this.element.results.replaceChildren();
        const query = this.element.input.value;

        url.set({ q: query });
        this.displaySearchResults();
    }

    async displaySearchResults() {
        const query = url.getParams().get("q") ?? "";
        this.element.input.value = query;
        const results = await this.search(query);

        this.element.results
        .replaceChildren(...results.map(post =>
            createEl("li", {
                properties: {
                    className: post.type,
                    title: `${post.id}: ${post.tags
                        .map(t => `${t.name} (${t.count})`)
                        .join(", ")
                    }`
                },
                children: [ createEl("a", {
                    properties: { href: post.href },
                    children: [
                        createEl("img", {
                            properties: {
                                className: "thumb",
                                src: post.thumbnail
                            }
                        }),
                        createEl("img", {
                            properties: {
                                className: "preview",
                                src: post.preview
                            }
                        })
                    ]
                })]
            }
        )));
    }
}
