"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handle = void 0;
const xml_1 = __importDefault(require("xml"));
const nconf_1 = __importDefault(require("nconf"));
const plugins = __importStar(require("../plugins"));
const meta = __importStar(require("../meta"));
function trimToLength(string, length) {
    return string.trim().substring(0, length).trim();
}
// Define the generateXML function with TypeScript signature
function generateXML() {
    const myImage = {
        _attr: {
            width: '16',
            height: '16',
            type: 'image/x-icon',
        },
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const baseUrl = nconf_1.default.get('url', null);
    const myUrl = {
        _attr: {
            type: 'text/html',
            method: 'get',
            template: `${baseUrl}/search?term={searchTerms}&in=titlesposts`,
        },
    };
    // const { title } = meta.config.title;
    // const browserTitle = meta.config?.browserTitle?.trim();
    const ret = [{
            OpenSearchDescription: [
                {
                    _attr: {
                        xmlns: 'http://a9.com/-/spec/opensearch/1.1/',
                        'xmlns:moz': 'http://www.mozilla.org/2006/browser/search/',
                    },
                },
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                { ShortName: trimToLength(String(meta.config.title || meta.config.browserTitle || 'NodeBB'), 16) },
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                { Description: trimToLength(String(meta.config.description || ''), 1024) },
                { InputEncoding: 'UTF-8' },
                { Image: [myImage, `${baseUrl}/favicon.ico`] },
                { Url: myUrl },
                { 'moz:SearchForm': `${baseUrl}/search` },
            ],
        }];
    return (0, xml_1.default)(ret, { declaration: true, indent: '\t' });
}
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
const handle = function (_req, res, next) {
    const xmlString = generateXML();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = JSON.parse(xmlString);
    if (plugins.hooks.hasListeners('filter:search.query')) {
        res.type('application/opensearchdescription+xml').send(body);
    }
    else {
        next();
    }
};
exports.handle = handle;
exports.default = exports.handle; // Export the function as the default export
