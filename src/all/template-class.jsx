const ERROR_CODE = {
    METHOD_NOT_IMPLEMENTED: "Method must be implemented by subclass.",
    PROPERTY_NOT_IMPLEMENTED: "Property must be implemented by subclass.",
    UNEXPECTED_ERROR: "An unexpected error was caught."
};

/** @abstract */
export class Submodule {
    /**
     * @abstract Method run when autocompletion is searched for.
     * @param {string} query Value of input element.
     * @returns {Promise<{ name: string; count: number; value: string; }[]>}
     */
    autocomplete(query) {
        this.throwError("METHOD_NOT_IMPLEMENTED");
    }
    
    /**
     * @abstract Method run when post results are searched for.
     * @param {string} query Value of input element.
     * @returns {Promise<{
     *  thumbnail: string; preview: string;
     *  href: string; type: "static" | "animated" | "video";
     *  id: string | number; tags: { name: string; count: number; }[];
     * }[]>}
     */
    search(query) {
        this.throwError("METHOD_NOT_IMPLEMENTED");
    }

    constructor () {
        try {
            this.run();
        } catch (error) {
            window.alert(error);
            this.throwError("UNEXPECTED_ERROR");
        }
    }
    
    element = {
        input: this.getElement("search-bar", "input.input"),
        clear: this.getElement("search-bar", "button.clear"),
        autocomplete: this.getElement("search-bar", "ul.autocomplete"),
        submit: this.getElement("search-bar", "button.submit"),
        results: this.getElement("search-results")
    };

    run() {
        this.element.input.addEventListener("keydown",
            event => event.key === "Enter" && this.submitSearch().catch(window.alert)
        );
        this.element.submit.addEventListener("click",
            () => this.submitSearch().catch(window.alert)
        );
        this.element.input.addEventListener("input",
            () => this.suggestAutocompletion().catch(window.alert)
        );
    }

    /**
     * @param {string} id 
     * @param {string | undefined} query 
     * @returns {HTMLElement}
     */
    getElement(id, query) {
        const el = document.getElementById(id);
        if (query) return el.querySelector(query);
        else return el;
    }

    async suggestAutocompletion() {
        this.element.autocomplete.replaceChildren();
        const query = this.element.input.value;

        const results = await this.autocomplete(query);

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

        this.urlParam.set({ q: query });
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
                    { post.type === "video"
                        ? <video className="preview" src={post.preview}></video>
                        : <img className="preview" src={post.preview} />
                    }
                </a>
            </li>
        )));
        
        function setSrc(src) { return function () { this.src = src; }; }
    }

    urlParam = {
        set(object) {
            const params = new URLSearchParams();
            Object.entries(object).forEach(
                ([ key, value ]) => params.set(key, value)
            );
            this.setParams(params);
        },
        replace(object) {
            const params = this.getParams();
            Object.entries(object).forEach(
                ([ key, value ]) => params.set(key, value)
            );
            this.setParams(params);
        },
        remove(...keys) {
            const params = this.getParams();
            keys.forEach(params.delete);
            this.setParams(params);
        },
        getParams() {
            return new URL(window.location.href).searchParams;
        },
        setParams(params) {
            const url = new URL(window.location);
            url.search = params.toString();
            window.history.replaceState({}, "", url.href);
        }
    };

    /**
     * @param {keyof typeof ERROR_CODE} code
     */
    throwError(code) {
        throw new Error(ERROR_CODE[code]);
    }
}
