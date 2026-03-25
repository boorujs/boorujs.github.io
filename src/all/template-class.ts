import { getEl, createEl } from "../util/ts/dom.ts";
import { URLParameterManager } from "../util/ts/url-parameter-manager.ts";
import type { AutocompleteResult, SearchResult } from "./return-types.ts";

const url = new URLParameterManager();

export abstract class Submodule {
    /** Method run when autocompletion is searched for. */
    abstract autocomplete(query: string): Promise<AutocompleteResult[]>;
    
    /** Method run when post results are searched for. */
    abstract search(query: string, page: number): Promise<SearchResult[]>;

    el = {
        search: {
            input: getEl<"input">("#search-bar .input"),
            clear: getEl<"button">("#search-bar .clear"),
            submit: getEl<"button">("#search-bar .submit"),
            autocomplete: getEl<"ul">("#search-bar .autocomplete"),
        },
        flipper: {
            prev: getEl<"button">("#page-flipper .prev"),
            next: getEl<"button">("#page-flipper .next"),
            input: getEl<"button">("#page-flipper .input")
        },
        results: getEl<"ul">("#search-results"),
        post: getEl<"article">("#post")
    };

    constructor () {
        this.bindWindowEvents();
        this.bindSearchBarEvents();
        this.bindFlipperEvents();
        this.bindAdditionalEvents?.();
    }

    //#region events

    bindWindowEvents() {
        // window.addEventListener("load", ...) doesnt work for some reason
        const onLoad = () => {
            const query = url.get("q") ?? "";
            const page = url.get("p") ?? "0";
            this.setSearchValues(query);
            this.setPageValues(page);
            this.submitSearch(query, page);
        };
        onLoad();

        window.addEventListener("error",
            e => window.alert([
                "ERROR ENCOUNTERED",
                `In ${e.filename}:${e.lineno}:${e.colno} :`,
                e.message
            ].join("\n"))
        );

        window.addEventListener("popstate", e => {
            const query = url.get("q");
            if (query) this.el.search.input.value = query;
            const page = url.get("p");
            this.el.flipper.input.value = page ?? "0";
            this.displaySearchResults(e.state);
        });
    }

    bindSearchBarEvents() {
        this.el.search.input.addEventListener("input",
            () => this.suggestAutocompletion()
        );

        this.el.search.input.addEventListener("keydown",
            e => e.key === "Enter" && submit()
        );
        this.el.search.submit.addEventListener("click",
            () => submit()
        );

        const submit = () => {
            const query = this.el.search.input.value;
            this.submitSearch(query, "0");
            this.el.search.input.blur();
        }
    }

    bindFlipperEvents() {
        this.el.flipper.prev.addEventListener("click",
            () => flip(-1)
        );
        this.el.flipper.next.addEventListener("click",
            () => flip(+1)
        );

        const flip = (dir: 1 | -1) => {
            const query = url.get("q") ?? "";
            const page = url.get("p") ?? "0";
            this.submitSearch(query, (parseInt(page) + dir).toString());
        };

        this.el.flipper.input.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                const query = url.get("q") ?? "";
                const page = this.el.flipper.input.value;
                this.submitSearch(query, page);
            }
        });
    }

    bindAdditionalEvents?(): void;

    //#region autocomplete

    lastTagRegex = /[^ ]*$/;

    getAutocompleteWord() {
        const text = this.el.search.input.value;
        const index = this.el.search.input.selectionStart;
        if (index !== null) {
            const word = (
                text.substring(0, index).match( /[^ ]*$/)![0] +
                text.substring(index)   .match(/^[^ ]*/ )![0]
            );
            return word;
        } else return null;
    }

    async suggestAutocompletion() {
        // const word = this.getAutocompleteWord();
        const word = this.el.search.input.value.match(this.lastTagRegex)![0];
        if (!word) {
            this.displayAutocomplete(null);
        } else {
            const results = await this.autocomplete(word);
            this.displayAutocomplete(results);
        }
    }

    autocompleteWord(word: string) {
        const input = this.el.search.input;
        input.value = input.value.replace(this.lastTagRegex, word);
        this.displayAutocomplete(null);
    }

    //#region search

    async submitSearch(query: string, page: string) {
        this.setSearchValues(query);
        this.setPageValues(page);

        this.displaySearchResults(null);
        const results = await this.search(query, parseInt(page));
        url.set({ q: query, p: page }, results);
        this.displaySearchResults(results);
    }

    setSearchValues(query: string) {
        if (query !== null) this.el.search.input.value = query;
    }

    //#region page flipper

    setPageValues(page: string) {
        this.el.flipper.input.value = page;
        if (page === "0")
            this.el.flipper.prev.disabled = true;
        else
            this.el.flipper.prev.disabled = false;
    }

    //#region display

    displayAutocomplete(tags: {
        name: string;
        count: number;
        value: string;
    }[] | null) {
        const list = this.el.search.autocomplete;
        if (!tags)
            list.replaceChildren();
        else if (!tags.length)
            list.replaceChildren(
                createEl("li", {
                    properties: { className: "no-results" },
                    children: [ "No results!" ]
                })
            );
        else
            list.replaceChildren(...tags.map((tag) =>
                createEl("li", {
                    once: {
                        "click": () => this.autocompleteWord(tag.value),
                    },
                    children: [
                        createEl("span", {
                            properties: { className: "name" },
                            children: [ tag.name ]
                        }),
                        createEl("span", {
                            properties: { className: "count" },
                            children: [ tag.count.toString() ]
                        })
                    ]
                })
            ));
    }

    displaySearchResults(posts: SearchResult[] | null) {
        const list = this.el.results;
        if (!posts)
            list.replaceChildren();
        else if (!posts.length)
            list.replaceChildren(
                createEl("li", {
                    properties: { className: "no-results" },
                    children: [ "No results!" ]
                })
            );
        else
            list.replaceChildren(...posts.map(post =>
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
                            createEl("img", { properties: {
                                className: "thumb",
                                src: post.thumbnail
                            }}),
                            createEl("img", { properties: {
                                className: "preview",
                                src: post.preview
                            }})
                        ]
                    })]
                })
            ));
    }
}
