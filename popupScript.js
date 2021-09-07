class ZamaPopup {
    constructor () {
        this._basicAuthToken = null;
        this._apiKeyToken = null;
        this._oAuthToken = null;
        this._authType = null;
        this._pathId = null;
        this._formData = [];
    }

    generateTextField({ label, name, required, disabled, value }) {
        return `
        <div class="uk-margin">
            <label class="uk-form-label" for="field-${name}">${label || name}${required ? '&nbsp;<b style="color: red;font-size: 12px;vertical-align: top;">*</b>' : ''}</label>
            <div class="uk-form-controls">
                <input class="uk-input" type="text" name="field-${name}" placeholder="Enter ${name}" id="field-${name}"${required ? ' required' : ''}${disabled ? ' disabled' : ''}${value ? ` value="${value}"` : ''}>
            </div>
        </div>
        `;
    }

    generatePasswordField({ label, name, required, disabled, value }) {
        return `
        <div class="uk-margin">
            <label class="uk-form-label" for="field-${name}">${label || name}${required ? '&nbsp;<b style="color: red;font-size: 12px;vertical-align: top;">*</b>' : ''}</label>
            <div class="uk-form-controls">
                <input class="uk-input" type="password" name="field-${name}" placeholder="Enter ${name}" id="field-${name}"${required ? ' required' : ''}${disabled ? ' disabled' : ''}${value ? ` value="${value}"` : ''}>
            </div>
        </div>
        `;
    }

    generateFileField({ label, name, required, disabled, value }) {
        return `
        <div class="uk-margin">
            <label class="uk-form-label" for="field-${name}">${label || name}${required ? '&nbsp;<b style="color: red;font-size: 12px;vertical-align: top;">*</b>' : ''}</label>
            <div class="uk-form-controls">
                <input class="uk-input" style="padding: 7px;" type="file" name="field-${name}" placeholder="Enter ${name}" id="field-${name}"${required ? ' required' : ''}${disabled ? ' disabled' : ''}${value ? ` value="${value}"` : ''}>
            </div>
        </div>
        `;
    }

    generateTextArea({ label, name, required, disabled, modelExample, example, value }) {
        return `
        <div class="uk-margin">
            <label class="uk-form-label" for="field-${name}">${label || name}${required ? '&nbsp;<b style="color: red;font-size: 12px;vertical-align: top;">*</b>' : ''}</label>
            <div class="uk-form-controls">
                <textarea class="uk-textarea" ${modelExample ? `rows="${(modelExample.match(/\n/g) || []).length < 15 ? (modelExample.match(/\n/g) || []).length : 15}"` : ''} name="field-${name}" placeholder="Enter ${name}" id="field-${name}"${required ? ' required' : ''}${disabled ? ' disabled' : ''}>${value || modelExample || example || ''}</textarea>
            </div>
        </div>
        `;
    }

    generateSelect({ label, name, options = [], required, disabled, value }) {
        return `
        <div class="uk-margin">
            <label class="uk-form-label" for="field-${name}">${label || name}${required ? '&nbsp;<i style="color: red;font-size: 8px;vertical-align: super;" class="fas fa-asterisk"></i>' : ''}</label>
            <div class="uk-form-controls">
                <select class="uk-select" placeholder="${name}" name="field-${name}" id="field-${name}"${required ? ' required' : ''}${disabled ? ' disabled' : ''}${value ? ` value="${value}"` : ''}>
                    ${options.map(({ name, value }) => `<option value="${value}">${name}</option>`).join('')}
                </select>
            </div>
        </div>
        `;
    }

    injectFieldHtml(fieldHtml) {
        if ($('#zamaModal').length) {
        $('#zamaModal .uk-modal-body').append(fieldHtml);
        }
    }

    injectBreak() {
        this.injectFieldHtml("<hr />");
    }

    injectButton({ onClick, name = '', label = 'Submit'}) {
        if ($('#zamaModal').length) {
        this.injectFieldHtml(`
            <div style="height: 40px;">
            <button type="button" style="float: right;" class="zama-internal-${name}-btn uk-button uk-button-primary">${label}</button>
            </div>
        `);

        $(`.zama-internal-${name}-btn`).off("click");
        $(`.zama-internal-${name}-btn`).click(onClick);
        }
    }

    resetFields() {
        if ($('#zamaModal').length) {
        $('#zamaModal .uk-modal-body').html('');
        }
    }

    setTitle(title) {
        if ($('#zamaModal').length) {
        $('#zamaModal .uk-modal-header .uk-modal-title').html(title);
        }
    }

    getTitle() {
        if ($('#zamaModal').length) {
        return $('#zamaModal .uk-modal-header .uk-modal-title').html();
        }
    }

    injectTitle(title) {
        this.injectFieldHtml(`<h4>${title}</h4>`);
    }

    createField({ type, ...props }) {
        let fieldHtml = '';
        type = type && type.toLowerCase();

        if (type === 'array') {
        const {items = {}} = props;
        const {enum: enums = []} = items;
        if (enums.length) {
            props.options = enums.map(e => ({name: e, value: e}));
            type = 'select'
        } else {
            type = 'text';
        }
        }

        if (type === 'boolean') {
        props.options = [true, false].map(e => ({name: e, value: e}));
        type = 'select'
        }

        if (['string'].includes(type)) type = 'text';
        else if (['int', 'integer'].includes(type)) type = 'number';
        else if (['boolean'].includes(type)) type = 'select';
        else if (['object', '', undefined, null].includes(type)) type = 'textarea';
        
        // type = 'string', format: 'byte' => https://swagger.io/docs/specification/data-models/data-types/#file 
        // else if (['', '', ''].includes(type)) type = 'file';

        if (type === 'text') {
        fieldHtml = this.generateTextField(props);
        } else if (type === 'number') {
        fieldHtml = this.generateTextField(props);
        } else if (type === 'password') {
        fieldHtml = this.generatePasswordField(props);
        } else if (type === 'select') {
        fieldHtml = this.generateSelect(props);
        } else if (type === 'textarea') {
        fieldHtml = this.generateTextArea(props);
        } else if (type === 'file') {
        fieldHtml = this.generateFileField(props);
        }

        if (fieldHtml) {
        this.injectFieldHtml(fieldHtml);
        }
    }

    attachOnSubmit(cb) {
        $('#zamaModal form').off('submit');
        $('#zamaModal form').submit((e) => {
        e.preventDefault();
        this.requestSubmitHandler();
        });
    }

    hide() {
        UIkit.modal($('#zamaModal')).hide();
    }

    show() {
        UIkit.modal($('#zamaModal')).show();
    }

    showSubmitButton() {
        $('#zamaModal .uk-modal-footer').show();
    }

    hideSubmitButton() {
        $('#zamaModal .uk-modal-footer').hide();
    }

    getFieldValue(name) {
        const field = $(`#zamaModal *[name="field-${name}"]`);
        return field.attr('type') === 'file' ? field.prop('files')[0] : field.val();
    }

    createRequestHeaders(headers = []) {
        this.injectTitle('Headers');
        headers.forEach((header) => {
        this.createField(header);
        });
    }

    createRequestPath(paths = []) {
        this.injectTitle('Paths');
        paths.forEach((path) => {
        this.createField(path);
        });
    }

    createRequestQuery(queries = []) {
        this.injectTitle('Query');
        queries.forEach((query) => {
        this.createField(query);
        });
    }

    createRequestBody(bodies = []) {
        this.injectTitle('Body');
        bodies.forEach((body) => {
        this.createField(body);
        });
    }

    createRequestFormData(formData = []) {
        this.injectTitle('Form Data');
        formData.forEach((form) => {
        this.createField(form);
        });
    }

    createRequest(pathId) {
        this._pathId = pathId;
        const {paths = [], auths = []} = pathsObject;
        const path = paths.find(({id}) => id === pathId);

        if (!path) return;

        if (!this.getAuthToken().type && auths.length) {
        this.createAuthenticationForm();
        return this.show();
        }

        let { summary = '', requests = [], methodName = '', pathName = '' } = path;
        requests = requests.reduce((acc, { title, items }) => {
        acc[title] = [...items];
        return acc;
        }, {});

        if (this.getAuthToken().type === 'basic') {
        const { value = '' } = this.getAuthToken();
        if (requests['header'] && requests['header'].length) {
            requests['header'].unshift({ name: 'Authorization', value: `Basic ${value}`, disabled: true, type: 'text' });
        } else {
            requests['header'] = [{ name: 'Authorization', value: `Basic ${value}`, disabled: true, type: 'text' }];
        }
        }

        if (this.getAuthToken().type === 'apiKey') {
        const { value = '' } = this.getAuthToken();
        const {in: inPlace, name} = auths.find(e => e.type === 'apiKey');
        
        if (inPlace === 'header') {
            if (requests['header'] && requests['header'].length) {
            requests['header'].unshift({ name, value, disabled: true, type: 'text' });
            } else {
            requests['header'] = [{ name, value, disabled: true, type: 'text' }];
            }
        } else {
            if (requests['query'] && requests['query'].length) {
            requests['query'].unshift({ name, value, disabled: true, type: 'text' });
            } else {
            requests['query'] = [{ name, value, disabled: true, type: 'text' }];
            }
        }
        }

        this.setTitle(summary);
        this.showSubmitButton();
        this.resetFields();
        this.injectPathUrl({ methodName, pathName });

        if (!!requests['header']) {
        this.createRequestHeaders(requests['header']);
        }

        if (requests['query']) {
        this.createRequestQuery(requests['query']);
        }

        if (requests['path']) {
        this.createRequestPath(requests['path']);
        }

        if (requests['body']) {
        this.createRequestBody(requests['body']);
        }

        if (requests['formData']) {
        this.createRequestFormData(requests['formData']);
        }

        this.attachOnSubmit(this.requestSubmitHandler);

        this.show();
    }

    getAuthToken() {
        const {_apiKeyToken, _basicAuthToken, _oAuthToken} = this;
        return {type: this._authType, value: _apiKeyToken || _basicAuthToken || _oAuthToken}
    }

    createAuthenticationForm() {
        const {auths = []} = pathsObject;
        this.setTitle('Authentication');
        this.attachOnSubmit(() => {
        e.preventDefault();
        });
        this.hideSubmitButton();
        this.resetFields();
        auths.forEach(({type = '', ...restProps}, i) => {
        if (type === 'basic') {
            this.createBasicAuth();
        }

        if (type === 'apiKey') {
            this.createApiKeyAuth(restProps);
        }

        if (type === 'oauth2') {
            this.createOauth(restProps);
        }

        if (auths.length > i + 1) {
            this.injectBreak();
        }
        });

    }

    createBasicAuth() {
        this.injectTitle('Basic Authentication');
        this.createField({ type: 'text', name: 'Username', placeholder: 'Enter username' });
        this.createField({ type: 'password', name: 'Password', placeholder: 'Enter password' });
        // this.createField({ type: 'checkbox', name: 'isSaveLocal', label: 'Keep me logged in' });
        this.injectButton({
        name: 'basic-auth',
        label: 'Authenticate',
        onClick: () => {
            const user = this.getFieldValue('Username');
            const pass = this.getFieldValue('Password');
            // const isSaveLocal = this.getFieldValue('isSaveLocal');
            this._basicAuthToken = btoa(`${user}:${pass}`);
            this._authType = 'basic';
            this._apiKeyToken = null;
            this._oAuthToken = null;
            this.resetFields();
            this.showSubmitButton();

            if (this._pathId) {
            return this.createRequest(this._pathId);
            }

            return this.hide();
        }
        });
    }
    
    createApiKeyAuth(props) {
        const { in: inPlace = 'header', name = '', } = props;
        this.injectTitle('API Key');
        this.injectFieldHtml(`<p>An API key with the name of <code>${name}</code>, will be send in <code>${inPlace}</code></p>`);
        this.createField({ type: 'text', name });
        this.injectButton({
        name: 'api-key',
        label: 'Authenticate',
        onClick: () => {
            const token = this.getFieldValue(name);
            this._authType = 'apiKey';
            this._apiKeyToken = token;
            this._basicAuthToken = null;
            this._oAuthToken = null;
            this.resetFields();
            this.showSubmitButton();

            if (this._pathId) {
            return this.createRequest(this._pathId);
            }

            return this.hide();
        }
        });
    }

    createOauth(props) {
        const {authorizationUrl = '', flow = '', scopes, tokenUrl = ''} = props;
        this.injectTitle('Oauth 2.0');
        this.injectFieldHtml(`
        <p>Oauth Server Details</p>
        <table class="uk-table uk-table-striped uk-table-small">
            <tr>
            <td>Authorization URL</td>
            <td>${authorizationUrl}<td/>
            </tr>
            <tr>
            <td>Token URL</td>
            <td>${tokenUrl}<td/>
            </tr>
            <tr>
            <td>Flow</td>
            <td>${flow}<td/>
            </tr>
        </table>
        <p>Scopes</p>
        <table class="uk-table uk-table-striped uk-table-small">
            ${Object.keys(scopes).map(name => `
            <tr>
                <td>${name}</td>
                <td>${scopes[name]}<td/>
            </tr>
            `).join('')}
        </table>
        `);
    }

    createResponseBody(body) {
        let viewCode = '';

        try {
        viewCode = JSON.stringify(JSON.parse(body), null, 4);
        } catch (e) {
        viewCode = body;
        }

        this.injectFieldHtml(`
        <p style="margin-bottom: 5px;">Response Body</p>
        <div class="highlight javascript">
            <pre><code class="language-javascript zama-response-code" data-lang="javascript">${viewCode}</code></pre>
        </div>
        `);

        hljs.highlightBlock($('.zama-response-code')[0])
    }

    createResponseRequestObject(request = {}) {
        const { url, options } = request;

        let formData = this._formData.map(({name, value}) => `formData.append('${name}', '${value}')`).join('\n');

        if (formData) {
        formData = `\n\nconst formData = new FormData();\n${formData}\noptions.body = formData;`;
        }

        const viewCode = `const options = ${JSON.stringify(options, null, 4)};${formData || ''}\n\nfetch('${url}', options)\n.then(e => e.text())\n.then(e => console.log(e));`;

        this.injectFieldHtml(`
        <p style="margin-bottom: 5px;">Request Object</p>
        <div class="highlight javascript">
            <pre><code class="language-javascript zama-request-code2" data-lang="javascript">${viewCode}</code></pre>
        </div>
        `);

        hljs.highlightBlock($('.zama-request-code2')[0])
    }

    createResponseHeaders(headers) {
        this.injectFieldHtml(`
        <p>Response Headers</p>
        <table class="uk-table uk-table-striped uk-table-small">
            ${headers.map(({name, value}) => `
            <tr>
                <td>${name}</td>
                <td>${value}<td/>
            </tr>
            `).join('')}
        </table>
        `);
    }

    createResponse({ request, body, headers }) {
        this.resetFields();
        this.hideSubmitButton();
        this.createResponseRequestObject(request);
        this.createResponseBody(body);
        this.createResponseHeaders(headers);
        this.setTitle(`<span uk-icon="icon: arrow-left; ratio: 2" class="btn-back"></span> ${this.getTitle()}`);
        $('#zamaModal .btn-back').off('click');
        $('#zamaModal .btn-back').click(() => {
            this.createRequest(this._pathId);
        });

        window.attachClipboard();
    }

    requestSubmitHandler(e) {
        const { auths, paths, rootUrl = '' } = pathsObject;
        const path = paths.find(({id}) => id === this._pathId);

        let { requests = [], methodName = '', pathName = '', consumes = [] } = path;
        requests = requests.reduce((acc, { title, items }) => {
        acc[title] = [...items];
        return acc;
        }, {});

        if (this.getAuthToken().type === 'basic') {
        const { value = '' } = this.getAuthToken();
        if (requests['header'] && requests['header'].length) {
            requests['header'].unshift({ name: 'Authorization', value: `Basic ${value}`, disabled: true, type: 'text' });
        } else {
            requests['header'] = [{ name: 'Authorization', value: `Basic ${value}`, disabled: true, type: 'text' }];
        }
        }

        if (consumes && Array.isArray(consumes) && consumes.includes('application/json')) {
        if (requests['header'] && requests['header'].length) {
            requests['header'].unshift({ name: 'Content-Type', value: 'application/json', disabled: true, type: 'text' });
        } else {
            requests['header'] = [{ name: 'Content-Type', value: 'application/json', disabled: true, type: 'text' }];
        }
        }

        if (this.getAuthToken().type === 'apiKey') {
        const { value = '' } = this.getAuthToken();
        const {in: inPlace, name} = auths.find(e => e.type === 'apiKey');
        
        if (inPlace === 'header') {
            if (requests['header'] && requests['header'].length) {
            requests['header'].unshift({ name, value, disabled: true, type: 'text' },{ name: 'x-registertype', value:1, disabled: true, type: 'text' });
            } else {
            requests['header'] = [{ name, value, disabled: true, type: 'text' },{ name: 'x-registertype', value:1, disabled: true, type: 'text' }];
            }
        } else {
            if (requests['query'] && requests['query'].length) {
            requests['query'].unshift({ name, value, disabled: true, type: 'text' },{ name: 'x-registertype', value:1, disabled: true, type: 'text' });
            } else {
            requests['query'] = [{ name, value, disabled: true, type: 'text' },{ name: 'x-registertype', value:1, disabled: true, type: 'text' }];
            }
        }
        }

        let url = `${rootUrl}${pathName}`;

        const options = {
        method: methodName,
        };

        if (requests['header'] && requests['header'].length) {
        options.headers = requests['header'].reduce((acc, cur) => {
            const _value = cur.value || this.getFieldValue(cur.name);

            if (_value) {
            acc[cur.name] = _value;
            }

            return acc;
        }, {});
        }

        if (requests['query'] && requests['query'].length) {
        url += encodeURI(`?${requests['query'].map(({ name, value }) => {
            const _value = value || this.getFieldValue(name);
            if (!_value) return '';
            return `${name}=${_value}`;
        }).filter(e => e).join('&')}`);
        }

        if (requests['path'] && requests['path'].length) {
        requests['path'].forEach(({name, value}) => {
            const _value = value || this.getFieldValue(name);
            if (_value) {
            url = url.replace(`{${name}}`, _value);
            }
        });
        }

        if (requests['body'] && requests['body'].length) {
        let [body] = requests['body'];
        try {
            options.body = this.getFieldValue(body.name);
        } catch (e) {
            options.body = {};
        }
        }

        this._formData = [];
        if (requests['formData'] && requests['formData'].length) {

        //  Check if there is input type file in the modal form
        if ($('.modal-body input[type=file]').length) {
            const formData = new FormData();

            requests['formData'].forEach(({ name, value }) => {
            const _value = value || this.getFieldValue(name);
            formData.append(name, _value);
            this._formData.push({ name, value: _value });
            });

            options.body = formData;
        } else {
            options.body = encodeURI(`${requests['formData'].map(({ name, value }) => {
            const _value = value || this.getFieldValue(name);
            return _value ? `${name}=${_value}` : '';
            }).filter(e => e).join('&')}`);

            options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        }

        let responseHeaders = [];

        this.resetFields();
        this.startLoading();

        fetch(url, options)
        .then(e => {
        responseHeaders = Array.from(e.headers.entries()).map(e => ({name: e[0], value: e[1]}));
        return e.text();
        })
        .then(e => this.createResponse({ body: e, headers: responseHeaders, request: { url, options } }));
    }

    injectPathUrl({ methodName = '', pathName = 'get' }) {
        const { rootUrl = '' } = pathsObject;
        const _html = `
        <div uk-alert class="path-url" style="margin-top: 0">
            <span class="api-method api-method-${methodName.toLowerCase()} uk-label">${methodName}</span>
            <span class="root">${rootUrl}</span>
            <span class="link" data-copy="${rootUrl}${pathName}" uk-tooltip="Click to copy">${pathName}</span>
        </div>
        `;
        
        $('#zamaModal .uk-modal-body').prepend(_html);
    }

    startLoading() {
        this.injectFieldHtml(`
            <div style="display: flex;justify-content: center;">
                <svg width="128" height="128" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" stroke="var(--color-base)">
                    <g fill="none" fill-rule="evenodd" stroke-width="2">
                        <circle cx="22" cy="22" r="1">
                            <animate attributeName="r"
                                begin="0s" dur="1.8s"
                                values="1; 20"
                                calcMode="spline"
                                keyTimes="0; 1"
                                keySplines="0.165, 0.84, 0.44, 1"
                                repeatCount="indefinite" />
                            <animate attributeName="stroke-opacity"
                                begin="0s" dur="1.8s"
                                values="1; 0"
                                calcMode="spline"
                                keyTimes="0; 1"
                                keySplines="0.3, 0.61, 0.355, 1"
                                repeatCount="indefinite" />
                        </circle>
                        <circle cx="22" cy="22" r="1">
                            <animate attributeName="r"
                                begin="-0.9s" dur="1.8s"
                                values="1; 20"
                                calcMode="spline"
                                keyTimes="0; 1"
                                keySplines="0.165, 0.84, 0.44, 1"
                                repeatCount="indefinite" />
                            <animate attributeName="stroke-opacity"
                                begin="-0.9s" dur="1.8s"
                                values="1; 0"
                                calcMode="spline"
                                keyTimes="0; 1"
                                keySplines="0.3, 0.61, 0.355, 1"
                                repeatCount="indefinite" />
                        </circle>
                    </g>
                </svg>
            </div>
        `);
    }

    injectPopup() {
        const { auths = [] } = pathsObject; 
        const _temp = `
        <div id="zamaModal" class="path" uk-modal style="margin-bottom: 0">
            <form class="uk-modal-dialog">
                <button class="uk-modal-close-default" type="button" uk-close></button>
                <div class="uk-modal-header">
                    <h2 class="uk-modal-title" style="font-weight: 300"></h2>
                </div>

                <div class="uk-modal-body"></div>

                <div class="uk-modal-footer uk-text-right">
                    ${auths.length ? `<button class="uk-button uk-button-default btn-re-auth" type="button">Authenticate</button>` : ''}
                    <button class="uk-button uk-button-primary" type="submit">Send Request</button>
                </div>
            </form>
        </div>
        `;

        $(document.body).append(_temp);
        $('.btn-re-auth').off('click');
        $('.btn-re-auth').click(() => this.createAuthenticationForm());
    }
}

$(() => {
    window.zamaPopup = new ZamaPopup();
    window.zamaPopup.injectPopup();
});