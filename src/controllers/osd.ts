import { Request, Response, NextFunction, Locals } from 'express';
import nconf from 'nconf';

import * as plugins from '../plugins';
import * as meta from '../meta';


function trimToLength(string: string, length: number): string {
    return string.trim().substring(0, length).trim();
}

interface Image {
    _attr: {
        width: string;
        height: string;
        type: string;
    };
}

interface Url {
    _attr: {
        type: string;
        method: string;
        template: string;
    };
}

// Define the generateXML function with TypeScript signature
function generateXML(): object {
    const myImage: Image = {
        _attr: {
            width: '16',
            height: '16',
            type: 'image/x-icon',
        },
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const baseUrl : string = nconf.get('url') as string; // casted as string
    const myUrl: Url = {
        _attr: {
            type: 'text/html',
            method: 'get',
            template: `${baseUrl}/search?term={searchTerms}&in=titlesposts`,
        },
    };
    const ret = [{
        OpenSearchDescription: [
            {
                _attr: {
                    xmlns: 'http://a9.com/-/spec/opensearch/1.1/',
                    'xmlns:moz': 'http://www.mozilla.org/2006/browser/search/',
                },
            },
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            { ShortName: trimToLength(String(meta.config.title || meta.config.browserTitle || 'NodeBB'), 16) },
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            { Description: trimToLength(String(meta.config.description || ''), 1024) },
            { InputEncoding: 'UTF-8' },
            { Image: [myImage, `${baseUrl}/favicon.ico`] },
            { Url: myUrl },
            { 'moz:SearchForm': `${baseUrl}/search` },
        ],
    }];
    // return xml(ret, { declaration: true, indent: '\t' });
    return ret;
}

export const handle = function (_req: Request, res: Response<object, Locals>, next: NextFunction): void {
    if (plugins.hooks.hasListeners('filter:search.query')) {
        res.type('application/opensearchdescription+xml').send(generateXML());
    } else {
        next();
    }
};

export default handle; // Export the function as the default export
