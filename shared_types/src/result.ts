type OkBase<T> = {
  ok: true;
  status: number;
  content: T;
};

type ErrBase = {
  ok: false;
  status: number;
  message: string;
};

interface ResultProto<T> {
  data(): T | null;
  err(): string | null;
  map<U>(f: (data: T) => U): Result<U>;
}

export type Ok<T> = OkBase<T> & ResultProto<T>;
export type Err = ErrBase & ResultProto<never>;

export type Result<T> = Ok<T> | Err;



const resultProto: ResultProto<any> = {

  data<T>(this: Result<T>): T | null {
    return this.ok ? this.content : null;
  },

  err<T = never>(this: Result<T>): string | null {
    return this.ok ? null : this.message;
  },

  map<U>(this: Result<any>, f: (data: any) => U): Result<U> {
    if (this.ok) {
      return result.ok(f(this.content));
    } else {
      return this as Result<U>;
    }
  }
};

function enhance<T>(res: OkBase<T> | ErrBase): Result<T> {
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

  err<T = never>(message: string, status: number): Result<T> {
    return enhance({
      ok: false,
      status,
      message,
    });
  },

  badRequest<T = never>(message: string): Result<T> {
    return this.err(message, 400);
  },

  unauthorized<T = never>(message: string): Result<T> {
    return this.err(message, 401);
  },

  forbidden<T = never>(message: string): Result<T> {
    return this.err(message, 403);
  },

  notFound<T = never>(message: string): Result<T> {
    return this.err(message, 404);
  },

  conflict<T = never>(message: string): Result<T> {
    return this.err(message, 409);
  },

  internal<T = never>(message: string): Result<T> {
    return this.err(message, 500);
  },
};