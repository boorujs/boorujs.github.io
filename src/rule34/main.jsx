import * as Rule34 from "https://esm.sh/gh/booru-abuse/booru-abuse@v0.1.0-alpha/src/module/rule34/index.ts.mjs?target=es2022";

/* this page is in testing and i just want to be sure esm.sh works before i get
 * custom api keys or a vercel service set up
 *
 * i dont value an individual limited key enough to hide it in any way, ill
 * refresh the key for the account once i get custom keys set up #lol
 * 
 * regardless dont abuse this key please and thanks!
 */
const auth = {
    api_key: "57931764243134609eb715b9d5c931134cb3cadfdbe166548b2b25543b869f82ee435076819810388fac48119b1eb0731dc86d75aff7b163e5d0c01f21618ecb",
    user_id: 5894621
};

const client = new Rule34.Client({ auth: auth });

try {
    client.test();
} catch (error) {
    window.alert([
        [
            "Uh-oh! The API key doesn't work properly. Please let me know via an",
            "issue and I'll be sure to fix it as soon as I can. Below are the",
            "specific error details."
        ].join(" "),
        error.toString()
    ].join("\n"));
    window.stop();
}

function getEl(i, q) {
    const el = document.getElementById(i);
    if (q) return el.querySelector(q);
    else return el;
}

const el = {
    input: getEl("search-bar", ".bar .input"),
    autocomplete: getEl("search-bar", ".autocomplete"),
    results: getEl("search-results")
};

el.input.addEventListener("keydown",
    event => event.key === "Enter" && submitSearch()
);
el.input.addEventListener("input", autocomplete);

function autocomplete() {
    el.autocomplete.replaceChildren();

    client.autocomplete(el.input.value)
    .then(tags => {
        el.autocomplete.replaceChildren();
        el.autocomplete.append(...tags.tags.map((tag, index) => (
            <li key={index}>
                <span className="name">{ tag.name }</span>
                <span className="count">{ tag.count }</span>
            </li>
        )
    ))});
}

function submitSearch() {
    el.results.replaceChildren();

    UrlParam.set({ q: el.input.value });

    client.search(el.input.value, {
        perPage: 42
    }).then(posts => {
        el.results.replaceChildren();
        el.results.append(...Array.from(posts).map(post => (
            <li
                key={post.id}
                title={
                    `${
                        post.id
                    }: ${
                        post.tags
                            .ofCategory(Rule34.TagType.Artist)
                            .map(t => `${t.name} (${t.count})`)
                            .join(", ")
                    }`
                }
            >
                <a href={post.file.url}>
                    <img
                        src={post.file.thumbnail.url}
                        onMouseOver={setSrc(post.file.downsample.url)}
                        onMouseOut ={setSrc(post.file.thumbnail.url)}
                    />
                </a>
            </li>
        )))
    });
    function setSrc(src) { return function () { this.src = src; }; }
}

const UrlParam = {
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
