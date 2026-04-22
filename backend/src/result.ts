type Ok<T> = {
  ok: true;
  status: number;
  content: T;
};

type Err = {
  ok: false;
  status: number;
  message: string;
};

type ResultBase<T> = Ok<T> | Err;

// =====================
// Public Result type (with methods)
// =====================

interface ResultProto<T> {
  onData(cb: (data: T) => void): this;
  onErr(cb: (err: string) => void): this;
  data(): T | null;
  err(): string | null;
}

export type Result<T> = ResultBase<T> & ResultProto<T>;

const resultProto: ResultProto<any> = {
  onData(this: Result<any>, cb) {
    if (this.ok) {
      cb(this.content);
    }
    return this;
  },

  onErr(this: Result<any>, cb) {
    if (!this.ok) {
      cb(this.message);
    }
    return this;
  },

  data(this: Result<any>) {
    return this.ok ? this.content : null;
  },

  err(this: Result<any>) {
    return this.ok ? null : this.message;
  },
};

function enhance<T>(res: ResultBase<T>): Result<T> {
  return Object.assign(Object.create(resultProto), res);
}

export const result = {
  ok<T>(content: T): Result<T> {
    return enhance({
      ok: true,
      status: 200,
      content,
    });
  },

  badRequest<T = never>(message: string): Result<T> {
    return enhance({
      ok: false,
      status: 400,
      message,
    });
  },

  unauthorized<T = never>(message: string): Result<T> {
    return enhance({
      ok: false,
      status: 401,
      message,
    });
  },

  forbidden<T = never>(message: string): Result<T> {
    return enhance({
      ok: false,
      status: 403,
      message,
    });
  },

  notFound<T = never>(message: string): Result<T> {
    return enhance({
      ok: false,
      status: 404,
      message,
    });
  },

  conflict<T = never>(message: string): Result<T> {
    return enhance({
      ok: false,
      status: 409,
      message,
    });
  },

  internal<T = never>(message: string): Result<T> {
    return enhance({
      ok: false,
      status: 500,
      message,
    });
  },
};