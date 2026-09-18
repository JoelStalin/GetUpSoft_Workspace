module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/fs/promises [external] (fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs/promises", () => require("fs/promises"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[project]/Galantesjewelry/src/config/odooClient.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OdooConfigError",
    ()=>OdooConfigError,
    "OdooRequestError",
    ()=>OdooRequestError,
    "assertOdooConfig",
    ()=>assertOdooConfig,
    "buildOdooJson2Url",
    ()=>buildOdooJson2Url,
    "createOdooClient",
    ()=>createOdooClient,
    "getOdooAuthToken",
    ()=>getOdooAuthToken,
    "getOdooConfig",
    ()=>getOdooConfig,
    "getOdooHeaders",
    ()=>getOdooHeaders,
    "parseBooleanEnv",
    ()=>parseBooleanEnv
]);
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_USER_AGENT = 'galantes-jewelry-appointments/1.0';
const DEFAULT_PARTNER_MODEL = 'res.partner';
const DEFAULT_APPOINTMENT_MODEL = 'galante.appointment';
const NON_RETRYABLE_STATUS_CODES = new Set([
    401,
    403,
    404
]);
const TRUE_VALUES = new Set([
    '1',
    'true',
    'yes',
    'on'
]);
const FALSE_VALUES = new Set([
    '0',
    'false',
    'no',
    'off'
]);
class OdooConfigError extends Error {
    constructor(message, details = {}){
        super(message);
        this.name = 'OdooConfigError';
        this.details = details;
    }
}
class OdooRequestError extends Error {
    constructor(message, details = {}){
        super(message);
        this.name = 'OdooRequestError';
        this.details = details;
    }
}
function firstDefinedValue(...values) {
    return values.find((value)=>value !== undefined && value !== null);
}
function parseBooleanEnv(value, fallback = false) {
    if (value === undefined || value === null || value === '') {
        return fallback;
    }
    if (typeof value === 'boolean') {
        return value;
    }
    const normalized = String(value).trim().toLowerCase();
    if (TRUE_VALUES.has(normalized)) {
        return true;
    }
    if (FALSE_VALUES.has(normalized)) {
        return false;
    }
    throw new OdooConfigError(`Invalid boolean value "${value}" in Odoo configuration.`);
}
function parseIntegerEnv(value, fallback, label) {
    if (value === undefined || value === null || value === '') {
        return fallback;
    }
    const parsed = Number.parseInt(String(value), 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new OdooConfigError(`${label} must be a positive integer.`);
    }
    return parsed;
}
function normalizeOptionalString(value) {
    if (value === undefined || value === null) {
        return '';
    }
    return String(value).trim();
}
function normalizeBaseUrl(value) {
    const normalized = normalizeOptionalString(value).replace(/\/+$/, '');
    if (!normalized) {
        return '';
    }
    try {
        const url = new URL(normalized);
        if (![
            'http:',
            'https:'
        ].includes(url.protocol)) {
            throw new Error('Invalid protocol');
        }
        return url.toString().replace(/\/+$/, '');
    } catch  {
        throw new OdooConfigError('ODOO_BASE_URL must be a valid http(s) URL.');
    }
}
function getOdooAuthToken(overrides = {}) {
    return normalizeOptionalString(firstDefinedValue(overrides.authToken, process.env.ODOO_BEARER_TOKEN, process.env.ODOO_API_KEY));
}
function getOdooPasswordFallback(overrides = {}) {
    return normalizeOptionalString(firstDefinedValue(overrides.password, process.env.ODOO_PASSWORD));
}
function getOdooConfig(overrides = {}) {
    const enabled = parseBooleanEnv(firstDefinedValue(overrides.enabled, process.env.ODOO_ENABLED), true);
    const baseUrl = normalizeBaseUrl(firstDefinedValue(overrides.baseUrl, process.env.ODOO_BASE_URL));
    const database = normalizeOptionalString(firstDefinedValue(overrides.database, process.env.ODOO_DATABASE, process.env.ODOO_DB));
    const authToken = getOdooAuthToken(overrides);
    const password = getOdooPasswordFallback(overrides);
    const timeoutMs = parseIntegerEnv(firstDefinedValue(overrides.timeoutMs, process.env.ODOO_TIMEOUT_MS), DEFAULT_TIMEOUT_MS, 'ODOO_TIMEOUT_MS');
    const config = {
        enabled,
        baseUrl,
        database,
        authToken,
        password,
        timeoutMs,
        syncOnAppointmentValidated: parseBooleanEnv(firstDefinedValue(overrides.syncOnAppointmentValidated, process.env.ODOO_SYNC_ON_APPOINTMENT_VALIDATED), true),
        publicShopUrl: normalizeOptionalString(firstDefinedValue(overrides.publicShopUrl, process.env.ODOO_PUBLIC_SHOP_URL)),
        websiteId: normalizeOptionalString(firstDefinedValue(overrides.websiteId, process.env.ODOO_WEBSITE_ID)),
        companyId: normalizeOptionalString(firstDefinedValue(overrides.companyId, process.env.ODOO_COMPANY_ID)),
        partnerModel: normalizeOptionalString(firstDefinedValue(overrides.partnerModel, process.env.ODOO_PARTNER_MODEL)) || DEFAULT_PARTNER_MODEL,
        appointmentModel: normalizeOptionalString(firstDefinedValue(overrides.appointmentModel, process.env.ODOO_APPOINTMENT_MODEL)) || DEFAULT_APPOINTMENT_MODEL,
        userAgent: normalizeOptionalString(firstDefinedValue(overrides.userAgent, process.env.ODOO_USER_AGENT)) || DEFAULT_USER_AGENT
    };
    const missing = [];
    if (config.enabled && !config.baseUrl) {
        missing.push('ODOO_BASE_URL');
    }
    if (config.enabled && !config.authToken && !config.password) {
        missing.push('ODOO_BEARER_TOKEN or ODOO_API_KEY or ODOO_PASSWORD');
    }
    if (config.enabled && !config.database) {
        missing.push('ODOO_DATABASE or ODOO_DB');
    }
    return {
        ...config,
        missing,
        isReady: config.enabled ? missing.length === 0 : false
    };
}
function assertOdooConfig(config = getOdooConfig()) {
    if (!config.enabled) {
        throw new OdooConfigError('Odoo sync is disabled by configuration.', {
            missing: []
        });
    }
    if (config.missing.length > 0) {
        throw new OdooConfigError(`Odoo configuration is incomplete: ${config.missing.join(', ')}`, {
            missing: config.missing
        });
    }
    return config;
}
function getOdooHeaders(config = getOdooConfig()) {
    const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        Accept: 'application/json',
        'User-Agent': config.userAgent,
        'X-Odoo-Database': config.database
    };
    if (config.authToken) {
        headers['Authorization'] = `Bearer ${config.authToken}`;
    } else if (config.password) {
        // Some Odoo JSON-2 deployments accept the shared admin secret only via bearer auth.
        headers['Authorization'] = `Bearer ${config.password}`;
    }
    return headers;
}
function buildOdooUrl(model, method, config = getOdooConfig()) {
    const normalizedModel = normalizeOptionalString(model);
    const normalizedMethod = normalizeOptionalString(method);
    if (!normalizedModel || !normalizedMethod) {
        throw new OdooConfigError('Odoo model and method are required.');
    }
    return `${config.baseUrl}/json/2/${encodeURIComponent(normalizedModel)}/${encodeURIComponent(normalizedMethod)}`;
}
function buildOdooJson2Url(model, method, config = getOdooConfig()) {
    return buildOdooUrl(model, method, config);
}
async function parseResponseBody(response) {
    const contentType = response.headers.get('content-type') || '';
    if (response.status === 204) {
        return null;
    }
    if (contentType.includes('application/json')) {
        const data = await response.json();
        // Standard Odoo JSON-RPC wraps results in a 'result' or 'error' object
        if (data && typeof data === 'object' && ('result' in data || 'error' in data)) {
            if (data.error) {
                throw new OdooRequestError(data.error.message || 'Odoo JSON-RPC error', {
                    status: response.status,
                    body: data.error
                });
            }
            return data.result;
        }
        return data;
    }
    const text = await response.text();
    return text ? {
        message: text
    } : null;
}
function bindAbortSignal(controller, signal) {
    if (!signal) {
        return ()=>{};
    }
    if (signal.aborted) {
        controller.abort(signal.reason);
        return ()=>{};
    }
    const onAbort = ()=>controller.abort(signal.reason);
    signal.addEventListener('abort', onAbort, {
        once: true
    });
    return ()=>signal.removeEventListener('abort', onAbort);
}
function createOdooClient(overrides = {}) {
    function resolveConfig() {
        return getOdooConfig(overrides);
    }
    async function call(model, method, payload = {}, options = {}) {
        const config = assertOdooConfig(resolveConfig());
        const fetchImpl = options.fetchImpl || fetch;
        const maxRetries = options.maxRetries || 3;
        let lastError;
        for(let attempt = 0; attempt <= maxRetries; attempt++){
            const controller = new AbortController();
            const clearSignal = bindAbortSignal(controller, options.signal);
            const timeoutId = setTimeout(()=>controller.abort(), config.timeoutMs);
            try {
                if (attempt > 0) {
                    const delay = Math.pow(2, attempt) * 1000;
                    console.log(`[Odoo] Retry attempt ${attempt}/${maxRetries} using json2...`);
                    await new Promise((resolve)=>setTimeout(resolve, delay));
                }
                const cleanPayload = {
                    ...payload
                };
                delete cleanPayload.args;
                delete cleanPayload.kwargs;
                const response = await fetchImpl(buildOdooUrl(model, method, config), {
                    method: 'POST',
                    headers: getOdooHeaders(config),
                    body: JSON.stringify(cleanPayload),
                    signal: controller.signal
                });
                const result = await parseResponseBody(response);
                if (!response.ok) {
                    throw new OdooRequestError(result?.message || `Odoo request failed with status ${response.status}.`, {
                        status: response.status,
                        body: result,
                        model,
                        method
                    });
                }
                clearTimeout(timeoutId);
                clearSignal();
                return result;
            } catch (error) {
                clearTimeout(timeoutId);
                clearSignal();
                lastError = error;
                const errorStatus = error?.status || error?.details?.status;
                if (NON_RETRYABLE_STATUS_CODES.has(errorStatus) || error.name === 'OdooConfigError') {
                    throw error;
                }
                console.warn(`[Odoo] Request attempt ${attempt} failed with json2: ${error.message}`);
                if (attempt === maxRetries) {
                    throw error;
                }
            }
        }
        throw lastError || new OdooRequestError(`Unable to reach Odoo API after retries.`, {
            model,
            method
        });
    }
    return {
        getConfig: resolveConfig,
        call,
        async searchRead (model, payload = {}, options = {}) {
            return call(model, 'search_read', payload, options);
        },
        async create (model, values, options = {}) {
            return call(model, 'create', {
                vals: Array.isArray(values) ? undefined : values,
                vals_list: Array.isArray(values) ? values : [
                    values
                ]
            }, options);
        }
    };
}
;
}),
"[project]/Galantesjewelry/lib/odoo/services.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OdooService",
    ()=>OdooService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$src$2f$config$2f$odooClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/src/config/odooClient.js [app-route] (ecmascript)");
;
const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$src$2f$config$2f$odooClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createOdooClient"])();
function buildPortalUrl(baseUrl, accessUrl) {
    return accessUrl ? `${baseUrl}${accessUrl}` : null;
}
function buildInvoicePdfUrl(baseUrl, accessUrl, accessToken) {
    if (!accessUrl) return null;
    const separator = accessUrl.includes('?') ? '&' : '?';
    const normalizedToken = accessToken && !accessUrl.includes('access_token=') ? `&access_token=${encodeURIComponent(accessToken)}` : '';
    return `${baseUrl}${accessUrl}${separator}report_type=pdf&download=true${normalizedToken}`;
}
const OdooService = {
    async getCompanySettings () {
        const config = client.getConfig();
        if (!config.enabled || !config.isReady) return {};
        try {
            const cmsSettings = await client.searchRead('galante.cms.settings', {
                domain: [],
                fields: [
                    'site_title',
                    'site_description',
                    'logo_url',
                    'favicon_url',
                    'hero_image_url',
                    'instagram_url',
                    'facebook_url',
                    'whatsapp_number',
                    'contact_email',
                    'contact_phone',
                    'contact_address',
                    'appointment_email',
                    'navigation_json'
                ],
                limit: 1
            });
            if (cmsSettings && cmsSettings.length > 0) {
                const s = cmsSettings[0];
                let navLinks = [];
                try {
                    const parsed = s.navigation_json ? JSON.parse(s.navigation_json) : [];
                    navLinks = Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                    console.error('Failed to parse nav links', e);
                }
                return {
                    site_title: s.site_title ?? undefined,
                    site_description: s.site_description ?? undefined,
                    logo_url: s.logo_url ?? undefined,
                    favicon_url: s.favicon_url ?? undefined,
                    hero_image_url: s.hero_image_url ?? undefined,
                    instagram_url: s.instagram_url ?? undefined,
                    facebook_url: s.facebook_url ?? undefined,
                    whatsapp_number: s.whatsapp_number ?? undefined,
                    contact_email: s.contact_email ?? undefined,
                    contact_phone: s.contact_phone ?? undefined,
                    contact_address: s.contact_address ?? undefined,
                    appointment_email: s.appointment_email ?? undefined,
                    navigation_links: navLinks
                };
            }
            return {};
        } catch  {
            console.warn('[OdooService] Company settings fetch failed, using local CMS data fallback.');
            return {};
        }
    },
    async getPartnerByEmail (email) {
        try {
            const existing = await client.call('res.partner', 'search_read', {
                domain: [
                    [
                        'email',
                        '=',
                        email
                    ]
                ],
                fields: [
                    'id'
                ],
                limit: 1
            });
            return existing && existing.length > 0 ? existing[0].id : null;
        } catch (error) {
            console.warn('[OdooService] Partner search failed:', error instanceof Error ? error.message : 'Unknown error');
            return null;
        }
    },
    async findOrCreateCustomer (data) {
        try {
            const existing = await this.getPartnerByEmail(data.email);
            if (existing) return existing;
            let countryId = data.country_id || 233; // Default to US
            let stateId = data.state_id;
            const countryName = data.country?.trim() || '';
            const isDR = countryName === 'Dominican Republic' || countryName === 'República Dominicana' || countryName === 'Republica Dominicana';
            const isUS = countryName === 'United States';
            if (isDR) {
                countryId = 62;
            } else if (isUS) {
                countryId = 233;
            }
            // Special handling for Florida state ID if name provided but no ID
            if (data.state?.toUpperCase() === 'FL' || data.state?.toLowerCase() === 'florida') {
                stateId = 10;
            }
            return await client.create('res.partner', {
                name: data.name,
                email: data.email,
                phone: data.phone,
                street: data.street,
                city: data.city,
                zip: data.zip,
                state_id: stateId,
                country_id: countryId,
                customer_rank: 1
            });
        } catch (error) {
            console.warn('[OdooService] Partner creation failed:', error instanceof Error ? error.message : 'Unknown error');
            return null;
        }
    },
    async syncCustomerProfile (data) {
        try {
            const partnerId = await this.findOrCreateCustomer(data);
            if (!partnerId) return null;
            const vals = {
                customer_rank: 1,
                galantes_customer_source: data.authMethod || 'unknown',
                galantes_customer_last_auth_at: data.lastAuthAt || new Date().toISOString()
            };
            await client.call('res.partner', 'write', {
                ids: [
                    partnerId
                ],
                vals
            });
            return partnerId;
        } catch (error) {
            console.warn('[OdooService] User profile sync failed:', error instanceof Error ? error.message : 'Unknown error');
            return null;
        }
    },
    async syncAuthenticatedUser (data) {
        return await this.syncCustomerProfile({
            ...data,
            lastAuthAt: new Date().toISOString()
        });
    },
    async createOrder (partnerId, lines) {
        try {
            const lineVals = lines.map((l)=>[
                    0,
                    0,
                    {
                        product_id: l.product_id,
                        product_uom_qty: l.product_uom_qty,
                        price_unit: l.price_unit,
                        ...l.name ? {
                            name: l.name
                        } : {}
                    }
                ]);
            return await client.create('sale.order', {
                partner_id: partnerId,
                order_line: lineVals
            });
        } catch (error) {
            console.error('Odoo Order Creation Error:', error);
            return null;
        }
    },
    async getProductVariantIdByDefaultCode (defaultCode) {
        try {
            const templates = await client.call('product.template', 'search_read', {
                domain: [
                    [
                        'default_code',
                        '=',
                        defaultCode
                    ]
                ],
                fields: [
                    'id',
                    'product_variant_id'
                ],
                limit: 1
            });
            const templateVariant = templates?.[0]?.product_variant_id;
            if (Array.isArray(templateVariant)) {
                return typeof templateVariant[0] === 'number' ? templateVariant[0] : null;
            }
            if (typeof templateVariant === 'number' && Number.isFinite(templateVariant)) {
                return templateVariant;
            }
            const products = await client.call('product.product', 'search_read', {
                domain: [
                    [
                        'default_code',
                        '=',
                        defaultCode
                    ]
                ],
                fields: [
                    'id'
                ],
                limit: 1
            });
            return products && products.length > 0 ? products[0].id : null;
        } catch (error) {
            console.error('Odoo Product Lookup Error:', error);
            return null;
        }
    },
    async automateBillingFlow (orderId, stripeData) {
        try {
            // 1. Fetch current order state
            const orders = await client.call('sale.order', 'read', {
                ids: [
                    orderId
                ],
                fields: [
                    'state',
                    'invoice_status',
                    'invoice_ids',
                    'picking_ids'
                ]
            });
            if (!orders || orders.length === 0) throw new Error('Order not found');
            // 2. Normalize Stripe data for Odoo
            const stripeVals = stripeData ? {
                payment_intent_id: stripeData.paymentIntentId,
                charge_id: stripeData.chargeId || false,
                amount: stripeData.amount,
                currency: stripeData.currency,
                receipt_url: stripeData.receiptUrl,
                customer_email: stripeData.customerEmail,
                payment_status: stripeData.paymentStatus
            } : false;
            // 3. Call Odoo finalization action (custom logic in galantes_jewelry module)
            const result = await client.call('sale.order', 'action_galantes_finalize_paid_checkout', {
                ids: [
                    orderId
                ],
                stripe_payment: stripeVals
            });
            // The action returns a list with the updated order details
            const finalizedOrder = Array.isArray(result) && result.length > 0 ? result[0] : null;
            if (!finalizedOrder || !finalizedOrder.invoice_ids?.length && finalizedOrder.state !== 'cancel') {
                // Log in Odoo if it didn't cancel but also didn't invoice
                if (finalizedOrder?.state !== 'cancel') {
                    await client.call('sale.order', 'message_post', {
                        ids: [
                            orderId
                        ],
                        body: 'Billing finalization completed without creating or linking an invoice.'
                    });
                    throw new Error('Billing finalization completed without creating or linking an invoice.');
                }
            }
            return {
                success: true,
                orderId,
                invoiceId: finalizedOrder?.invoice_ids?.[0] || null,
                pickingIds: finalizedOrder?.picking_ids || [],
                steps: [
                    'confirmed',
                    'finalized'
                ]
            };
        } catch (error) {
            console.error('Odoo Billing Automation Error:', error);
            // Log failure in Odoo chatter
            try {
                await client.call('sale.order', 'message_post', {
                    ids: [
                        orderId
                    ],
                    body: `Billing Automation Failed: ${error instanceof Error ? error.message : String(error)}`
                });
            } catch  {}
            throw error instanceof Error ? error : new Error(String(error));
        }
    },
    async getOrderWithInvoices (orderId) {
        const orders = await client.call('sale.order', 'search_read', {
            domain: [
                [
                    'id',
                    '=',
                    orderId
                ]
            ],
            fields: [
                'name',
                'date_order',
                'state',
                'amount_total',
                'invoice_status',
                'access_url',
                'partner_id',
                'invoice_ids'
            ],
            limit: 1
        });
        if (!orders || orders.length === 0) return null;
        const o = orders[0];
        let baseUrl = process.env.ODOO_BASE_URL || 'http://odoo:8069';
        // Internal container networking fix
        if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
            baseUrl = baseUrl.replace('localhost', 'odoo').replace('127.0.0.1', 'odoo');
        }
        let invoices = [];
        const invoiceIds = o.invoice_ids ?? [];
        if (invoiceIds.length > 0) {
            const invData = await client.call('account.move', 'search_read', {
                domain: [
                    [
                        'id',
                        'in',
                        invoiceIds
                    ]
                ],
                fields: [
                    'name',
                    'invoice_date',
                    'state',
                    'amount_total',
                    'payment_state',
                    'access_url',
                    'access_token'
                ]
            });
            invoices = (invData || []).map((inv)=>({
                    ...inv,
                    display_status: this.mapInvoiceState(inv.state, inv.payment_state),
                    portal_url: buildPortalUrl(baseUrl, inv.access_url),
                    pdf_url: buildInvoicePdfUrl(baseUrl, inv.access_url, inv.access_token)
                }));
        }
        return {
            ...o,
            display_status: this.mapOrderState(o.state, o.invoice_status),
            portal_url: o.access_url ? `${baseUrl}${o.access_url}` : null,
            invoices
        };
    },
    async syncCompanyProfile (settings) {
        try {
            // Prefer the US country record, but fall back to the standard US id so state lookup still runs.
            const countries = await client.call('res.country', 'search_read', {
                domain: [
                    [
                        'code',
                        '=',
                        'US'
                    ]
                ],
                fields: [
                    'id'
                ],
                limit: 1
            });
            const countryId = countries?.[0]?.id || 233;
            // Simple address parsing for Islamorada
            const vals = {
                email: settings.contact_email,
                phone: settings.contact_phone,
                street: settings.contact_address?.split(',')[0]?.trim(),
                city: 'Islamorada',
                zip: '33036',
                country_id: countryId
            };
            if (settings.contact_address) {
                const stateMatch = settings.contact_address.match(/,\s*([A-Z]{2})\s+\d{5}(?:-\d{4})?\s*,/i);
                const stateCode = stateMatch?.[1]?.toUpperCase() || 'FL';
                const states = await client.call('res.country.state', 'search_read', {
                    domain: [
                        [
                            'code',
                            '=',
                            stateCode
                        ],
                        [
                            'country_id',
                            '=',
                            countryId
                        ]
                    ],
                    fields: [
                        'id'
                    ],
                    limit: 1
                });
                if (states?.length > 0) vals.state_id = states[0].id;
            }
            // Write to company 1
            await client.call('res.company', 'write', {
                ids: [
                    1
                ],
                vals
            });
            return true;
        } catch (error) {
            console.error('Company Sync Error:', error);
            return false;
        }
    },
    async getOrderDetails (orderId, authenticatedEmail) {
        try {
            const orders = await client.call('sale.order', 'search_read', {
                domain: [
                    [
                        'id',
                        '=',
                        orderId
                    ]
                ],
                fields: [
                    'name',
                    'date_order',
                    'state',
                    'amount_untaxed',
                    'amount_tax',
                    'amount_total',
                    'invoice_status',
                    'order_line',
                    'access_url',
                    'partner_id'
                ],
                limit: 1
            });
            if (!orders || orders.length === 0) return null;
            const order = orders[0];
            if (authenticatedEmail) {
                const partnerId = await this.getPartnerByEmail(authenticatedEmail);
                const orderPartnerId = Array.isArray(order.partner_id) ? order.partner_id[0] : order.partner_id;
                if (!partnerId || !orderPartnerId || partnerId !== orderPartnerId) {
                    return null;
                }
            }
            let baseUrl = process.env.ODOO_BASE_URL || 'http://odoo:8069';
            // Internal container networking fix
            if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
                baseUrl = baseUrl.replace('localhost', 'odoo').replace('127.0.0.1', 'odoo');
            }
            return {
                ...order,
                display_status: this.mapOrderState(order.state, order.invoice_status),
                portal_url: order.access_url ? `${baseUrl}${order.access_url}` : null
            };
        } catch (error) {
            console.error('Odoo Order Fetch Error:', error);
            return null;
        }
    },
    async getPartnerOrders (partnerId) {
        try {
            const orders = await client.call('sale.order', 'search_read', {
                domain: [
                    [
                        'partner_id',
                        '=',
                        partnerId
                    ]
                ],
                fields: [
                    'id',
                    'name',
                    'date_order',
                    'state',
                    'amount_total',
                    'invoice_status',
                    'access_url',
                    'invoice_ids'
                ],
                order: 'date_order desc'
            });
            let baseUrl = process.env.ODOO_BASE_URL || 'http://odoo:8069';
            // Internal container networking fix
            if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
                baseUrl = baseUrl.replace('localhost', 'odoo').replace('127.0.0.1', 'odoo');
            }
            return (orders || []).map((o)=>({
                    ...o,
                    display_status: this.mapOrderState(o.state, o.invoice_status),
                    portal_url: o.access_url ? `${baseUrl}${o.access_url}` : null
                }));
        } catch (error) {
            console.error('Odoo Partner Orders Fetch Error:', error);
            return [];
        }
    },
    async getOrdersWithInvoices (partnerId, authenticatedEmail) {
        try {
            if (authenticatedEmail) {
                const partner = await client.call('res.partner', 'search_read', {
                    domain: [
                        [
                            'id',
                            '=',
                            partnerId
                        ]
                    ],
                    fields: [
                        'email'
                    ],
                    limit: 1
                });
                const resolvedEmail = partner?.[0]?.email || '';
                if (!resolvedEmail || resolvedEmail.toLowerCase() !== authenticatedEmail.toLowerCase()) {
                    return [];
                }
            }
            const orders = await this.getPartnerOrders(partnerId);
            if (!orders || orders.length === 0) return [];
            let baseUrl = process.env.ODOO_BASE_URL || 'http://odoo:8069';
            // Internal container networking fix
            if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
                baseUrl = baseUrl.replace('localhost', 'odoo').replace('127.0.0.1', 'odoo');
            }
            const allInvoiceIds = orders.flatMap((o)=>o.invoice_ids || []);
            const invoiceMap = {};
            if (allInvoiceIds.length > 0) {
                const invoices = await client.call('account.move', 'search_read', {
                    domain: [
                        [
                            'id',
                            'in',
                            allInvoiceIds
                        ],
                        [
                            'move_type',
                            '=',
                            'out_invoice'
                        ]
                    ],
                    fields: [
                        'id',
                        'name',
                        'invoice_date',
                        'state',
                        'amount_total',
                        'payment_state',
                        'access_url',
                        'access_token'
                    ]
                });
                for (const inv of invoices || []){
                    const enriched = {
                        ...inv,
                        display_status: this.mapInvoiceState(inv.state, inv.payment_state),
                        portal_url: buildPortalUrl(baseUrl, inv.access_url),
                        pdf_url: buildInvoicePdfUrl(baseUrl, inv.access_url, inv.access_token)
                    };
                    for (const order of orders){
                        if ((order.invoice_ids || []).includes(inv.id)) {
                            if (!invoiceMap[order.id]) invoiceMap[order.id] = [];
                            invoiceMap[order.id].push(enriched);
                        }
                    }
                }
            }
            return orders.map((o)=>({
                    ...o,
                    invoices: invoiceMap[o.id] || []
                }));
        } catch (error) {
            console.warn('[OdooService] Orders+Invoices fetch failed:', error);
            return [];
        }
    },
    async getPartnerInvoices (partnerId) {
        try {
            const invoices = await client.call('account.move', 'search_read', {
                domain: [
                    [
                        'partner_id',
                        '=',
                        partnerId
                    ],
                    [
                        'move_type',
                        '=',
                        'out_invoice'
                    ]
                ],
                fields: [
                    'name',
                    'invoice_date',
                    'state',
                    'amount_total',
                    'payment_state',
                    'access_url',
                    'access_token'
                ],
                order: 'invoice_date desc'
            });
            let baseUrl = process.env.ODOO_BASE_URL || 'http://odoo:8069';
            // Internal container networking fix
            if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
                baseUrl = baseUrl.replace('localhost', 'odoo').replace('127.0.0.1', 'odoo');
            }
            return (invoices || []).map((inv)=>({
                    ...inv,
                    display_status: this.mapInvoiceState(inv.state, inv.payment_state),
                    portal_url: buildPortalUrl(baseUrl, inv.access_url),
                    pdf_url: buildInvoicePdfUrl(baseUrl, inv.access_url, inv.access_token)
                }));
        } catch (error) {
            console.error('Odoo Partner Invoices Fetch Error:', error);
            return [];
        }
    },
    async getPartnerAddresses (partnerId) {
        try {
            return await client.call('res.partner', 'search_read', {
                domain: [
                    [
                        'parent_id',
                        '=',
                        partnerId
                    ],
                    [
                        'type',
                        'in',
                        [
                            'delivery',
                            'invoice',
                            'other'
                        ]
                    ]
                ],
                fields: [
                    'id',
                    'name',
                    'type',
                    'email',
                    'phone',
                    'street',
                    'street2',
                    'city',
                    'zip',
                    'state_id',
                    'country_id'
                ],
                order: 'type asc'
            });
        } catch (error) {
            console.error('Odoo Partner Addresses Fetch Error:', error);
            return [];
        }
    },
    async savePartnerAddress (partnerId, data) {
        try {
            const vals = {
                parent_id: partnerId,
                ...data
            };
            if (data.id) {
                await client.call('res.partner', 'write', {
                    ids: [
                        data.id
                    ],
                    vals
                });
                return data.id;
            }
            return await client.create('res.partner', vals);
        } catch (error) {
            console.error('Odoo Address Save Error:', error);
            return null;
        }
    },
    async deletePartnerAddress (addressId) {
        try {
            return await client.call('res.partner', 'write', {
                ids: [
                    addressId
                ],
                vals: {
                    active: false
                }
            });
        } catch (error) {
            console.error('Odoo Address Delete Error:', error);
            return false;
        }
    },
    async getProductImage (templateId) {
        let baseUrl = process.env.ODOO_BASE_URL || 'http://odoo:8069';
        // Internal container networking fix
        if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
            baseUrl = baseUrl.replace('localhost', 'odoo').replace('127.0.0.1', 'odoo');
        }
        const db = process.env.ODOO_DATABASE || process.env.ODOO_DB || 'galantes_prod';
        const fields = [
            'image_256',
            'image_1920'
        ];
        // Attempt 1: Direct HTTP Fetch (Fastest, best for cache)
        for (const field of fields){
            const urls = [
                `${baseUrl}/web/image/product.template/${templateId}/${field}?db=${db}`,
                `${baseUrl}/web/image?model=product.template&id=${templateId}&field=${field}&db=${db}`
            ];
            for (const url of urls){
                try {
                    const response = await fetch(url, {
                        next: {
                            revalidate: 3600
                        }
                    });
                    if (response.ok) {
                        const buffer = await response.arrayBuffer();
                        if (buffer.byteLength > 9000) {
                            return Buffer.from(buffer).toString('base64');
                        }
                    }
                } catch (error) {
                // Silent fail to next attempt
                }
            }
        }
        // Attempt 2: Odoo API Call (Most reliable, uses credentials)
        console.log(`[OdooService] HTTP fetch failed or returned placeholders for ${templateId}, trying API fallback...`);
        try {
            const result = await client.call('product.template', 'read', {
                ids: [
                    templateId
                ],
                fields: [
                    'image_1920',
                    'image_256'
                ]
            });
            if (result && result.length > 0) {
                const p = result[0];
                // Check image_1920 first, then image_256
                const images = [
                    p.image_1920,
                    p.image_256
                ];
                for (const img of images){
                    if (img && img.length > 12000) {
                        console.log(`[OdooService] Success via API for ${templateId} using ${img === p.image_1920 ? '1920' : '256'}`);
                        return img;
                    }
                }
            }
        } catch (apiError) {
            console.error(`[OdooService] API fallback failed for ${templateId}:`, apiError);
        }
        return null;
    },
    async getOrderFullDetails (orderId, authenticatedEmail) {
        try {
            const order = await this.getOrderDetails(orderId, authenticatedEmail);
            if (!order) return null;
            const orderLineIds = order.order_line ?? [];
            const lines = await client.call('sale.order.line', 'search_read', {
                domain: [
                    [
                        'id',
                        'in',
                        orderLineIds
                    ]
                ],
                fields: [
                    'product_id',
                    'name',
                    'product_uom_qty',
                    'price_unit',
                    'price_subtotal',
                    'price_total',
                    'product_template_id'
                ]
            });
            let tracking = [];
            if (order.picking_ids && order.picking_ids.length > 0) {
                tracking = await client.call('stock.picking', 'search_read', {
                    domain: [
                        [
                            'id',
                            'in',
                            order.picking_ids
                        ]
                    ],
                    fields: [
                        'name',
                        'state',
                        'carrier_tracking_ref',
                        'carrier_id',
                        'date_done'
                    ]
                });
            }
            return {
                ...order,
                lines: (lines || []).map((l)=>({
                        ...l,
                        image_url: `/api/products/image?id=${Array.isArray(l.product_template_id) ? l.product_template_id[0] : l.product_template_id}`
                    })),
                tracking: (tracking || []).map((t)=>({
                        ...t,
                        carrier_name: Array.isArray(t.carrier_id) ? t.carrier_id[1] : 'Standard Shipping'
                    }))
            };
        } catch (error) {
            console.error('Odoo Order Full Details Error:', error);
            return null;
        }
    },
    async getPartnerProfile (partnerId) {
        try {
            const partners = await client.call('res.partner', 'search_read', {
                domain: [
                    [
                        'id',
                        '=',
                        partnerId
                    ]
                ],
                fields: [
                    'name',
                    'email',
                    'phone',
                    'street',
                    'street2',
                    'city',
                    'zip',
                    'country_id',
                    'state_id'
                ],
                limit: 1
            });
            if (!partners || partners.length === 0) return null;
            const p = partners[0];
            return {
                ...p,
                country_name: p.country_id ? p.country_id[1] : '',
                state_name: p.state_id ? p.state_id[1] : ''
            };
        } catch (error) {
            console.error('Odoo Profile Fetch Error:', error);
            return null;
        }
    },
    async updatePartnerProfile (partnerId, data) {
        try {
            await client.call('res.partner', 'write', {
                ids: [
                    partnerId
                ],
                vals: data
            });
            return {
                success: true
            };
        } catch (error) {
            console.error('Odoo Profile Update Error:', error);
            return {
                success: false,
                error: String(error)
            };
        }
    },
    mapOrderState (state, invoiceStatus) {
        const states = {
            'draft': 'Quotation',
            'sent': 'Quotation Sent',
            'sale': 'Confirmed',
            'done': 'Locked',
            'cancel': 'Cancelled'
        };
        if (state === 'sale' && invoiceStatus === 'invoiced') return 'Completed & Invoiced';
        if (state === 'sale' && invoiceStatus === 'to invoice') return 'Ready to Invoice';
        return states[state] || state;
    },
    mapInvoiceState (state, paymentState) {
        if (paymentState === 'paid') return 'Paid';
        if (paymentState === 'in_payment') return 'Processing Payment';
        if (paymentState === 'partial') return 'Partially Paid';
        const states = {
            'draft': 'Draft',
            'posted': 'Posted',
            'cancel': 'Cancelled'
        };
        return states[state] || state;
    }
};
}),
"[project]/Galantesjewelry/app/api/products/image/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs/promises [external] (fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2f$services$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/odoo/services.ts [app-route] (ecmascript)");
;
;
;
;
;
const CACHE_DIR = process.env.APP_DATA_DIR ? __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.env.APP_DATA_DIR, 'blobs', 'product_images') : __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), 'data', 'blobs', 'product_images');
const LOCAL_FALLBACK_IMAGES = {
    '1': 'the-islamorada-solitaire.png',
    '2': 'mariners-bond-band.png',
    '3': 'compass-rose-pendant.png',
    '4': 'keys-azure-drop-earrings.png',
    '5': 'anchor-soul-bracelet.png',
    '6': 'coastal-tide-ring.png',
    '7': 'sirens-pearl-necklace.png',
    '8': 'navigators-chrono-link.png',
    '9': 'tritons-trident-tie-bar.png',
    '10': 'lighthouse-guardian-charm.png'
};
function parseProductTemplateId(value) {
    if (!value || !/^[1-9]\d{0,8}$/.test(value)) {
        return null;
    }
    const templateId = Number(value);
    if (!Number.isSafeInteger(templateId)) {
        return null;
    }
    return templateId;
}
function buildCachePath(templateId) {
    const cacheRoot = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(CACHE_DIR);
    const cachePath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(cacheRoot, `${templateId}.png`);
    const relativePath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].relative(cacheRoot, cachePath);
    if (relativePath.startsWith('..') || __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].isAbsolute(relativePath)) {
        throw new Error('Resolved product image cache path escaped the cache directory.');
    }
    return cachePath;
}
async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const templateId = parseProductTemplateId(id);
    if (!templateId) {
        return new Response('Valid product ID required', {
            status: 400
        });
    }
    const cachePath = buildCachePath(templateId);
    try {
        // 1. Check local file cache first
        if ((0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"])(cachePath)) {
            const buffer = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].readFile(cachePath);
            if (buffer.byteLength > 9000) {
                return new __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](buffer, {
                    headers: {
                        'Content-Type': 'image/png',
                        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
                        'X-Cache': 'HIT'
                    }
                });
            }
            console.warn(`[ProductImageProxy] Cached image for ID ${templateId} is too small (${buffer.byteLength} bytes), re-fetching...`);
        }
        const base64Image = await __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2f$services$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["OdooService"].getProductImage(templateId);
        if (!base64Image) {
            console.warn(`[ProductImageProxy] Image for ID ${templateId} not found in Odoo, attempting local fallback...`);
            const fileName = LOCAL_FALLBACK_IMAGES[String(templateId)];
            if (!fileName) {
                return new Response('Product image not found', {
                    status: 404
                });
            }
            const localPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), 'public', 'assets', 'products', fileName);
            const buffer = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].readFile(localPath);
            return new __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](buffer, {
                headers: {
                    'Content-Type': 'image/png',
                    'Cache-Control': 'public, max-age=86400',
                    'X-Cache': 'MISS-FALLBACK'
                }
            });
        }
        const buffer = Buffer.from(base64Image, 'base64');
        // 2. Save to cache asynchronously (don't block the response)
        try {
            if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"])(CACHE_DIR)) {
                await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].mkdir(CACHE_DIR, {
                    recursive: true
                });
            }
            await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].writeFile(cachePath, buffer);
        } catch (cacheError) {
            console.error('[ProductImageProxy] Failed to write to cache:', cacheError);
        }
        return new __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](buffer, {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
                'X-Cache': 'MISS'
            }
        });
    } catch (error) {
        console.error('[ProductImageProxy] Error fetching image:', error);
        return new Response('Error fetching product image', {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0a-ug~y._.js.map