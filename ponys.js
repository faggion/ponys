/* ponys v0.3.6
 * 2024 jhuddle
 *
 * Declarative creation of browser-native web components.
 */

/* a simple polyfill for Promise.allSettled */
if (!Promise.allSettled) {
    Promise.allSettled = function(promises) {
      return Promise.all(promises.map(p =>
        Promise.resolve(p).then(value => ({
          status: 'fulfilled',
          value
        }), reason => ({
          status: 'rejected',
          reason
        }))
      ));
    };
}

export default class {

    static define(name, template, options, url = '') {
        if (!template.content) {
            let templateElement = document.createElement('template');
            templateElement.innerHTML = template;
            template = templateElement;
        }
        template = template.content;

        let script = template.querySelector('script[setup]') || template.querySelector('script');

        // Fallback to empty string if script or script.text is undefined
        let scriptText = script ? script.text : '';

        let modifiedScriptText = scriptText.replace(
            /(import|from)\s*?(["'])\.{0,2}\/.*?[^\\](?=\2)/g,  // Matches relative imports
            (match, keyword, quote) => new URL(match, new URL(url, location.origin))
        );

        return import(
            'data:text/javascript;base64,' + btoa(modifiedScriptText)
        ).then(module => {
            if (script) {
                script.remove();
            }
            class Component extends (module.default || HTMLElement) {
                constructor() {
                    super();
                    let root = this;
                    try {
                        root = root.attachShadow({ mode: 'open' });
                    } catch (e) {
                        // Handle the case where Shadow DOM is not supported
                    }
                    this.$ = selector => root.querySelector(selector);
                    this.$$ = selector => root.querySelectorAll(selector);
                    let content = template.cloneNode(true);
                    propagateHost(this, content);
                    root.append(content);
                }
            }
            customElements.define(name, Component, options);
            return Component;
        });
    }

    static defineAll(container = document) {
        return Promise.allSettled(
            [...container.querySelectorAll('template[name]')].map(template => {
                let options = {};
                for (let { name, value } of template.attributes) {
                    options[name] = value;
                }
                return options.src
                    ? this.import(options.name, options.src, options)
                    : this.define(options.name, template, options);
            })
        );
    }

    static import(name, url, options) {
        return fetch(url)
            .then(response => response.ok ? response.text() : Promise.reject(new Error(url)))
            .then(text => this.define(name, text, options, url));
    }

}

function propagateHost(host, parentElement) {
    for (let element of parentElement.children) {
        element.host = host;
        element.$ = host.$;
        element.$$ = host.$$;
        propagateHost(host, element);
    }
}