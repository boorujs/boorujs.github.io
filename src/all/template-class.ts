import { getEl, createEl } from "../util/ts/dom.ts";
import { URLParameterManager } from "../util/ts/url-parameter-manager.ts";

const url = new URLParameterManager();

export abstract class Submodule {
    /** Method run when autocompletion is searched for. */
    abstract autocomplete(query: string): Promise<{
        name: string;
        count: number;
        value: string;
    }[]>;
    
    /** Method run when post results are searched for. */
    abstract search(query: string, page: number): Promise<{
        thumbnail: string;
        preview: string;
        href: string;
        type: "static" | "animated" | "video";
        id: string | number;
        tags: { name: string; count: number; }[];
    }[]>;

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
        this.bindEvents();
    }

    //#region events

    bindEvents() {
        // window.addEventListener("load", ...) doesnt work for some reason
        const onload = () => {
            const query = url.get("q");
            const page = url.get("p");
            if (query !== null || page !== null) {
                this.setSearchValues(query);
                this.setPageValues(page);
                this.submitSearch(query ?? "", page ?? 0);
            }
        };
        onload();

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
            const page = parseInt(url.get("p"));
            this.el.flipper.input.value = page ?? 0;
            this.displaySearchResults(e.state);
        });

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
            const page = this.el.flipper.input.value;
            this.submitSearch(query, page);
        }

        this.el.flipper.prev.addEventListener("click", () => {
            const query = url.get("q");
            const page = parseInt(url.get("p"));
            this.submitSearch(query, ++page);
        });
        this.el.flipper.next.addEventListener("click", () => {
            const query = url.get("q");
            const page = parseInt(url.get("p"));
            this.submitSearch(query, --page);
        });

        this.el.flipper.input.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                const query = url.get("q");
                const page = this.el.flipper.input.value;
                this.submitSearch(query, page);
            }
        });
    }

    //#region autocomplete

    getAutocompleteWord() {
        const text = this.el.search.input.value;
        const index = this.el.search.input.selectionStart;
        if (index !== null) {
            return (
                text.substring(0, index).match( /[^ ]*$/)![0] +
                text.substring(index)   .match(/^[^ ]*/ )![0]
            );
        } else return null;
    }

    async suggestAutocompletion() {
        const tag = this.getAutocompleteWord();
        if (!tag) {
            this.displayAutocomplete(null);
            return;
        } else {
            const results = await this.autocomplete(tag);
            this.displayAutocomplete(results);
        }
    }

    //#region search

    async submitSearch(query, page) {
        this.setSearchValues(query);
        this.setPageValues(page);

        this.displaySearchResults(null);
        const results = await this.search(query, page);
        url.set({ q: query, p: page }, results);
        this.displaySearchResults(results);
    }

    searchBarSubmit() {
        const query = this.el.search.input.value;
        const page = this.el.flipper.input.value;
        this.submitSearch(query, page);
    }

    setSearchValues(query) {
        if (query !== null) this.el.search.input.value = query;
    }

    //#region page flipper

    setPageValues(page) {
        page ??= 0;
        this.el.flipper.input.value = page;
        if (page === 0)
            this.el.flipper.prev.disabled = true;
    }

    //#region display

    displayAutocomplete(tags) {
        switch (true) {
            case !tags:
                list.replaceChildren();
                break;
            case !tags.length:
                list.replaceChildren(
                    createEl("li", {
                        properties: { className: "no-results" },
                        children: [ "No results!" ]
                    })
                );
                break;
            default:
                list.replaceChildren(...tags.map(tag =>
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
    }

    displaySearchResults(posts) {
        const list = this.el.results;
        switch (true) {
            case !posts:
                list.replaceChildren();
                break;
            case !posts.length:
                list.replaceChildren(
                    createEl("li", {
                        properties: { className: "no-results" },
                        children: [ "No results!" ]
                    })
                );
                break;
            default:
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
}
