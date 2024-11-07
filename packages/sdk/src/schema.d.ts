/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
    "/auth/login/credentials": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Log in with credentials */
        post: operations["loginWithCredentials"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        User: {
            id: string;
            createdAt: Record<string, never> | string;
            updatedAt: Record<string, never> | string;
            name: string;
            email: string;
            permissions: "ManageCompetitions"[];
            isRoot: boolean;
            password: null | {
                userId: string;
                /** @description @omit */
                passwordHash: string;
            };
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type SchemaUser = components['schemas']['User'];
export type $defs = Record<string, never>;
export interface operations {
    loginWithCredentials: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    email: string;
                    password: string;
                };
                "multipart/form-data": {
                    email: string;
                    password: string;
                };
                "text/plain": {
                    email: string;
                    password: string;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        accessToken: string;
                        refreshToken: string;
                    };
                    "multipart/form-data": {
                        accessToken: string;
                        refreshToken: string;
                    };
                    "text/plain": {
                        accessToken: string;
                        refreshToken: string;
                    };
                };
            };
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        message: string;
                    };
                    "multipart/form-data": {
                        message: string;
                    };
                    "text/plain": {
                        message: string;
                    };
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        message: string;
                    };
                    "multipart/form-data": {
                        message: string;
                    };
                    "text/plain": {
                        message: string;
                    };
                };
            };
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        message: string;
                    };
                    "multipart/form-data": {
                        message: string;
                    };
                    "text/plain": {
                        message: string;
                    };
                };
            };
        };
    };
}
