import { DOMManager } from "../util/js/dom-manager.js";
import { URLParameterManager } from "../util/js/url-parameter-manager.js";

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

/** @abstract */
export abstract class Submodule {
    /**
     * Method run when autocompletion is searched for.
     */
    abstract autocomplete(query: string): Promise<AutocompleteResult[]>;
    
    /**
     * Method run when post results are searched for.
     */
    abstract search(query: string): Promise<SearchResult[]>;

    url = new URLParameterManager();
    dom = new DOMManager();

    element = {
        input:        this.dom.get<"input">("search-bar", ".input")!,
        clear:        this.dom.get<"button">("search-bar", ".clear")!,
        autocomplete: this.dom.get<"ul">("search-bar", ".autocomplete")!,
        submit:       this.dom.get<"button">("search-bar", ".submit")!,
        results:      this.dom.get<"ul">("search-results")!
    } satisfies Record<any, Element>;

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
                <li className="no-results">No results!</li>
            )
            return;
        }

        this.element.autocomplete
        .replaceChildren(...results.map((tag, index) => (
            <li key={index}>
                <span className="name">{ tag.name }</span>
                <span className="count">{ tag.count }</span>
            </li>
        )));
    }

    async submitSearch() {
        this.element.results.replaceChildren();
        const query = this.element.input.value;

        this.url.set({ q: query });
        this.displaySearchResults();
    }

    async displaySearchResults() {
        const query = this.url.getParams().get("q") ?? "";
        this.element.input.value = query;
        const results = await this.search(query);

        this.element.results
        .replaceChildren(...results.map((post, index) => (
            <li key={index}
                className={post.type}
                title={`${post.id}: ${post.tags
                    .map(t => `${t.name} (${t.count})`)
                    .join(", ")
                }`}
            >
                <a href={post.href}>
                    <img className="thumb" src={post.thumbnail} />
                    <img className="preview" src={post.preview} />
                </a>
            </li>
        )));
    }
}
