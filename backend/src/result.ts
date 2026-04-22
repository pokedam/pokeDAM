interface ResultBase<T> {
    status: number;
    content: T | string;
}

export type Result<T> = ResultBase<T> & {
    data: () => T | null;
    err: () => string | null;
};

export const result = {
    ok,
    badRequest,
    unauthorized,
    forbidden,
    notFound,
    conflict,
    internal
}

function ok<T>(data: T): Result<T> {
    return enhance<T>({ status: 200, content: data });
}

function badRequest<T>(message: string): Result<T> {
    return enhance<T>({ status: 400, content: message });
}

function unauthorized<T>(message: string): Result<T> {
    return enhance<T>({ status: 401, content: message });
}

function forbidden<T>(message: string): Result<T> {
    return enhance<T>({ status: 403, content: message });
}

function notFound<T>(message: string): Result<T> {
    return enhance<T>({ status: 404, content: message });
}

function conflict<T>(message: string): Result<T> {
    return enhance<T>({ status: 409, content: message });
}

function internal<T>(message: string): Result<T> {
    return enhance<T>({ status: 500, content: message });
}

function check_status<T>(data: T | string, status: number): data is T {
    return status >= 200 && status < 300;
}

function enhance<T>(res: ResultBase<T>): Result<T> {
    return {
        ...res,
        data: () => {
            if (check_status(res.content, res.status)) {
                return res.content;
            }
            return null;
        },

        err: () => {
            if (!check_status(res.content, res.status)) {
                return res.content;
            }
            return null;
        }
    };
}