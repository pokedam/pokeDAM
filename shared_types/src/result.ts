type OkBase<T> = {
  success: true;
  status: number;
  content: T;
};

type ErrBase = {
  success: false;
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
    return this.success ? this.content : null;
  },

  err<T>(this: Result<T>): string | null {
    return this.success ? null : this.message;
  },

  map<U>(this: Result<any>, f: (data: any) => U): Result<U> {
    if (this.success) {
      return result.ok(f(this.content));
    } else {
      return this as Result<U>;
    }
  }
};

export const result = {
  ok<T>(content: T): Ok<T> {
    return Object.assign(Object.create(resultProto), {
      success: true,
      status: 200,
      content,
    });
  },

  err(message: string, status: number): Err {
    return Object.assign(Object.create(resultProto), {
      success: false,
      status,
      message,
    });
  },

  badRequest<T = never>(message: string): Err {
    return this.err(message, 400);
  },

  unauthorized<T = never>(message: string): Err {
    return this.err(message, 401);
  },

  forbidden(message: string): Err {
    return this.err(message, 403);
  },

  notFound<T = never>(message: string): Err {
    return this.err(message, 404);
  },

  conflict<T = never>(message: string): Result<T> {
    return this.err(message, 409);
  },

  internal<T = never>(message: string): Result<T> {
    return this.err(message, 500);
  },
};