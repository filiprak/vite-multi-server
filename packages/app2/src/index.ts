class HelloWorld extends HTMLElement {
    constructor() {
        super(); // always call super() first in the constructor

        // Optional: attach a shadow DOM
        const shadow = this.attachShadow({ mode: 'open' });

        // Add content
        shadow.innerHTML = `
          <style>
            div { color: white; font-weight: bold; padding: 10px }
          </style>
          <div style="background: grey">
            Hello, World!
          </div>
        `;
    }
}

// Register the element
customElements.define('hello-world', HelloWorld);
