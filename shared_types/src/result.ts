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

function _err(err: any): ErrBase {
  return err.status && err.message ? {
    success: false,
    status: err.status,
    message: err.message,
  } : {
    success: false,
    status: 500,
    message: 'Internal server error',
  };
}

export const result = {
  ok<T>(content: T): Ok<T> {
    return Object.assign(Object.create(resultProto), {
      success: true,
      status: 200,
      content,
    });
  },

  err(err: any): Err {
    return Object.assign(Object.create(resultProto), _err(err));
  },

  badRequest(message: string): Err {
    return this.err({ message, status: 400 });
  },

  unauthorized(message: string): Err {
    return this.err({ message, status: 401 });
  },

  forbidden(message: string): Err {
    return this.err({ message, status: 403 });
  },

  notFound(message: string): Err {
    return this.err({ message, status: 404 });
  },

  conflict(message: string): Err {
    return this.err({ message, status: 409 });
  },

  internal(message?: string): Err {
    return this.err({ message: message ?? 'Internal server error', status: 500 });
  },

};