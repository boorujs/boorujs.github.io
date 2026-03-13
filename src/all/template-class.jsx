import { DOMManager } from "../util/js/dom-manager.jsx";
import { URLParameterManager } from "../util/js/url-parameter-manager.jsx";

/**
 * @typedef {Object} AutocompleteResult
 * @prop {string} name
 * @prop {number} count
 * @prop {string} value
 */

/**
 * @typedef {Object} SearchResult
 * @prop {string} thumbnail
 * @prop {string} preview
 * @prop {string} href
 * @prop {"static" | "animated" | "video"} type
 * @prop {string | number} id
 * @prop {{ name: string; count: number; }[]} tags
 */

/** @abstract */
export class Submodule {
    /**
     * @abstract Method run when autocompletion is searched for.
     * @param {string} query Value of input element.
     * @returns {Promise<AutocompleteResult[]>}
     */
    autocomplete(query) {
        throw new Error("Method must be implemented by subclass.");
    }
    
    /**
     * @abstract Method run when post results are searched for.
     * @param {string} query Value of input element.
     * @returns {Promise<SearchResult[]>}
     */
    search(query) {
        throw new Error("Method must be implemented by subclass.");
    }

    constructor () {
        this.url = new URLParameterManager();
        const dom = new DOMManager();

        this.element = {
            input:        dom.getElement("search-bar", "input.input"),
            clear:        dom.getElement("search-bar", "button.clear"),
            autocomplete: dom.getElement("search-bar", "ul.autocomplete"),
            submit:       dom.getElement("search-bar", "button.submit"),
            results:      dom.getElement("search-results")
        };
        
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
        const query = this.url.getParams().get("q");
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
