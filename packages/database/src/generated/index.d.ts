
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model AuthUser
 * 
 */
export type AuthUser = $Result.DefaultSelection<Prisma.$AuthUserPayload>
/**
 * Model Session
 * 
 */
export type Session = $Result.DefaultSelection<Prisma.$SessionPayload>
/**
 * Model AuthAccount
 * 
 */
export type AuthAccount = $Result.DefaultSelection<Prisma.$AuthAccountPayload>
/**
 * Model Verification
 * 
 */
export type Verification = $Result.DefaultSelection<Prisma.$VerificationPayload>
/**
 * Model Account
 * 
 */
export type Account = $Result.DefaultSelection<Prisma.$AccountPayload>
/**
 * Model Profile
 * 
 */
export type Profile = $Result.DefaultSelection<Prisma.$ProfilePayload>
/**
 * Model ProfileMember
 * 
 */
export type ProfileMember = $Result.DefaultSelection<Prisma.$ProfileMemberPayload>
/**
 * Model IdentityCheck
 * 
 */
export type IdentityCheck = $Result.DefaultSelection<Prisma.$IdentityCheckPayload>
/**
 * Model Post
 * 
 */
export type Post = $Result.DefaultSelection<Prisma.$PostPayload>
/**
 * Model Comment
 * 
 */
export type Comment = $Result.DefaultSelection<Prisma.$CommentPayload>
/**
 * Model Like
 * 
 */
export type Like = $Result.DefaultSelection<Prisma.$LikePayload>
/**
 * Model Follow
 * 
 */
export type Follow = $Result.DefaultSelection<Prisma.$FollowPayload>
/**
 * Model NFT
 * 
 */
export type NFT = $Result.DefaultSelection<Prisma.$NFTPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const ProfileType: {
  MUSICIAN: 'MUSICIAN',
  VENUE: 'VENUE',
  PROMOTER: 'PROMOTER',
  VISUAL_ARTIST: 'VISUAL_ARTIST',
  BAND: 'BAND'
};

export type ProfileType = (typeof ProfileType)[keyof typeof ProfileType]


export const ProfileRole: {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER'
};

export type ProfileRole = (typeof ProfileRole)[keyof typeof ProfileRole]


export const IdentityTier: {
  NONE: 'NONE',
  BASIC: 'BASIC',
  CREATOR: 'CREATOR',
  ARTIST: 'ARTIST'
};

export type IdentityTier = (typeof IdentityTier)[keyof typeof IdentityTier]


export const IdentityCheckStatus: {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED'
};

export type IdentityCheckStatus = (typeof IdentityCheckStatus)[keyof typeof IdentityCheckStatus]


export const MediaType: {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO',
  PERFORMANCE: 'PERFORMANCE'
};

export type MediaType = (typeof MediaType)[keyof typeof MediaType]


export const NFTType: {
  MUSIC: 'MUSIC',
  PERFORMANCE: 'PERFORMANCE',
  ART: 'ART',
  COLLECTIBLE: 'COLLECTIBLE'
};

export type NFTType = (typeof NFTType)[keyof typeof NFTType]

}

export type ProfileType = $Enums.ProfileType

export const ProfileType: typeof $Enums.ProfileType

export type ProfileRole = $Enums.ProfileRole

export const ProfileRole: typeof $Enums.ProfileRole

export type IdentityTier = $Enums.IdentityTier

export const IdentityTier: typeof $Enums.IdentityTier

export type IdentityCheckStatus = $Enums.IdentityCheckStatus

export const IdentityCheckStatus: typeof $Enums.IdentityCheckStatus

export type MediaType = $Enums.MediaType

export const MediaType: typeof $Enums.MediaType

export type NFTType = $Enums.NFTType

export const NFTType: typeof $Enums.NFTType

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more AuthUsers
 * const authUsers = await prisma.authUser.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more AuthUsers
   * const authUsers = await prisma.authUser.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.authUser`: Exposes CRUD operations for the **AuthUser** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AuthUsers
    * const authUsers = await prisma.authUser.findMany()
    * ```
    */
  get authUser(): Prisma.AuthUserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.session`: Exposes CRUD operations for the **Session** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Sessions
    * const sessions = await prisma.session.findMany()
    * ```
    */
  get session(): Prisma.SessionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.authAccount`: Exposes CRUD operations for the **AuthAccount** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AuthAccounts
    * const authAccounts = await prisma.authAccount.findMany()
    * ```
    */
  get authAccount(): Prisma.AuthAccountDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.verification`: Exposes CRUD operations for the **Verification** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Verifications
    * const verifications = await prisma.verification.findMany()
    * ```
    */
  get verification(): Prisma.VerificationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.account`: Exposes CRUD operations for the **Account** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Accounts
    * const accounts = await prisma.account.findMany()
    * ```
    */
  get account(): Prisma.AccountDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.profile`: Exposes CRUD operations for the **Profile** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Profiles
    * const profiles = await prisma.profile.findMany()
    * ```
    */
  get profile(): Prisma.ProfileDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.profileMember`: Exposes CRUD operations for the **ProfileMember** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProfileMembers
    * const profileMembers = await prisma.profileMember.findMany()
    * ```
    */
  get profileMember(): Prisma.ProfileMemberDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.identityCheck`: Exposes CRUD operations for the **IdentityCheck** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more IdentityChecks
    * const identityChecks = await prisma.identityCheck.findMany()
    * ```
    */
  get identityCheck(): Prisma.IdentityCheckDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.post`: Exposes CRUD operations for the **Post** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Posts
    * const posts = await prisma.post.findMany()
    * ```
    */
  get post(): Prisma.PostDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.comment`: Exposes CRUD operations for the **Comment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Comments
    * const comments = await prisma.comment.findMany()
    * ```
    */
  get comment(): Prisma.CommentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.like`: Exposes CRUD operations for the **Like** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Likes
    * const likes = await prisma.like.findMany()
    * ```
    */
  get like(): Prisma.LikeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.follow`: Exposes CRUD operations for the **Follow** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Follows
    * const follows = await prisma.follow.findMany()
    * ```
    */
  get follow(): Prisma.FollowDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.nFT`: Exposes CRUD operations for the **NFT** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more NFTS
    * const nFTS = await prisma.nFT.findMany()
    * ```
    */
  get nFT(): Prisma.NFTDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.3
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    AuthUser: 'AuthUser',
    Session: 'Session',
    AuthAccount: 'AuthAccount',
    Verification: 'Verification',
    Account: 'Account',
    Profile: 'Profile',
    ProfileMember: 'ProfileMember',
    IdentityCheck: 'IdentityCheck',
    Post: 'Post',
    Comment: 'Comment',
    Like: 'Like',
    Follow: 'Follow',
    NFT: 'NFT'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "authUser" | "session" | "authAccount" | "verification" | "account" | "profile" | "profileMember" | "identityCheck" | "post" | "comment" | "like" | "follow" | "nFT"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      AuthUser: {
        payload: Prisma.$AuthUserPayload<ExtArgs>
        fields: Prisma.AuthUserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AuthUserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthUserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AuthUserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthUserPayload>
          }
          findFirst: {
            args: Prisma.AuthUserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthUserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AuthUserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthUserPayload>
          }
          findMany: {
            args: Prisma.AuthUserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthUserPayload>[]
          }
          create: {
            args: Prisma.AuthUserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthUserPayload>
          }
          createMany: {
            args: Prisma.AuthUserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AuthUserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthUserPayload>[]
          }
          delete: {
            args: Prisma.AuthUserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthUserPayload>
          }
          update: {
            args: Prisma.AuthUserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthUserPayload>
          }
          deleteMany: {
            args: Prisma.AuthUserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AuthUserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AuthUserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthUserPayload>[]
          }
          upsert: {
            args: Prisma.AuthUserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthUserPayload>
          }
          aggregate: {
            args: Prisma.AuthUserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAuthUser>
          }
          groupBy: {
            args: Prisma.AuthUserGroupByArgs<ExtArgs>
            result: $Utils.Optional<AuthUserGroupByOutputType>[]
          }
          count: {
            args: Prisma.AuthUserCountArgs<ExtArgs>
            result: $Utils.Optional<AuthUserCountAggregateOutputType> | number
          }
        }
      }
      Session: {
        payload: Prisma.$SessionPayload<ExtArgs>
        fields: Prisma.SessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          findFirst: {
            args: Prisma.SessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          findMany: {
            args: Prisma.SessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[]
          }
          create: {
            args: Prisma.SessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          createMany: {
            args: Prisma.SessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[]
          }
          delete: {
            args: Prisma.SessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          update: {
            args: Prisma.SessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          deleteMany: {
            args: Prisma.SessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SessionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[]
          }
          upsert: {
            args: Prisma.SessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          aggregate: {
            args: Prisma.SessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSession>
          }
          groupBy: {
            args: Prisma.SessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<SessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.SessionCountArgs<ExtArgs>
            result: $Utils.Optional<SessionCountAggregateOutputType> | number
          }
        }
      }
      AuthAccount: {
        payload: Prisma.$AuthAccountPayload<ExtArgs>
        fields: Prisma.AuthAccountFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AuthAccountFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthAccountPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AuthAccountFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthAccountPayload>
          }
          findFirst: {
            args: Prisma.AuthAccountFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthAccountPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AuthAccountFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthAccountPayload>
          }
          findMany: {
            args: Prisma.AuthAccountFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthAccountPayload>[]
          }
          create: {
            args: Prisma.AuthAccountCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthAccountPayload>
          }
          createMany: {
            args: Prisma.AuthAccountCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AuthAccountCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthAccountPayload>[]
          }
          delete: {
            args: Prisma.AuthAccountDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthAccountPayload>
          }
          update: {
            args: Prisma.AuthAccountUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthAccountPayload>
          }
          deleteMany: {
            args: Prisma.AuthAccountDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AuthAccountUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AuthAccountUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthAccountPayload>[]
          }
          upsert: {
            args: Prisma.AuthAccountUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthAccountPayload>
          }
          aggregate: {
            args: Prisma.AuthAccountAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAuthAccount>
          }
          groupBy: {
            args: Prisma.AuthAccountGroupByArgs<ExtArgs>
            result: $Utils.Optional<AuthAccountGroupByOutputType>[]
          }
          count: {
            args: Prisma.AuthAccountCountArgs<ExtArgs>
            result: $Utils.Optional<AuthAccountCountAggregateOutputType> | number
          }
        }
      }
      Verification: {
        payload: Prisma.$VerificationPayload<ExtArgs>
        fields: Prisma.VerificationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VerificationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VerificationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload>
          }
          findFirst: {
            args: Prisma.VerificationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VerificationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload>
          }
          findMany: {
            args: Prisma.VerificationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload>[]
          }
          create: {
            args: Prisma.VerificationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload>
          }
          createMany: {
            args: Prisma.VerificationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.VerificationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload>[]
          }
          delete: {
            args: Prisma.VerificationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload>
          }
          update: {
            args: Prisma.VerificationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload>
          }
          deleteMany: {
            args: Prisma.VerificationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VerificationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.VerificationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload>[]
          }
          upsert: {
            args: Prisma.VerificationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationPayload>
          }
          aggregate: {
            args: Prisma.VerificationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVerification>
          }
          groupBy: {
            args: Prisma.VerificationGroupByArgs<ExtArgs>
            result: $Utils.Optional<VerificationGroupByOutputType>[]
          }
          count: {
            args: Prisma.VerificationCountArgs<ExtArgs>
            result: $Utils.Optional<VerificationCountAggregateOutputType> | number
          }
        }
      }
      Account: {
        payload: Prisma.$AccountPayload<ExtArgs>
        fields: Prisma.AccountFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AccountFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AccountFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          findFirst: {
            args: Prisma.AccountFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AccountFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          findMany: {
            args: Prisma.AccountFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>[]
          }
          create: {
            args: Prisma.AccountCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          createMany: {
            args: Prisma.AccountCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AccountCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>[]
          }
          delete: {
            args: Prisma.AccountDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          update: {
            args: Prisma.AccountUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          deleteMany: {
            args: Prisma.AccountDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AccountUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AccountUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>[]
          }
          upsert: {
            args: Prisma.AccountUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          aggregate: {
            args: Prisma.AccountAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAccount>
          }
          groupBy: {
            args: Prisma.AccountGroupByArgs<ExtArgs>
            result: $Utils.Optional<AccountGroupByOutputType>[]
          }
          count: {
            args: Prisma.AccountCountArgs<ExtArgs>
            result: $Utils.Optional<AccountCountAggregateOutputType> | number
          }
        }
      }
      Profile: {
        payload: Prisma.$ProfilePayload<ExtArgs>
        fields: Prisma.ProfileFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProfileFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfilePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProfileFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfilePayload>
          }
          findFirst: {
            args: Prisma.ProfileFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfilePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProfileFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfilePayload>
          }
          findMany: {
            args: Prisma.ProfileFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfilePayload>[]
          }
          create: {
            args: Prisma.ProfileCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfilePayload>
          }
          createMany: {
            args: Prisma.ProfileCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProfileCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfilePayload>[]
          }
          delete: {
            args: Prisma.ProfileDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfilePayload>
          }
          update: {
            args: Prisma.ProfileUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfilePayload>
          }
          deleteMany: {
            args: Prisma.ProfileDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProfileUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ProfileUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfilePayload>[]
          }
          upsert: {
            args: Prisma.ProfileUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfilePayload>
          }
          aggregate: {
            args: Prisma.ProfileAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProfile>
          }
          groupBy: {
            args: Prisma.ProfileGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProfileGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProfileCountArgs<ExtArgs>
            result: $Utils.Optional<ProfileCountAggregateOutputType> | number
          }
        }
      }
      ProfileMember: {
        payload: Prisma.$ProfileMemberPayload<ExtArgs>
        fields: Prisma.ProfileMemberFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProfileMemberFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileMemberPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProfileMemberFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileMemberPayload>
          }
          findFirst: {
            args: Prisma.ProfileMemberFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileMemberPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProfileMemberFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileMemberPayload>
          }
          findMany: {
            args: Prisma.ProfileMemberFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileMemberPayload>[]
          }
          create: {
            args: Prisma.ProfileMemberCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileMemberPayload>
          }
          createMany: {
            args: Prisma.ProfileMemberCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProfileMemberCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileMemberPayload>[]
          }
          delete: {
            args: Prisma.ProfileMemberDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileMemberPayload>
          }
          update: {
            args: Prisma.ProfileMemberUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileMemberPayload>
          }
          deleteMany: {
            args: Prisma.ProfileMemberDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProfileMemberUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ProfileMemberUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileMemberPayload>[]
          }
          upsert: {
            args: Prisma.ProfileMemberUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileMemberPayload>
          }
          aggregate: {
            args: Prisma.ProfileMemberAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProfileMember>
          }
          groupBy: {
            args: Prisma.ProfileMemberGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProfileMemberGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProfileMemberCountArgs<ExtArgs>
            result: $Utils.Optional<ProfileMemberCountAggregateOutputType> | number
          }
        }
      }
      IdentityCheck: {
        payload: Prisma.$IdentityCheckPayload<ExtArgs>
        fields: Prisma.IdentityCheckFieldRefs
        operations: {
          findUnique: {
            args: Prisma.IdentityCheckFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IdentityCheckPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.IdentityCheckFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IdentityCheckPayload>
          }
          findFirst: {
            args: Prisma.IdentityCheckFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IdentityCheckPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.IdentityCheckFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IdentityCheckPayload>
          }
          findMany: {
            args: Prisma.IdentityCheckFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IdentityCheckPayload>[]
          }
          create: {
            args: Prisma.IdentityCheckCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IdentityCheckPayload>
          }
          createMany: {
            args: Prisma.IdentityCheckCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.IdentityCheckCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IdentityCheckPayload>[]
          }
          delete: {
            args: Prisma.IdentityCheckDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IdentityCheckPayload>
          }
          update: {
            args: Prisma.IdentityCheckUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IdentityCheckPayload>
          }
          deleteMany: {
            args: Prisma.IdentityCheckDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.IdentityCheckUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.IdentityCheckUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IdentityCheckPayload>[]
          }
          upsert: {
            args: Prisma.IdentityCheckUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IdentityCheckPayload>
          }
          aggregate: {
            args: Prisma.IdentityCheckAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateIdentityCheck>
          }
          groupBy: {
            args: Prisma.IdentityCheckGroupByArgs<ExtArgs>
            result: $Utils.Optional<IdentityCheckGroupByOutputType>[]
          }
          count: {
            args: Prisma.IdentityCheckCountArgs<ExtArgs>
            result: $Utils.Optional<IdentityCheckCountAggregateOutputType> | number
          }
        }
      }
      Post: {
        payload: Prisma.$PostPayload<ExtArgs>
        fields: Prisma.PostFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PostFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PostFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>
          }
          findFirst: {
            args: Prisma.PostFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PostFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>
          }
          findMany: {
            args: Prisma.PostFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>[]
          }
          create: {
            args: Prisma.PostCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>
          }
          createMany: {
            args: Prisma.PostCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PostCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>[]
          }
          delete: {
            args: Prisma.PostDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>
          }
          update: {
            args: Prisma.PostUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>
          }
          deleteMany: {
            args: Prisma.PostDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PostUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PostUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>[]
          }
          upsert: {
            args: Prisma.PostUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>
          }
          aggregate: {
            args: Prisma.PostAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePost>
          }
          groupBy: {
            args: Prisma.PostGroupByArgs<ExtArgs>
            result: $Utils.Optional<PostGroupByOutputType>[]
          }
          count: {
            args: Prisma.PostCountArgs<ExtArgs>
            result: $Utils.Optional<PostCountAggregateOutputType> | number
          }
        }
      }
      Comment: {
        payload: Prisma.$CommentPayload<ExtArgs>
        fields: Prisma.CommentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CommentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CommentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>
          }
          findFirst: {
            args: Prisma.CommentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CommentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>
          }
          findMany: {
            args: Prisma.CommentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>[]
          }
          create: {
            args: Prisma.CommentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>
          }
          createMany: {
            args: Prisma.CommentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CommentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>[]
          }
          delete: {
            args: Prisma.CommentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>
          }
          update: {
            args: Prisma.CommentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>
          }
          deleteMany: {
            args: Prisma.CommentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CommentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CommentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>[]
          }
          upsert: {
            args: Prisma.CommentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentPayload>
          }
          aggregate: {
            args: Prisma.CommentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateComment>
          }
          groupBy: {
            args: Prisma.CommentGroupByArgs<ExtArgs>
            result: $Utils.Optional<CommentGroupByOutputType>[]
          }
          count: {
            args: Prisma.CommentCountArgs<ExtArgs>
            result: $Utils.Optional<CommentCountAggregateOutputType> | number
          }
        }
      }
      Like: {
        payload: Prisma.$LikePayload<ExtArgs>
        fields: Prisma.LikeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LikeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LikePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LikeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LikePayload>
          }
          findFirst: {
            args: Prisma.LikeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LikePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LikeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LikePayload>
          }
          findMany: {
            args: Prisma.LikeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LikePayload>[]
          }
          create: {
            args: Prisma.LikeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LikePayload>
          }
          createMany: {
            args: Prisma.LikeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LikeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LikePayload>[]
          }
          delete: {
            args: Prisma.LikeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LikePayload>
          }
          update: {
            args: Prisma.LikeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LikePayload>
          }
          deleteMany: {
            args: Prisma.LikeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LikeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LikeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LikePayload>[]
          }
          upsert: {
            args: Prisma.LikeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LikePayload>
          }
          aggregate: {
            args: Prisma.LikeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLike>
          }
          groupBy: {
            args: Prisma.LikeGroupByArgs<ExtArgs>
            result: $Utils.Optional<LikeGroupByOutputType>[]
          }
          count: {
            args: Prisma.LikeCountArgs<ExtArgs>
            result: $Utils.Optional<LikeCountAggregateOutputType> | number
          }
        }
      }
      Follow: {
        payload: Prisma.$FollowPayload<ExtArgs>
        fields: Prisma.FollowFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FollowFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FollowFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowPayload>
          }
          findFirst: {
            args: Prisma.FollowFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FollowFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowPayload>
          }
          findMany: {
            args: Prisma.FollowFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowPayload>[]
          }
          create: {
            args: Prisma.FollowCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowPayload>
          }
          createMany: {
            args: Prisma.FollowCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FollowCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowPayload>[]
          }
          delete: {
            args: Prisma.FollowDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowPayload>
          }
          update: {
            args: Prisma.FollowUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowPayload>
          }
          deleteMany: {
            args: Prisma.FollowDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FollowUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.FollowUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowPayload>[]
          }
          upsert: {
            args: Prisma.FollowUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowPayload>
          }
          aggregate: {
            args: Prisma.FollowAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFollow>
          }
          groupBy: {
            args: Prisma.FollowGroupByArgs<ExtArgs>
            result: $Utils.Optional<FollowGroupByOutputType>[]
          }
          count: {
            args: Prisma.FollowCountArgs<ExtArgs>
            result: $Utils.Optional<FollowCountAggregateOutputType> | number
          }
        }
      }
      NFT: {
        payload: Prisma.$NFTPayload<ExtArgs>
        fields: Prisma.NFTFieldRefs
        operations: {
          findUnique: {
            args: Prisma.NFTFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NFTPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.NFTFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NFTPayload>
          }
          findFirst: {
            args: Prisma.NFTFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NFTPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.NFTFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NFTPayload>
          }
          findMany: {
            args: Prisma.NFTFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NFTPayload>[]
          }
          create: {
            args: Prisma.NFTCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NFTPayload>
          }
          createMany: {
            args: Prisma.NFTCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.NFTCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NFTPayload>[]
          }
          delete: {
            args: Prisma.NFTDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NFTPayload>
          }
          update: {
            args: Prisma.NFTUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NFTPayload>
          }
          deleteMany: {
            args: Prisma.NFTDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.NFTUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.NFTUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NFTPayload>[]
          }
          upsert: {
            args: Prisma.NFTUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NFTPayload>
          }
          aggregate: {
            args: Prisma.NFTAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateNFT>
          }
          groupBy: {
            args: Prisma.NFTGroupByArgs<ExtArgs>
            result: $Utils.Optional<NFTGroupByOutputType>[]
          }
          count: {
            args: Prisma.NFTCountArgs<ExtArgs>
            result: $Utils.Optional<NFTCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    authUser?: AuthUserOmit
    session?: SessionOmit
    authAccount?: AuthAccountOmit
    verification?: VerificationOmit
    account?: AccountOmit
    profile?: ProfileOmit
    profileMember?: ProfileMemberOmit
    identityCheck?: IdentityCheckOmit
    post?: PostOmit
    comment?: CommentOmit
    like?: LikeOmit
    follow?: FollowOmit
    nFT?: NFTOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type AuthUserCountOutputType
   */

  export type AuthUserCountOutputType = {
    sessions: number
    accounts: number
  }

  export type AuthUserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sessions?: boolean | AuthUserCountOutputTypeCountSessionsArgs
    accounts?: boolean | AuthUserCountOutputTypeCountAccountsArgs
  }

  // Custom InputTypes
  /**
   * AuthUserCountOutputType without action
   */
  export type AuthUserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthUserCountOutputType
     */
    select?: AuthUserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * AuthUserCountOutputType without action
   */
  export type AuthUserCountOutputTypeCountSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SessionWhereInput
  }

  /**
   * AuthUserCountOutputType without action
   */
  export type AuthUserCountOutputTypeCountAccountsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuthAccountWhereInput
  }


  /**
   * Count Type AccountCountOutputType
   */

  export type AccountCountOutputType = {
    profiles: number
    identityChecks: number
  }

  export type AccountCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    profiles?: boolean | AccountCountOutputTypeCountProfilesArgs
    identityChecks?: boolean | AccountCountOutputTypeCountIdentityChecksArgs
  }

  // Custom InputTypes
  /**
   * AccountCountOutputType without action
   */
  export type AccountCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountCountOutputType
     */
    select?: AccountCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * AccountCountOutputType without action
   */
  export type AccountCountOutputTypeCountProfilesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProfileMemberWhereInput
  }

  /**
   * AccountCountOutputType without action
   */
  export type AccountCountOutputTypeCountIdentityChecksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IdentityCheckWhereInput
  }


  /**
   * Count Type ProfileCountOutputType
   */

  export type ProfileCountOutputType = {
    members: number
    posts: number
    comments: number
    likes: number
    nfts: number
    follows: number
    followers: number
  }

  export type ProfileCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    members?: boolean | ProfileCountOutputTypeCountMembersArgs
    posts?: boolean | ProfileCountOutputTypeCountPostsArgs
    comments?: boolean | ProfileCountOutputTypeCountCommentsArgs
    likes?: boolean | ProfileCountOutputTypeCountLikesArgs
    nfts?: boolean | ProfileCountOutputTypeCountNftsArgs
    follows?: boolean | ProfileCountOutputTypeCountFollowsArgs
    followers?: boolean | ProfileCountOutputTypeCountFollowersArgs
  }

  // Custom InputTypes
  /**
   * ProfileCountOutputType without action
   */
  export type ProfileCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileCountOutputType
     */
    select?: ProfileCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ProfileCountOutputType without action
   */
  export type ProfileCountOutputTypeCountMembersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProfileMemberWhereInput
  }

  /**
   * ProfileCountOutputType without action
   */
  export type ProfileCountOutputTypeCountPostsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PostWhereInput
  }

  /**
   * ProfileCountOutputType without action
   */
  export type ProfileCountOutputTypeCountCommentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CommentWhereInput
  }

  /**
   * ProfileCountOutputType without action
   */
  export type ProfileCountOutputTypeCountLikesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LikeWhereInput
  }

  /**
   * ProfileCountOutputType without action
   */
  export type ProfileCountOutputTypeCountNftsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NFTWhereInput
  }

  /**
   * ProfileCountOutputType without action
   */
  export type ProfileCountOutputTypeCountFollowsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FollowWhereInput
  }

  /**
   * ProfileCountOutputType without action
   */
  export type ProfileCountOutputTypeCountFollowersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FollowWhereInput
  }


  /**
   * Count Type PostCountOutputType
   */

  export type PostCountOutputType = {
    comments: number
    likes: number
  }

  export type PostCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    comments?: boolean | PostCountOutputTypeCountCommentsArgs
    likes?: boolean | PostCountOutputTypeCountLikesArgs
  }

  // Custom InputTypes
  /**
   * PostCountOutputType without action
   */
  export type PostCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostCountOutputType
     */
    select?: PostCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PostCountOutputType without action
   */
  export type PostCountOutputTypeCountCommentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CommentWhereInput
  }

  /**
   * PostCountOutputType without action
   */
  export type PostCountOutputTypeCountLikesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LikeWhereInput
  }


  /**
   * Models
   */

  /**
   * Model AuthUser
   */

  export type AggregateAuthUser = {
    _count: AuthUserCountAggregateOutputType | null
    _min: AuthUserMinAggregateOutputType | null
    _max: AuthUserMaxAggregateOutputType | null
  }

  export type AuthUserMinAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    emailVerified: boolean | null
    image: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AuthUserMaxAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    emailVerified: boolean | null
    image: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AuthUserCountAggregateOutputType = {
    id: number
    name: number
    email: number
    emailVerified: number
    image: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AuthUserMinAggregateInputType = {
    id?: true
    name?: true
    email?: true
    emailVerified?: true
    image?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AuthUserMaxAggregateInputType = {
    id?: true
    name?: true
    email?: true
    emailVerified?: true
    image?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AuthUserCountAggregateInputType = {
    id?: true
    name?: true
    email?: true
    emailVerified?: true
    image?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AuthUserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuthUser to aggregate.
     */
    where?: AuthUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuthUsers to fetch.
     */
    orderBy?: AuthUserOrderByWithRelationInput | AuthUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AuthUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuthUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuthUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AuthUsers
    **/
    _count?: true | AuthUserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AuthUserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AuthUserMaxAggregateInputType
  }

  export type GetAuthUserAggregateType<T extends AuthUserAggregateArgs> = {
        [P in keyof T & keyof AggregateAuthUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuthUser[P]>
      : GetScalarType<T[P], AggregateAuthUser[P]>
  }




  export type AuthUserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuthUserWhereInput
    orderBy?: AuthUserOrderByWithAggregationInput | AuthUserOrderByWithAggregationInput[]
    by: AuthUserScalarFieldEnum[] | AuthUserScalarFieldEnum
    having?: AuthUserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AuthUserCountAggregateInputType | true
    _min?: AuthUserMinAggregateInputType
    _max?: AuthUserMaxAggregateInputType
  }

  export type AuthUserGroupByOutputType = {
    id: string
    name: string
    email: string
    emailVerified: boolean
    image: string | null
    createdAt: Date
    updatedAt: Date
    _count: AuthUserCountAggregateOutputType | null
    _min: AuthUserMinAggregateOutputType | null
    _max: AuthUserMaxAggregateOutputType | null
  }

  type GetAuthUserGroupByPayload<T extends AuthUserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AuthUserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AuthUserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AuthUserGroupByOutputType[P]>
            : GetScalarType<T[P], AuthUserGroupByOutputType[P]>
        }
      >
    >


  export type AuthUserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    emailVerified?: boolean
    image?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    sessions?: boolean | AuthUser$sessionsArgs<ExtArgs>
    accounts?: boolean | AuthUser$accountsArgs<ExtArgs>
    domainAccount?: boolean | AuthUser$domainAccountArgs<ExtArgs>
    _count?: boolean | AuthUserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["authUser"]>

  export type AuthUserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    emailVerified?: boolean
    image?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["authUser"]>

  export type AuthUserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    emailVerified?: boolean
    image?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["authUser"]>

  export type AuthUserSelectScalar = {
    id?: boolean
    name?: boolean
    email?: boolean
    emailVerified?: boolean
    image?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AuthUserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "email" | "emailVerified" | "image" | "createdAt" | "updatedAt", ExtArgs["result"]["authUser"]>
  export type AuthUserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sessions?: boolean | AuthUser$sessionsArgs<ExtArgs>
    accounts?: boolean | AuthUser$accountsArgs<ExtArgs>
    domainAccount?: boolean | AuthUser$domainAccountArgs<ExtArgs>
    _count?: boolean | AuthUserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type AuthUserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type AuthUserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $AuthUserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AuthUser"
    objects: {
      sessions: Prisma.$SessionPayload<ExtArgs>[]
      accounts: Prisma.$AuthAccountPayload<ExtArgs>[]
      domainAccount: Prisma.$AccountPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      email: string
      emailVerified: boolean
      image: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["authUser"]>
    composites: {}
  }

  type AuthUserGetPayload<S extends boolean | null | undefined | AuthUserDefaultArgs> = $Result.GetResult<Prisma.$AuthUserPayload, S>

  type AuthUserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AuthUserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AuthUserCountAggregateInputType | true
    }

  export interface AuthUserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AuthUser'], meta: { name: 'AuthUser' } }
    /**
     * Find zero or one AuthUser that matches the filter.
     * @param {AuthUserFindUniqueArgs} args - Arguments to find a AuthUser
     * @example
     * // Get one AuthUser
     * const authUser = await prisma.authUser.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AuthUserFindUniqueArgs>(args: SelectSubset<T, AuthUserFindUniqueArgs<ExtArgs>>): Prisma__AuthUserClient<$Result.GetResult<Prisma.$AuthUserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AuthUser that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AuthUserFindUniqueOrThrowArgs} args - Arguments to find a AuthUser
     * @example
     * // Get one AuthUser
     * const authUser = await prisma.authUser.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AuthUserFindUniqueOrThrowArgs>(args: SelectSubset<T, AuthUserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AuthUserClient<$Result.GetResult<Prisma.$AuthUserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuthUser that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthUserFindFirstArgs} args - Arguments to find a AuthUser
     * @example
     * // Get one AuthUser
     * const authUser = await prisma.authUser.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AuthUserFindFirstArgs>(args?: SelectSubset<T, AuthUserFindFirstArgs<ExtArgs>>): Prisma__AuthUserClient<$Result.GetResult<Prisma.$AuthUserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuthUser that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthUserFindFirstOrThrowArgs} args - Arguments to find a AuthUser
     * @example
     * // Get one AuthUser
     * const authUser = await prisma.authUser.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AuthUserFindFirstOrThrowArgs>(args?: SelectSubset<T, AuthUserFindFirstOrThrowArgs<ExtArgs>>): Prisma__AuthUserClient<$Result.GetResult<Prisma.$AuthUserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AuthUsers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthUserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AuthUsers
     * const authUsers = await prisma.authUser.findMany()
     * 
     * // Get first 10 AuthUsers
     * const authUsers = await prisma.authUser.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const authUserWithIdOnly = await prisma.authUser.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AuthUserFindManyArgs>(args?: SelectSubset<T, AuthUserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthUserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AuthUser.
     * @param {AuthUserCreateArgs} args - Arguments to create a AuthUser.
     * @example
     * // Create one AuthUser
     * const AuthUser = await prisma.authUser.create({
     *   data: {
     *     // ... data to create a AuthUser
     *   }
     * })
     * 
     */
    create<T extends AuthUserCreateArgs>(args: SelectSubset<T, AuthUserCreateArgs<ExtArgs>>): Prisma__AuthUserClient<$Result.GetResult<Prisma.$AuthUserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AuthUsers.
     * @param {AuthUserCreateManyArgs} args - Arguments to create many AuthUsers.
     * @example
     * // Create many AuthUsers
     * const authUser = await prisma.authUser.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AuthUserCreateManyArgs>(args?: SelectSubset<T, AuthUserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AuthUsers and returns the data saved in the database.
     * @param {AuthUserCreateManyAndReturnArgs} args - Arguments to create many AuthUsers.
     * @example
     * // Create many AuthUsers
     * const authUser = await prisma.authUser.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AuthUsers and only return the `id`
     * const authUserWithIdOnly = await prisma.authUser.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AuthUserCreateManyAndReturnArgs>(args?: SelectSubset<T, AuthUserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthUserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AuthUser.
     * @param {AuthUserDeleteArgs} args - Arguments to delete one AuthUser.
     * @example
     * // Delete one AuthUser
     * const AuthUser = await prisma.authUser.delete({
     *   where: {
     *     // ... filter to delete one AuthUser
     *   }
     * })
     * 
     */
    delete<T extends AuthUserDeleteArgs>(args: SelectSubset<T, AuthUserDeleteArgs<ExtArgs>>): Prisma__AuthUserClient<$Result.GetResult<Prisma.$AuthUserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AuthUser.
     * @param {AuthUserUpdateArgs} args - Arguments to update one AuthUser.
     * @example
     * // Update one AuthUser
     * const authUser = await prisma.authUser.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AuthUserUpdateArgs>(args: SelectSubset<T, AuthUserUpdateArgs<ExtArgs>>): Prisma__AuthUserClient<$Result.GetResult<Prisma.$AuthUserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AuthUsers.
     * @param {AuthUserDeleteManyArgs} args - Arguments to filter AuthUsers to delete.
     * @example
     * // Delete a few AuthUsers
     * const { count } = await prisma.authUser.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AuthUserDeleteManyArgs>(args?: SelectSubset<T, AuthUserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuthUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthUserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AuthUsers
     * const authUser = await prisma.authUser.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AuthUserUpdateManyArgs>(args: SelectSubset<T, AuthUserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuthUsers and returns the data updated in the database.
     * @param {AuthUserUpdateManyAndReturnArgs} args - Arguments to update many AuthUsers.
     * @example
     * // Update many AuthUsers
     * const authUser = await prisma.authUser.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AuthUsers and only return the `id`
     * const authUserWithIdOnly = await prisma.authUser.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AuthUserUpdateManyAndReturnArgs>(args: SelectSubset<T, AuthUserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthUserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AuthUser.
     * @param {AuthUserUpsertArgs} args - Arguments to update or create a AuthUser.
     * @example
     * // Update or create a AuthUser
     * const authUser = await prisma.authUser.upsert({
     *   create: {
     *     // ... data to create a AuthUser
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AuthUser we want to update
     *   }
     * })
     */
    upsert<T extends AuthUserUpsertArgs>(args: SelectSubset<T, AuthUserUpsertArgs<ExtArgs>>): Prisma__AuthUserClient<$Result.GetResult<Prisma.$AuthUserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AuthUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthUserCountArgs} args - Arguments to filter AuthUsers to count.
     * @example
     * // Count the number of AuthUsers
     * const count = await prisma.authUser.count({
     *   where: {
     *     // ... the filter for the AuthUsers we want to count
     *   }
     * })
    **/
    count<T extends AuthUserCountArgs>(
      args?: Subset<T, AuthUserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AuthUserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AuthUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthUserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AuthUserAggregateArgs>(args: Subset<T, AuthUserAggregateArgs>): Prisma.PrismaPromise<GetAuthUserAggregateType<T>>

    /**
     * Group by AuthUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthUserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AuthUserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AuthUserGroupByArgs['orderBy'] }
        : { orderBy?: AuthUserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AuthUserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuthUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AuthUser model
   */
  readonly fields: AuthUserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AuthUser.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AuthUserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    sessions<T extends AuthUser$sessionsArgs<ExtArgs> = {}>(args?: Subset<T, AuthUser$sessionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    accounts<T extends AuthUser$accountsArgs<ExtArgs> = {}>(args?: Subset<T, AuthUser$accountsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthAccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    domainAccount<T extends AuthUser$domainAccountArgs<ExtArgs> = {}>(args?: Subset<T, AuthUser$domainAccountArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AuthUser model
   */
  interface AuthUserFieldRefs {
    readonly id: FieldRef<"AuthUser", 'String'>
    readonly name: FieldRef<"AuthUser", 'String'>
    readonly email: FieldRef<"AuthUser", 'String'>
    readonly emailVerified: FieldRef<"AuthUser", 'Boolean'>
    readonly image: FieldRef<"AuthUser", 'String'>
    readonly createdAt: FieldRef<"AuthUser", 'DateTime'>
    readonly updatedAt: FieldRef<"AuthUser", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AuthUser findUnique
   */
  export type AuthUserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthUser
     */
    select?: AuthUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthUser
     */
    omit?: AuthUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthUserInclude<ExtArgs> | null
    /**
     * Filter, which AuthUser to fetch.
     */
    where: AuthUserWhereUniqueInput
  }

  /**
   * AuthUser findUniqueOrThrow
   */
  export type AuthUserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthUser
     */
    select?: AuthUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthUser
     */
    omit?: AuthUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthUserInclude<ExtArgs> | null
    /**
     * Filter, which AuthUser to fetch.
     */
    where: AuthUserWhereUniqueInput
  }

  /**
   * AuthUser findFirst
   */
  export type AuthUserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthUser
     */
    select?: AuthUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthUser
     */
    omit?: AuthUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthUserInclude<ExtArgs> | null
    /**
     * Filter, which AuthUser to fetch.
     */
    where?: AuthUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuthUsers to fetch.
     */
    orderBy?: AuthUserOrderByWithRelationInput | AuthUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuthUsers.
     */
    cursor?: AuthUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuthUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuthUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuthUsers.
     */
    distinct?: AuthUserScalarFieldEnum | AuthUserScalarFieldEnum[]
  }

  /**
   * AuthUser findFirstOrThrow
   */
  export type AuthUserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthUser
     */
    select?: AuthUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthUser
     */
    omit?: AuthUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthUserInclude<ExtArgs> | null
    /**
     * Filter, which AuthUser to fetch.
     */
    where?: AuthUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuthUsers to fetch.
     */
    orderBy?: AuthUserOrderByWithRelationInput | AuthUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuthUsers.
     */
    cursor?: AuthUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuthUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuthUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuthUsers.
     */
    distinct?: AuthUserScalarFieldEnum | AuthUserScalarFieldEnum[]
  }

  /**
   * AuthUser findMany
   */
  export type AuthUserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthUser
     */
    select?: AuthUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthUser
     */
    omit?: AuthUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthUserInclude<ExtArgs> | null
    /**
     * Filter, which AuthUsers to fetch.
     */
    where?: AuthUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuthUsers to fetch.
     */
    orderBy?: AuthUserOrderByWithRelationInput | AuthUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AuthUsers.
     */
    cursor?: AuthUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuthUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuthUsers.
     */
    skip?: number
    distinct?: AuthUserScalarFieldEnum | AuthUserScalarFieldEnum[]
  }

  /**
   * AuthUser create
   */
  export type AuthUserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthUser
     */
    select?: AuthUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthUser
     */
    omit?: AuthUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthUserInclude<ExtArgs> | null
    /**
     * The data needed to create a AuthUser.
     */
    data: XOR<AuthUserCreateInput, AuthUserUncheckedCreateInput>
  }

  /**
   * AuthUser createMany
   */
  export type AuthUserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AuthUsers.
     */
    data: AuthUserCreateManyInput | AuthUserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AuthUser createManyAndReturn
   */
  export type AuthUserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthUser
     */
    select?: AuthUserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AuthUser
     */
    omit?: AuthUserOmit<ExtArgs> | null
    /**
     * The data used to create many AuthUsers.
     */
    data: AuthUserCreateManyInput | AuthUserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AuthUser update
   */
  export type AuthUserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthUser
     */
    select?: AuthUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthUser
     */
    omit?: AuthUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthUserInclude<ExtArgs> | null
    /**
     * The data needed to update a AuthUser.
     */
    data: XOR<AuthUserUpdateInput, AuthUserUncheckedUpdateInput>
    /**
     * Choose, which AuthUser to update.
     */
    where: AuthUserWhereUniqueInput
  }

  /**
   * AuthUser updateMany
   */
  export type AuthUserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AuthUsers.
     */
    data: XOR<AuthUserUpdateManyMutationInput, AuthUserUncheckedUpdateManyInput>
    /**
     * Filter which AuthUsers to update
     */
    where?: AuthUserWhereInput
    /**
     * Limit how many AuthUsers to update.
     */
    limit?: number
  }

  /**
   * AuthUser updateManyAndReturn
   */
  export type AuthUserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthUser
     */
    select?: AuthUserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AuthUser
     */
    omit?: AuthUserOmit<ExtArgs> | null
    /**
     * The data used to update AuthUsers.
     */
    data: XOR<AuthUserUpdateManyMutationInput, AuthUserUncheckedUpdateManyInput>
    /**
     * Filter which AuthUsers to update
     */
    where?: AuthUserWhereInput
    /**
     * Limit how many AuthUsers to update.
     */
    limit?: number
  }

  /**
   * AuthUser upsert
   */
  export type AuthUserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthUser
     */
    select?: AuthUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthUser
     */
    omit?: AuthUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthUserInclude<ExtArgs> | null
    /**
     * The filter to search for the AuthUser to update in case it exists.
     */
    where: AuthUserWhereUniqueInput
    /**
     * In case the AuthUser found by the `where` argument doesn't exist, create a new AuthUser with this data.
     */
    create: XOR<AuthUserCreateInput, AuthUserUncheckedCreateInput>
    /**
     * In case the AuthUser was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AuthUserUpdateInput, AuthUserUncheckedUpdateInput>
  }

  /**
   * AuthUser delete
   */
  export type AuthUserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthUser
     */
    select?: AuthUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthUser
     */
    omit?: AuthUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthUserInclude<ExtArgs> | null
    /**
     * Filter which AuthUser to delete.
     */
    where: AuthUserWhereUniqueInput
  }

  /**
   * AuthUser deleteMany
   */
  export type AuthUserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuthUsers to delete
     */
    where?: AuthUserWhereInput
    /**
     * Limit how many AuthUsers to delete.
     */
    limit?: number
  }

  /**
   * AuthUser.sessions
   */
  export type AuthUser$sessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    where?: SessionWhereInput
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    cursor?: SessionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * AuthUser.accounts
   */
  export type AuthUser$accountsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthAccount
     */
    select?: AuthAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthAccount
     */
    omit?: AuthAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthAccountInclude<ExtArgs> | null
    where?: AuthAccountWhereInput
    orderBy?: AuthAccountOrderByWithRelationInput | AuthAccountOrderByWithRelationInput[]
    cursor?: AuthAccountWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AuthAccountScalarFieldEnum | AuthAccountScalarFieldEnum[]
  }

  /**
   * AuthUser.domainAccount
   */
  export type AuthUser$domainAccountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    where?: AccountWhereInput
  }

  /**
   * AuthUser without action
   */
  export type AuthUserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthUser
     */
    select?: AuthUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthUser
     */
    omit?: AuthUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthUserInclude<ExtArgs> | null
  }


  /**
   * Model Session
   */

  export type AggregateSession = {
    _count: SessionCountAggregateOutputType | null
    _min: SessionMinAggregateOutputType | null
    _max: SessionMaxAggregateOutputType | null
  }

  export type SessionMinAggregateOutputType = {
    id: string | null
    expiresAt: Date | null
    token: string | null
    createdAt: Date | null
    updatedAt: Date | null
    ipAddress: string | null
    userAgent: string | null
    userId: string | null
  }

  export type SessionMaxAggregateOutputType = {
    id: string | null
    expiresAt: Date | null
    token: string | null
    createdAt: Date | null
    updatedAt: Date | null
    ipAddress: string | null
    userAgent: string | null
    userId: string | null
  }

  export type SessionCountAggregateOutputType = {
    id: number
    expiresAt: number
    token: number
    createdAt: number
    updatedAt: number
    ipAddress: number
    userAgent: number
    userId: number
    _all: number
  }


  export type SessionMinAggregateInputType = {
    id?: true
    expiresAt?: true
    token?: true
    createdAt?: true
    updatedAt?: true
    ipAddress?: true
    userAgent?: true
    userId?: true
  }

  export type SessionMaxAggregateInputType = {
    id?: true
    expiresAt?: true
    token?: true
    createdAt?: true
    updatedAt?: true
    ipAddress?: true
    userAgent?: true
    userId?: true
  }

  export type SessionCountAggregateInputType = {
    id?: true
    expiresAt?: true
    token?: true
    createdAt?: true
    updatedAt?: true
    ipAddress?: true
    userAgent?: true
    userId?: true
    _all?: true
  }

  export type SessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Session to aggregate.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Sessions
    **/
    _count?: true | SessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SessionMaxAggregateInputType
  }

  export type GetSessionAggregateType<T extends SessionAggregateArgs> = {
        [P in keyof T & keyof AggregateSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSession[P]>
      : GetScalarType<T[P], AggregateSession[P]>
  }




  export type SessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SessionWhereInput
    orderBy?: SessionOrderByWithAggregationInput | SessionOrderByWithAggregationInput[]
    by: SessionScalarFieldEnum[] | SessionScalarFieldEnum
    having?: SessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SessionCountAggregateInputType | true
    _min?: SessionMinAggregateInputType
    _max?: SessionMaxAggregateInputType
  }

  export type SessionGroupByOutputType = {
    id: string
    expiresAt: Date
    token: string
    createdAt: Date
    updatedAt: Date
    ipAddress: string | null
    userAgent: string | null
    userId: string
    _count: SessionCountAggregateOutputType | null
    _min: SessionMinAggregateOutputType | null
    _max: SessionMaxAggregateOutputType | null
  }

  type GetSessionGroupByPayload<T extends SessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SessionGroupByOutputType[P]>
            : GetScalarType<T[P], SessionGroupByOutputType[P]>
        }
      >
    >


  export type SessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    expiresAt?: boolean
    token?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    userId?: boolean
    user?: boolean | AuthUserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["session"]>

  export type SessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    expiresAt?: boolean
    token?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    userId?: boolean
    user?: boolean | AuthUserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["session"]>

  export type SessionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    expiresAt?: boolean
    token?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    userId?: boolean
    user?: boolean | AuthUserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["session"]>

  export type SessionSelectScalar = {
    id?: boolean
    expiresAt?: boolean
    token?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    userId?: boolean
  }

  export type SessionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "expiresAt" | "token" | "createdAt" | "updatedAt" | "ipAddress" | "userAgent" | "userId", ExtArgs["result"]["session"]>
  export type SessionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | AuthUserDefaultArgs<ExtArgs>
  }
  export type SessionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | AuthUserDefaultArgs<ExtArgs>
  }
  export type SessionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | AuthUserDefaultArgs<ExtArgs>
  }

  export type $SessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Session"
    objects: {
      user: Prisma.$AuthUserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      expiresAt: Date
      token: string
      createdAt: Date
      updatedAt: Date
      ipAddress: string | null
      userAgent: string | null
      userId: string
    }, ExtArgs["result"]["session"]>
    composites: {}
  }

  type SessionGetPayload<S extends boolean | null | undefined | SessionDefaultArgs> = $Result.GetResult<Prisma.$SessionPayload, S>

  type SessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SessionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SessionCountAggregateInputType | true
    }

  export interface SessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Session'], meta: { name: 'Session' } }
    /**
     * Find zero or one Session that matches the filter.
     * @param {SessionFindUniqueArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SessionFindUniqueArgs>(args: SelectSubset<T, SessionFindUniqueArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Session that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SessionFindUniqueOrThrowArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SessionFindUniqueOrThrowArgs>(args: SelectSubset<T, SessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Session that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindFirstArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SessionFindFirstArgs>(args?: SelectSubset<T, SessionFindFirstArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Session that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindFirstOrThrowArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SessionFindFirstOrThrowArgs>(args?: SelectSubset<T, SessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Sessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Sessions
     * const sessions = await prisma.session.findMany()
     * 
     * // Get first 10 Sessions
     * const sessions = await prisma.session.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sessionWithIdOnly = await prisma.session.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SessionFindManyArgs>(args?: SelectSubset<T, SessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Session.
     * @param {SessionCreateArgs} args - Arguments to create a Session.
     * @example
     * // Create one Session
     * const Session = await prisma.session.create({
     *   data: {
     *     // ... data to create a Session
     *   }
     * })
     * 
     */
    create<T extends SessionCreateArgs>(args: SelectSubset<T, SessionCreateArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Sessions.
     * @param {SessionCreateManyArgs} args - Arguments to create many Sessions.
     * @example
     * // Create many Sessions
     * const session = await prisma.session.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SessionCreateManyArgs>(args?: SelectSubset<T, SessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Sessions and returns the data saved in the database.
     * @param {SessionCreateManyAndReturnArgs} args - Arguments to create many Sessions.
     * @example
     * // Create many Sessions
     * const session = await prisma.session.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Sessions and only return the `id`
     * const sessionWithIdOnly = await prisma.session.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SessionCreateManyAndReturnArgs>(args?: SelectSubset<T, SessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Session.
     * @param {SessionDeleteArgs} args - Arguments to delete one Session.
     * @example
     * // Delete one Session
     * const Session = await prisma.session.delete({
     *   where: {
     *     // ... filter to delete one Session
     *   }
     * })
     * 
     */
    delete<T extends SessionDeleteArgs>(args: SelectSubset<T, SessionDeleteArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Session.
     * @param {SessionUpdateArgs} args - Arguments to update one Session.
     * @example
     * // Update one Session
     * const session = await prisma.session.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SessionUpdateArgs>(args: SelectSubset<T, SessionUpdateArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Sessions.
     * @param {SessionDeleteManyArgs} args - Arguments to filter Sessions to delete.
     * @example
     * // Delete a few Sessions
     * const { count } = await prisma.session.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SessionDeleteManyArgs>(args?: SelectSubset<T, SessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Sessions
     * const session = await prisma.session.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SessionUpdateManyArgs>(args: SelectSubset<T, SessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sessions and returns the data updated in the database.
     * @param {SessionUpdateManyAndReturnArgs} args - Arguments to update many Sessions.
     * @example
     * // Update many Sessions
     * const session = await prisma.session.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Sessions and only return the `id`
     * const sessionWithIdOnly = await prisma.session.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SessionUpdateManyAndReturnArgs>(args: SelectSubset<T, SessionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Session.
     * @param {SessionUpsertArgs} args - Arguments to update or create a Session.
     * @example
     * // Update or create a Session
     * const session = await prisma.session.upsert({
     *   create: {
     *     // ... data to create a Session
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Session we want to update
     *   }
     * })
     */
    upsert<T extends SessionUpsertArgs>(args: SelectSubset<T, SessionUpsertArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionCountArgs} args - Arguments to filter Sessions to count.
     * @example
     * // Count the number of Sessions
     * const count = await prisma.session.count({
     *   where: {
     *     // ... the filter for the Sessions we want to count
     *   }
     * })
    **/
    count<T extends SessionCountArgs>(
      args?: Subset<T, SessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Session.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SessionAggregateArgs>(args: Subset<T, SessionAggregateArgs>): Prisma.PrismaPromise<GetSessionAggregateType<T>>

    /**
     * Group by Session.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SessionGroupByArgs['orderBy'] }
        : { orderBy?: SessionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Session model
   */
  readonly fields: SessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Session.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends AuthUserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AuthUserDefaultArgs<ExtArgs>>): Prisma__AuthUserClient<$Result.GetResult<Prisma.$AuthUserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Session model
   */
  interface SessionFieldRefs {
    readonly id: FieldRef<"Session", 'String'>
    readonly expiresAt: FieldRef<"Session", 'DateTime'>
    readonly token: FieldRef<"Session", 'String'>
    readonly createdAt: FieldRef<"Session", 'DateTime'>
    readonly updatedAt: FieldRef<"Session", 'DateTime'>
    readonly ipAddress: FieldRef<"Session", 'String'>
    readonly userAgent: FieldRef<"Session", 'String'>
    readonly userId: FieldRef<"Session", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Session findUnique
   */
  export type SessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session findUniqueOrThrow
   */
  export type SessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session findFirst
   */
  export type SessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sessions.
     */
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * Session findFirstOrThrow
   */
  export type SessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sessions.
     */
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * Session findMany
   */
  export type SessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Sessions to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * Session create
   */
  export type SessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * The data needed to create a Session.
     */
    data: XOR<SessionCreateInput, SessionUncheckedCreateInput>
  }

  /**
   * Session createMany
   */
  export type SessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Sessions.
     */
    data: SessionCreateManyInput | SessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Session createManyAndReturn
   */
  export type SessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * The data used to create many Sessions.
     */
    data: SessionCreateManyInput | SessionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Session update
   */
  export type SessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * The data needed to update a Session.
     */
    data: XOR<SessionUpdateInput, SessionUncheckedUpdateInput>
    /**
     * Choose, which Session to update.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session updateMany
   */
  export type SessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Sessions.
     */
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyInput>
    /**
     * Filter which Sessions to update
     */
    where?: SessionWhereInput
    /**
     * Limit how many Sessions to update.
     */
    limit?: number
  }

  /**
   * Session updateManyAndReturn
   */
  export type SessionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * The data used to update Sessions.
     */
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyInput>
    /**
     * Filter which Sessions to update
     */
    where?: SessionWhereInput
    /**
     * Limit how many Sessions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Session upsert
   */
  export type SessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * The filter to search for the Session to update in case it exists.
     */
    where: SessionWhereUniqueInput
    /**
     * In case the Session found by the `where` argument doesn't exist, create a new Session with this data.
     */
    create: XOR<SessionCreateInput, SessionUncheckedCreateInput>
    /**
     * In case the Session was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SessionUpdateInput, SessionUncheckedUpdateInput>
  }

  /**
   * Session delete
   */
  export type SessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter which Session to delete.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session deleteMany
   */
  export type SessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Sessions to delete
     */
    where?: SessionWhereInput
    /**
     * Limit how many Sessions to delete.
     */
    limit?: number
  }

  /**
   * Session without action
   */
  export type SessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
  }


  /**
   * Model AuthAccount
   */

  export type AggregateAuthAccount = {
    _count: AuthAccountCountAggregateOutputType | null
    _min: AuthAccountMinAggregateOutputType | null
    _max: AuthAccountMaxAggregateOutputType | null
  }

  export type AuthAccountMinAggregateOutputType = {
    id: string | null
    accountId: string | null
    providerId: string | null
    userId: string | null
    accessToken: string | null
    refreshToken: string | null
    idToken: string | null
    accessTokenExpiresAt: Date | null
    refreshTokenExpiresAt: Date | null
    scope: string | null
    password: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AuthAccountMaxAggregateOutputType = {
    id: string | null
    accountId: string | null
    providerId: string | null
    userId: string | null
    accessToken: string | null
    refreshToken: string | null
    idToken: string | null
    accessTokenExpiresAt: Date | null
    refreshTokenExpiresAt: Date | null
    scope: string | null
    password: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AuthAccountCountAggregateOutputType = {
    id: number
    accountId: number
    providerId: number
    userId: number
    accessToken: number
    refreshToken: number
    idToken: number
    accessTokenExpiresAt: number
    refreshTokenExpiresAt: number
    scope: number
    password: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AuthAccountMinAggregateInputType = {
    id?: true
    accountId?: true
    providerId?: true
    userId?: true
    accessToken?: true
    refreshToken?: true
    idToken?: true
    accessTokenExpiresAt?: true
    refreshTokenExpiresAt?: true
    scope?: true
    password?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AuthAccountMaxAggregateInputType = {
    id?: true
    accountId?: true
    providerId?: true
    userId?: true
    accessToken?: true
    refreshToken?: true
    idToken?: true
    accessTokenExpiresAt?: true
    refreshTokenExpiresAt?: true
    scope?: true
    password?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AuthAccountCountAggregateInputType = {
    id?: true
    accountId?: true
    providerId?: true
    userId?: true
    accessToken?: true
    refreshToken?: true
    idToken?: true
    accessTokenExpiresAt?: true
    refreshTokenExpiresAt?: true
    scope?: true
    password?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AuthAccountAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuthAccount to aggregate.
     */
    where?: AuthAccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuthAccounts to fetch.
     */
    orderBy?: AuthAccountOrderByWithRelationInput | AuthAccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AuthAccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuthAccounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuthAccounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AuthAccounts
    **/
    _count?: true | AuthAccountCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AuthAccountMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AuthAccountMaxAggregateInputType
  }

  export type GetAuthAccountAggregateType<T extends AuthAccountAggregateArgs> = {
        [P in keyof T & keyof AggregateAuthAccount]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuthAccount[P]>
      : GetScalarType<T[P], AggregateAuthAccount[P]>
  }




  export type AuthAccountGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuthAccountWhereInput
    orderBy?: AuthAccountOrderByWithAggregationInput | AuthAccountOrderByWithAggregationInput[]
    by: AuthAccountScalarFieldEnum[] | AuthAccountScalarFieldEnum
    having?: AuthAccountScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AuthAccountCountAggregateInputType | true
    _min?: AuthAccountMinAggregateInputType
    _max?: AuthAccountMaxAggregateInputType
  }

  export type AuthAccountGroupByOutputType = {
    id: string
    accountId: string
    providerId: string
    userId: string
    accessToken: string | null
    refreshToken: string | null
    idToken: string | null
    accessTokenExpiresAt: Date | null
    refreshTokenExpiresAt: Date | null
    scope: string | null
    password: string | null
    createdAt: Date
    updatedAt: Date
    _count: AuthAccountCountAggregateOutputType | null
    _min: AuthAccountMinAggregateOutputType | null
    _max: AuthAccountMaxAggregateOutputType | null
  }

  type GetAuthAccountGroupByPayload<T extends AuthAccountGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AuthAccountGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AuthAccountGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AuthAccountGroupByOutputType[P]>
            : GetScalarType<T[P], AuthAccountGroupByOutputType[P]>
        }
      >
    >


  export type AuthAccountSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    accountId?: boolean
    providerId?: boolean
    userId?: boolean
    accessToken?: boolean
    refreshToken?: boolean
    idToken?: boolean
    accessTokenExpiresAt?: boolean
    refreshTokenExpiresAt?: boolean
    scope?: boolean
    password?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | AuthUserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["authAccount"]>

  export type AuthAccountSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    accountId?: boolean
    providerId?: boolean
    userId?: boolean
    accessToken?: boolean
    refreshToken?: boolean
    idToken?: boolean
    accessTokenExpiresAt?: boolean
    refreshTokenExpiresAt?: boolean
    scope?: boolean
    password?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | AuthUserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["authAccount"]>

  export type AuthAccountSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    accountId?: boolean
    providerId?: boolean
    userId?: boolean
    accessToken?: boolean
    refreshToken?: boolean
    idToken?: boolean
    accessTokenExpiresAt?: boolean
    refreshTokenExpiresAt?: boolean
    scope?: boolean
    password?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | AuthUserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["authAccount"]>

  export type AuthAccountSelectScalar = {
    id?: boolean
    accountId?: boolean
    providerId?: boolean
    userId?: boolean
    accessToken?: boolean
    refreshToken?: boolean
    idToken?: boolean
    accessTokenExpiresAt?: boolean
    refreshTokenExpiresAt?: boolean
    scope?: boolean
    password?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AuthAccountOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "accountId" | "providerId" | "userId" | "accessToken" | "refreshToken" | "idToken" | "accessTokenExpiresAt" | "refreshTokenExpiresAt" | "scope" | "password" | "createdAt" | "updatedAt", ExtArgs["result"]["authAccount"]>
  export type AuthAccountInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | AuthUserDefaultArgs<ExtArgs>
  }
  export type AuthAccountIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | AuthUserDefaultArgs<ExtArgs>
  }
  export type AuthAccountIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | AuthUserDefaultArgs<ExtArgs>
  }

  export type $AuthAccountPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AuthAccount"
    objects: {
      user: Prisma.$AuthUserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      accountId: string
      providerId: string
      userId: string
      accessToken: string | null
      refreshToken: string | null
      idToken: string | null
      accessTokenExpiresAt: Date | null
      refreshTokenExpiresAt: Date | null
      scope: string | null
      password: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["authAccount"]>
    composites: {}
  }

  type AuthAccountGetPayload<S extends boolean | null | undefined | AuthAccountDefaultArgs> = $Result.GetResult<Prisma.$AuthAccountPayload, S>

  type AuthAccountCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AuthAccountFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AuthAccountCountAggregateInputType | true
    }

  export interface AuthAccountDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AuthAccount'], meta: { name: 'AuthAccount' } }
    /**
     * Find zero or one AuthAccount that matches the filter.
     * @param {AuthAccountFindUniqueArgs} args - Arguments to find a AuthAccount
     * @example
     * // Get one AuthAccount
     * const authAccount = await prisma.authAccount.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AuthAccountFindUniqueArgs>(args: SelectSubset<T, AuthAccountFindUniqueArgs<ExtArgs>>): Prisma__AuthAccountClient<$Result.GetResult<Prisma.$AuthAccountPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AuthAccount that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AuthAccountFindUniqueOrThrowArgs} args - Arguments to find a AuthAccount
     * @example
     * // Get one AuthAccount
     * const authAccount = await prisma.authAccount.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AuthAccountFindUniqueOrThrowArgs>(args: SelectSubset<T, AuthAccountFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AuthAccountClient<$Result.GetResult<Prisma.$AuthAccountPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuthAccount that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthAccountFindFirstArgs} args - Arguments to find a AuthAccount
     * @example
     * // Get one AuthAccount
     * const authAccount = await prisma.authAccount.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AuthAccountFindFirstArgs>(args?: SelectSubset<T, AuthAccountFindFirstArgs<ExtArgs>>): Prisma__AuthAccountClient<$Result.GetResult<Prisma.$AuthAccountPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuthAccount that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthAccountFindFirstOrThrowArgs} args - Arguments to find a AuthAccount
     * @example
     * // Get one AuthAccount
     * const authAccount = await prisma.authAccount.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AuthAccountFindFirstOrThrowArgs>(args?: SelectSubset<T, AuthAccountFindFirstOrThrowArgs<ExtArgs>>): Prisma__AuthAccountClient<$Result.GetResult<Prisma.$AuthAccountPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AuthAccounts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthAccountFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AuthAccounts
     * const authAccounts = await prisma.authAccount.findMany()
     * 
     * // Get first 10 AuthAccounts
     * const authAccounts = await prisma.authAccount.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const authAccountWithIdOnly = await prisma.authAccount.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AuthAccountFindManyArgs>(args?: SelectSubset<T, AuthAccountFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthAccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AuthAccount.
     * @param {AuthAccountCreateArgs} args - Arguments to create a AuthAccount.
     * @example
     * // Create one AuthAccount
     * const AuthAccount = await prisma.authAccount.create({
     *   data: {
     *     // ... data to create a AuthAccount
     *   }
     * })
     * 
     */
    create<T extends AuthAccountCreateArgs>(args: SelectSubset<T, AuthAccountCreateArgs<ExtArgs>>): Prisma__AuthAccountClient<$Result.GetResult<Prisma.$AuthAccountPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AuthAccounts.
     * @param {AuthAccountCreateManyArgs} args - Arguments to create many AuthAccounts.
     * @example
     * // Create many AuthAccounts
     * const authAccount = await prisma.authAccount.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AuthAccountCreateManyArgs>(args?: SelectSubset<T, AuthAccountCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AuthAccounts and returns the data saved in the database.
     * @param {AuthAccountCreateManyAndReturnArgs} args - Arguments to create many AuthAccounts.
     * @example
     * // Create many AuthAccounts
     * const authAccount = await prisma.authAccount.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AuthAccounts and only return the `id`
     * const authAccountWithIdOnly = await prisma.authAccount.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AuthAccountCreateManyAndReturnArgs>(args?: SelectSubset<T, AuthAccountCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthAccountPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AuthAccount.
     * @param {AuthAccountDeleteArgs} args - Arguments to delete one AuthAccount.
     * @example
     * // Delete one AuthAccount
     * const AuthAccount = await prisma.authAccount.delete({
     *   where: {
     *     // ... filter to delete one AuthAccount
     *   }
     * })
     * 
     */
    delete<T extends AuthAccountDeleteArgs>(args: SelectSubset<T, AuthAccountDeleteArgs<ExtArgs>>): Prisma__AuthAccountClient<$Result.GetResult<Prisma.$AuthAccountPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AuthAccount.
     * @param {AuthAccountUpdateArgs} args - Arguments to update one AuthAccount.
     * @example
     * // Update one AuthAccount
     * const authAccount = await prisma.authAccount.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AuthAccountUpdateArgs>(args: SelectSubset<T, AuthAccountUpdateArgs<ExtArgs>>): Prisma__AuthAccountClient<$Result.GetResult<Prisma.$AuthAccountPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AuthAccounts.
     * @param {AuthAccountDeleteManyArgs} args - Arguments to filter AuthAccounts to delete.
     * @example
     * // Delete a few AuthAccounts
     * const { count } = await prisma.authAccount.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AuthAccountDeleteManyArgs>(args?: SelectSubset<T, AuthAccountDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuthAccounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthAccountUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AuthAccounts
     * const authAccount = await prisma.authAccount.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AuthAccountUpdateManyArgs>(args: SelectSubset<T, AuthAccountUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuthAccounts and returns the data updated in the database.
     * @param {AuthAccountUpdateManyAndReturnArgs} args - Arguments to update many AuthAccounts.
     * @example
     * // Update many AuthAccounts
     * const authAccount = await prisma.authAccount.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AuthAccounts and only return the `id`
     * const authAccountWithIdOnly = await prisma.authAccount.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AuthAccountUpdateManyAndReturnArgs>(args: SelectSubset<T, AuthAccountUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthAccountPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AuthAccount.
     * @param {AuthAccountUpsertArgs} args - Arguments to update or create a AuthAccount.
     * @example
     * // Update or create a AuthAccount
     * const authAccount = await prisma.authAccount.upsert({
     *   create: {
     *     // ... data to create a AuthAccount
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AuthAccount we want to update
     *   }
     * })
     */
    upsert<T extends AuthAccountUpsertArgs>(args: SelectSubset<T, AuthAccountUpsertArgs<ExtArgs>>): Prisma__AuthAccountClient<$Result.GetResult<Prisma.$AuthAccountPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AuthAccounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthAccountCountArgs} args - Arguments to filter AuthAccounts to count.
     * @example
     * // Count the number of AuthAccounts
     * const count = await prisma.authAccount.count({
     *   where: {
     *     // ... the filter for the AuthAccounts we want to count
     *   }
     * })
    **/
    count<T extends AuthAccountCountArgs>(
      args?: Subset<T, AuthAccountCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AuthAccountCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AuthAccount.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthAccountAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AuthAccountAggregateArgs>(args: Subset<T, AuthAccountAggregateArgs>): Prisma.PrismaPromise<GetAuthAccountAggregateType<T>>

    /**
     * Group by AuthAccount.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthAccountGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AuthAccountGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AuthAccountGroupByArgs['orderBy'] }
        : { orderBy?: AuthAccountGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AuthAccountGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuthAccountGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AuthAccount model
   */
  readonly fields: AuthAccountFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AuthAccount.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AuthAccountClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends AuthUserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AuthUserDefaultArgs<ExtArgs>>): Prisma__AuthUserClient<$Result.GetResult<Prisma.$AuthUserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AuthAccount model
   */
  interface AuthAccountFieldRefs {
    readonly id: FieldRef<"AuthAccount", 'String'>
    readonly accountId: FieldRef<"AuthAccount", 'String'>
    readonly providerId: FieldRef<"AuthAccount", 'String'>
    readonly userId: FieldRef<"AuthAccount", 'String'>
    readonly accessToken: FieldRef<"AuthAccount", 'String'>
    readonly refreshToken: FieldRef<"AuthAccount", 'String'>
    readonly idToken: FieldRef<"AuthAccount", 'String'>
    readonly accessTokenExpiresAt: FieldRef<"AuthAccount", 'DateTime'>
    readonly refreshTokenExpiresAt: FieldRef<"AuthAccount", 'DateTime'>
    readonly scope: FieldRef<"AuthAccount", 'String'>
    readonly password: FieldRef<"AuthAccount", 'String'>
    readonly createdAt: FieldRef<"AuthAccount", 'DateTime'>
    readonly updatedAt: FieldRef<"AuthAccount", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AuthAccount findUnique
   */
  export type AuthAccountFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthAccount
     */
    select?: AuthAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthAccount
     */
    omit?: AuthAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthAccountInclude<ExtArgs> | null
    /**
     * Filter, which AuthAccount to fetch.
     */
    where: AuthAccountWhereUniqueInput
  }

  /**
   * AuthAccount findUniqueOrThrow
   */
  export type AuthAccountFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthAccount
     */
    select?: AuthAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthAccount
     */
    omit?: AuthAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthAccountInclude<ExtArgs> | null
    /**
     * Filter, which AuthAccount to fetch.
     */
    where: AuthAccountWhereUniqueInput
  }

  /**
   * AuthAccount findFirst
   */
  export type AuthAccountFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthAccount
     */
    select?: AuthAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthAccount
     */
    omit?: AuthAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthAccountInclude<ExtArgs> | null
    /**
     * Filter, which AuthAccount to fetch.
     */
    where?: AuthAccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuthAccounts to fetch.
     */
    orderBy?: AuthAccountOrderByWithRelationInput | AuthAccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuthAccounts.
     */
    cursor?: AuthAccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuthAccounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuthAccounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuthAccounts.
     */
    distinct?: AuthAccountScalarFieldEnum | AuthAccountScalarFieldEnum[]
  }

  /**
   * AuthAccount findFirstOrThrow
   */
  export type AuthAccountFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthAccount
     */
    select?: AuthAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthAccount
     */
    omit?: AuthAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthAccountInclude<ExtArgs> | null
    /**
     * Filter, which AuthAccount to fetch.
     */
    where?: AuthAccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuthAccounts to fetch.
     */
    orderBy?: AuthAccountOrderByWithRelationInput | AuthAccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuthAccounts.
     */
    cursor?: AuthAccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuthAccounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuthAccounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuthAccounts.
     */
    distinct?: AuthAccountScalarFieldEnum | AuthAccountScalarFieldEnum[]
  }

  /**
   * AuthAccount findMany
   */
  export type AuthAccountFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthAccount
     */
    select?: AuthAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthAccount
     */
    omit?: AuthAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthAccountInclude<ExtArgs> | null
    /**
     * Filter, which AuthAccounts to fetch.
     */
    where?: AuthAccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuthAccounts to fetch.
     */
    orderBy?: AuthAccountOrderByWithRelationInput | AuthAccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AuthAccounts.
     */
    cursor?: AuthAccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuthAccounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuthAccounts.
     */
    skip?: number
    distinct?: AuthAccountScalarFieldEnum | AuthAccountScalarFieldEnum[]
  }

  /**
   * AuthAccount create
   */
  export type AuthAccountCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthAccount
     */
    select?: AuthAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthAccount
     */
    omit?: AuthAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthAccountInclude<ExtArgs> | null
    /**
     * The data needed to create a AuthAccount.
     */
    data: XOR<AuthAccountCreateInput, AuthAccountUncheckedCreateInput>
  }

  /**
   * AuthAccount createMany
   */
  export type AuthAccountCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AuthAccounts.
     */
    data: AuthAccountCreateManyInput | AuthAccountCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AuthAccount createManyAndReturn
   */
  export type AuthAccountCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthAccount
     */
    select?: AuthAccountSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AuthAccount
     */
    omit?: AuthAccountOmit<ExtArgs> | null
    /**
     * The data used to create many AuthAccounts.
     */
    data: AuthAccountCreateManyInput | AuthAccountCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthAccountIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AuthAccount update
   */
  export type AuthAccountUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthAccount
     */
    select?: AuthAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthAccount
     */
    omit?: AuthAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthAccountInclude<ExtArgs> | null
    /**
     * The data needed to update a AuthAccount.
     */
    data: XOR<AuthAccountUpdateInput, AuthAccountUncheckedUpdateInput>
    /**
     * Choose, which AuthAccount to update.
     */
    where: AuthAccountWhereUniqueInput
  }

  /**
   * AuthAccount updateMany
   */
  export type AuthAccountUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AuthAccounts.
     */
    data: XOR<AuthAccountUpdateManyMutationInput, AuthAccountUncheckedUpdateManyInput>
    /**
     * Filter which AuthAccounts to update
     */
    where?: AuthAccountWhereInput
    /**
     * Limit how many AuthAccounts to update.
     */
    limit?: number
  }

  /**
   * AuthAccount updateManyAndReturn
   */
  export type AuthAccountUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthAccount
     */
    select?: AuthAccountSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AuthAccount
     */
    omit?: AuthAccountOmit<ExtArgs> | null
    /**
     * The data used to update AuthAccounts.
     */
    data: XOR<AuthAccountUpdateManyMutationInput, AuthAccountUncheckedUpdateManyInput>
    /**
     * Filter which AuthAccounts to update
     */
    where?: AuthAccountWhereInput
    /**
     * Limit how many AuthAccounts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthAccountIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * AuthAccount upsert
   */
  export type AuthAccountUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthAccount
     */
    select?: AuthAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthAccount
     */
    omit?: AuthAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthAccountInclude<ExtArgs> | null
    /**
     * The filter to search for the AuthAccount to update in case it exists.
     */
    where: AuthAccountWhereUniqueInput
    /**
     * In case the AuthAccount found by the `where` argument doesn't exist, create a new AuthAccount with this data.
     */
    create: XOR<AuthAccountCreateInput, AuthAccountUncheckedCreateInput>
    /**
     * In case the AuthAccount was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AuthAccountUpdateInput, AuthAccountUncheckedUpdateInput>
  }

  /**
   * AuthAccount delete
   */
  export type AuthAccountDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthAccount
     */
    select?: AuthAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthAccount
     */
    omit?: AuthAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthAccountInclude<ExtArgs> | null
    /**
     * Filter which AuthAccount to delete.
     */
    where: AuthAccountWhereUniqueInput
  }

  /**
   * AuthAccount deleteMany
   */
  export type AuthAccountDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuthAccounts to delete
     */
    where?: AuthAccountWhereInput
    /**
     * Limit how many AuthAccounts to delete.
     */
    limit?: number
  }

  /**
   * AuthAccount without action
   */
  export type AuthAccountDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthAccount
     */
    select?: AuthAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthAccount
     */
    omit?: AuthAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthAccountInclude<ExtArgs> | null
  }


  /**
   * Model Verification
   */

  export type AggregateVerification = {
    _count: VerificationCountAggregateOutputType | null
    _min: VerificationMinAggregateOutputType | null
    _max: VerificationMaxAggregateOutputType | null
  }

  export type VerificationMinAggregateOutputType = {
    id: string | null
    identifier: string | null
    value: string | null
    expiresAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type VerificationMaxAggregateOutputType = {
    id: string | null
    identifier: string | null
    value: string | null
    expiresAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type VerificationCountAggregateOutputType = {
    id: number
    identifier: number
    value: number
    expiresAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type VerificationMinAggregateInputType = {
    id?: true
    identifier?: true
    value?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type VerificationMaxAggregateInputType = {
    id?: true
    identifier?: true
    value?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type VerificationCountAggregateInputType = {
    id?: true
    identifier?: true
    value?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type VerificationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Verification to aggregate.
     */
    where?: VerificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Verifications to fetch.
     */
    orderBy?: VerificationOrderByWithRelationInput | VerificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VerificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Verifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Verifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Verifications
    **/
    _count?: true | VerificationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VerificationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VerificationMaxAggregateInputType
  }

  export type GetVerificationAggregateType<T extends VerificationAggregateArgs> = {
        [P in keyof T & keyof AggregateVerification]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVerification[P]>
      : GetScalarType<T[P], AggregateVerification[P]>
  }




  export type VerificationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VerificationWhereInput
    orderBy?: VerificationOrderByWithAggregationInput | VerificationOrderByWithAggregationInput[]
    by: VerificationScalarFieldEnum[] | VerificationScalarFieldEnum
    having?: VerificationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VerificationCountAggregateInputType | true
    _min?: VerificationMinAggregateInputType
    _max?: VerificationMaxAggregateInputType
  }

  export type VerificationGroupByOutputType = {
    id: string
    identifier: string
    value: string
    expiresAt: Date
    createdAt: Date
    updatedAt: Date
    _count: VerificationCountAggregateOutputType | null
    _min: VerificationMinAggregateOutputType | null
    _max: VerificationMaxAggregateOutputType | null
  }

  type GetVerificationGroupByPayload<T extends VerificationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VerificationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VerificationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VerificationGroupByOutputType[P]>
            : GetScalarType<T[P], VerificationGroupByOutputType[P]>
        }
      >
    >


  export type VerificationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    identifier?: boolean
    value?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["verification"]>

  export type VerificationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    identifier?: boolean
    value?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["verification"]>

  export type VerificationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    identifier?: boolean
    value?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["verification"]>

  export type VerificationSelectScalar = {
    id?: boolean
    identifier?: boolean
    value?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type VerificationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "identifier" | "value" | "expiresAt" | "createdAt" | "updatedAt", ExtArgs["result"]["verification"]>

  export type $VerificationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Verification"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      identifier: string
      value: string
      expiresAt: Date
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["verification"]>
    composites: {}
  }

  type VerificationGetPayload<S extends boolean | null | undefined | VerificationDefaultArgs> = $Result.GetResult<Prisma.$VerificationPayload, S>

  type VerificationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<VerificationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: VerificationCountAggregateInputType | true
    }

  export interface VerificationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Verification'], meta: { name: 'Verification' } }
    /**
     * Find zero or one Verification that matches the filter.
     * @param {VerificationFindUniqueArgs} args - Arguments to find a Verification
     * @example
     * // Get one Verification
     * const verification = await prisma.verification.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VerificationFindUniqueArgs>(args: SelectSubset<T, VerificationFindUniqueArgs<ExtArgs>>): Prisma__VerificationClient<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Verification that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VerificationFindUniqueOrThrowArgs} args - Arguments to find a Verification
     * @example
     * // Get one Verification
     * const verification = await prisma.verification.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VerificationFindUniqueOrThrowArgs>(args: SelectSubset<T, VerificationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VerificationClient<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Verification that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationFindFirstArgs} args - Arguments to find a Verification
     * @example
     * // Get one Verification
     * const verification = await prisma.verification.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VerificationFindFirstArgs>(args?: SelectSubset<T, VerificationFindFirstArgs<ExtArgs>>): Prisma__VerificationClient<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Verification that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationFindFirstOrThrowArgs} args - Arguments to find a Verification
     * @example
     * // Get one Verification
     * const verification = await prisma.verification.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VerificationFindFirstOrThrowArgs>(args?: SelectSubset<T, VerificationFindFirstOrThrowArgs<ExtArgs>>): Prisma__VerificationClient<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Verifications that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Verifications
     * const verifications = await prisma.verification.findMany()
     * 
     * // Get first 10 Verifications
     * const verifications = await prisma.verification.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const verificationWithIdOnly = await prisma.verification.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends VerificationFindManyArgs>(args?: SelectSubset<T, VerificationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Verification.
     * @param {VerificationCreateArgs} args - Arguments to create a Verification.
     * @example
     * // Create one Verification
     * const Verification = await prisma.verification.create({
     *   data: {
     *     // ... data to create a Verification
     *   }
     * })
     * 
     */
    create<T extends VerificationCreateArgs>(args: SelectSubset<T, VerificationCreateArgs<ExtArgs>>): Prisma__VerificationClient<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Verifications.
     * @param {VerificationCreateManyArgs} args - Arguments to create many Verifications.
     * @example
     * // Create many Verifications
     * const verification = await prisma.verification.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VerificationCreateManyArgs>(args?: SelectSubset<T, VerificationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Verifications and returns the data saved in the database.
     * @param {VerificationCreateManyAndReturnArgs} args - Arguments to create many Verifications.
     * @example
     * // Create many Verifications
     * const verification = await prisma.verification.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Verifications and only return the `id`
     * const verificationWithIdOnly = await prisma.verification.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends VerificationCreateManyAndReturnArgs>(args?: SelectSubset<T, VerificationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Verification.
     * @param {VerificationDeleteArgs} args - Arguments to delete one Verification.
     * @example
     * // Delete one Verification
     * const Verification = await prisma.verification.delete({
     *   where: {
     *     // ... filter to delete one Verification
     *   }
     * })
     * 
     */
    delete<T extends VerificationDeleteArgs>(args: SelectSubset<T, VerificationDeleteArgs<ExtArgs>>): Prisma__VerificationClient<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Verification.
     * @param {VerificationUpdateArgs} args - Arguments to update one Verification.
     * @example
     * // Update one Verification
     * const verification = await prisma.verification.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VerificationUpdateArgs>(args: SelectSubset<T, VerificationUpdateArgs<ExtArgs>>): Prisma__VerificationClient<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Verifications.
     * @param {VerificationDeleteManyArgs} args - Arguments to filter Verifications to delete.
     * @example
     * // Delete a few Verifications
     * const { count } = await prisma.verification.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VerificationDeleteManyArgs>(args?: SelectSubset<T, VerificationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Verifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Verifications
     * const verification = await prisma.verification.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VerificationUpdateManyArgs>(args: SelectSubset<T, VerificationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Verifications and returns the data updated in the database.
     * @param {VerificationUpdateManyAndReturnArgs} args - Arguments to update many Verifications.
     * @example
     * // Update many Verifications
     * const verification = await prisma.verification.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Verifications and only return the `id`
     * const verificationWithIdOnly = await prisma.verification.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends VerificationUpdateManyAndReturnArgs>(args: SelectSubset<T, VerificationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Verification.
     * @param {VerificationUpsertArgs} args - Arguments to update or create a Verification.
     * @example
     * // Update or create a Verification
     * const verification = await prisma.verification.upsert({
     *   create: {
     *     // ... data to create a Verification
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Verification we want to update
     *   }
     * })
     */
    upsert<T extends VerificationUpsertArgs>(args: SelectSubset<T, VerificationUpsertArgs<ExtArgs>>): Prisma__VerificationClient<$Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Verifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationCountArgs} args - Arguments to filter Verifications to count.
     * @example
     * // Count the number of Verifications
     * const count = await prisma.verification.count({
     *   where: {
     *     // ... the filter for the Verifications we want to count
     *   }
     * })
    **/
    count<T extends VerificationCountArgs>(
      args?: Subset<T, VerificationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VerificationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Verification.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends VerificationAggregateArgs>(args: Subset<T, VerificationAggregateArgs>): Prisma.PrismaPromise<GetVerificationAggregateType<T>>

    /**
     * Group by Verification.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends VerificationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VerificationGroupByArgs['orderBy'] }
        : { orderBy?: VerificationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, VerificationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVerificationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Verification model
   */
  readonly fields: VerificationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Verification.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VerificationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Verification model
   */
  interface VerificationFieldRefs {
    readonly id: FieldRef<"Verification", 'String'>
    readonly identifier: FieldRef<"Verification", 'String'>
    readonly value: FieldRef<"Verification", 'String'>
    readonly expiresAt: FieldRef<"Verification", 'DateTime'>
    readonly createdAt: FieldRef<"Verification", 'DateTime'>
    readonly updatedAt: FieldRef<"Verification", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Verification findUnique
   */
  export type VerificationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * Filter, which Verification to fetch.
     */
    where: VerificationWhereUniqueInput
  }

  /**
   * Verification findUniqueOrThrow
   */
  export type VerificationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * Filter, which Verification to fetch.
     */
    where: VerificationWhereUniqueInput
  }

  /**
   * Verification findFirst
   */
  export type VerificationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * Filter, which Verification to fetch.
     */
    where?: VerificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Verifications to fetch.
     */
    orderBy?: VerificationOrderByWithRelationInput | VerificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Verifications.
     */
    cursor?: VerificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Verifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Verifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Verifications.
     */
    distinct?: VerificationScalarFieldEnum | VerificationScalarFieldEnum[]
  }

  /**
   * Verification findFirstOrThrow
   */
  export type VerificationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * Filter, which Verification to fetch.
     */
    where?: VerificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Verifications to fetch.
     */
    orderBy?: VerificationOrderByWithRelationInput | VerificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Verifications.
     */
    cursor?: VerificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Verifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Verifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Verifications.
     */
    distinct?: VerificationScalarFieldEnum | VerificationScalarFieldEnum[]
  }

  /**
   * Verification findMany
   */
  export type VerificationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * Filter, which Verifications to fetch.
     */
    where?: VerificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Verifications to fetch.
     */
    orderBy?: VerificationOrderByWithRelationInput | VerificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Verifications.
     */
    cursor?: VerificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Verifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Verifications.
     */
    skip?: number
    distinct?: VerificationScalarFieldEnum | VerificationScalarFieldEnum[]
  }

  /**
   * Verification create
   */
  export type VerificationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * The data needed to create a Verification.
     */
    data: XOR<VerificationCreateInput, VerificationUncheckedCreateInput>
  }

  /**
   * Verification createMany
   */
  export type VerificationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Verifications.
     */
    data: VerificationCreateManyInput | VerificationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Verification createManyAndReturn
   */
  export type VerificationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * The data used to create many Verifications.
     */
    data: VerificationCreateManyInput | VerificationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Verification update
   */
  export type VerificationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * The data needed to update a Verification.
     */
    data: XOR<VerificationUpdateInput, VerificationUncheckedUpdateInput>
    /**
     * Choose, which Verification to update.
     */
    where: VerificationWhereUniqueInput
  }

  /**
   * Verification updateMany
   */
  export type VerificationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Verifications.
     */
    data: XOR<VerificationUpdateManyMutationInput, VerificationUncheckedUpdateManyInput>
    /**
     * Filter which Verifications to update
     */
    where?: VerificationWhereInput
    /**
     * Limit how many Verifications to update.
     */
    limit?: number
  }

  /**
   * Verification updateManyAndReturn
   */
  export type VerificationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * The data used to update Verifications.
     */
    data: XOR<VerificationUpdateManyMutationInput, VerificationUncheckedUpdateManyInput>
    /**
     * Filter which Verifications to update
     */
    where?: VerificationWhereInput
    /**
     * Limit how many Verifications to update.
     */
    limit?: number
  }

  /**
   * Verification upsert
   */
  export type VerificationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * The filter to search for the Verification to update in case it exists.
     */
    where: VerificationWhereUniqueInput
    /**
     * In case the Verification found by the `where` argument doesn't exist, create a new Verification with this data.
     */
    create: XOR<VerificationCreateInput, VerificationUncheckedCreateInput>
    /**
     * In case the Verification was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VerificationUpdateInput, VerificationUncheckedUpdateInput>
  }

  /**
   * Verification delete
   */
  export type VerificationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
    /**
     * Filter which Verification to delete.
     */
    where: VerificationWhereUniqueInput
  }

  /**
   * Verification deleteMany
   */
  export type VerificationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Verifications to delete
     */
    where?: VerificationWhereInput
    /**
     * Limit how many Verifications to delete.
     */
    limit?: number
  }

  /**
   * Verification without action
   */
  export type VerificationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verification
     */
    select?: VerificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verification
     */
    omit?: VerificationOmit<ExtArgs> | null
  }


  /**
   * Model Account
   */

  export type AggregateAccount = {
    _count: AccountCountAggregateOutputType | null
    _min: AccountMinAggregateOutputType | null
    _max: AccountMaxAggregateOutputType | null
  }

  export type AccountMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    lastActiveAt: Date | null
    authUserId: string | null
    email: string | null
    walletAddress: string | null
    isBanned: boolean | null
    identityTier: $Enums.IdentityTier | null
    identityVerifiedAt: Date | null
  }

  export type AccountMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    lastActiveAt: Date | null
    authUserId: string | null
    email: string | null
    walletAddress: string | null
    isBanned: boolean | null
    identityTier: $Enums.IdentityTier | null
    identityVerifiedAt: Date | null
  }

  export type AccountCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    lastActiveAt: number
    authUserId: number
    email: number
    walletAddress: number
    isBanned: number
    identityTier: number
    identityVerifiedAt: number
    _all: number
  }


  export type AccountMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    lastActiveAt?: true
    authUserId?: true
    email?: true
    walletAddress?: true
    isBanned?: true
    identityTier?: true
    identityVerifiedAt?: true
  }

  export type AccountMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    lastActiveAt?: true
    authUserId?: true
    email?: true
    walletAddress?: true
    isBanned?: true
    identityTier?: true
    identityVerifiedAt?: true
  }

  export type AccountCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    lastActiveAt?: true
    authUserId?: true
    email?: true
    walletAddress?: true
    isBanned?: true
    identityTier?: true
    identityVerifiedAt?: true
    _all?: true
  }

  export type AccountAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Account to aggregate.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Accounts
    **/
    _count?: true | AccountCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AccountMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AccountMaxAggregateInputType
  }

  export type GetAccountAggregateType<T extends AccountAggregateArgs> = {
        [P in keyof T & keyof AggregateAccount]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAccount[P]>
      : GetScalarType<T[P], AggregateAccount[P]>
  }




  export type AccountGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AccountWhereInput
    orderBy?: AccountOrderByWithAggregationInput | AccountOrderByWithAggregationInput[]
    by: AccountScalarFieldEnum[] | AccountScalarFieldEnum
    having?: AccountScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AccountCountAggregateInputType | true
    _min?: AccountMinAggregateInputType
    _max?: AccountMaxAggregateInputType
  }

  export type AccountGroupByOutputType = {
    id: string
    createdAt: Date
    updatedAt: Date
    lastActiveAt: Date
    authUserId: string
    email: string | null
    walletAddress: string | null
    isBanned: boolean
    identityTier: $Enums.IdentityTier
    identityVerifiedAt: Date | null
    _count: AccountCountAggregateOutputType | null
    _min: AccountMinAggregateOutputType | null
    _max: AccountMaxAggregateOutputType | null
  }

  type GetAccountGroupByPayload<T extends AccountGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AccountGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AccountGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AccountGroupByOutputType[P]>
            : GetScalarType<T[P], AccountGroupByOutputType[P]>
        }
      >
    >


  export type AccountSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lastActiveAt?: boolean
    authUserId?: boolean
    email?: boolean
    walletAddress?: boolean
    isBanned?: boolean
    identityTier?: boolean
    identityVerifiedAt?: boolean
    authUser?: boolean | AuthUserDefaultArgs<ExtArgs>
    profiles?: boolean | Account$profilesArgs<ExtArgs>
    identityChecks?: boolean | Account$identityChecksArgs<ExtArgs>
    _count?: boolean | AccountCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["account"]>

  export type AccountSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lastActiveAt?: boolean
    authUserId?: boolean
    email?: boolean
    walletAddress?: boolean
    isBanned?: boolean
    identityTier?: boolean
    identityVerifiedAt?: boolean
    authUser?: boolean | AuthUserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["account"]>

  export type AccountSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lastActiveAt?: boolean
    authUserId?: boolean
    email?: boolean
    walletAddress?: boolean
    isBanned?: boolean
    identityTier?: boolean
    identityVerifiedAt?: boolean
    authUser?: boolean | AuthUserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["account"]>

  export type AccountSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lastActiveAt?: boolean
    authUserId?: boolean
    email?: boolean
    walletAddress?: boolean
    isBanned?: boolean
    identityTier?: boolean
    identityVerifiedAt?: boolean
  }

  export type AccountOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "updatedAt" | "lastActiveAt" | "authUserId" | "email" | "walletAddress" | "isBanned" | "identityTier" | "identityVerifiedAt", ExtArgs["result"]["account"]>
  export type AccountInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    authUser?: boolean | AuthUserDefaultArgs<ExtArgs>
    profiles?: boolean | Account$profilesArgs<ExtArgs>
    identityChecks?: boolean | Account$identityChecksArgs<ExtArgs>
    _count?: boolean | AccountCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type AccountIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    authUser?: boolean | AuthUserDefaultArgs<ExtArgs>
  }
  export type AccountIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    authUser?: boolean | AuthUserDefaultArgs<ExtArgs>
  }

  export type $AccountPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Account"
    objects: {
      authUser: Prisma.$AuthUserPayload<ExtArgs>
      profiles: Prisma.$ProfileMemberPayload<ExtArgs>[]
      identityChecks: Prisma.$IdentityCheckPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      updatedAt: Date
      lastActiveAt: Date
      authUserId: string
      email: string | null
      walletAddress: string | null
      isBanned: boolean
      identityTier: $Enums.IdentityTier
      identityVerifiedAt: Date | null
    }, ExtArgs["result"]["account"]>
    composites: {}
  }

  type AccountGetPayload<S extends boolean | null | undefined | AccountDefaultArgs> = $Result.GetResult<Prisma.$AccountPayload, S>

  type AccountCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AccountFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AccountCountAggregateInputType | true
    }

  export interface AccountDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Account'], meta: { name: 'Account' } }
    /**
     * Find zero or one Account that matches the filter.
     * @param {AccountFindUniqueArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AccountFindUniqueArgs>(args: SelectSubset<T, AccountFindUniqueArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Account that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AccountFindUniqueOrThrowArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AccountFindUniqueOrThrowArgs>(args: SelectSubset<T, AccountFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Account that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindFirstArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AccountFindFirstArgs>(args?: SelectSubset<T, AccountFindFirstArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Account that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindFirstOrThrowArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AccountFindFirstOrThrowArgs>(args?: SelectSubset<T, AccountFindFirstOrThrowArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Accounts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Accounts
     * const accounts = await prisma.account.findMany()
     * 
     * // Get first 10 Accounts
     * const accounts = await prisma.account.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const accountWithIdOnly = await prisma.account.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AccountFindManyArgs>(args?: SelectSubset<T, AccountFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Account.
     * @param {AccountCreateArgs} args - Arguments to create a Account.
     * @example
     * // Create one Account
     * const Account = await prisma.account.create({
     *   data: {
     *     // ... data to create a Account
     *   }
     * })
     * 
     */
    create<T extends AccountCreateArgs>(args: SelectSubset<T, AccountCreateArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Accounts.
     * @param {AccountCreateManyArgs} args - Arguments to create many Accounts.
     * @example
     * // Create many Accounts
     * const account = await prisma.account.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AccountCreateManyArgs>(args?: SelectSubset<T, AccountCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Accounts and returns the data saved in the database.
     * @param {AccountCreateManyAndReturnArgs} args - Arguments to create many Accounts.
     * @example
     * // Create many Accounts
     * const account = await prisma.account.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Accounts and only return the `id`
     * const accountWithIdOnly = await prisma.account.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AccountCreateManyAndReturnArgs>(args?: SelectSubset<T, AccountCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Account.
     * @param {AccountDeleteArgs} args - Arguments to delete one Account.
     * @example
     * // Delete one Account
     * const Account = await prisma.account.delete({
     *   where: {
     *     // ... filter to delete one Account
     *   }
     * })
     * 
     */
    delete<T extends AccountDeleteArgs>(args: SelectSubset<T, AccountDeleteArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Account.
     * @param {AccountUpdateArgs} args - Arguments to update one Account.
     * @example
     * // Update one Account
     * const account = await prisma.account.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AccountUpdateArgs>(args: SelectSubset<T, AccountUpdateArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Accounts.
     * @param {AccountDeleteManyArgs} args - Arguments to filter Accounts to delete.
     * @example
     * // Delete a few Accounts
     * const { count } = await prisma.account.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AccountDeleteManyArgs>(args?: SelectSubset<T, AccountDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Accounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Accounts
     * const account = await prisma.account.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AccountUpdateManyArgs>(args: SelectSubset<T, AccountUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Accounts and returns the data updated in the database.
     * @param {AccountUpdateManyAndReturnArgs} args - Arguments to update many Accounts.
     * @example
     * // Update many Accounts
     * const account = await prisma.account.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Accounts and only return the `id`
     * const accountWithIdOnly = await prisma.account.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AccountUpdateManyAndReturnArgs>(args: SelectSubset<T, AccountUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Account.
     * @param {AccountUpsertArgs} args - Arguments to update or create a Account.
     * @example
     * // Update or create a Account
     * const account = await prisma.account.upsert({
     *   create: {
     *     // ... data to create a Account
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Account we want to update
     *   }
     * })
     */
    upsert<T extends AccountUpsertArgs>(args: SelectSubset<T, AccountUpsertArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Accounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountCountArgs} args - Arguments to filter Accounts to count.
     * @example
     * // Count the number of Accounts
     * const count = await prisma.account.count({
     *   where: {
     *     // ... the filter for the Accounts we want to count
     *   }
     * })
    **/
    count<T extends AccountCountArgs>(
      args?: Subset<T, AccountCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AccountCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Account.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AccountAggregateArgs>(args: Subset<T, AccountAggregateArgs>): Prisma.PrismaPromise<GetAccountAggregateType<T>>

    /**
     * Group by Account.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AccountGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AccountGroupByArgs['orderBy'] }
        : { orderBy?: AccountGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AccountGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAccountGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Account model
   */
  readonly fields: AccountFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Account.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AccountClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    authUser<T extends AuthUserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AuthUserDefaultArgs<ExtArgs>>): Prisma__AuthUserClient<$Result.GetResult<Prisma.$AuthUserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    profiles<T extends Account$profilesArgs<ExtArgs> = {}>(args?: Subset<T, Account$profilesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProfileMemberPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    identityChecks<T extends Account$identityChecksArgs<ExtArgs> = {}>(args?: Subset<T, Account$identityChecksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IdentityCheckPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Account model
   */
  interface AccountFieldRefs {
    readonly id: FieldRef<"Account", 'String'>
    readonly createdAt: FieldRef<"Account", 'DateTime'>
    readonly updatedAt: FieldRef<"Account", 'DateTime'>
    readonly lastActiveAt: FieldRef<"Account", 'DateTime'>
    readonly authUserId: FieldRef<"Account", 'String'>
    readonly email: FieldRef<"Account", 'String'>
    readonly walletAddress: FieldRef<"Account", 'String'>
    readonly isBanned: FieldRef<"Account", 'Boolean'>
    readonly identityTier: FieldRef<"Account", 'IdentityTier'>
    readonly identityVerifiedAt: FieldRef<"Account", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Account findUnique
   */
  export type AccountFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account findUniqueOrThrow
   */
  export type AccountFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account findFirst
   */
  export type AccountFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Accounts.
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Accounts.
     */
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * Account findFirstOrThrow
   */
  export type AccountFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Accounts.
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Accounts.
     */
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * Account findMany
   */
  export type AccountFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Accounts to fetch.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Accounts.
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * Account create
   */
  export type AccountCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * The data needed to create a Account.
     */
    data: XOR<AccountCreateInput, AccountUncheckedCreateInput>
  }

  /**
   * Account createMany
   */
  export type AccountCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Accounts.
     */
    data: AccountCreateManyInput | AccountCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Account createManyAndReturn
   */
  export type AccountCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * The data used to create many Accounts.
     */
    data: AccountCreateManyInput | AccountCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Account update
   */
  export type AccountUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * The data needed to update a Account.
     */
    data: XOR<AccountUpdateInput, AccountUncheckedUpdateInput>
    /**
     * Choose, which Account to update.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account updateMany
   */
  export type AccountUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Accounts.
     */
    data: XOR<AccountUpdateManyMutationInput, AccountUncheckedUpdateManyInput>
    /**
     * Filter which Accounts to update
     */
    where?: AccountWhereInput
    /**
     * Limit how many Accounts to update.
     */
    limit?: number
  }

  /**
   * Account updateManyAndReturn
   */
  export type AccountUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * The data used to update Accounts.
     */
    data: XOR<AccountUpdateManyMutationInput, AccountUncheckedUpdateManyInput>
    /**
     * Filter which Accounts to update
     */
    where?: AccountWhereInput
    /**
     * Limit how many Accounts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Account upsert
   */
  export type AccountUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * The filter to search for the Account to update in case it exists.
     */
    where: AccountWhereUniqueInput
    /**
     * In case the Account found by the `where` argument doesn't exist, create a new Account with this data.
     */
    create: XOR<AccountCreateInput, AccountUncheckedCreateInput>
    /**
     * In case the Account was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AccountUpdateInput, AccountUncheckedUpdateInput>
  }

  /**
   * Account delete
   */
  export type AccountDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter which Account to delete.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account deleteMany
   */
  export type AccountDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Accounts to delete
     */
    where?: AccountWhereInput
    /**
     * Limit how many Accounts to delete.
     */
    limit?: number
  }

  /**
   * Account.profiles
   */
  export type Account$profilesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileMember
     */
    select?: ProfileMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileMember
     */
    omit?: ProfileMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileMemberInclude<ExtArgs> | null
    where?: ProfileMemberWhereInput
    orderBy?: ProfileMemberOrderByWithRelationInput | ProfileMemberOrderByWithRelationInput[]
    cursor?: ProfileMemberWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProfileMemberScalarFieldEnum | ProfileMemberScalarFieldEnum[]
  }

  /**
   * Account.identityChecks
   */
  export type Account$identityChecksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IdentityCheck
     */
    select?: IdentityCheckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IdentityCheck
     */
    omit?: IdentityCheckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IdentityCheckInclude<ExtArgs> | null
    where?: IdentityCheckWhereInput
    orderBy?: IdentityCheckOrderByWithRelationInput | IdentityCheckOrderByWithRelationInput[]
    cursor?: IdentityCheckWhereUniqueInput
    take?: number
    skip?: number
    distinct?: IdentityCheckScalarFieldEnum | IdentityCheckScalarFieldEnum[]
  }

  /**
   * Account without action
   */
  export type AccountDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
  }


  /**
   * Model Profile
   */

  export type AggregateProfile = {
    _count: ProfileCountAggregateOutputType | null
    _avg: ProfileAvgAggregateOutputType | null
    _sum: ProfileSumAggregateOutputType | null
    _min: ProfileMinAggregateOutputType | null
    _max: ProfileMaxAggregateOutputType | null
  }

  export type ProfileAvgAggregateOutputType = {
    reportCount: number | null
    reputation: number | null
  }

  export type ProfileSumAggregateOutputType = {
    reportCount: number | null
    reputation: number | null
  }

  export type ProfileMinAggregateOutputType = {
    id: string | null
    handle: string | null
    displayName: string | null
    bio: string | null
    avatar: string | null
    type: $Enums.ProfileType | null
    createdAt: Date | null
    updatedAt: Date | null
    isBanned: boolean | null
    reportCount: number | null
    isVerified: boolean | null
    reputation: number | null
  }

  export type ProfileMaxAggregateOutputType = {
    id: string | null
    handle: string | null
    displayName: string | null
    bio: string | null
    avatar: string | null
    type: $Enums.ProfileType | null
    createdAt: Date | null
    updatedAt: Date | null
    isBanned: boolean | null
    reportCount: number | null
    isVerified: boolean | null
    reputation: number | null
  }

  export type ProfileCountAggregateOutputType = {
    id: number
    handle: number
    displayName: number
    bio: number
    avatar: number
    type: number
    createdAt: number
    updatedAt: number
    isBanned: number
    reportCount: number
    isVerified: number
    reputation: number
    _all: number
  }


  export type ProfileAvgAggregateInputType = {
    reportCount?: true
    reputation?: true
  }

  export type ProfileSumAggregateInputType = {
    reportCount?: true
    reputation?: true
  }

  export type ProfileMinAggregateInputType = {
    id?: true
    handle?: true
    displayName?: true
    bio?: true
    avatar?: true
    type?: true
    createdAt?: true
    updatedAt?: true
    isBanned?: true
    reportCount?: true
    isVerified?: true
    reputation?: true
  }

  export type ProfileMaxAggregateInputType = {
    id?: true
    handle?: true
    displayName?: true
    bio?: true
    avatar?: true
    type?: true
    createdAt?: true
    updatedAt?: true
    isBanned?: true
    reportCount?: true
    isVerified?: true
    reputation?: true
  }

  export type ProfileCountAggregateInputType = {
    id?: true
    handle?: true
    displayName?: true
    bio?: true
    avatar?: true
    type?: true
    createdAt?: true
    updatedAt?: true
    isBanned?: true
    reportCount?: true
    isVerified?: true
    reputation?: true
    _all?: true
  }

  export type ProfileAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Profile to aggregate.
     */
    where?: ProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Profiles to fetch.
     */
    orderBy?: ProfileOrderByWithRelationInput | ProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Profiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Profiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Profiles
    **/
    _count?: true | ProfileCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProfileAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProfileSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProfileMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProfileMaxAggregateInputType
  }

  export type GetProfileAggregateType<T extends ProfileAggregateArgs> = {
        [P in keyof T & keyof AggregateProfile]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProfile[P]>
      : GetScalarType<T[P], AggregateProfile[P]>
  }




  export type ProfileGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProfileWhereInput
    orderBy?: ProfileOrderByWithAggregationInput | ProfileOrderByWithAggregationInput[]
    by: ProfileScalarFieldEnum[] | ProfileScalarFieldEnum
    having?: ProfileScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProfileCountAggregateInputType | true
    _avg?: ProfileAvgAggregateInputType
    _sum?: ProfileSumAggregateInputType
    _min?: ProfileMinAggregateInputType
    _max?: ProfileMaxAggregateInputType
  }

  export type ProfileGroupByOutputType = {
    id: string
    handle: string
    displayName: string
    bio: string | null
    avatar: string | null
    type: $Enums.ProfileType
    createdAt: Date
    updatedAt: Date
    isBanned: boolean
    reportCount: number
    isVerified: boolean
    reputation: number
    _count: ProfileCountAggregateOutputType | null
    _avg: ProfileAvgAggregateOutputType | null
    _sum: ProfileSumAggregateOutputType | null
    _min: ProfileMinAggregateOutputType | null
    _max: ProfileMaxAggregateOutputType | null
  }

  type GetProfileGroupByPayload<T extends ProfileGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProfileGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProfileGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProfileGroupByOutputType[P]>
            : GetScalarType<T[P], ProfileGroupByOutputType[P]>
        }
      >
    >


  export type ProfileSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    handle?: boolean
    displayName?: boolean
    bio?: boolean
    avatar?: boolean
    type?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    isBanned?: boolean
    reportCount?: boolean
    isVerified?: boolean
    reputation?: boolean
    members?: boolean | Profile$membersArgs<ExtArgs>
    posts?: boolean | Profile$postsArgs<ExtArgs>
    comments?: boolean | Profile$commentsArgs<ExtArgs>
    likes?: boolean | Profile$likesArgs<ExtArgs>
    nfts?: boolean | Profile$nftsArgs<ExtArgs>
    follows?: boolean | Profile$followsArgs<ExtArgs>
    followers?: boolean | Profile$followersArgs<ExtArgs>
    _count?: boolean | ProfileCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["profile"]>

  export type ProfileSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    handle?: boolean
    displayName?: boolean
    bio?: boolean
    avatar?: boolean
    type?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    isBanned?: boolean
    reportCount?: boolean
    isVerified?: boolean
    reputation?: boolean
  }, ExtArgs["result"]["profile"]>

  export type ProfileSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    handle?: boolean
    displayName?: boolean
    bio?: boolean
    avatar?: boolean
    type?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    isBanned?: boolean
    reportCount?: boolean
    isVerified?: boolean
    reputation?: boolean
  }, ExtArgs["result"]["profile"]>

  export type ProfileSelectScalar = {
    id?: boolean
    handle?: boolean
    displayName?: boolean
    bio?: boolean
    avatar?: boolean
    type?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    isBanned?: boolean
    reportCount?: boolean
    isVerified?: boolean
    reputation?: boolean
  }

  export type ProfileOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "handle" | "displayName" | "bio" | "avatar" | "type" | "createdAt" | "updatedAt" | "isBanned" | "reportCount" | "isVerified" | "reputation", ExtArgs["result"]["profile"]>
  export type ProfileInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    members?: boolean | Profile$membersArgs<ExtArgs>
    posts?: boolean | Profile$postsArgs<ExtArgs>
    comments?: boolean | Profile$commentsArgs<ExtArgs>
    likes?: boolean | Profile$likesArgs<ExtArgs>
    nfts?: boolean | Profile$nftsArgs<ExtArgs>
    follows?: boolean | Profile$followsArgs<ExtArgs>
    followers?: boolean | Profile$followersArgs<ExtArgs>
    _count?: boolean | ProfileCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ProfileIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type ProfileIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ProfilePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Profile"
    objects: {
      members: Prisma.$ProfileMemberPayload<ExtArgs>[]
      posts: Prisma.$PostPayload<ExtArgs>[]
      comments: Prisma.$CommentPayload<ExtArgs>[]
      likes: Prisma.$LikePayload<ExtArgs>[]
      nfts: Prisma.$NFTPayload<ExtArgs>[]
      follows: Prisma.$FollowPayload<ExtArgs>[]
      followers: Prisma.$FollowPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      handle: string
      displayName: string
      bio: string | null
      avatar: string | null
      type: $Enums.ProfileType
      createdAt: Date
      updatedAt: Date
      isBanned: boolean
      reportCount: number
      isVerified: boolean
      reputation: number
    }, ExtArgs["result"]["profile"]>
    composites: {}
  }

  type ProfileGetPayload<S extends boolean | null | undefined | ProfileDefaultArgs> = $Result.GetResult<Prisma.$ProfilePayload, S>

  type ProfileCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ProfileFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProfileCountAggregateInputType | true
    }

  export interface ProfileDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Profile'], meta: { name: 'Profile' } }
    /**
     * Find zero or one Profile that matches the filter.
     * @param {ProfileFindUniqueArgs} args - Arguments to find a Profile
     * @example
     * // Get one Profile
     * const profile = await prisma.profile.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProfileFindUniqueArgs>(args: SelectSubset<T, ProfileFindUniqueArgs<ExtArgs>>): Prisma__ProfileClient<$Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Profile that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProfileFindUniqueOrThrowArgs} args - Arguments to find a Profile
     * @example
     * // Get one Profile
     * const profile = await prisma.profile.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProfileFindUniqueOrThrowArgs>(args: SelectSubset<T, ProfileFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProfileClient<$Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Profile that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileFindFirstArgs} args - Arguments to find a Profile
     * @example
     * // Get one Profile
     * const profile = await prisma.profile.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProfileFindFirstArgs>(args?: SelectSubset<T, ProfileFindFirstArgs<ExtArgs>>): Prisma__ProfileClient<$Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Profile that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileFindFirstOrThrowArgs} args - Arguments to find a Profile
     * @example
     * // Get one Profile
     * const profile = await prisma.profile.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProfileFindFirstOrThrowArgs>(args?: SelectSubset<T, ProfileFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProfileClient<$Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Profiles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Profiles
     * const profiles = await prisma.profile.findMany()
     * 
     * // Get first 10 Profiles
     * const profiles = await prisma.profile.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const profileWithIdOnly = await prisma.profile.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProfileFindManyArgs>(args?: SelectSubset<T, ProfileFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Profile.
     * @param {ProfileCreateArgs} args - Arguments to create a Profile.
     * @example
     * // Create one Profile
     * const Profile = await prisma.profile.create({
     *   data: {
     *     // ... data to create a Profile
     *   }
     * })
     * 
     */
    create<T extends ProfileCreateArgs>(args: SelectSubset<T, ProfileCreateArgs<ExtArgs>>): Prisma__ProfileClient<$Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Profiles.
     * @param {ProfileCreateManyArgs} args - Arguments to create many Profiles.
     * @example
     * // Create many Profiles
     * const profile = await prisma.profile.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProfileCreateManyArgs>(args?: SelectSubset<T, ProfileCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Profiles and returns the data saved in the database.
     * @param {ProfileCreateManyAndReturnArgs} args - Arguments to create many Profiles.
     * @example
     * // Create many Profiles
     * const profile = await prisma.profile.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Profiles and only return the `id`
     * const profileWithIdOnly = await prisma.profile.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProfileCreateManyAndReturnArgs>(args?: SelectSubset<T, ProfileCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Profile.
     * @param {ProfileDeleteArgs} args - Arguments to delete one Profile.
     * @example
     * // Delete one Profile
     * const Profile = await prisma.profile.delete({
     *   where: {
     *     // ... filter to delete one Profile
     *   }
     * })
     * 
     */
    delete<T extends ProfileDeleteArgs>(args: SelectSubset<T, ProfileDeleteArgs<ExtArgs>>): Prisma__ProfileClient<$Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Profile.
     * @param {ProfileUpdateArgs} args - Arguments to update one Profile.
     * @example
     * // Update one Profile
     * const profile = await prisma.profile.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProfileUpdateArgs>(args: SelectSubset<T, ProfileUpdateArgs<ExtArgs>>): Prisma__ProfileClient<$Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Profiles.
     * @param {ProfileDeleteManyArgs} args - Arguments to filter Profiles to delete.
     * @example
     * // Delete a few Profiles
     * const { count } = await prisma.profile.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProfileDeleteManyArgs>(args?: SelectSubset<T, ProfileDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Profiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Profiles
     * const profile = await prisma.profile.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProfileUpdateManyArgs>(args: SelectSubset<T, ProfileUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Profiles and returns the data updated in the database.
     * @param {ProfileUpdateManyAndReturnArgs} args - Arguments to update many Profiles.
     * @example
     * // Update many Profiles
     * const profile = await prisma.profile.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Profiles and only return the `id`
     * const profileWithIdOnly = await prisma.profile.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ProfileUpdateManyAndReturnArgs>(args: SelectSubset<T, ProfileUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Profile.
     * @param {ProfileUpsertArgs} args - Arguments to update or create a Profile.
     * @example
     * // Update or create a Profile
     * const profile = await prisma.profile.upsert({
     *   create: {
     *     // ... data to create a Profile
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Profile we want to update
     *   }
     * })
     */
    upsert<T extends ProfileUpsertArgs>(args: SelectSubset<T, ProfileUpsertArgs<ExtArgs>>): Prisma__ProfileClient<$Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Profiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileCountArgs} args - Arguments to filter Profiles to count.
     * @example
     * // Count the number of Profiles
     * const count = await prisma.profile.count({
     *   where: {
     *     // ... the filter for the Profiles we want to count
     *   }
     * })
    **/
    count<T extends ProfileCountArgs>(
      args?: Subset<T, ProfileCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProfileCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Profile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProfileAggregateArgs>(args: Subset<T, ProfileAggregateArgs>): Prisma.PrismaPromise<GetProfileAggregateType<T>>

    /**
     * Group by Profile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProfileGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProfileGroupByArgs['orderBy'] }
        : { orderBy?: ProfileGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProfileGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProfileGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Profile model
   */
  readonly fields: ProfileFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Profile.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProfileClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    members<T extends Profile$membersArgs<ExtArgs> = {}>(args?: Subset<T, Profile$membersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProfileMemberPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    posts<T extends Profile$postsArgs<ExtArgs> = {}>(args?: Subset<T, Profile$postsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    comments<T extends Profile$commentsArgs<ExtArgs> = {}>(args?: Subset<T, Profile$commentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    likes<T extends Profile$likesArgs<ExtArgs> = {}>(args?: Subset<T, Profile$likesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LikePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    nfts<T extends Profile$nftsArgs<ExtArgs> = {}>(args?: Subset<T, Profile$nftsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NFTPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    follows<T extends Profile$followsArgs<ExtArgs> = {}>(args?: Subset<T, Profile$followsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FollowPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    followers<T extends Profile$followersArgs<ExtArgs> = {}>(args?: Subset<T, Profile$followersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FollowPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Profile model
   */
  interface ProfileFieldRefs {
    readonly id: FieldRef<"Profile", 'String'>
    readonly handle: FieldRef<"Profile", 'String'>
    readonly displayName: FieldRef<"Profile", 'String'>
    readonly bio: FieldRef<"Profile", 'String'>
    readonly avatar: FieldRef<"Profile", 'String'>
    readonly type: FieldRef<"Profile", 'ProfileType'>
    readonly createdAt: FieldRef<"Profile", 'DateTime'>
    readonly updatedAt: FieldRef<"Profile", 'DateTime'>
    readonly isBanned: FieldRef<"Profile", 'Boolean'>
    readonly reportCount: FieldRef<"Profile", 'Int'>
    readonly isVerified: FieldRef<"Profile", 'Boolean'>
    readonly reputation: FieldRef<"Profile", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Profile findUnique
   */
  export type ProfileFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Profile
     */
    select?: ProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Profile
     */
    omit?: ProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileInclude<ExtArgs> | null
    /**
     * Filter, which Profile to fetch.
     */
    where: ProfileWhereUniqueInput
  }

  /**
   * Profile findUniqueOrThrow
   */
  export type ProfileFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Profile
     */
    select?: ProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Profile
     */
    omit?: ProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileInclude<ExtArgs> | null
    /**
     * Filter, which Profile to fetch.
     */
    where: ProfileWhereUniqueInput
  }

  /**
   * Profile findFirst
   */
  export type ProfileFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Profile
     */
    select?: ProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Profile
     */
    omit?: ProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileInclude<ExtArgs> | null
    /**
     * Filter, which Profile to fetch.
     */
    where?: ProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Profiles to fetch.
     */
    orderBy?: ProfileOrderByWithRelationInput | ProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Profiles.
     */
    cursor?: ProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Profiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Profiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Profiles.
     */
    distinct?: ProfileScalarFieldEnum | ProfileScalarFieldEnum[]
  }

  /**
   * Profile findFirstOrThrow
   */
  export type ProfileFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Profile
     */
    select?: ProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Profile
     */
    omit?: ProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileInclude<ExtArgs> | null
    /**
     * Filter, which Profile to fetch.
     */
    where?: ProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Profiles to fetch.
     */
    orderBy?: ProfileOrderByWithRelationInput | ProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Profiles.
     */
    cursor?: ProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Profiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Profiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Profiles.
     */
    distinct?: ProfileScalarFieldEnum | ProfileScalarFieldEnum[]
  }

  /**
   * Profile findMany
   */
  export type ProfileFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Profile
     */
    select?: ProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Profile
     */
    omit?: ProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileInclude<ExtArgs> | null
    /**
     * Filter, which Profiles to fetch.
     */
    where?: ProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Profiles to fetch.
     */
    orderBy?: ProfileOrderByWithRelationInput | ProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Profiles.
     */
    cursor?: ProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Profiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Profiles.
     */
    skip?: number
    distinct?: ProfileScalarFieldEnum | ProfileScalarFieldEnum[]
  }

  /**
   * Profile create
   */
  export type ProfileCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Profile
     */
    select?: ProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Profile
     */
    omit?: ProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileInclude<ExtArgs> | null
    /**
     * The data needed to create a Profile.
     */
    data: XOR<ProfileCreateInput, ProfileUncheckedCreateInput>
  }

  /**
   * Profile createMany
   */
  export type ProfileCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Profiles.
     */
    data: ProfileCreateManyInput | ProfileCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Profile createManyAndReturn
   */
  export type ProfileCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Profile
     */
    select?: ProfileSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Profile
     */
    omit?: ProfileOmit<ExtArgs> | null
    /**
     * The data used to create many Profiles.
     */
    data: ProfileCreateManyInput | ProfileCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Profile update
   */
  export type ProfileUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Profile
     */
    select?: ProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Profile
     */
    omit?: ProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileInclude<ExtArgs> | null
    /**
     * The data needed to update a Profile.
     */
    data: XOR<ProfileUpdateInput, ProfileUncheckedUpdateInput>
    /**
     * Choose, which Profile to update.
     */
    where: ProfileWhereUniqueInput
  }

  /**
   * Profile updateMany
   */
  export type ProfileUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Profiles.
     */
    data: XOR<ProfileUpdateManyMutationInput, ProfileUncheckedUpdateManyInput>
    /**
     * Filter which Profiles to update
     */
    where?: ProfileWhereInput
    /**
     * Limit how many Profiles to update.
     */
    limit?: number
  }

  /**
   * Profile updateManyAndReturn
   */
  export type ProfileUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Profile
     */
    select?: ProfileSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Profile
     */
    omit?: ProfileOmit<ExtArgs> | null
    /**
     * The data used to update Profiles.
     */
    data: XOR<ProfileUpdateManyMutationInput, ProfileUncheckedUpdateManyInput>
    /**
     * Filter which Profiles to update
     */
    where?: ProfileWhereInput
    /**
     * Limit how many Profiles to update.
     */
    limit?: number
  }

  /**
   * Profile upsert
   */
  export type ProfileUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Profile
     */
    select?: ProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Profile
     */
    omit?: ProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileInclude<ExtArgs> | null
    /**
     * The filter to search for the Profile to update in case it exists.
     */
    where: ProfileWhereUniqueInput
    /**
     * In case the Profile found by the `where` argument doesn't exist, create a new Profile with this data.
     */
    create: XOR<ProfileCreateInput, ProfileUncheckedCreateInput>
    /**
     * In case the Profile was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProfileUpdateInput, ProfileUncheckedUpdateInput>
  }

  /**
   * Profile delete
   */
  export type ProfileDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Profile
     */
    select?: ProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Profile
     */
    omit?: ProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileInclude<ExtArgs> | null
    /**
     * Filter which Profile to delete.
     */
    where: ProfileWhereUniqueInput
  }

  /**
   * Profile deleteMany
   */
  export type ProfileDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Profiles to delete
     */
    where?: ProfileWhereInput
    /**
     * Limit how many Profiles to delete.
     */
    limit?: number
  }

  /**
   * Profile.members
   */
  export type Profile$membersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileMember
     */
    select?: ProfileMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileMember
     */
    omit?: ProfileMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileMemberInclude<ExtArgs> | null
    where?: ProfileMemberWhereInput
    orderBy?: ProfileMemberOrderByWithRelationInput | ProfileMemberOrderByWithRelationInput[]
    cursor?: ProfileMemberWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProfileMemberScalarFieldEnum | ProfileMemberScalarFieldEnum[]
  }

  /**
   * Profile.posts
   */
  export type Profile$postsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    where?: PostWhereInput
    orderBy?: PostOrderByWithRelationInput | PostOrderByWithRelationInput[]
    cursor?: PostWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PostScalarFieldEnum | PostScalarFieldEnum[]
  }

  /**
   * Profile.comments
   */
  export type Profile$commentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    where?: CommentWhereInput
    orderBy?: CommentOrderByWithRelationInput | CommentOrderByWithRelationInput[]
    cursor?: CommentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CommentScalarFieldEnum | CommentScalarFieldEnum[]
  }

  /**
   * Profile.likes
   */
  export type Profile$likesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Like
     */
    select?: LikeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Like
     */
    omit?: LikeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LikeInclude<ExtArgs> | null
    where?: LikeWhereInput
    orderBy?: LikeOrderByWithRelationInput | LikeOrderByWithRelationInput[]
    cursor?: LikeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LikeScalarFieldEnum | LikeScalarFieldEnum[]
  }

  /**
   * Profile.nfts
   */
  export type Profile$nftsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NFT
     */
    select?: NFTSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NFT
     */
    omit?: NFTOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NFTInclude<ExtArgs> | null
    where?: NFTWhereInput
    orderBy?: NFTOrderByWithRelationInput | NFTOrderByWithRelationInput[]
    cursor?: NFTWhereUniqueInput
    take?: number
    skip?: number
    distinct?: NFTScalarFieldEnum | NFTScalarFieldEnum[]
  }

  /**
   * Profile.follows
   */
  export type Profile$followsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Follow
     */
    select?: FollowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Follow
     */
    omit?: FollowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowInclude<ExtArgs> | null
    where?: FollowWhereInput
    orderBy?: FollowOrderByWithRelationInput | FollowOrderByWithRelationInput[]
    cursor?: FollowWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FollowScalarFieldEnum | FollowScalarFieldEnum[]
  }

  /**
   * Profile.followers
   */
  export type Profile$followersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Follow
     */
    select?: FollowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Follow
     */
    omit?: FollowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowInclude<ExtArgs> | null
    where?: FollowWhereInput
    orderBy?: FollowOrderByWithRelationInput | FollowOrderByWithRelationInput[]
    cursor?: FollowWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FollowScalarFieldEnum | FollowScalarFieldEnum[]
  }

  /**
   * Profile without action
   */
  export type ProfileDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Profile
     */
    select?: ProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Profile
     */
    omit?: ProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileInclude<ExtArgs> | null
  }


  /**
   * Model ProfileMember
   */

  export type AggregateProfileMember = {
    _count: ProfileMemberCountAggregateOutputType | null
    _min: ProfileMemberMinAggregateOutputType | null
    _max: ProfileMemberMaxAggregateOutputType | null
  }

  export type ProfileMemberMinAggregateOutputType = {
    id: string | null
    accountId: string | null
    profileId: string | null
    role: $Enums.ProfileRole | null
    createdAt: Date | null
  }

  export type ProfileMemberMaxAggregateOutputType = {
    id: string | null
    accountId: string | null
    profileId: string | null
    role: $Enums.ProfileRole | null
    createdAt: Date | null
  }

  export type ProfileMemberCountAggregateOutputType = {
    id: number
    accountId: number
    profileId: number
    role: number
    createdAt: number
    _all: number
  }


  export type ProfileMemberMinAggregateInputType = {
    id?: true
    accountId?: true
    profileId?: true
    role?: true
    createdAt?: true
  }

  export type ProfileMemberMaxAggregateInputType = {
    id?: true
    accountId?: true
    profileId?: true
    role?: true
    createdAt?: true
  }

  export type ProfileMemberCountAggregateInputType = {
    id?: true
    accountId?: true
    profileId?: true
    role?: true
    createdAt?: true
    _all?: true
  }

  export type ProfileMemberAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProfileMember to aggregate.
     */
    where?: ProfileMemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProfileMembers to fetch.
     */
    orderBy?: ProfileMemberOrderByWithRelationInput | ProfileMemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProfileMemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProfileMembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProfileMembers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProfileMembers
    **/
    _count?: true | ProfileMemberCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProfileMemberMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProfileMemberMaxAggregateInputType
  }

  export type GetProfileMemberAggregateType<T extends ProfileMemberAggregateArgs> = {
        [P in keyof T & keyof AggregateProfileMember]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProfileMember[P]>
      : GetScalarType<T[P], AggregateProfileMember[P]>
  }




  export type ProfileMemberGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProfileMemberWhereInput
    orderBy?: ProfileMemberOrderByWithAggregationInput | ProfileMemberOrderByWithAggregationInput[]
    by: ProfileMemberScalarFieldEnum[] | ProfileMemberScalarFieldEnum
    having?: ProfileMemberScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProfileMemberCountAggregateInputType | true
    _min?: ProfileMemberMinAggregateInputType
    _max?: ProfileMemberMaxAggregateInputType
  }

  export type ProfileMemberGroupByOutputType = {
    id: string
    accountId: string
    profileId: string
    role: $Enums.ProfileRole
    createdAt: Date
    _count: ProfileMemberCountAggregateOutputType | null
    _min: ProfileMemberMinAggregateOutputType | null
    _max: ProfileMemberMaxAggregateOutputType | null
  }

  type GetProfileMemberGroupByPayload<T extends ProfileMemberGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProfileMemberGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProfileMemberGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProfileMemberGroupByOutputType[P]>
            : GetScalarType<T[P], ProfileMemberGroupByOutputType[P]>
        }
      >
    >


  export type ProfileMemberSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    accountId?: boolean
    profileId?: boolean
    role?: boolean
    createdAt?: boolean
    account?: boolean | AccountDefaultArgs<ExtArgs>
    profile?: boolean | ProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["profileMember"]>

  export type ProfileMemberSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    accountId?: boolean
    profileId?: boolean
    role?: boolean
    createdAt?: boolean
    account?: boolean | AccountDefaultArgs<ExtArgs>
    profile?: boolean | ProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["profileMember"]>

  export type ProfileMemberSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    accountId?: boolean
    profileId?: boolean
    role?: boolean
    createdAt?: boolean
    account?: boolean | AccountDefaultArgs<ExtArgs>
    profile?: boolean | ProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["profileMember"]>

  export type ProfileMemberSelectScalar = {
    id?: boolean
    accountId?: boolean
    profileId?: boolean
    role?: boolean
    createdAt?: boolean
  }

  export type ProfileMemberOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "accountId" | "profileId" | "role" | "createdAt", ExtArgs["result"]["profileMember"]>
  export type ProfileMemberInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    account?: boolean | AccountDefaultArgs<ExtArgs>
    profile?: boolean | ProfileDefaultArgs<ExtArgs>
  }
  export type ProfileMemberIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    account?: boolean | AccountDefaultArgs<ExtArgs>
    profile?: boolean | ProfileDefaultArgs<ExtArgs>
  }
  export type ProfileMemberIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    account?: boolean | AccountDefaultArgs<ExtArgs>
    profile?: boolean | ProfileDefaultArgs<ExtArgs>
  }

  export type $ProfileMemberPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProfileMember"
    objects: {
      account: Prisma.$AccountPayload<ExtArgs>
      profile: Prisma.$ProfilePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      accountId: string
      profileId: string
      role: $Enums.ProfileRole
      createdAt: Date
    }, ExtArgs["result"]["profileMember"]>
    composites: {}
  }

  type ProfileMemberGetPayload<S extends boolean | null | undefined | ProfileMemberDefaultArgs> = $Result.GetResult<Prisma.$ProfileMemberPayload, S>

  type ProfileMemberCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ProfileMemberFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProfileMemberCountAggregateInputType | true
    }

  export interface ProfileMemberDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProfileMember'], meta: { name: 'ProfileMember' } }
    /**
     * Find zero or one ProfileMember that matches the filter.
     * @param {ProfileMemberFindUniqueArgs} args - Arguments to find a ProfileMember
     * @example
     * // Get one ProfileMember
     * const profileMember = await prisma.profileMember.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProfileMemberFindUniqueArgs>(args: SelectSubset<T, ProfileMemberFindUniqueArgs<ExtArgs>>): Prisma__ProfileMemberClient<$Result.GetResult<Prisma.$ProfileMemberPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ProfileMember that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProfileMemberFindUniqueOrThrowArgs} args - Arguments to find a ProfileMember
     * @example
     * // Get one ProfileMember
     * const profileMember = await prisma.profileMember.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProfileMemberFindUniqueOrThrowArgs>(args: SelectSubset<T, ProfileMemberFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProfileMemberClient<$Result.GetResult<Prisma.$ProfileMemberPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ProfileMember that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileMemberFindFirstArgs} args - Arguments to find a ProfileMember
     * @example
     * // Get one ProfileMember
     * const profileMember = await prisma.profileMember.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProfileMemberFindFirstArgs>(args?: SelectSubset<T, ProfileMemberFindFirstArgs<ExtArgs>>): Prisma__ProfileMemberClient<$Result.GetResult<Prisma.$ProfileMemberPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ProfileMember that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileMemberFindFirstOrThrowArgs} args - Arguments to find a ProfileMember
     * @example
     * // Get one ProfileMember
     * const profileMember = await prisma.profileMember.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProfileMemberFindFirstOrThrowArgs>(args?: SelectSubset<T, ProfileMemberFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProfileMemberClient<$Result.GetResult<Prisma.$ProfileMemberPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ProfileMembers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileMemberFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProfileMembers
     * const profileMembers = await prisma.profileMember.findMany()
     * 
     * // Get first 10 ProfileMembers
     * const profileMembers = await prisma.profileMember.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const profileMemberWithIdOnly = await prisma.profileMember.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProfileMemberFindManyArgs>(args?: SelectSubset<T, ProfileMemberFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProfileMemberPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ProfileMember.
     * @param {ProfileMemberCreateArgs} args - Arguments to create a ProfileMember.
     * @example
     * // Create one ProfileMember
     * const ProfileMember = await prisma.profileMember.create({
     *   data: {
     *     // ... data to create a ProfileMember
     *   }
     * })
     * 
     */
    create<T extends ProfileMemberCreateArgs>(args: SelectSubset<T, ProfileMemberCreateArgs<ExtArgs>>): Prisma__ProfileMemberClient<$Result.GetResult<Prisma.$ProfileMemberPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ProfileMembers.
     * @param {ProfileMemberCreateManyArgs} args - Arguments to create many ProfileMembers.
     * @example
     * // Create many ProfileMembers
     * const profileMember = await prisma.profileMember.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProfileMemberCreateManyArgs>(args?: SelectSubset<T, ProfileMemberCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProfileMembers and returns the data saved in the database.
     * @param {ProfileMemberCreateManyAndReturnArgs} args - Arguments to create many ProfileMembers.
     * @example
     * // Create many ProfileMembers
     * const profileMember = await prisma.profileMember.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProfileMembers and only return the `id`
     * const profileMemberWithIdOnly = await prisma.profileMember.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProfileMemberCreateManyAndReturnArgs>(args?: SelectSubset<T, ProfileMemberCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProfileMemberPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ProfileMember.
     * @param {ProfileMemberDeleteArgs} args - Arguments to delete one ProfileMember.
     * @example
     * // Delete one ProfileMember
     * const ProfileMember = await prisma.profileMember.delete({
     *   where: {
     *     // ... filter to delete one ProfileMember
     *   }
     * })
     * 
     */
    delete<T extends ProfileMemberDeleteArgs>(args: SelectSubset<T, ProfileMemberDeleteArgs<ExtArgs>>): Prisma__ProfileMemberClient<$Result.GetResult<Prisma.$ProfileMemberPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ProfileMember.
     * @param {ProfileMemberUpdateArgs} args - Arguments to update one ProfileMember.
     * @example
     * // Update one ProfileMember
     * const profileMember = await prisma.profileMember.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProfileMemberUpdateArgs>(args: SelectSubset<T, ProfileMemberUpdateArgs<ExtArgs>>): Prisma__ProfileMemberClient<$Result.GetResult<Prisma.$ProfileMemberPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ProfileMembers.
     * @param {ProfileMemberDeleteManyArgs} args - Arguments to filter ProfileMembers to delete.
     * @example
     * // Delete a few ProfileMembers
     * const { count } = await prisma.profileMember.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProfileMemberDeleteManyArgs>(args?: SelectSubset<T, ProfileMemberDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProfileMembers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileMemberUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProfileMembers
     * const profileMember = await prisma.profileMember.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProfileMemberUpdateManyArgs>(args: SelectSubset<T, ProfileMemberUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProfileMembers and returns the data updated in the database.
     * @param {ProfileMemberUpdateManyAndReturnArgs} args - Arguments to update many ProfileMembers.
     * @example
     * // Update many ProfileMembers
     * const profileMember = await prisma.profileMember.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ProfileMembers and only return the `id`
     * const profileMemberWithIdOnly = await prisma.profileMember.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ProfileMemberUpdateManyAndReturnArgs>(args: SelectSubset<T, ProfileMemberUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProfileMemberPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ProfileMember.
     * @param {ProfileMemberUpsertArgs} args - Arguments to update or create a ProfileMember.
     * @example
     * // Update or create a ProfileMember
     * const profileMember = await prisma.profileMember.upsert({
     *   create: {
     *     // ... data to create a ProfileMember
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProfileMember we want to update
     *   }
     * })
     */
    upsert<T extends ProfileMemberUpsertArgs>(args: SelectSubset<T, ProfileMemberUpsertArgs<ExtArgs>>): Prisma__ProfileMemberClient<$Result.GetResult<Prisma.$ProfileMemberPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ProfileMembers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileMemberCountArgs} args - Arguments to filter ProfileMembers to count.
     * @example
     * // Count the number of ProfileMembers
     * const count = await prisma.profileMember.count({
     *   where: {
     *     // ... the filter for the ProfileMembers we want to count
     *   }
     * })
    **/
    count<T extends ProfileMemberCountArgs>(
      args?: Subset<T, ProfileMemberCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProfileMemberCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProfileMember.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileMemberAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProfileMemberAggregateArgs>(args: Subset<T, ProfileMemberAggregateArgs>): Prisma.PrismaPromise<GetProfileMemberAggregateType<T>>

    /**
     * Group by ProfileMember.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileMemberGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProfileMemberGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProfileMemberGroupByArgs['orderBy'] }
        : { orderBy?: ProfileMemberGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProfileMemberGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProfileMemberGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProfileMember model
   */
  readonly fields: ProfileMemberFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProfileMember.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProfileMemberClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    account<T extends AccountDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AccountDefaultArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    profile<T extends ProfileDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProfileDefaultArgs<ExtArgs>>): Prisma__ProfileClient<$Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ProfileMember model
   */
  interface ProfileMemberFieldRefs {
    readonly id: FieldRef<"ProfileMember", 'String'>
    readonly accountId: FieldRef<"ProfileMember", 'String'>
    readonly profileId: FieldRef<"ProfileMember", 'String'>
    readonly role: FieldRef<"ProfileMember", 'ProfileRole'>
    readonly createdAt: FieldRef<"ProfileMember", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ProfileMember findUnique
   */
  export type ProfileMemberFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileMember
     */
    select?: ProfileMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileMember
     */
    omit?: ProfileMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileMemberInclude<ExtArgs> | null
    /**
     * Filter, which ProfileMember to fetch.
     */
    where: ProfileMemberWhereUniqueInput
  }

  /**
   * ProfileMember findUniqueOrThrow
   */
  export type ProfileMemberFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileMember
     */
    select?: ProfileMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileMember
     */
    omit?: ProfileMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileMemberInclude<ExtArgs> | null
    /**
     * Filter, which ProfileMember to fetch.
     */
    where: ProfileMemberWhereUniqueInput
  }

  /**
   * ProfileMember findFirst
   */
  export type ProfileMemberFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileMember
     */
    select?: ProfileMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileMember
     */
    omit?: ProfileMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileMemberInclude<ExtArgs> | null
    /**
     * Filter, which ProfileMember to fetch.
     */
    where?: ProfileMemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProfileMembers to fetch.
     */
    orderBy?: ProfileMemberOrderByWithRelationInput | ProfileMemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProfileMembers.
     */
    cursor?: ProfileMemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProfileMembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProfileMembers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProfileMembers.
     */
    distinct?: ProfileMemberScalarFieldEnum | ProfileMemberScalarFieldEnum[]
  }

  /**
   * ProfileMember findFirstOrThrow
   */
  export type ProfileMemberFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileMember
     */
    select?: ProfileMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileMember
     */
    omit?: ProfileMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileMemberInclude<ExtArgs> | null
    /**
     * Filter, which ProfileMember to fetch.
     */
    where?: ProfileMemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProfileMembers to fetch.
     */
    orderBy?: ProfileMemberOrderByWithRelationInput | ProfileMemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProfileMembers.
     */
    cursor?: ProfileMemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProfileMembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProfileMembers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProfileMembers.
     */
    distinct?: ProfileMemberScalarFieldEnum | ProfileMemberScalarFieldEnum[]
  }

  /**
   * ProfileMember findMany
   */
  export type ProfileMemberFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileMember
     */
    select?: ProfileMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileMember
     */
    omit?: ProfileMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileMemberInclude<ExtArgs> | null
    /**
     * Filter, which ProfileMembers to fetch.
     */
    where?: ProfileMemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProfileMembers to fetch.
     */
    orderBy?: ProfileMemberOrderByWithRelationInput | ProfileMemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProfileMembers.
     */
    cursor?: ProfileMemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProfileMembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProfileMembers.
     */
    skip?: number
    distinct?: ProfileMemberScalarFieldEnum | ProfileMemberScalarFieldEnum[]
  }

  /**
   * ProfileMember create
   */
  export type ProfileMemberCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileMember
     */
    select?: ProfileMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileMember
     */
    omit?: ProfileMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileMemberInclude<ExtArgs> | null
    /**
     * The data needed to create a ProfileMember.
     */
    data: XOR<ProfileMemberCreateInput, ProfileMemberUncheckedCreateInput>
  }

  /**
   * ProfileMember createMany
   */
  export type ProfileMemberCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProfileMembers.
     */
    data: ProfileMemberCreateManyInput | ProfileMemberCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProfileMember createManyAndReturn
   */
  export type ProfileMemberCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileMember
     */
    select?: ProfileMemberSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileMember
     */
    omit?: ProfileMemberOmit<ExtArgs> | null
    /**
     * The data used to create many ProfileMembers.
     */
    data: ProfileMemberCreateManyInput | ProfileMemberCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileMemberIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ProfileMember update
   */
  export type ProfileMemberUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileMember
     */
    select?: ProfileMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileMember
     */
    omit?: ProfileMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileMemberInclude<ExtArgs> | null
    /**
     * The data needed to update a ProfileMember.
     */
    data: XOR<ProfileMemberUpdateInput, ProfileMemberUncheckedUpdateInput>
    /**
     * Choose, which ProfileMember to update.
     */
    where: ProfileMemberWhereUniqueInput
  }

  /**
   * ProfileMember updateMany
   */
  export type ProfileMemberUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProfileMembers.
     */
    data: XOR<ProfileMemberUpdateManyMutationInput, ProfileMemberUncheckedUpdateManyInput>
    /**
     * Filter which ProfileMembers to update
     */
    where?: ProfileMemberWhereInput
    /**
     * Limit how many ProfileMembers to update.
     */
    limit?: number
  }

  /**
   * ProfileMember updateManyAndReturn
   */
  export type ProfileMemberUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileMember
     */
    select?: ProfileMemberSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileMember
     */
    omit?: ProfileMemberOmit<ExtArgs> | null
    /**
     * The data used to update ProfileMembers.
     */
    data: XOR<ProfileMemberUpdateManyMutationInput, ProfileMemberUncheckedUpdateManyInput>
    /**
     * Filter which ProfileMembers to update
     */
    where?: ProfileMemberWhereInput
    /**
     * Limit how many ProfileMembers to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileMemberIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ProfileMember upsert
   */
  export type ProfileMemberUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileMember
     */
    select?: ProfileMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileMember
     */
    omit?: ProfileMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileMemberInclude<ExtArgs> | null
    /**
     * The filter to search for the ProfileMember to update in case it exists.
     */
    where: ProfileMemberWhereUniqueInput
    /**
     * In case the ProfileMember found by the `where` argument doesn't exist, create a new ProfileMember with this data.
     */
    create: XOR<ProfileMemberCreateInput, ProfileMemberUncheckedCreateInput>
    /**
     * In case the ProfileMember was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProfileMemberUpdateInput, ProfileMemberUncheckedUpdateInput>
  }

  /**
   * ProfileMember delete
   */
  export type ProfileMemberDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileMember
     */
    select?: ProfileMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileMember
     */
    omit?: ProfileMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileMemberInclude<ExtArgs> | null
    /**
     * Filter which ProfileMember to delete.
     */
    where: ProfileMemberWhereUniqueInput
  }

  /**
   * ProfileMember deleteMany
   */
  export type ProfileMemberDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProfileMembers to delete
     */
    where?: ProfileMemberWhereInput
    /**
     * Limit how many ProfileMembers to delete.
     */
    limit?: number
  }

  /**
   * ProfileMember without action
   */
  export type ProfileMemberDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileMember
     */
    select?: ProfileMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileMember
     */
    omit?: ProfileMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileMemberInclude<ExtArgs> | null
  }


  /**
   * Model IdentityCheck
   */

  export type AggregateIdentityCheck = {
    _count: IdentityCheckCountAggregateOutputType | null
    _min: IdentityCheckMinAggregateOutputType | null
    _max: IdentityCheckMaxAggregateOutputType | null
  }

  export type IdentityCheckMinAggregateOutputType = {
    id: string | null
    accountId: string | null
    provider: string | null
    externalId: string | null
    tier: $Enums.IdentityTier | null
    status: $Enums.IdentityCheckStatus | null
    initiatedAt: Date | null
    resolvedAt: Date | null
    expiresAt: Date | null
  }

  export type IdentityCheckMaxAggregateOutputType = {
    id: string | null
    accountId: string | null
    provider: string | null
    externalId: string | null
    tier: $Enums.IdentityTier | null
    status: $Enums.IdentityCheckStatus | null
    initiatedAt: Date | null
    resolvedAt: Date | null
    expiresAt: Date | null
  }

  export type IdentityCheckCountAggregateOutputType = {
    id: number
    accountId: number
    provider: number
    externalId: number
    tier: number
    status: number
    initiatedAt: number
    resolvedAt: number
    expiresAt: number
    providerPayload: number
    _all: number
  }


  export type IdentityCheckMinAggregateInputType = {
    id?: true
    accountId?: true
    provider?: true
    externalId?: true
    tier?: true
    status?: true
    initiatedAt?: true
    resolvedAt?: true
    expiresAt?: true
  }

  export type IdentityCheckMaxAggregateInputType = {
    id?: true
    accountId?: true
    provider?: true
    externalId?: true
    tier?: true
    status?: true
    initiatedAt?: true
    resolvedAt?: true
    expiresAt?: true
  }

  export type IdentityCheckCountAggregateInputType = {
    id?: true
    accountId?: true
    provider?: true
    externalId?: true
    tier?: true
    status?: true
    initiatedAt?: true
    resolvedAt?: true
    expiresAt?: true
    providerPayload?: true
    _all?: true
  }

  export type IdentityCheckAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IdentityCheck to aggregate.
     */
    where?: IdentityCheckWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IdentityChecks to fetch.
     */
    orderBy?: IdentityCheckOrderByWithRelationInput | IdentityCheckOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: IdentityCheckWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IdentityChecks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IdentityChecks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned IdentityChecks
    **/
    _count?: true | IdentityCheckCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: IdentityCheckMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: IdentityCheckMaxAggregateInputType
  }

  export type GetIdentityCheckAggregateType<T extends IdentityCheckAggregateArgs> = {
        [P in keyof T & keyof AggregateIdentityCheck]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateIdentityCheck[P]>
      : GetScalarType<T[P], AggregateIdentityCheck[P]>
  }




  export type IdentityCheckGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IdentityCheckWhereInput
    orderBy?: IdentityCheckOrderByWithAggregationInput | IdentityCheckOrderByWithAggregationInput[]
    by: IdentityCheckScalarFieldEnum[] | IdentityCheckScalarFieldEnum
    having?: IdentityCheckScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: IdentityCheckCountAggregateInputType | true
    _min?: IdentityCheckMinAggregateInputType
    _max?: IdentityCheckMaxAggregateInputType
  }

  export type IdentityCheckGroupByOutputType = {
    id: string
    accountId: string
    provider: string
    externalId: string
    tier: $Enums.IdentityTier
    status: $Enums.IdentityCheckStatus
    initiatedAt: Date
    resolvedAt: Date | null
    expiresAt: Date | null
    providerPayload: JsonValue | null
    _count: IdentityCheckCountAggregateOutputType | null
    _min: IdentityCheckMinAggregateOutputType | null
    _max: IdentityCheckMaxAggregateOutputType | null
  }

  type GetIdentityCheckGroupByPayload<T extends IdentityCheckGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<IdentityCheckGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof IdentityCheckGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], IdentityCheckGroupByOutputType[P]>
            : GetScalarType<T[P], IdentityCheckGroupByOutputType[P]>
        }
      >
    >


  export type IdentityCheckSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    accountId?: boolean
    provider?: boolean
    externalId?: boolean
    tier?: boolean
    status?: boolean
    initiatedAt?: boolean
    resolvedAt?: boolean
    expiresAt?: boolean
    providerPayload?: boolean
    account?: boolean | AccountDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["identityCheck"]>

  export type IdentityCheckSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    accountId?: boolean
    provider?: boolean
    externalId?: boolean
    tier?: boolean
    status?: boolean
    initiatedAt?: boolean
    resolvedAt?: boolean
    expiresAt?: boolean
    providerPayload?: boolean
    account?: boolean | AccountDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["identityCheck"]>

  export type IdentityCheckSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    accountId?: boolean
    provider?: boolean
    externalId?: boolean
    tier?: boolean
    status?: boolean
    initiatedAt?: boolean
    resolvedAt?: boolean
    expiresAt?: boolean
    providerPayload?: boolean
    account?: boolean | AccountDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["identityCheck"]>

  export type IdentityCheckSelectScalar = {
    id?: boolean
    accountId?: boolean
    provider?: boolean
    externalId?: boolean
    tier?: boolean
    status?: boolean
    initiatedAt?: boolean
    resolvedAt?: boolean
    expiresAt?: boolean
    providerPayload?: boolean
  }

  export type IdentityCheckOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "accountId" | "provider" | "externalId" | "tier" | "status" | "initiatedAt" | "resolvedAt" | "expiresAt" | "providerPayload", ExtArgs["result"]["identityCheck"]>
  export type IdentityCheckInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    account?: boolean | AccountDefaultArgs<ExtArgs>
  }
  export type IdentityCheckIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    account?: boolean | AccountDefaultArgs<ExtArgs>
  }
  export type IdentityCheckIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    account?: boolean | AccountDefaultArgs<ExtArgs>
  }

  export type $IdentityCheckPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "IdentityCheck"
    objects: {
      account: Prisma.$AccountPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      accountId: string
      provider: string
      externalId: string
      tier: $Enums.IdentityTier
      status: $Enums.IdentityCheckStatus
      initiatedAt: Date
      resolvedAt: Date | null
      expiresAt: Date | null
      providerPayload: Prisma.JsonValue | null
    }, ExtArgs["result"]["identityCheck"]>
    composites: {}
  }

  type IdentityCheckGetPayload<S extends boolean | null | undefined | IdentityCheckDefaultArgs> = $Result.GetResult<Prisma.$IdentityCheckPayload, S>

  type IdentityCheckCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<IdentityCheckFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: IdentityCheckCountAggregateInputType | true
    }

  export interface IdentityCheckDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['IdentityCheck'], meta: { name: 'IdentityCheck' } }
    /**
     * Find zero or one IdentityCheck that matches the filter.
     * @param {IdentityCheckFindUniqueArgs} args - Arguments to find a IdentityCheck
     * @example
     * // Get one IdentityCheck
     * const identityCheck = await prisma.identityCheck.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends IdentityCheckFindUniqueArgs>(args: SelectSubset<T, IdentityCheckFindUniqueArgs<ExtArgs>>): Prisma__IdentityCheckClient<$Result.GetResult<Prisma.$IdentityCheckPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one IdentityCheck that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {IdentityCheckFindUniqueOrThrowArgs} args - Arguments to find a IdentityCheck
     * @example
     * // Get one IdentityCheck
     * const identityCheck = await prisma.identityCheck.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends IdentityCheckFindUniqueOrThrowArgs>(args: SelectSubset<T, IdentityCheckFindUniqueOrThrowArgs<ExtArgs>>): Prisma__IdentityCheckClient<$Result.GetResult<Prisma.$IdentityCheckPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first IdentityCheck that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IdentityCheckFindFirstArgs} args - Arguments to find a IdentityCheck
     * @example
     * // Get one IdentityCheck
     * const identityCheck = await prisma.identityCheck.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends IdentityCheckFindFirstArgs>(args?: SelectSubset<T, IdentityCheckFindFirstArgs<ExtArgs>>): Prisma__IdentityCheckClient<$Result.GetResult<Prisma.$IdentityCheckPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first IdentityCheck that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IdentityCheckFindFirstOrThrowArgs} args - Arguments to find a IdentityCheck
     * @example
     * // Get one IdentityCheck
     * const identityCheck = await prisma.identityCheck.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends IdentityCheckFindFirstOrThrowArgs>(args?: SelectSubset<T, IdentityCheckFindFirstOrThrowArgs<ExtArgs>>): Prisma__IdentityCheckClient<$Result.GetResult<Prisma.$IdentityCheckPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more IdentityChecks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IdentityCheckFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all IdentityChecks
     * const identityChecks = await prisma.identityCheck.findMany()
     * 
     * // Get first 10 IdentityChecks
     * const identityChecks = await prisma.identityCheck.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const identityCheckWithIdOnly = await prisma.identityCheck.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends IdentityCheckFindManyArgs>(args?: SelectSubset<T, IdentityCheckFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IdentityCheckPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a IdentityCheck.
     * @param {IdentityCheckCreateArgs} args - Arguments to create a IdentityCheck.
     * @example
     * // Create one IdentityCheck
     * const IdentityCheck = await prisma.identityCheck.create({
     *   data: {
     *     // ... data to create a IdentityCheck
     *   }
     * })
     * 
     */
    create<T extends IdentityCheckCreateArgs>(args: SelectSubset<T, IdentityCheckCreateArgs<ExtArgs>>): Prisma__IdentityCheckClient<$Result.GetResult<Prisma.$IdentityCheckPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many IdentityChecks.
     * @param {IdentityCheckCreateManyArgs} args - Arguments to create many IdentityChecks.
     * @example
     * // Create many IdentityChecks
     * const identityCheck = await prisma.identityCheck.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends IdentityCheckCreateManyArgs>(args?: SelectSubset<T, IdentityCheckCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many IdentityChecks and returns the data saved in the database.
     * @param {IdentityCheckCreateManyAndReturnArgs} args - Arguments to create many IdentityChecks.
     * @example
     * // Create many IdentityChecks
     * const identityCheck = await prisma.identityCheck.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many IdentityChecks and only return the `id`
     * const identityCheckWithIdOnly = await prisma.identityCheck.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends IdentityCheckCreateManyAndReturnArgs>(args?: SelectSubset<T, IdentityCheckCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IdentityCheckPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a IdentityCheck.
     * @param {IdentityCheckDeleteArgs} args - Arguments to delete one IdentityCheck.
     * @example
     * // Delete one IdentityCheck
     * const IdentityCheck = await prisma.identityCheck.delete({
     *   where: {
     *     // ... filter to delete one IdentityCheck
     *   }
     * })
     * 
     */
    delete<T extends IdentityCheckDeleteArgs>(args: SelectSubset<T, IdentityCheckDeleteArgs<ExtArgs>>): Prisma__IdentityCheckClient<$Result.GetResult<Prisma.$IdentityCheckPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one IdentityCheck.
     * @param {IdentityCheckUpdateArgs} args - Arguments to update one IdentityCheck.
     * @example
     * // Update one IdentityCheck
     * const identityCheck = await prisma.identityCheck.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends IdentityCheckUpdateArgs>(args: SelectSubset<T, IdentityCheckUpdateArgs<ExtArgs>>): Prisma__IdentityCheckClient<$Result.GetResult<Prisma.$IdentityCheckPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more IdentityChecks.
     * @param {IdentityCheckDeleteManyArgs} args - Arguments to filter IdentityChecks to delete.
     * @example
     * // Delete a few IdentityChecks
     * const { count } = await prisma.identityCheck.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends IdentityCheckDeleteManyArgs>(args?: SelectSubset<T, IdentityCheckDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more IdentityChecks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IdentityCheckUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many IdentityChecks
     * const identityCheck = await prisma.identityCheck.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends IdentityCheckUpdateManyArgs>(args: SelectSubset<T, IdentityCheckUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more IdentityChecks and returns the data updated in the database.
     * @param {IdentityCheckUpdateManyAndReturnArgs} args - Arguments to update many IdentityChecks.
     * @example
     * // Update many IdentityChecks
     * const identityCheck = await prisma.identityCheck.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more IdentityChecks and only return the `id`
     * const identityCheckWithIdOnly = await prisma.identityCheck.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends IdentityCheckUpdateManyAndReturnArgs>(args: SelectSubset<T, IdentityCheckUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IdentityCheckPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one IdentityCheck.
     * @param {IdentityCheckUpsertArgs} args - Arguments to update or create a IdentityCheck.
     * @example
     * // Update or create a IdentityCheck
     * const identityCheck = await prisma.identityCheck.upsert({
     *   create: {
     *     // ... data to create a IdentityCheck
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the IdentityCheck we want to update
     *   }
     * })
     */
    upsert<T extends IdentityCheckUpsertArgs>(args: SelectSubset<T, IdentityCheckUpsertArgs<ExtArgs>>): Prisma__IdentityCheckClient<$Result.GetResult<Prisma.$IdentityCheckPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of IdentityChecks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IdentityCheckCountArgs} args - Arguments to filter IdentityChecks to count.
     * @example
     * // Count the number of IdentityChecks
     * const count = await prisma.identityCheck.count({
     *   where: {
     *     // ... the filter for the IdentityChecks we want to count
     *   }
     * })
    **/
    count<T extends IdentityCheckCountArgs>(
      args?: Subset<T, IdentityCheckCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], IdentityCheckCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a IdentityCheck.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IdentityCheckAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends IdentityCheckAggregateArgs>(args: Subset<T, IdentityCheckAggregateArgs>): Prisma.PrismaPromise<GetIdentityCheckAggregateType<T>>

    /**
     * Group by IdentityCheck.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IdentityCheckGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends IdentityCheckGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: IdentityCheckGroupByArgs['orderBy'] }
        : { orderBy?: IdentityCheckGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, IdentityCheckGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetIdentityCheckGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the IdentityCheck model
   */
  readonly fields: IdentityCheckFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for IdentityCheck.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__IdentityCheckClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    account<T extends AccountDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AccountDefaultArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the IdentityCheck model
   */
  interface IdentityCheckFieldRefs {
    readonly id: FieldRef<"IdentityCheck", 'String'>
    readonly accountId: FieldRef<"IdentityCheck", 'String'>
    readonly provider: FieldRef<"IdentityCheck", 'String'>
    readonly externalId: FieldRef<"IdentityCheck", 'String'>
    readonly tier: FieldRef<"IdentityCheck", 'IdentityTier'>
    readonly status: FieldRef<"IdentityCheck", 'IdentityCheckStatus'>
    readonly initiatedAt: FieldRef<"IdentityCheck", 'DateTime'>
    readonly resolvedAt: FieldRef<"IdentityCheck", 'DateTime'>
    readonly expiresAt: FieldRef<"IdentityCheck", 'DateTime'>
    readonly providerPayload: FieldRef<"IdentityCheck", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * IdentityCheck findUnique
   */
  export type IdentityCheckFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IdentityCheck
     */
    select?: IdentityCheckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IdentityCheck
     */
    omit?: IdentityCheckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IdentityCheckInclude<ExtArgs> | null
    /**
     * Filter, which IdentityCheck to fetch.
     */
    where: IdentityCheckWhereUniqueInput
  }

  /**
   * IdentityCheck findUniqueOrThrow
   */
  export type IdentityCheckFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IdentityCheck
     */
    select?: IdentityCheckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IdentityCheck
     */
    omit?: IdentityCheckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IdentityCheckInclude<ExtArgs> | null
    /**
     * Filter, which IdentityCheck to fetch.
     */
    where: IdentityCheckWhereUniqueInput
  }

  /**
   * IdentityCheck findFirst
   */
  export type IdentityCheckFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IdentityCheck
     */
    select?: IdentityCheckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IdentityCheck
     */
    omit?: IdentityCheckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IdentityCheckInclude<ExtArgs> | null
    /**
     * Filter, which IdentityCheck to fetch.
     */
    where?: IdentityCheckWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IdentityChecks to fetch.
     */
    orderBy?: IdentityCheckOrderByWithRelationInput | IdentityCheckOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IdentityChecks.
     */
    cursor?: IdentityCheckWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IdentityChecks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IdentityChecks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IdentityChecks.
     */
    distinct?: IdentityCheckScalarFieldEnum | IdentityCheckScalarFieldEnum[]
  }

  /**
   * IdentityCheck findFirstOrThrow
   */
  export type IdentityCheckFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IdentityCheck
     */
    select?: IdentityCheckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IdentityCheck
     */
    omit?: IdentityCheckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IdentityCheckInclude<ExtArgs> | null
    /**
     * Filter, which IdentityCheck to fetch.
     */
    where?: IdentityCheckWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IdentityChecks to fetch.
     */
    orderBy?: IdentityCheckOrderByWithRelationInput | IdentityCheckOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IdentityChecks.
     */
    cursor?: IdentityCheckWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IdentityChecks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IdentityChecks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IdentityChecks.
     */
    distinct?: IdentityCheckScalarFieldEnum | IdentityCheckScalarFieldEnum[]
  }

  /**
   * IdentityCheck findMany
   */
  export type IdentityCheckFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IdentityCheck
     */
    select?: IdentityCheckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IdentityCheck
     */
    omit?: IdentityCheckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IdentityCheckInclude<ExtArgs> | null
    /**
     * Filter, which IdentityChecks to fetch.
     */
    where?: IdentityCheckWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IdentityChecks to fetch.
     */
    orderBy?: IdentityCheckOrderByWithRelationInput | IdentityCheckOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing IdentityChecks.
     */
    cursor?: IdentityCheckWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IdentityChecks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IdentityChecks.
     */
    skip?: number
    distinct?: IdentityCheckScalarFieldEnum | IdentityCheckScalarFieldEnum[]
  }

  /**
   * IdentityCheck create
   */
  export type IdentityCheckCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IdentityCheck
     */
    select?: IdentityCheckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IdentityCheck
     */
    omit?: IdentityCheckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IdentityCheckInclude<ExtArgs> | null
    /**
     * The data needed to create a IdentityCheck.
     */
    data: XOR<IdentityCheckCreateInput, IdentityCheckUncheckedCreateInput>
  }

  /**
   * IdentityCheck createMany
   */
  export type IdentityCheckCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many IdentityChecks.
     */
    data: IdentityCheckCreateManyInput | IdentityCheckCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * IdentityCheck createManyAndReturn
   */
  export type IdentityCheckCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IdentityCheck
     */
    select?: IdentityCheckSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the IdentityCheck
     */
    omit?: IdentityCheckOmit<ExtArgs> | null
    /**
     * The data used to create many IdentityChecks.
     */
    data: IdentityCheckCreateManyInput | IdentityCheckCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IdentityCheckIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * IdentityCheck update
   */
  export type IdentityCheckUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IdentityCheck
     */
    select?: IdentityCheckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IdentityCheck
     */
    omit?: IdentityCheckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IdentityCheckInclude<ExtArgs> | null
    /**
     * The data needed to update a IdentityCheck.
     */
    data: XOR<IdentityCheckUpdateInput, IdentityCheckUncheckedUpdateInput>
    /**
     * Choose, which IdentityCheck to update.
     */
    where: IdentityCheckWhereUniqueInput
  }

  /**
   * IdentityCheck updateMany
   */
  export type IdentityCheckUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update IdentityChecks.
     */
    data: XOR<IdentityCheckUpdateManyMutationInput, IdentityCheckUncheckedUpdateManyInput>
    /**
     * Filter which IdentityChecks to update
     */
    where?: IdentityCheckWhereInput
    /**
     * Limit how many IdentityChecks to update.
     */
    limit?: number
  }

  /**
   * IdentityCheck updateManyAndReturn
   */
  export type IdentityCheckUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IdentityCheck
     */
    select?: IdentityCheckSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the IdentityCheck
     */
    omit?: IdentityCheckOmit<ExtArgs> | null
    /**
     * The data used to update IdentityChecks.
     */
    data: XOR<IdentityCheckUpdateManyMutationInput, IdentityCheckUncheckedUpdateManyInput>
    /**
     * Filter which IdentityChecks to update
     */
    where?: IdentityCheckWhereInput
    /**
     * Limit how many IdentityChecks to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IdentityCheckIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * IdentityCheck upsert
   */
  export type IdentityCheckUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IdentityCheck
     */
    select?: IdentityCheckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IdentityCheck
     */
    omit?: IdentityCheckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IdentityCheckInclude<ExtArgs> | null
    /**
     * The filter to search for the IdentityCheck to update in case it exists.
     */
    where: IdentityCheckWhereUniqueInput
    /**
     * In case the IdentityCheck found by the `where` argument doesn't exist, create a new IdentityCheck with this data.
     */
    create: XOR<IdentityCheckCreateInput, IdentityCheckUncheckedCreateInput>
    /**
     * In case the IdentityCheck was found with the provided `where` argument, update it with this data.
     */
    update: XOR<IdentityCheckUpdateInput, IdentityCheckUncheckedUpdateInput>
  }

  /**
   * IdentityCheck delete
   */
  export type IdentityCheckDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IdentityCheck
     */
    select?: IdentityCheckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IdentityCheck
     */
    omit?: IdentityCheckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IdentityCheckInclude<ExtArgs> | null
    /**
     * Filter which IdentityCheck to delete.
     */
    where: IdentityCheckWhereUniqueInput
  }

  /**
   * IdentityCheck deleteMany
   */
  export type IdentityCheckDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IdentityChecks to delete
     */
    where?: IdentityCheckWhereInput
    /**
     * Limit how many IdentityChecks to delete.
     */
    limit?: number
  }

  /**
   * IdentityCheck without action
   */
  export type IdentityCheckDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IdentityCheck
     */
    select?: IdentityCheckSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IdentityCheck
     */
    omit?: IdentityCheckOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IdentityCheckInclude<ExtArgs> | null
  }


  /**
   * Model Post
   */

  export type AggregatePost = {
    _count: PostCountAggregateOutputType | null
    _avg: PostAvgAggregateOutputType | null
    _sum: PostSumAggregateOutputType | null
    _min: PostMinAggregateOutputType | null
    _max: PostMaxAggregateOutputType | null
  }

  export type PostAvgAggregateOutputType = {
    likesCount: number | null
    commentsCount: number | null
    reportCount: number | null
  }

  export type PostSumAggregateOutputType = {
    likesCount: number | null
    commentsCount: number | null
    reportCount: number | null
  }

  export type PostMinAggregateOutputType = {
    id: string | null
    profileId: string | null
    content: string | null
    mediaType: $Enums.MediaType | null
    createdAt: Date | null
    updatedAt: Date | null
    likesCount: number | null
    commentsCount: number | null
    isHidden: boolean | null
    reportCount: number | null
  }

  export type PostMaxAggregateOutputType = {
    id: string | null
    profileId: string | null
    content: string | null
    mediaType: $Enums.MediaType | null
    createdAt: Date | null
    updatedAt: Date | null
    likesCount: number | null
    commentsCount: number | null
    isHidden: boolean | null
    reportCount: number | null
  }

  export type PostCountAggregateOutputType = {
    id: number
    profileId: number
    content: number
    mediaUrls: number
    mediaType: number
    createdAt: number
    updatedAt: number
    likesCount: number
    commentsCount: number
    isHidden: number
    reportCount: number
    _all: number
  }


  export type PostAvgAggregateInputType = {
    likesCount?: true
    commentsCount?: true
    reportCount?: true
  }

  export type PostSumAggregateInputType = {
    likesCount?: true
    commentsCount?: true
    reportCount?: true
  }

  export type PostMinAggregateInputType = {
    id?: true
    profileId?: true
    content?: true
    mediaType?: true
    createdAt?: true
    updatedAt?: true
    likesCount?: true
    commentsCount?: true
    isHidden?: true
    reportCount?: true
  }

  export type PostMaxAggregateInputType = {
    id?: true
    profileId?: true
    content?: true
    mediaType?: true
    createdAt?: true
    updatedAt?: true
    likesCount?: true
    commentsCount?: true
    isHidden?: true
    reportCount?: true
  }

  export type PostCountAggregateInputType = {
    id?: true
    profileId?: true
    content?: true
    mediaUrls?: true
    mediaType?: true
    createdAt?: true
    updatedAt?: true
    likesCount?: true
    commentsCount?: true
    isHidden?: true
    reportCount?: true
    _all?: true
  }

  export type PostAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Post to aggregate.
     */
    where?: PostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Posts to fetch.
     */
    orderBy?: PostOrderByWithRelationInput | PostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Posts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Posts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Posts
    **/
    _count?: true | PostCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PostAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PostSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PostMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PostMaxAggregateInputType
  }

  export type GetPostAggregateType<T extends PostAggregateArgs> = {
        [P in keyof T & keyof AggregatePost]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePost[P]>
      : GetScalarType<T[P], AggregatePost[P]>
  }




  export type PostGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PostWhereInput
    orderBy?: PostOrderByWithAggregationInput | PostOrderByWithAggregationInput[]
    by: PostScalarFieldEnum[] | PostScalarFieldEnum
    having?: PostScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PostCountAggregateInputType | true
    _avg?: PostAvgAggregateInputType
    _sum?: PostSumAggregateInputType
    _min?: PostMinAggregateInputType
    _max?: PostMaxAggregateInputType
  }

  export type PostGroupByOutputType = {
    id: string
    profileId: string
    content: string
    mediaUrls: string[]
    mediaType: $Enums.MediaType
    createdAt: Date
    updatedAt: Date
    likesCount: number
    commentsCount: number
    isHidden: boolean
    reportCount: number
    _count: PostCountAggregateOutputType | null
    _avg: PostAvgAggregateOutputType | null
    _sum: PostSumAggregateOutputType | null
    _min: PostMinAggregateOutputType | null
    _max: PostMaxAggregateOutputType | null
  }

  type GetPostGroupByPayload<T extends PostGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PostGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PostGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PostGroupByOutputType[P]>
            : GetScalarType<T[P], PostGroupByOutputType[P]>
        }
      >
    >


  export type PostSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    profileId?: boolean
    content?: boolean
    mediaUrls?: boolean
    mediaType?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    likesCount?: boolean
    commentsCount?: boolean
    isHidden?: boolean
    reportCount?: boolean
    profile?: boolean | ProfileDefaultArgs<ExtArgs>
    comments?: boolean | Post$commentsArgs<ExtArgs>
    likes?: boolean | Post$likesArgs<ExtArgs>
    nft?: boolean | Post$nftArgs<ExtArgs>
    _count?: boolean | PostCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["post"]>

  export type PostSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    profileId?: boolean
    content?: boolean
    mediaUrls?: boolean
    mediaType?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    likesCount?: boolean
    commentsCount?: boolean
    isHidden?: boolean
    reportCount?: boolean
    profile?: boolean | ProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["post"]>

  export type PostSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    profileId?: boolean
    content?: boolean
    mediaUrls?: boolean
    mediaType?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    likesCount?: boolean
    commentsCount?: boolean
    isHidden?: boolean
    reportCount?: boolean
    profile?: boolean | ProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["post"]>

  export type PostSelectScalar = {
    id?: boolean
    profileId?: boolean
    content?: boolean
    mediaUrls?: boolean
    mediaType?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    likesCount?: boolean
    commentsCount?: boolean
    isHidden?: boolean
    reportCount?: boolean
  }

  export type PostOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "profileId" | "content" | "mediaUrls" | "mediaType" | "createdAt" | "updatedAt" | "likesCount" | "commentsCount" | "isHidden" | "reportCount", ExtArgs["result"]["post"]>
  export type PostInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    profile?: boolean | ProfileDefaultArgs<ExtArgs>
    comments?: boolean | Post$commentsArgs<ExtArgs>
    likes?: boolean | Post$likesArgs<ExtArgs>
    nft?: boolean | Post$nftArgs<ExtArgs>
    _count?: boolean | PostCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PostIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    profile?: boolean | ProfileDefaultArgs<ExtArgs>
  }
  export type PostIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    profile?: boolean | ProfileDefaultArgs<ExtArgs>
  }

  export type $PostPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Post"
    objects: {
      profile: Prisma.$ProfilePayload<ExtArgs>
      comments: Prisma.$CommentPayload<ExtArgs>[]
      likes: Prisma.$LikePayload<ExtArgs>[]
      nft: Prisma.$NFTPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      profileId: string
      content: string
      mediaUrls: string[]
      mediaType: $Enums.MediaType
      createdAt: Date
      updatedAt: Date
      likesCount: number
      commentsCount: number
      isHidden: boolean
      reportCount: number
    }, ExtArgs["result"]["post"]>
    composites: {}
  }

  type PostGetPayload<S extends boolean | null | undefined | PostDefaultArgs> = $Result.GetResult<Prisma.$PostPayload, S>

  type PostCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PostFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PostCountAggregateInputType | true
    }

  export interface PostDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Post'], meta: { name: 'Post' } }
    /**
     * Find zero or one Post that matches the filter.
     * @param {PostFindUniqueArgs} args - Arguments to find a Post
     * @example
     * // Get one Post
     * const post = await prisma.post.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PostFindUniqueArgs>(args: SelectSubset<T, PostFindUniqueArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Post that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PostFindUniqueOrThrowArgs} args - Arguments to find a Post
     * @example
     * // Get one Post
     * const post = await prisma.post.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PostFindUniqueOrThrowArgs>(args: SelectSubset<T, PostFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Post that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostFindFirstArgs} args - Arguments to find a Post
     * @example
     * // Get one Post
     * const post = await prisma.post.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PostFindFirstArgs>(args?: SelectSubset<T, PostFindFirstArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Post that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostFindFirstOrThrowArgs} args - Arguments to find a Post
     * @example
     * // Get one Post
     * const post = await prisma.post.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PostFindFirstOrThrowArgs>(args?: SelectSubset<T, PostFindFirstOrThrowArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Posts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Posts
     * const posts = await prisma.post.findMany()
     * 
     * // Get first 10 Posts
     * const posts = await prisma.post.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const postWithIdOnly = await prisma.post.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PostFindManyArgs>(args?: SelectSubset<T, PostFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Post.
     * @param {PostCreateArgs} args - Arguments to create a Post.
     * @example
     * // Create one Post
     * const Post = await prisma.post.create({
     *   data: {
     *     // ... data to create a Post
     *   }
     * })
     * 
     */
    create<T extends PostCreateArgs>(args: SelectSubset<T, PostCreateArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Posts.
     * @param {PostCreateManyArgs} args - Arguments to create many Posts.
     * @example
     * // Create many Posts
     * const post = await prisma.post.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PostCreateManyArgs>(args?: SelectSubset<T, PostCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Posts and returns the data saved in the database.
     * @param {PostCreateManyAndReturnArgs} args - Arguments to create many Posts.
     * @example
     * // Create many Posts
     * const post = await prisma.post.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Posts and only return the `id`
     * const postWithIdOnly = await prisma.post.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PostCreateManyAndReturnArgs>(args?: SelectSubset<T, PostCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Post.
     * @param {PostDeleteArgs} args - Arguments to delete one Post.
     * @example
     * // Delete one Post
     * const Post = await prisma.post.delete({
     *   where: {
     *     // ... filter to delete one Post
     *   }
     * })
     * 
     */
    delete<T extends PostDeleteArgs>(args: SelectSubset<T, PostDeleteArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Post.
     * @param {PostUpdateArgs} args - Arguments to update one Post.
     * @example
     * // Update one Post
     * const post = await prisma.post.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PostUpdateArgs>(args: SelectSubset<T, PostUpdateArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Posts.
     * @param {PostDeleteManyArgs} args - Arguments to filter Posts to delete.
     * @example
     * // Delete a few Posts
     * const { count } = await prisma.post.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PostDeleteManyArgs>(args?: SelectSubset<T, PostDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Posts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Posts
     * const post = await prisma.post.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PostUpdateManyArgs>(args: SelectSubset<T, PostUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Posts and returns the data updated in the database.
     * @param {PostUpdateManyAndReturnArgs} args - Arguments to update many Posts.
     * @example
     * // Update many Posts
     * const post = await prisma.post.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Posts and only return the `id`
     * const postWithIdOnly = await prisma.post.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PostUpdateManyAndReturnArgs>(args: SelectSubset<T, PostUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Post.
     * @param {PostUpsertArgs} args - Arguments to update or create a Post.
     * @example
     * // Update or create a Post
     * const post = await prisma.post.upsert({
     *   create: {
     *     // ... data to create a Post
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Post we want to update
     *   }
     * })
     */
    upsert<T extends PostUpsertArgs>(args: SelectSubset<T, PostUpsertArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Posts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostCountArgs} args - Arguments to filter Posts to count.
     * @example
     * // Count the number of Posts
     * const count = await prisma.post.count({
     *   where: {
     *     // ... the filter for the Posts we want to count
     *   }
     * })
    **/
    count<T extends PostCountArgs>(
      args?: Subset<T, PostCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PostCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Post.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PostAggregateArgs>(args: Subset<T, PostAggregateArgs>): Prisma.PrismaPromise<GetPostAggregateType<T>>

    /**
     * Group by Post.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PostGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PostGroupByArgs['orderBy'] }
        : { orderBy?: PostGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PostGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPostGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Post model
   */
  readonly fields: PostFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Post.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PostClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    profile<T extends ProfileDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProfileDefaultArgs<ExtArgs>>): Prisma__ProfileClient<$Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    comments<T extends Post$commentsArgs<ExtArgs> = {}>(args?: Subset<T, Post$commentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    likes<T extends Post$likesArgs<ExtArgs> = {}>(args?: Subset<T, Post$likesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LikePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    nft<T extends Post$nftArgs<ExtArgs> = {}>(args?: Subset<T, Post$nftArgs<ExtArgs>>): Prisma__NFTClient<$Result.GetResult<Prisma.$NFTPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Post model
   */
  interface PostFieldRefs {
    readonly id: FieldRef<"Post", 'String'>
    readonly profileId: FieldRef<"Post", 'String'>
    readonly content: FieldRef<"Post", 'String'>
    readonly mediaUrls: FieldRef<"Post", 'String[]'>
    readonly mediaType: FieldRef<"Post", 'MediaType'>
    readonly createdAt: FieldRef<"Post", 'DateTime'>
    readonly updatedAt: FieldRef<"Post", 'DateTime'>
    readonly likesCount: FieldRef<"Post", 'Int'>
    readonly commentsCount: FieldRef<"Post", 'Int'>
    readonly isHidden: FieldRef<"Post", 'Boolean'>
    readonly reportCount: FieldRef<"Post", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Post findUnique
   */
  export type PostFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * Filter, which Post to fetch.
     */
    where: PostWhereUniqueInput
  }

  /**
   * Post findUniqueOrThrow
   */
  export type PostFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * Filter, which Post to fetch.
     */
    where: PostWhereUniqueInput
  }

  /**
   * Post findFirst
   */
  export type PostFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * Filter, which Post to fetch.
     */
    where?: PostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Posts to fetch.
     */
    orderBy?: PostOrderByWithRelationInput | PostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Posts.
     */
    cursor?: PostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Posts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Posts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Posts.
     */
    distinct?: PostScalarFieldEnum | PostScalarFieldEnum[]
  }

  /**
   * Post findFirstOrThrow
   */
  export type PostFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * Filter, which Post to fetch.
     */
    where?: PostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Posts to fetch.
     */
    orderBy?: PostOrderByWithRelationInput | PostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Posts.
     */
    cursor?: PostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Posts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Posts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Posts.
     */
    distinct?: PostScalarFieldEnum | PostScalarFieldEnum[]
  }

  /**
   * Post findMany
   */
  export type PostFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * Filter, which Posts to fetch.
     */
    where?: PostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Posts to fetch.
     */
    orderBy?: PostOrderByWithRelationInput | PostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Posts.
     */
    cursor?: PostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Posts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Posts.
     */
    skip?: number
    distinct?: PostScalarFieldEnum | PostScalarFieldEnum[]
  }

  /**
   * Post create
   */
  export type PostCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * The data needed to create a Post.
     */
    data: XOR<PostCreateInput, PostUncheckedCreateInput>
  }

  /**
   * Post createMany
   */
  export type PostCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Posts.
     */
    data: PostCreateManyInput | PostCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Post createManyAndReturn
   */
  export type PostCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * The data used to create many Posts.
     */
    data: PostCreateManyInput | PostCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Post update
   */
  export type PostUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * The data needed to update a Post.
     */
    data: XOR<PostUpdateInput, PostUncheckedUpdateInput>
    /**
     * Choose, which Post to update.
     */
    where: PostWhereUniqueInput
  }

  /**
   * Post updateMany
   */
  export type PostUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Posts.
     */
    data: XOR<PostUpdateManyMutationInput, PostUncheckedUpdateManyInput>
    /**
     * Filter which Posts to update
     */
    where?: PostWhereInput
    /**
     * Limit how many Posts to update.
     */
    limit?: number
  }

  /**
   * Post updateManyAndReturn
   */
  export type PostUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * The data used to update Posts.
     */
    data: XOR<PostUpdateManyMutationInput, PostUncheckedUpdateManyInput>
    /**
     * Filter which Posts to update
     */
    where?: PostWhereInput
    /**
     * Limit how many Posts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Post upsert
   */
  export type PostUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * The filter to search for the Post to update in case it exists.
     */
    where: PostWhereUniqueInput
    /**
     * In case the Post found by the `where` argument doesn't exist, create a new Post with this data.
     */
    create: XOR<PostCreateInput, PostUncheckedCreateInput>
    /**
     * In case the Post was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PostUpdateInput, PostUncheckedUpdateInput>
  }

  /**
   * Post delete
   */
  export type PostDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * Filter which Post to delete.
     */
    where: PostWhereUniqueInput
  }

  /**
   * Post deleteMany
   */
  export type PostDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Posts to delete
     */
    where?: PostWhereInput
    /**
     * Limit how many Posts to delete.
     */
    limit?: number
  }

  /**
   * Post.comments
   */
  export type Post$commentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    where?: CommentWhereInput
    orderBy?: CommentOrderByWithRelationInput | CommentOrderByWithRelationInput[]
    cursor?: CommentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CommentScalarFieldEnum | CommentScalarFieldEnum[]
  }

  /**
   * Post.likes
   */
  export type Post$likesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Like
     */
    select?: LikeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Like
     */
    omit?: LikeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LikeInclude<ExtArgs> | null
    where?: LikeWhereInput
    orderBy?: LikeOrderByWithRelationInput | LikeOrderByWithRelationInput[]
    cursor?: LikeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LikeScalarFieldEnum | LikeScalarFieldEnum[]
  }

  /**
   * Post.nft
   */
  export type Post$nftArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NFT
     */
    select?: NFTSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NFT
     */
    omit?: NFTOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NFTInclude<ExtArgs> | null
    where?: NFTWhereInput
  }

  /**
   * Post without action
   */
  export type PostDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
  }


  /**
   * Model Comment
   */

  export type AggregateComment = {
    _count: CommentCountAggregateOutputType | null
    _min: CommentMinAggregateOutputType | null
    _max: CommentMaxAggregateOutputType | null
  }

  export type CommentMinAggregateOutputType = {
    id: string | null
    postId: string | null
    profileId: string | null
    content: string | null
    createdAt: Date | null
    updatedAt: Date | null
    isHidden: boolean | null
  }

  export type CommentMaxAggregateOutputType = {
    id: string | null
    postId: string | null
    profileId: string | null
    content: string | null
    createdAt: Date | null
    updatedAt: Date | null
    isHidden: boolean | null
  }

  export type CommentCountAggregateOutputType = {
    id: number
    postId: number
    profileId: number
    content: number
    createdAt: number
    updatedAt: number
    isHidden: number
    _all: number
  }


  export type CommentMinAggregateInputType = {
    id?: true
    postId?: true
    profileId?: true
    content?: true
    createdAt?: true
    updatedAt?: true
    isHidden?: true
  }

  export type CommentMaxAggregateInputType = {
    id?: true
    postId?: true
    profileId?: true
    content?: true
    createdAt?: true
    updatedAt?: true
    isHidden?: true
  }

  export type CommentCountAggregateInputType = {
    id?: true
    postId?: true
    profileId?: true
    content?: true
    createdAt?: true
    updatedAt?: true
    isHidden?: true
    _all?: true
  }

  export type CommentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Comment to aggregate.
     */
    where?: CommentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Comments to fetch.
     */
    orderBy?: CommentOrderByWithRelationInput | CommentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CommentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Comments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Comments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Comments
    **/
    _count?: true | CommentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CommentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CommentMaxAggregateInputType
  }

  export type GetCommentAggregateType<T extends CommentAggregateArgs> = {
        [P in keyof T & keyof AggregateComment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateComment[P]>
      : GetScalarType<T[P], AggregateComment[P]>
  }




  export type CommentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CommentWhereInput
    orderBy?: CommentOrderByWithAggregationInput | CommentOrderByWithAggregationInput[]
    by: CommentScalarFieldEnum[] | CommentScalarFieldEnum
    having?: CommentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CommentCountAggregateInputType | true
    _min?: CommentMinAggregateInputType
    _max?: CommentMaxAggregateInputType
  }

  export type CommentGroupByOutputType = {
    id: string
    postId: string
    profileId: string
    content: string
    createdAt: Date
    updatedAt: Date
    isHidden: boolean
    _count: CommentCountAggregateOutputType | null
    _min: CommentMinAggregateOutputType | null
    _max: CommentMaxAggregateOutputType | null
  }

  type GetCommentGroupByPayload<T extends CommentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CommentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CommentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CommentGroupByOutputType[P]>
            : GetScalarType<T[P], CommentGroupByOutputType[P]>
        }
      >
    >


  export type CommentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    postId?: boolean
    profileId?: boolean
    content?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    isHidden?: boolean
    post?: boolean | PostDefaultArgs<ExtArgs>
    profile?: boolean | ProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["comment"]>

  export type CommentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    postId?: boolean
    profileId?: boolean
    content?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    isHidden?: boolean
    post?: boolean | PostDefaultArgs<ExtArgs>
    profile?: boolean | ProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["comment"]>

  export type CommentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    postId?: boolean
    profileId?: boolean
    content?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    isHidden?: boolean
    post?: boolean | PostDefaultArgs<ExtArgs>
    profile?: boolean | ProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["comment"]>

  export type CommentSelectScalar = {
    id?: boolean
    postId?: boolean
    profileId?: boolean
    content?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    isHidden?: boolean
  }

  export type CommentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "postId" | "profileId" | "content" | "createdAt" | "updatedAt" | "isHidden", ExtArgs["result"]["comment"]>
  export type CommentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    post?: boolean | PostDefaultArgs<ExtArgs>
    profile?: boolean | ProfileDefaultArgs<ExtArgs>
  }
  export type CommentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    post?: boolean | PostDefaultArgs<ExtArgs>
    profile?: boolean | ProfileDefaultArgs<ExtArgs>
  }
  export type CommentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    post?: boolean | PostDefaultArgs<ExtArgs>
    profile?: boolean | ProfileDefaultArgs<ExtArgs>
  }

  export type $CommentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Comment"
    objects: {
      post: Prisma.$PostPayload<ExtArgs>
      profile: Prisma.$ProfilePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      postId: string
      profileId: string
      content: string
      createdAt: Date
      updatedAt: Date
      isHidden: boolean
    }, ExtArgs["result"]["comment"]>
    composites: {}
  }

  type CommentGetPayload<S extends boolean | null | undefined | CommentDefaultArgs> = $Result.GetResult<Prisma.$CommentPayload, S>

  type CommentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CommentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CommentCountAggregateInputType | true
    }

  export interface CommentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Comment'], meta: { name: 'Comment' } }
    /**
     * Find zero or one Comment that matches the filter.
     * @param {CommentFindUniqueArgs} args - Arguments to find a Comment
     * @example
     * // Get one Comment
     * const comment = await prisma.comment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CommentFindUniqueArgs>(args: SelectSubset<T, CommentFindUniqueArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Comment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CommentFindUniqueOrThrowArgs} args - Arguments to find a Comment
     * @example
     * // Get one Comment
     * const comment = await prisma.comment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CommentFindUniqueOrThrowArgs>(args: SelectSubset<T, CommentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Comment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentFindFirstArgs} args - Arguments to find a Comment
     * @example
     * // Get one Comment
     * const comment = await prisma.comment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CommentFindFirstArgs>(args?: SelectSubset<T, CommentFindFirstArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Comment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentFindFirstOrThrowArgs} args - Arguments to find a Comment
     * @example
     * // Get one Comment
     * const comment = await prisma.comment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CommentFindFirstOrThrowArgs>(args?: SelectSubset<T, CommentFindFirstOrThrowArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Comments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Comments
     * const comments = await prisma.comment.findMany()
     * 
     * // Get first 10 Comments
     * const comments = await prisma.comment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const commentWithIdOnly = await prisma.comment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CommentFindManyArgs>(args?: SelectSubset<T, CommentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Comment.
     * @param {CommentCreateArgs} args - Arguments to create a Comment.
     * @example
     * // Create one Comment
     * const Comment = await prisma.comment.create({
     *   data: {
     *     // ... data to create a Comment
     *   }
     * })
     * 
     */
    create<T extends CommentCreateArgs>(args: SelectSubset<T, CommentCreateArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Comments.
     * @param {CommentCreateManyArgs} args - Arguments to create many Comments.
     * @example
     * // Create many Comments
     * const comment = await prisma.comment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CommentCreateManyArgs>(args?: SelectSubset<T, CommentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Comments and returns the data saved in the database.
     * @param {CommentCreateManyAndReturnArgs} args - Arguments to create many Comments.
     * @example
     * // Create many Comments
     * const comment = await prisma.comment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Comments and only return the `id`
     * const commentWithIdOnly = await prisma.comment.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CommentCreateManyAndReturnArgs>(args?: SelectSubset<T, CommentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Comment.
     * @param {CommentDeleteArgs} args - Arguments to delete one Comment.
     * @example
     * // Delete one Comment
     * const Comment = await prisma.comment.delete({
     *   where: {
     *     // ... filter to delete one Comment
     *   }
     * })
     * 
     */
    delete<T extends CommentDeleteArgs>(args: SelectSubset<T, CommentDeleteArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Comment.
     * @param {CommentUpdateArgs} args - Arguments to update one Comment.
     * @example
     * // Update one Comment
     * const comment = await prisma.comment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CommentUpdateArgs>(args: SelectSubset<T, CommentUpdateArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Comments.
     * @param {CommentDeleteManyArgs} args - Arguments to filter Comments to delete.
     * @example
     * // Delete a few Comments
     * const { count } = await prisma.comment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CommentDeleteManyArgs>(args?: SelectSubset<T, CommentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Comments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Comments
     * const comment = await prisma.comment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CommentUpdateManyArgs>(args: SelectSubset<T, CommentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Comments and returns the data updated in the database.
     * @param {CommentUpdateManyAndReturnArgs} args - Arguments to update many Comments.
     * @example
     * // Update many Comments
     * const comment = await prisma.comment.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Comments and only return the `id`
     * const commentWithIdOnly = await prisma.comment.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CommentUpdateManyAndReturnArgs>(args: SelectSubset<T, CommentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Comment.
     * @param {CommentUpsertArgs} args - Arguments to update or create a Comment.
     * @example
     * // Update or create a Comment
     * const comment = await prisma.comment.upsert({
     *   create: {
     *     // ... data to create a Comment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Comment we want to update
     *   }
     * })
     */
    upsert<T extends CommentUpsertArgs>(args: SelectSubset<T, CommentUpsertArgs<ExtArgs>>): Prisma__CommentClient<$Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Comments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentCountArgs} args - Arguments to filter Comments to count.
     * @example
     * // Count the number of Comments
     * const count = await prisma.comment.count({
     *   where: {
     *     // ... the filter for the Comments we want to count
     *   }
     * })
    **/
    count<T extends CommentCountArgs>(
      args?: Subset<T, CommentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CommentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Comment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CommentAggregateArgs>(args: Subset<T, CommentAggregateArgs>): Prisma.PrismaPromise<GetCommentAggregateType<T>>

    /**
     * Group by Comment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CommentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CommentGroupByArgs['orderBy'] }
        : { orderBy?: CommentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CommentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCommentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Comment model
   */
  readonly fields: CommentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Comment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CommentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    post<T extends PostDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PostDefaultArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    profile<T extends ProfileDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProfileDefaultArgs<ExtArgs>>): Prisma__ProfileClient<$Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Comment model
   */
  interface CommentFieldRefs {
    readonly id: FieldRef<"Comment", 'String'>
    readonly postId: FieldRef<"Comment", 'String'>
    readonly profileId: FieldRef<"Comment", 'String'>
    readonly content: FieldRef<"Comment", 'String'>
    readonly createdAt: FieldRef<"Comment", 'DateTime'>
    readonly updatedAt: FieldRef<"Comment", 'DateTime'>
    readonly isHidden: FieldRef<"Comment", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * Comment findUnique
   */
  export type CommentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * Filter, which Comment to fetch.
     */
    where: CommentWhereUniqueInput
  }

  /**
   * Comment findUniqueOrThrow
   */
  export type CommentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * Filter, which Comment to fetch.
     */
    where: CommentWhereUniqueInput
  }

  /**
   * Comment findFirst
   */
  export type CommentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * Filter, which Comment to fetch.
     */
    where?: CommentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Comments to fetch.
     */
    orderBy?: CommentOrderByWithRelationInput | CommentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Comments.
     */
    cursor?: CommentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Comments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Comments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Comments.
     */
    distinct?: CommentScalarFieldEnum | CommentScalarFieldEnum[]
  }

  /**
   * Comment findFirstOrThrow
   */
  export type CommentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * Filter, which Comment to fetch.
     */
    where?: CommentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Comments to fetch.
     */
    orderBy?: CommentOrderByWithRelationInput | CommentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Comments.
     */
    cursor?: CommentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Comments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Comments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Comments.
     */
    distinct?: CommentScalarFieldEnum | CommentScalarFieldEnum[]
  }

  /**
   * Comment findMany
   */
  export type CommentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * Filter, which Comments to fetch.
     */
    where?: CommentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Comments to fetch.
     */
    orderBy?: CommentOrderByWithRelationInput | CommentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Comments.
     */
    cursor?: CommentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Comments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Comments.
     */
    skip?: number
    distinct?: CommentScalarFieldEnum | CommentScalarFieldEnum[]
  }

  /**
   * Comment create
   */
  export type CommentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * The data needed to create a Comment.
     */
    data: XOR<CommentCreateInput, CommentUncheckedCreateInput>
  }

  /**
   * Comment createMany
   */
  export type CommentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Comments.
     */
    data: CommentCreateManyInput | CommentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Comment createManyAndReturn
   */
  export type CommentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * The data used to create many Comments.
     */
    data: CommentCreateManyInput | CommentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Comment update
   */
  export type CommentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * The data needed to update a Comment.
     */
    data: XOR<CommentUpdateInput, CommentUncheckedUpdateInput>
    /**
     * Choose, which Comment to update.
     */
    where: CommentWhereUniqueInput
  }

  /**
   * Comment updateMany
   */
  export type CommentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Comments.
     */
    data: XOR<CommentUpdateManyMutationInput, CommentUncheckedUpdateManyInput>
    /**
     * Filter which Comments to update
     */
    where?: CommentWhereInput
    /**
     * Limit how many Comments to update.
     */
    limit?: number
  }

  /**
   * Comment updateManyAndReturn
   */
  export type CommentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * The data used to update Comments.
     */
    data: XOR<CommentUpdateManyMutationInput, CommentUncheckedUpdateManyInput>
    /**
     * Filter which Comments to update
     */
    where?: CommentWhereInput
    /**
     * Limit how many Comments to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Comment upsert
   */
  export type CommentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * The filter to search for the Comment to update in case it exists.
     */
    where: CommentWhereUniqueInput
    /**
     * In case the Comment found by the `where` argument doesn't exist, create a new Comment with this data.
     */
    create: XOR<CommentCreateInput, CommentUncheckedCreateInput>
    /**
     * In case the Comment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CommentUpdateInput, CommentUncheckedUpdateInput>
  }

  /**
   * Comment delete
   */
  export type CommentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
    /**
     * Filter which Comment to delete.
     */
    where: CommentWhereUniqueInput
  }

  /**
   * Comment deleteMany
   */
  export type CommentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Comments to delete
     */
    where?: CommentWhereInput
    /**
     * Limit how many Comments to delete.
     */
    limit?: number
  }

  /**
   * Comment without action
   */
  export type CommentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Comment
     */
    select?: CommentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Comment
     */
    omit?: CommentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CommentInclude<ExtArgs> | null
  }


  /**
   * Model Like
   */

  export type AggregateLike = {
    _count: LikeCountAggregateOutputType | null
    _min: LikeMinAggregateOutputType | null
    _max: LikeMaxAggregateOutputType | null
  }

  export type LikeMinAggregateOutputType = {
    id: string | null
    postId: string | null
    profileId: string | null
    createdAt: Date | null
  }

  export type LikeMaxAggregateOutputType = {
    id: string | null
    postId: string | null
    profileId: string | null
    createdAt: Date | null
  }

  export type LikeCountAggregateOutputType = {
    id: number
    postId: number
    profileId: number
    createdAt: number
    _all: number
  }


  export type LikeMinAggregateInputType = {
    id?: true
    postId?: true
    profileId?: true
    createdAt?: true
  }

  export type LikeMaxAggregateInputType = {
    id?: true
    postId?: true
    profileId?: true
    createdAt?: true
  }

  export type LikeCountAggregateInputType = {
    id?: true
    postId?: true
    profileId?: true
    createdAt?: true
    _all?: true
  }

  export type LikeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Like to aggregate.
     */
    where?: LikeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Likes to fetch.
     */
    orderBy?: LikeOrderByWithRelationInput | LikeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LikeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Likes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Likes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Likes
    **/
    _count?: true | LikeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LikeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LikeMaxAggregateInputType
  }

  export type GetLikeAggregateType<T extends LikeAggregateArgs> = {
        [P in keyof T & keyof AggregateLike]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLike[P]>
      : GetScalarType<T[P], AggregateLike[P]>
  }




  export type LikeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LikeWhereInput
    orderBy?: LikeOrderByWithAggregationInput | LikeOrderByWithAggregationInput[]
    by: LikeScalarFieldEnum[] | LikeScalarFieldEnum
    having?: LikeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LikeCountAggregateInputType | true
    _min?: LikeMinAggregateInputType
    _max?: LikeMaxAggregateInputType
  }

  export type LikeGroupByOutputType = {
    id: string
    postId: string
    profileId: string
    createdAt: Date
    _count: LikeCountAggregateOutputType | null
    _min: LikeMinAggregateOutputType | null
    _max: LikeMaxAggregateOutputType | null
  }

  type GetLikeGroupByPayload<T extends LikeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LikeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LikeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LikeGroupByOutputType[P]>
            : GetScalarType<T[P], LikeGroupByOutputType[P]>
        }
      >
    >


  export type LikeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    postId?: boolean
    profileId?: boolean
    createdAt?: boolean
    post?: boolean | PostDefaultArgs<ExtArgs>
    profile?: boolean | ProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["like"]>

  export type LikeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    postId?: boolean
    profileId?: boolean
    createdAt?: boolean
    post?: boolean | PostDefaultArgs<ExtArgs>
    profile?: boolean | ProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["like"]>

  export type LikeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    postId?: boolean
    profileId?: boolean
    createdAt?: boolean
    post?: boolean | PostDefaultArgs<ExtArgs>
    profile?: boolean | ProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["like"]>

  export type LikeSelectScalar = {
    id?: boolean
    postId?: boolean
    profileId?: boolean
    createdAt?: boolean
  }

  export type LikeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "postId" | "profileId" | "createdAt", ExtArgs["result"]["like"]>
  export type LikeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    post?: boolean | PostDefaultArgs<ExtArgs>
    profile?: boolean | ProfileDefaultArgs<ExtArgs>
  }
  export type LikeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    post?: boolean | PostDefaultArgs<ExtArgs>
    profile?: boolean | ProfileDefaultArgs<ExtArgs>
  }
  export type LikeIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    post?: boolean | PostDefaultArgs<ExtArgs>
    profile?: boolean | ProfileDefaultArgs<ExtArgs>
  }

  export type $LikePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Like"
    objects: {
      post: Prisma.$PostPayload<ExtArgs>
      profile: Prisma.$ProfilePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      postId: string
      profileId: string
      createdAt: Date
    }, ExtArgs["result"]["like"]>
    composites: {}
  }

  type LikeGetPayload<S extends boolean | null | undefined | LikeDefaultArgs> = $Result.GetResult<Prisma.$LikePayload, S>

  type LikeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LikeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LikeCountAggregateInputType | true
    }

  export interface LikeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Like'], meta: { name: 'Like' } }
    /**
     * Find zero or one Like that matches the filter.
     * @param {LikeFindUniqueArgs} args - Arguments to find a Like
     * @example
     * // Get one Like
     * const like = await prisma.like.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LikeFindUniqueArgs>(args: SelectSubset<T, LikeFindUniqueArgs<ExtArgs>>): Prisma__LikeClient<$Result.GetResult<Prisma.$LikePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Like that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LikeFindUniqueOrThrowArgs} args - Arguments to find a Like
     * @example
     * // Get one Like
     * const like = await prisma.like.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LikeFindUniqueOrThrowArgs>(args: SelectSubset<T, LikeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LikeClient<$Result.GetResult<Prisma.$LikePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Like that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LikeFindFirstArgs} args - Arguments to find a Like
     * @example
     * // Get one Like
     * const like = await prisma.like.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LikeFindFirstArgs>(args?: SelectSubset<T, LikeFindFirstArgs<ExtArgs>>): Prisma__LikeClient<$Result.GetResult<Prisma.$LikePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Like that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LikeFindFirstOrThrowArgs} args - Arguments to find a Like
     * @example
     * // Get one Like
     * const like = await prisma.like.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LikeFindFirstOrThrowArgs>(args?: SelectSubset<T, LikeFindFirstOrThrowArgs<ExtArgs>>): Prisma__LikeClient<$Result.GetResult<Prisma.$LikePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Likes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LikeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Likes
     * const likes = await prisma.like.findMany()
     * 
     * // Get first 10 Likes
     * const likes = await prisma.like.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const likeWithIdOnly = await prisma.like.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LikeFindManyArgs>(args?: SelectSubset<T, LikeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LikePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Like.
     * @param {LikeCreateArgs} args - Arguments to create a Like.
     * @example
     * // Create one Like
     * const Like = await prisma.like.create({
     *   data: {
     *     // ... data to create a Like
     *   }
     * })
     * 
     */
    create<T extends LikeCreateArgs>(args: SelectSubset<T, LikeCreateArgs<ExtArgs>>): Prisma__LikeClient<$Result.GetResult<Prisma.$LikePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Likes.
     * @param {LikeCreateManyArgs} args - Arguments to create many Likes.
     * @example
     * // Create many Likes
     * const like = await prisma.like.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LikeCreateManyArgs>(args?: SelectSubset<T, LikeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Likes and returns the data saved in the database.
     * @param {LikeCreateManyAndReturnArgs} args - Arguments to create many Likes.
     * @example
     * // Create many Likes
     * const like = await prisma.like.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Likes and only return the `id`
     * const likeWithIdOnly = await prisma.like.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LikeCreateManyAndReturnArgs>(args?: SelectSubset<T, LikeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LikePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Like.
     * @param {LikeDeleteArgs} args - Arguments to delete one Like.
     * @example
     * // Delete one Like
     * const Like = await prisma.like.delete({
     *   where: {
     *     // ... filter to delete one Like
     *   }
     * })
     * 
     */
    delete<T extends LikeDeleteArgs>(args: SelectSubset<T, LikeDeleteArgs<ExtArgs>>): Prisma__LikeClient<$Result.GetResult<Prisma.$LikePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Like.
     * @param {LikeUpdateArgs} args - Arguments to update one Like.
     * @example
     * // Update one Like
     * const like = await prisma.like.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LikeUpdateArgs>(args: SelectSubset<T, LikeUpdateArgs<ExtArgs>>): Prisma__LikeClient<$Result.GetResult<Prisma.$LikePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Likes.
     * @param {LikeDeleteManyArgs} args - Arguments to filter Likes to delete.
     * @example
     * // Delete a few Likes
     * const { count } = await prisma.like.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LikeDeleteManyArgs>(args?: SelectSubset<T, LikeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Likes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LikeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Likes
     * const like = await prisma.like.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LikeUpdateManyArgs>(args: SelectSubset<T, LikeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Likes and returns the data updated in the database.
     * @param {LikeUpdateManyAndReturnArgs} args - Arguments to update many Likes.
     * @example
     * // Update many Likes
     * const like = await prisma.like.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Likes and only return the `id`
     * const likeWithIdOnly = await prisma.like.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends LikeUpdateManyAndReturnArgs>(args: SelectSubset<T, LikeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LikePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Like.
     * @param {LikeUpsertArgs} args - Arguments to update or create a Like.
     * @example
     * // Update or create a Like
     * const like = await prisma.like.upsert({
     *   create: {
     *     // ... data to create a Like
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Like we want to update
     *   }
     * })
     */
    upsert<T extends LikeUpsertArgs>(args: SelectSubset<T, LikeUpsertArgs<ExtArgs>>): Prisma__LikeClient<$Result.GetResult<Prisma.$LikePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Likes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LikeCountArgs} args - Arguments to filter Likes to count.
     * @example
     * // Count the number of Likes
     * const count = await prisma.like.count({
     *   where: {
     *     // ... the filter for the Likes we want to count
     *   }
     * })
    **/
    count<T extends LikeCountArgs>(
      args?: Subset<T, LikeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LikeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Like.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LikeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LikeAggregateArgs>(args: Subset<T, LikeAggregateArgs>): Prisma.PrismaPromise<GetLikeAggregateType<T>>

    /**
     * Group by Like.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LikeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LikeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LikeGroupByArgs['orderBy'] }
        : { orderBy?: LikeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LikeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLikeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Like model
   */
  readonly fields: LikeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Like.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LikeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    post<T extends PostDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PostDefaultArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    profile<T extends ProfileDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProfileDefaultArgs<ExtArgs>>): Prisma__ProfileClient<$Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Like model
   */
  interface LikeFieldRefs {
    readonly id: FieldRef<"Like", 'String'>
    readonly postId: FieldRef<"Like", 'String'>
    readonly profileId: FieldRef<"Like", 'String'>
    readonly createdAt: FieldRef<"Like", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Like findUnique
   */
  export type LikeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Like
     */
    select?: LikeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Like
     */
    omit?: LikeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LikeInclude<ExtArgs> | null
    /**
     * Filter, which Like to fetch.
     */
    where: LikeWhereUniqueInput
  }

  /**
   * Like findUniqueOrThrow
   */
  export type LikeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Like
     */
    select?: LikeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Like
     */
    omit?: LikeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LikeInclude<ExtArgs> | null
    /**
     * Filter, which Like to fetch.
     */
    where: LikeWhereUniqueInput
  }

  /**
   * Like findFirst
   */
  export type LikeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Like
     */
    select?: LikeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Like
     */
    omit?: LikeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LikeInclude<ExtArgs> | null
    /**
     * Filter, which Like to fetch.
     */
    where?: LikeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Likes to fetch.
     */
    orderBy?: LikeOrderByWithRelationInput | LikeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Likes.
     */
    cursor?: LikeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Likes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Likes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Likes.
     */
    distinct?: LikeScalarFieldEnum | LikeScalarFieldEnum[]
  }

  /**
   * Like findFirstOrThrow
   */
  export type LikeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Like
     */
    select?: LikeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Like
     */
    omit?: LikeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LikeInclude<ExtArgs> | null
    /**
     * Filter, which Like to fetch.
     */
    where?: LikeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Likes to fetch.
     */
    orderBy?: LikeOrderByWithRelationInput | LikeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Likes.
     */
    cursor?: LikeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Likes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Likes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Likes.
     */
    distinct?: LikeScalarFieldEnum | LikeScalarFieldEnum[]
  }

  /**
   * Like findMany
   */
  export type LikeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Like
     */
    select?: LikeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Like
     */
    omit?: LikeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LikeInclude<ExtArgs> | null
    /**
     * Filter, which Likes to fetch.
     */
    where?: LikeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Likes to fetch.
     */
    orderBy?: LikeOrderByWithRelationInput | LikeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Likes.
     */
    cursor?: LikeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Likes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Likes.
     */
    skip?: number
    distinct?: LikeScalarFieldEnum | LikeScalarFieldEnum[]
  }

  /**
   * Like create
   */
  export type LikeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Like
     */
    select?: LikeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Like
     */
    omit?: LikeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LikeInclude<ExtArgs> | null
    /**
     * The data needed to create a Like.
     */
    data: XOR<LikeCreateInput, LikeUncheckedCreateInput>
  }

  /**
   * Like createMany
   */
  export type LikeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Likes.
     */
    data: LikeCreateManyInput | LikeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Like createManyAndReturn
   */
  export type LikeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Like
     */
    select?: LikeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Like
     */
    omit?: LikeOmit<ExtArgs> | null
    /**
     * The data used to create many Likes.
     */
    data: LikeCreateManyInput | LikeCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LikeIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Like update
   */
  export type LikeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Like
     */
    select?: LikeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Like
     */
    omit?: LikeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LikeInclude<ExtArgs> | null
    /**
     * The data needed to update a Like.
     */
    data: XOR<LikeUpdateInput, LikeUncheckedUpdateInput>
    /**
     * Choose, which Like to update.
     */
    where: LikeWhereUniqueInput
  }

  /**
   * Like updateMany
   */
  export type LikeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Likes.
     */
    data: XOR<LikeUpdateManyMutationInput, LikeUncheckedUpdateManyInput>
    /**
     * Filter which Likes to update
     */
    where?: LikeWhereInput
    /**
     * Limit how many Likes to update.
     */
    limit?: number
  }

  /**
   * Like updateManyAndReturn
   */
  export type LikeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Like
     */
    select?: LikeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Like
     */
    omit?: LikeOmit<ExtArgs> | null
    /**
     * The data used to update Likes.
     */
    data: XOR<LikeUpdateManyMutationInput, LikeUncheckedUpdateManyInput>
    /**
     * Filter which Likes to update
     */
    where?: LikeWhereInput
    /**
     * Limit how many Likes to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LikeIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Like upsert
   */
  export type LikeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Like
     */
    select?: LikeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Like
     */
    omit?: LikeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LikeInclude<ExtArgs> | null
    /**
     * The filter to search for the Like to update in case it exists.
     */
    where: LikeWhereUniqueInput
    /**
     * In case the Like found by the `where` argument doesn't exist, create a new Like with this data.
     */
    create: XOR<LikeCreateInput, LikeUncheckedCreateInput>
    /**
     * In case the Like was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LikeUpdateInput, LikeUncheckedUpdateInput>
  }

  /**
   * Like delete
   */
  export type LikeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Like
     */
    select?: LikeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Like
     */
    omit?: LikeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LikeInclude<ExtArgs> | null
    /**
     * Filter which Like to delete.
     */
    where: LikeWhereUniqueInput
  }

  /**
   * Like deleteMany
   */
  export type LikeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Likes to delete
     */
    where?: LikeWhereInput
    /**
     * Limit how many Likes to delete.
     */
    limit?: number
  }

  /**
   * Like without action
   */
  export type LikeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Like
     */
    select?: LikeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Like
     */
    omit?: LikeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LikeInclude<ExtArgs> | null
  }


  /**
   * Model Follow
   */

  export type AggregateFollow = {
    _count: FollowCountAggregateOutputType | null
    _min: FollowMinAggregateOutputType | null
    _max: FollowMaxAggregateOutputType | null
  }

  export type FollowMinAggregateOutputType = {
    id: string | null
    followerId: string | null
    followingId: string | null
    createdAt: Date | null
  }

  export type FollowMaxAggregateOutputType = {
    id: string | null
    followerId: string | null
    followingId: string | null
    createdAt: Date | null
  }

  export type FollowCountAggregateOutputType = {
    id: number
    followerId: number
    followingId: number
    createdAt: number
    _all: number
  }


  export type FollowMinAggregateInputType = {
    id?: true
    followerId?: true
    followingId?: true
    createdAt?: true
  }

  export type FollowMaxAggregateInputType = {
    id?: true
    followerId?: true
    followingId?: true
    createdAt?: true
  }

  export type FollowCountAggregateInputType = {
    id?: true
    followerId?: true
    followingId?: true
    createdAt?: true
    _all?: true
  }

  export type FollowAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Follow to aggregate.
     */
    where?: FollowWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Follows to fetch.
     */
    orderBy?: FollowOrderByWithRelationInput | FollowOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FollowWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Follows from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Follows.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Follows
    **/
    _count?: true | FollowCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FollowMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FollowMaxAggregateInputType
  }

  export type GetFollowAggregateType<T extends FollowAggregateArgs> = {
        [P in keyof T & keyof AggregateFollow]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFollow[P]>
      : GetScalarType<T[P], AggregateFollow[P]>
  }




  export type FollowGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FollowWhereInput
    orderBy?: FollowOrderByWithAggregationInput | FollowOrderByWithAggregationInput[]
    by: FollowScalarFieldEnum[] | FollowScalarFieldEnum
    having?: FollowScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FollowCountAggregateInputType | true
    _min?: FollowMinAggregateInputType
    _max?: FollowMaxAggregateInputType
  }

  export type FollowGroupByOutputType = {
    id: string
    followerId: string
    followingId: string
    createdAt: Date
    _count: FollowCountAggregateOutputType | null
    _min: FollowMinAggregateOutputType | null
    _max: FollowMaxAggregateOutputType | null
  }

  type GetFollowGroupByPayload<T extends FollowGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FollowGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FollowGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FollowGroupByOutputType[P]>
            : GetScalarType<T[P], FollowGroupByOutputType[P]>
        }
      >
    >


  export type FollowSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    followerId?: boolean
    followingId?: boolean
    createdAt?: boolean
    follower?: boolean | ProfileDefaultArgs<ExtArgs>
    following?: boolean | ProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["follow"]>

  export type FollowSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    followerId?: boolean
    followingId?: boolean
    createdAt?: boolean
    follower?: boolean | ProfileDefaultArgs<ExtArgs>
    following?: boolean | ProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["follow"]>

  export type FollowSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    followerId?: boolean
    followingId?: boolean
    createdAt?: boolean
    follower?: boolean | ProfileDefaultArgs<ExtArgs>
    following?: boolean | ProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["follow"]>

  export type FollowSelectScalar = {
    id?: boolean
    followerId?: boolean
    followingId?: boolean
    createdAt?: boolean
  }

  export type FollowOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "followerId" | "followingId" | "createdAt", ExtArgs["result"]["follow"]>
  export type FollowInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    follower?: boolean | ProfileDefaultArgs<ExtArgs>
    following?: boolean | ProfileDefaultArgs<ExtArgs>
  }
  export type FollowIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    follower?: boolean | ProfileDefaultArgs<ExtArgs>
    following?: boolean | ProfileDefaultArgs<ExtArgs>
  }
  export type FollowIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    follower?: boolean | ProfileDefaultArgs<ExtArgs>
    following?: boolean | ProfileDefaultArgs<ExtArgs>
  }

  export type $FollowPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Follow"
    objects: {
      follower: Prisma.$ProfilePayload<ExtArgs>
      following: Prisma.$ProfilePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      followerId: string
      followingId: string
      createdAt: Date
    }, ExtArgs["result"]["follow"]>
    composites: {}
  }

  type FollowGetPayload<S extends boolean | null | undefined | FollowDefaultArgs> = $Result.GetResult<Prisma.$FollowPayload, S>

  type FollowCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FollowFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: FollowCountAggregateInputType | true
    }

  export interface FollowDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Follow'], meta: { name: 'Follow' } }
    /**
     * Find zero or one Follow that matches the filter.
     * @param {FollowFindUniqueArgs} args - Arguments to find a Follow
     * @example
     * // Get one Follow
     * const follow = await prisma.follow.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FollowFindUniqueArgs>(args: SelectSubset<T, FollowFindUniqueArgs<ExtArgs>>): Prisma__FollowClient<$Result.GetResult<Prisma.$FollowPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Follow that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FollowFindUniqueOrThrowArgs} args - Arguments to find a Follow
     * @example
     * // Get one Follow
     * const follow = await prisma.follow.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FollowFindUniqueOrThrowArgs>(args: SelectSubset<T, FollowFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FollowClient<$Result.GetResult<Prisma.$FollowPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Follow that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowFindFirstArgs} args - Arguments to find a Follow
     * @example
     * // Get one Follow
     * const follow = await prisma.follow.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FollowFindFirstArgs>(args?: SelectSubset<T, FollowFindFirstArgs<ExtArgs>>): Prisma__FollowClient<$Result.GetResult<Prisma.$FollowPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Follow that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowFindFirstOrThrowArgs} args - Arguments to find a Follow
     * @example
     * // Get one Follow
     * const follow = await prisma.follow.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FollowFindFirstOrThrowArgs>(args?: SelectSubset<T, FollowFindFirstOrThrowArgs<ExtArgs>>): Prisma__FollowClient<$Result.GetResult<Prisma.$FollowPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Follows that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Follows
     * const follows = await prisma.follow.findMany()
     * 
     * // Get first 10 Follows
     * const follows = await prisma.follow.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const followWithIdOnly = await prisma.follow.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FollowFindManyArgs>(args?: SelectSubset<T, FollowFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FollowPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Follow.
     * @param {FollowCreateArgs} args - Arguments to create a Follow.
     * @example
     * // Create one Follow
     * const Follow = await prisma.follow.create({
     *   data: {
     *     // ... data to create a Follow
     *   }
     * })
     * 
     */
    create<T extends FollowCreateArgs>(args: SelectSubset<T, FollowCreateArgs<ExtArgs>>): Prisma__FollowClient<$Result.GetResult<Prisma.$FollowPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Follows.
     * @param {FollowCreateManyArgs} args - Arguments to create many Follows.
     * @example
     * // Create many Follows
     * const follow = await prisma.follow.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FollowCreateManyArgs>(args?: SelectSubset<T, FollowCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Follows and returns the data saved in the database.
     * @param {FollowCreateManyAndReturnArgs} args - Arguments to create many Follows.
     * @example
     * // Create many Follows
     * const follow = await prisma.follow.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Follows and only return the `id`
     * const followWithIdOnly = await prisma.follow.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FollowCreateManyAndReturnArgs>(args?: SelectSubset<T, FollowCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FollowPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Follow.
     * @param {FollowDeleteArgs} args - Arguments to delete one Follow.
     * @example
     * // Delete one Follow
     * const Follow = await prisma.follow.delete({
     *   where: {
     *     // ... filter to delete one Follow
     *   }
     * })
     * 
     */
    delete<T extends FollowDeleteArgs>(args: SelectSubset<T, FollowDeleteArgs<ExtArgs>>): Prisma__FollowClient<$Result.GetResult<Prisma.$FollowPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Follow.
     * @param {FollowUpdateArgs} args - Arguments to update one Follow.
     * @example
     * // Update one Follow
     * const follow = await prisma.follow.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FollowUpdateArgs>(args: SelectSubset<T, FollowUpdateArgs<ExtArgs>>): Prisma__FollowClient<$Result.GetResult<Prisma.$FollowPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Follows.
     * @param {FollowDeleteManyArgs} args - Arguments to filter Follows to delete.
     * @example
     * // Delete a few Follows
     * const { count } = await prisma.follow.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FollowDeleteManyArgs>(args?: SelectSubset<T, FollowDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Follows.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Follows
     * const follow = await prisma.follow.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FollowUpdateManyArgs>(args: SelectSubset<T, FollowUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Follows and returns the data updated in the database.
     * @param {FollowUpdateManyAndReturnArgs} args - Arguments to update many Follows.
     * @example
     * // Update many Follows
     * const follow = await prisma.follow.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Follows and only return the `id`
     * const followWithIdOnly = await prisma.follow.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends FollowUpdateManyAndReturnArgs>(args: SelectSubset<T, FollowUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FollowPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Follow.
     * @param {FollowUpsertArgs} args - Arguments to update or create a Follow.
     * @example
     * // Update or create a Follow
     * const follow = await prisma.follow.upsert({
     *   create: {
     *     // ... data to create a Follow
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Follow we want to update
     *   }
     * })
     */
    upsert<T extends FollowUpsertArgs>(args: SelectSubset<T, FollowUpsertArgs<ExtArgs>>): Prisma__FollowClient<$Result.GetResult<Prisma.$FollowPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Follows.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowCountArgs} args - Arguments to filter Follows to count.
     * @example
     * // Count the number of Follows
     * const count = await prisma.follow.count({
     *   where: {
     *     // ... the filter for the Follows we want to count
     *   }
     * })
    **/
    count<T extends FollowCountArgs>(
      args?: Subset<T, FollowCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FollowCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Follow.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FollowAggregateArgs>(args: Subset<T, FollowAggregateArgs>): Prisma.PrismaPromise<GetFollowAggregateType<T>>

    /**
     * Group by Follow.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FollowGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FollowGroupByArgs['orderBy'] }
        : { orderBy?: FollowGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FollowGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFollowGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Follow model
   */
  readonly fields: FollowFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Follow.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FollowClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    follower<T extends ProfileDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProfileDefaultArgs<ExtArgs>>): Prisma__ProfileClient<$Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    following<T extends ProfileDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProfileDefaultArgs<ExtArgs>>): Prisma__ProfileClient<$Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Follow model
   */
  interface FollowFieldRefs {
    readonly id: FieldRef<"Follow", 'String'>
    readonly followerId: FieldRef<"Follow", 'String'>
    readonly followingId: FieldRef<"Follow", 'String'>
    readonly createdAt: FieldRef<"Follow", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Follow findUnique
   */
  export type FollowFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Follow
     */
    select?: FollowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Follow
     */
    omit?: FollowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowInclude<ExtArgs> | null
    /**
     * Filter, which Follow to fetch.
     */
    where: FollowWhereUniqueInput
  }

  /**
   * Follow findUniqueOrThrow
   */
  export type FollowFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Follow
     */
    select?: FollowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Follow
     */
    omit?: FollowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowInclude<ExtArgs> | null
    /**
     * Filter, which Follow to fetch.
     */
    where: FollowWhereUniqueInput
  }

  /**
   * Follow findFirst
   */
  export type FollowFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Follow
     */
    select?: FollowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Follow
     */
    omit?: FollowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowInclude<ExtArgs> | null
    /**
     * Filter, which Follow to fetch.
     */
    where?: FollowWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Follows to fetch.
     */
    orderBy?: FollowOrderByWithRelationInput | FollowOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Follows.
     */
    cursor?: FollowWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Follows from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Follows.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Follows.
     */
    distinct?: FollowScalarFieldEnum | FollowScalarFieldEnum[]
  }

  /**
   * Follow findFirstOrThrow
   */
  export type FollowFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Follow
     */
    select?: FollowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Follow
     */
    omit?: FollowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowInclude<ExtArgs> | null
    /**
     * Filter, which Follow to fetch.
     */
    where?: FollowWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Follows to fetch.
     */
    orderBy?: FollowOrderByWithRelationInput | FollowOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Follows.
     */
    cursor?: FollowWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Follows from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Follows.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Follows.
     */
    distinct?: FollowScalarFieldEnum | FollowScalarFieldEnum[]
  }

  /**
   * Follow findMany
   */
  export type FollowFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Follow
     */
    select?: FollowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Follow
     */
    omit?: FollowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowInclude<ExtArgs> | null
    /**
     * Filter, which Follows to fetch.
     */
    where?: FollowWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Follows to fetch.
     */
    orderBy?: FollowOrderByWithRelationInput | FollowOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Follows.
     */
    cursor?: FollowWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Follows from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Follows.
     */
    skip?: number
    distinct?: FollowScalarFieldEnum | FollowScalarFieldEnum[]
  }

  /**
   * Follow create
   */
  export type FollowCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Follow
     */
    select?: FollowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Follow
     */
    omit?: FollowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowInclude<ExtArgs> | null
    /**
     * The data needed to create a Follow.
     */
    data: XOR<FollowCreateInput, FollowUncheckedCreateInput>
  }

  /**
   * Follow createMany
   */
  export type FollowCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Follows.
     */
    data: FollowCreateManyInput | FollowCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Follow createManyAndReturn
   */
  export type FollowCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Follow
     */
    select?: FollowSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Follow
     */
    omit?: FollowOmit<ExtArgs> | null
    /**
     * The data used to create many Follows.
     */
    data: FollowCreateManyInput | FollowCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Follow update
   */
  export type FollowUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Follow
     */
    select?: FollowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Follow
     */
    omit?: FollowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowInclude<ExtArgs> | null
    /**
     * The data needed to update a Follow.
     */
    data: XOR<FollowUpdateInput, FollowUncheckedUpdateInput>
    /**
     * Choose, which Follow to update.
     */
    where: FollowWhereUniqueInput
  }

  /**
   * Follow updateMany
   */
  export type FollowUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Follows.
     */
    data: XOR<FollowUpdateManyMutationInput, FollowUncheckedUpdateManyInput>
    /**
     * Filter which Follows to update
     */
    where?: FollowWhereInput
    /**
     * Limit how many Follows to update.
     */
    limit?: number
  }

  /**
   * Follow updateManyAndReturn
   */
  export type FollowUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Follow
     */
    select?: FollowSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Follow
     */
    omit?: FollowOmit<ExtArgs> | null
    /**
     * The data used to update Follows.
     */
    data: XOR<FollowUpdateManyMutationInput, FollowUncheckedUpdateManyInput>
    /**
     * Filter which Follows to update
     */
    where?: FollowWhereInput
    /**
     * Limit how many Follows to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Follow upsert
   */
  export type FollowUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Follow
     */
    select?: FollowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Follow
     */
    omit?: FollowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowInclude<ExtArgs> | null
    /**
     * The filter to search for the Follow to update in case it exists.
     */
    where: FollowWhereUniqueInput
    /**
     * In case the Follow found by the `where` argument doesn't exist, create a new Follow with this data.
     */
    create: XOR<FollowCreateInput, FollowUncheckedCreateInput>
    /**
     * In case the Follow was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FollowUpdateInput, FollowUncheckedUpdateInput>
  }

  /**
   * Follow delete
   */
  export type FollowDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Follow
     */
    select?: FollowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Follow
     */
    omit?: FollowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowInclude<ExtArgs> | null
    /**
     * Filter which Follow to delete.
     */
    where: FollowWhereUniqueInput
  }

  /**
   * Follow deleteMany
   */
  export type FollowDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Follows to delete
     */
    where?: FollowWhereInput
    /**
     * Limit how many Follows to delete.
     */
    limit?: number
  }

  /**
   * Follow without action
   */
  export type FollowDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Follow
     */
    select?: FollowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Follow
     */
    omit?: FollowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowInclude<ExtArgs> | null
  }


  /**
   * Model NFT
   */

  export type AggregateNFT = {
    _count: NFTCountAggregateOutputType | null
    _min: NFTMinAggregateOutputType | null
    _max: NFTMaxAggregateOutputType | null
  }

  export type NFTMinAggregateOutputType = {
    id: string | null
    profileId: string | null
    postId: string | null
    objectId: string | null
    packageId: string | null
    moduleId: string | null
    type: $Enums.NFTType | null
    name: string | null
    description: string | null
    imageUrl: string | null
    metadataUri: string | null
    isListed: boolean | null
    price: string | null
    createdAt: Date | null
  }

  export type NFTMaxAggregateOutputType = {
    id: string | null
    profileId: string | null
    postId: string | null
    objectId: string | null
    packageId: string | null
    moduleId: string | null
    type: $Enums.NFTType | null
    name: string | null
    description: string | null
    imageUrl: string | null
    metadataUri: string | null
    isListed: boolean | null
    price: string | null
    createdAt: Date | null
  }

  export type NFTCountAggregateOutputType = {
    id: number
    profileId: number
    postId: number
    objectId: number
    packageId: number
    moduleId: number
    type: number
    name: number
    description: number
    imageUrl: number
    metadataUri: number
    isListed: number
    price: number
    createdAt: number
    _all: number
  }


  export type NFTMinAggregateInputType = {
    id?: true
    profileId?: true
    postId?: true
    objectId?: true
    packageId?: true
    moduleId?: true
    type?: true
    name?: true
    description?: true
    imageUrl?: true
    metadataUri?: true
    isListed?: true
    price?: true
    createdAt?: true
  }

  export type NFTMaxAggregateInputType = {
    id?: true
    profileId?: true
    postId?: true
    objectId?: true
    packageId?: true
    moduleId?: true
    type?: true
    name?: true
    description?: true
    imageUrl?: true
    metadataUri?: true
    isListed?: true
    price?: true
    createdAt?: true
  }

  export type NFTCountAggregateInputType = {
    id?: true
    profileId?: true
    postId?: true
    objectId?: true
    packageId?: true
    moduleId?: true
    type?: true
    name?: true
    description?: true
    imageUrl?: true
    metadataUri?: true
    isListed?: true
    price?: true
    createdAt?: true
    _all?: true
  }

  export type NFTAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which NFT to aggregate.
     */
    where?: NFTWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NFTS to fetch.
     */
    orderBy?: NFTOrderByWithRelationInput | NFTOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: NFTWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NFTS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NFTS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned NFTS
    **/
    _count?: true | NFTCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: NFTMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: NFTMaxAggregateInputType
  }

  export type GetNFTAggregateType<T extends NFTAggregateArgs> = {
        [P in keyof T & keyof AggregateNFT]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateNFT[P]>
      : GetScalarType<T[P], AggregateNFT[P]>
  }




  export type NFTGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NFTWhereInput
    orderBy?: NFTOrderByWithAggregationInput | NFTOrderByWithAggregationInput[]
    by: NFTScalarFieldEnum[] | NFTScalarFieldEnum
    having?: NFTScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: NFTCountAggregateInputType | true
    _min?: NFTMinAggregateInputType
    _max?: NFTMaxAggregateInputType
  }

  export type NFTGroupByOutputType = {
    id: string
    profileId: string
    postId: string | null
    objectId: string
    packageId: string
    moduleId: string
    type: $Enums.NFTType
    name: string
    description: string | null
    imageUrl: string
    metadataUri: string
    isListed: boolean
    price: string | null
    createdAt: Date
    _count: NFTCountAggregateOutputType | null
    _min: NFTMinAggregateOutputType | null
    _max: NFTMaxAggregateOutputType | null
  }

  type GetNFTGroupByPayload<T extends NFTGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<NFTGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof NFTGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], NFTGroupByOutputType[P]>
            : GetScalarType<T[P], NFTGroupByOutputType[P]>
        }
      >
    >


  export type NFTSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    profileId?: boolean
    postId?: boolean
    objectId?: boolean
    packageId?: boolean
    moduleId?: boolean
    type?: boolean
    name?: boolean
    description?: boolean
    imageUrl?: boolean
    metadataUri?: boolean
    isListed?: boolean
    price?: boolean
    createdAt?: boolean
    profile?: boolean | ProfileDefaultArgs<ExtArgs>
    post?: boolean | NFT$postArgs<ExtArgs>
  }, ExtArgs["result"]["nFT"]>

  export type NFTSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    profileId?: boolean
    postId?: boolean
    objectId?: boolean
    packageId?: boolean
    moduleId?: boolean
    type?: boolean
    name?: boolean
    description?: boolean
    imageUrl?: boolean
    metadataUri?: boolean
    isListed?: boolean
    price?: boolean
    createdAt?: boolean
    profile?: boolean | ProfileDefaultArgs<ExtArgs>
    post?: boolean | NFT$postArgs<ExtArgs>
  }, ExtArgs["result"]["nFT"]>

  export type NFTSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    profileId?: boolean
    postId?: boolean
    objectId?: boolean
    packageId?: boolean
    moduleId?: boolean
    type?: boolean
    name?: boolean
    description?: boolean
    imageUrl?: boolean
    metadataUri?: boolean
    isListed?: boolean
    price?: boolean
    createdAt?: boolean
    profile?: boolean | ProfileDefaultArgs<ExtArgs>
    post?: boolean | NFT$postArgs<ExtArgs>
  }, ExtArgs["result"]["nFT"]>

  export type NFTSelectScalar = {
    id?: boolean
    profileId?: boolean
    postId?: boolean
    objectId?: boolean
    packageId?: boolean
    moduleId?: boolean
    type?: boolean
    name?: boolean
    description?: boolean
    imageUrl?: boolean
    metadataUri?: boolean
    isListed?: boolean
    price?: boolean
    createdAt?: boolean
  }

  export type NFTOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "profileId" | "postId" | "objectId" | "packageId" | "moduleId" | "type" | "name" | "description" | "imageUrl" | "metadataUri" | "isListed" | "price" | "createdAt", ExtArgs["result"]["nFT"]>
  export type NFTInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    profile?: boolean | ProfileDefaultArgs<ExtArgs>
    post?: boolean | NFT$postArgs<ExtArgs>
  }
  export type NFTIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    profile?: boolean | ProfileDefaultArgs<ExtArgs>
    post?: boolean | NFT$postArgs<ExtArgs>
  }
  export type NFTIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    profile?: boolean | ProfileDefaultArgs<ExtArgs>
    post?: boolean | NFT$postArgs<ExtArgs>
  }

  export type $NFTPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "NFT"
    objects: {
      profile: Prisma.$ProfilePayload<ExtArgs>
      post: Prisma.$PostPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      profileId: string
      postId: string | null
      objectId: string
      packageId: string
      moduleId: string
      type: $Enums.NFTType
      name: string
      description: string | null
      imageUrl: string
      metadataUri: string
      isListed: boolean
      price: string | null
      createdAt: Date
    }, ExtArgs["result"]["nFT"]>
    composites: {}
  }

  type NFTGetPayload<S extends boolean | null | undefined | NFTDefaultArgs> = $Result.GetResult<Prisma.$NFTPayload, S>

  type NFTCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<NFTFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: NFTCountAggregateInputType | true
    }

  export interface NFTDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['NFT'], meta: { name: 'NFT' } }
    /**
     * Find zero or one NFT that matches the filter.
     * @param {NFTFindUniqueArgs} args - Arguments to find a NFT
     * @example
     * // Get one NFT
     * const nFT = await prisma.nFT.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends NFTFindUniqueArgs>(args: SelectSubset<T, NFTFindUniqueArgs<ExtArgs>>): Prisma__NFTClient<$Result.GetResult<Prisma.$NFTPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one NFT that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {NFTFindUniqueOrThrowArgs} args - Arguments to find a NFT
     * @example
     * // Get one NFT
     * const nFT = await prisma.nFT.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends NFTFindUniqueOrThrowArgs>(args: SelectSubset<T, NFTFindUniqueOrThrowArgs<ExtArgs>>): Prisma__NFTClient<$Result.GetResult<Prisma.$NFTPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first NFT that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NFTFindFirstArgs} args - Arguments to find a NFT
     * @example
     * // Get one NFT
     * const nFT = await prisma.nFT.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends NFTFindFirstArgs>(args?: SelectSubset<T, NFTFindFirstArgs<ExtArgs>>): Prisma__NFTClient<$Result.GetResult<Prisma.$NFTPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first NFT that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NFTFindFirstOrThrowArgs} args - Arguments to find a NFT
     * @example
     * // Get one NFT
     * const nFT = await prisma.nFT.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends NFTFindFirstOrThrowArgs>(args?: SelectSubset<T, NFTFindFirstOrThrowArgs<ExtArgs>>): Prisma__NFTClient<$Result.GetResult<Prisma.$NFTPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more NFTS that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NFTFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all NFTS
     * const nFTS = await prisma.nFT.findMany()
     * 
     * // Get first 10 NFTS
     * const nFTS = await prisma.nFT.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const nFTWithIdOnly = await prisma.nFT.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends NFTFindManyArgs>(args?: SelectSubset<T, NFTFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NFTPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a NFT.
     * @param {NFTCreateArgs} args - Arguments to create a NFT.
     * @example
     * // Create one NFT
     * const NFT = await prisma.nFT.create({
     *   data: {
     *     // ... data to create a NFT
     *   }
     * })
     * 
     */
    create<T extends NFTCreateArgs>(args: SelectSubset<T, NFTCreateArgs<ExtArgs>>): Prisma__NFTClient<$Result.GetResult<Prisma.$NFTPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many NFTS.
     * @param {NFTCreateManyArgs} args - Arguments to create many NFTS.
     * @example
     * // Create many NFTS
     * const nFT = await prisma.nFT.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends NFTCreateManyArgs>(args?: SelectSubset<T, NFTCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many NFTS and returns the data saved in the database.
     * @param {NFTCreateManyAndReturnArgs} args - Arguments to create many NFTS.
     * @example
     * // Create many NFTS
     * const nFT = await prisma.nFT.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many NFTS and only return the `id`
     * const nFTWithIdOnly = await prisma.nFT.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends NFTCreateManyAndReturnArgs>(args?: SelectSubset<T, NFTCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NFTPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a NFT.
     * @param {NFTDeleteArgs} args - Arguments to delete one NFT.
     * @example
     * // Delete one NFT
     * const NFT = await prisma.nFT.delete({
     *   where: {
     *     // ... filter to delete one NFT
     *   }
     * })
     * 
     */
    delete<T extends NFTDeleteArgs>(args: SelectSubset<T, NFTDeleteArgs<ExtArgs>>): Prisma__NFTClient<$Result.GetResult<Prisma.$NFTPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one NFT.
     * @param {NFTUpdateArgs} args - Arguments to update one NFT.
     * @example
     * // Update one NFT
     * const nFT = await prisma.nFT.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends NFTUpdateArgs>(args: SelectSubset<T, NFTUpdateArgs<ExtArgs>>): Prisma__NFTClient<$Result.GetResult<Prisma.$NFTPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more NFTS.
     * @param {NFTDeleteManyArgs} args - Arguments to filter NFTS to delete.
     * @example
     * // Delete a few NFTS
     * const { count } = await prisma.nFT.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends NFTDeleteManyArgs>(args?: SelectSubset<T, NFTDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more NFTS.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NFTUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many NFTS
     * const nFT = await prisma.nFT.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends NFTUpdateManyArgs>(args: SelectSubset<T, NFTUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more NFTS and returns the data updated in the database.
     * @param {NFTUpdateManyAndReturnArgs} args - Arguments to update many NFTS.
     * @example
     * // Update many NFTS
     * const nFT = await prisma.nFT.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more NFTS and only return the `id`
     * const nFTWithIdOnly = await prisma.nFT.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends NFTUpdateManyAndReturnArgs>(args: SelectSubset<T, NFTUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NFTPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one NFT.
     * @param {NFTUpsertArgs} args - Arguments to update or create a NFT.
     * @example
     * // Update or create a NFT
     * const nFT = await prisma.nFT.upsert({
     *   create: {
     *     // ... data to create a NFT
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the NFT we want to update
     *   }
     * })
     */
    upsert<T extends NFTUpsertArgs>(args: SelectSubset<T, NFTUpsertArgs<ExtArgs>>): Prisma__NFTClient<$Result.GetResult<Prisma.$NFTPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of NFTS.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NFTCountArgs} args - Arguments to filter NFTS to count.
     * @example
     * // Count the number of NFTS
     * const count = await prisma.nFT.count({
     *   where: {
     *     // ... the filter for the NFTS we want to count
     *   }
     * })
    **/
    count<T extends NFTCountArgs>(
      args?: Subset<T, NFTCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], NFTCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a NFT.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NFTAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends NFTAggregateArgs>(args: Subset<T, NFTAggregateArgs>): Prisma.PrismaPromise<GetNFTAggregateType<T>>

    /**
     * Group by NFT.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NFTGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends NFTGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: NFTGroupByArgs['orderBy'] }
        : { orderBy?: NFTGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, NFTGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetNFTGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the NFT model
   */
  readonly fields: NFTFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for NFT.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__NFTClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    profile<T extends ProfileDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProfileDefaultArgs<ExtArgs>>): Prisma__ProfileClient<$Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    post<T extends NFT$postArgs<ExtArgs> = {}>(args?: Subset<T, NFT$postArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the NFT model
   */
  interface NFTFieldRefs {
    readonly id: FieldRef<"NFT", 'String'>
    readonly profileId: FieldRef<"NFT", 'String'>
    readonly postId: FieldRef<"NFT", 'String'>
    readonly objectId: FieldRef<"NFT", 'String'>
    readonly packageId: FieldRef<"NFT", 'String'>
    readonly moduleId: FieldRef<"NFT", 'String'>
    readonly type: FieldRef<"NFT", 'NFTType'>
    readonly name: FieldRef<"NFT", 'String'>
    readonly description: FieldRef<"NFT", 'String'>
    readonly imageUrl: FieldRef<"NFT", 'String'>
    readonly metadataUri: FieldRef<"NFT", 'String'>
    readonly isListed: FieldRef<"NFT", 'Boolean'>
    readonly price: FieldRef<"NFT", 'String'>
    readonly createdAt: FieldRef<"NFT", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * NFT findUnique
   */
  export type NFTFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NFT
     */
    select?: NFTSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NFT
     */
    omit?: NFTOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NFTInclude<ExtArgs> | null
    /**
     * Filter, which NFT to fetch.
     */
    where: NFTWhereUniqueInput
  }

  /**
   * NFT findUniqueOrThrow
   */
  export type NFTFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NFT
     */
    select?: NFTSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NFT
     */
    omit?: NFTOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NFTInclude<ExtArgs> | null
    /**
     * Filter, which NFT to fetch.
     */
    where: NFTWhereUniqueInput
  }

  /**
   * NFT findFirst
   */
  export type NFTFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NFT
     */
    select?: NFTSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NFT
     */
    omit?: NFTOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NFTInclude<ExtArgs> | null
    /**
     * Filter, which NFT to fetch.
     */
    where?: NFTWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NFTS to fetch.
     */
    orderBy?: NFTOrderByWithRelationInput | NFTOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for NFTS.
     */
    cursor?: NFTWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NFTS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NFTS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NFTS.
     */
    distinct?: NFTScalarFieldEnum | NFTScalarFieldEnum[]
  }

  /**
   * NFT findFirstOrThrow
   */
  export type NFTFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NFT
     */
    select?: NFTSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NFT
     */
    omit?: NFTOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NFTInclude<ExtArgs> | null
    /**
     * Filter, which NFT to fetch.
     */
    where?: NFTWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NFTS to fetch.
     */
    orderBy?: NFTOrderByWithRelationInput | NFTOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for NFTS.
     */
    cursor?: NFTWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NFTS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NFTS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NFTS.
     */
    distinct?: NFTScalarFieldEnum | NFTScalarFieldEnum[]
  }

  /**
   * NFT findMany
   */
  export type NFTFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NFT
     */
    select?: NFTSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NFT
     */
    omit?: NFTOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NFTInclude<ExtArgs> | null
    /**
     * Filter, which NFTS to fetch.
     */
    where?: NFTWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NFTS to fetch.
     */
    orderBy?: NFTOrderByWithRelationInput | NFTOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing NFTS.
     */
    cursor?: NFTWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NFTS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NFTS.
     */
    skip?: number
    distinct?: NFTScalarFieldEnum | NFTScalarFieldEnum[]
  }

  /**
   * NFT create
   */
  export type NFTCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NFT
     */
    select?: NFTSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NFT
     */
    omit?: NFTOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NFTInclude<ExtArgs> | null
    /**
     * The data needed to create a NFT.
     */
    data: XOR<NFTCreateInput, NFTUncheckedCreateInput>
  }

  /**
   * NFT createMany
   */
  export type NFTCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many NFTS.
     */
    data: NFTCreateManyInput | NFTCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * NFT createManyAndReturn
   */
  export type NFTCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NFT
     */
    select?: NFTSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the NFT
     */
    omit?: NFTOmit<ExtArgs> | null
    /**
     * The data used to create many NFTS.
     */
    data: NFTCreateManyInput | NFTCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NFTIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * NFT update
   */
  export type NFTUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NFT
     */
    select?: NFTSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NFT
     */
    omit?: NFTOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NFTInclude<ExtArgs> | null
    /**
     * The data needed to update a NFT.
     */
    data: XOR<NFTUpdateInput, NFTUncheckedUpdateInput>
    /**
     * Choose, which NFT to update.
     */
    where: NFTWhereUniqueInput
  }

  /**
   * NFT updateMany
   */
  export type NFTUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update NFTS.
     */
    data: XOR<NFTUpdateManyMutationInput, NFTUncheckedUpdateManyInput>
    /**
     * Filter which NFTS to update
     */
    where?: NFTWhereInput
    /**
     * Limit how many NFTS to update.
     */
    limit?: number
  }

  /**
   * NFT updateManyAndReturn
   */
  export type NFTUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NFT
     */
    select?: NFTSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the NFT
     */
    omit?: NFTOmit<ExtArgs> | null
    /**
     * The data used to update NFTS.
     */
    data: XOR<NFTUpdateManyMutationInput, NFTUncheckedUpdateManyInput>
    /**
     * Filter which NFTS to update
     */
    where?: NFTWhereInput
    /**
     * Limit how many NFTS to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NFTIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * NFT upsert
   */
  export type NFTUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NFT
     */
    select?: NFTSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NFT
     */
    omit?: NFTOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NFTInclude<ExtArgs> | null
    /**
     * The filter to search for the NFT to update in case it exists.
     */
    where: NFTWhereUniqueInput
    /**
     * In case the NFT found by the `where` argument doesn't exist, create a new NFT with this data.
     */
    create: XOR<NFTCreateInput, NFTUncheckedCreateInput>
    /**
     * In case the NFT was found with the provided `where` argument, update it with this data.
     */
    update: XOR<NFTUpdateInput, NFTUncheckedUpdateInput>
  }

  /**
   * NFT delete
   */
  export type NFTDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NFT
     */
    select?: NFTSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NFT
     */
    omit?: NFTOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NFTInclude<ExtArgs> | null
    /**
     * Filter which NFT to delete.
     */
    where: NFTWhereUniqueInput
  }

  /**
   * NFT deleteMany
   */
  export type NFTDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which NFTS to delete
     */
    where?: NFTWhereInput
    /**
     * Limit how many NFTS to delete.
     */
    limit?: number
  }

  /**
   * NFT.post
   */
  export type NFT$postArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    where?: PostWhereInput
  }

  /**
   * NFT without action
   */
  export type NFTDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NFT
     */
    select?: NFTSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NFT
     */
    omit?: NFTOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NFTInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const AuthUserScalarFieldEnum: {
    id: 'id',
    name: 'name',
    email: 'email',
    emailVerified: 'emailVerified',
    image: 'image',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AuthUserScalarFieldEnum = (typeof AuthUserScalarFieldEnum)[keyof typeof AuthUserScalarFieldEnum]


  export const SessionScalarFieldEnum: {
    id: 'id',
    expiresAt: 'expiresAt',
    token: 'token',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    ipAddress: 'ipAddress',
    userAgent: 'userAgent',
    userId: 'userId'
  };

  export type SessionScalarFieldEnum = (typeof SessionScalarFieldEnum)[keyof typeof SessionScalarFieldEnum]


  export const AuthAccountScalarFieldEnum: {
    id: 'id',
    accountId: 'accountId',
    providerId: 'providerId',
    userId: 'userId',
    accessToken: 'accessToken',
    refreshToken: 'refreshToken',
    idToken: 'idToken',
    accessTokenExpiresAt: 'accessTokenExpiresAt',
    refreshTokenExpiresAt: 'refreshTokenExpiresAt',
    scope: 'scope',
    password: 'password',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AuthAccountScalarFieldEnum = (typeof AuthAccountScalarFieldEnum)[keyof typeof AuthAccountScalarFieldEnum]


  export const VerificationScalarFieldEnum: {
    id: 'id',
    identifier: 'identifier',
    value: 'value',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type VerificationScalarFieldEnum = (typeof VerificationScalarFieldEnum)[keyof typeof VerificationScalarFieldEnum]


  export const AccountScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    lastActiveAt: 'lastActiveAt',
    authUserId: 'authUserId',
    email: 'email',
    walletAddress: 'walletAddress',
    isBanned: 'isBanned',
    identityTier: 'identityTier',
    identityVerifiedAt: 'identityVerifiedAt'
  };

  export type AccountScalarFieldEnum = (typeof AccountScalarFieldEnum)[keyof typeof AccountScalarFieldEnum]


  export const ProfileScalarFieldEnum: {
    id: 'id',
    handle: 'handle',
    displayName: 'displayName',
    bio: 'bio',
    avatar: 'avatar',
    type: 'type',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    isBanned: 'isBanned',
    reportCount: 'reportCount',
    isVerified: 'isVerified',
    reputation: 'reputation'
  };

  export type ProfileScalarFieldEnum = (typeof ProfileScalarFieldEnum)[keyof typeof ProfileScalarFieldEnum]


  export const ProfileMemberScalarFieldEnum: {
    id: 'id',
    accountId: 'accountId',
    profileId: 'profileId',
    role: 'role',
    createdAt: 'createdAt'
  };

  export type ProfileMemberScalarFieldEnum = (typeof ProfileMemberScalarFieldEnum)[keyof typeof ProfileMemberScalarFieldEnum]


  export const IdentityCheckScalarFieldEnum: {
    id: 'id',
    accountId: 'accountId',
    provider: 'provider',
    externalId: 'externalId',
    tier: 'tier',
    status: 'status',
    initiatedAt: 'initiatedAt',
    resolvedAt: 'resolvedAt',
    expiresAt: 'expiresAt',
    providerPayload: 'providerPayload'
  };

  export type IdentityCheckScalarFieldEnum = (typeof IdentityCheckScalarFieldEnum)[keyof typeof IdentityCheckScalarFieldEnum]


  export const PostScalarFieldEnum: {
    id: 'id',
    profileId: 'profileId',
    content: 'content',
    mediaUrls: 'mediaUrls',
    mediaType: 'mediaType',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    likesCount: 'likesCount',
    commentsCount: 'commentsCount',
    isHidden: 'isHidden',
    reportCount: 'reportCount'
  };

  export type PostScalarFieldEnum = (typeof PostScalarFieldEnum)[keyof typeof PostScalarFieldEnum]


  export const CommentScalarFieldEnum: {
    id: 'id',
    postId: 'postId',
    profileId: 'profileId',
    content: 'content',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    isHidden: 'isHidden'
  };

  export type CommentScalarFieldEnum = (typeof CommentScalarFieldEnum)[keyof typeof CommentScalarFieldEnum]


  export const LikeScalarFieldEnum: {
    id: 'id',
    postId: 'postId',
    profileId: 'profileId',
    createdAt: 'createdAt'
  };

  export type LikeScalarFieldEnum = (typeof LikeScalarFieldEnum)[keyof typeof LikeScalarFieldEnum]


  export const FollowScalarFieldEnum: {
    id: 'id',
    followerId: 'followerId',
    followingId: 'followingId',
    createdAt: 'createdAt'
  };

  export type FollowScalarFieldEnum = (typeof FollowScalarFieldEnum)[keyof typeof FollowScalarFieldEnum]


  export const NFTScalarFieldEnum: {
    id: 'id',
    profileId: 'profileId',
    postId: 'postId',
    objectId: 'objectId',
    packageId: 'packageId',
    moduleId: 'moduleId',
    type: 'type',
    name: 'name',
    description: 'description',
    imageUrl: 'imageUrl',
    metadataUri: 'metadataUri',
    isListed: 'isListed',
    price: 'price',
    createdAt: 'createdAt'
  };

  export type NFTScalarFieldEnum = (typeof NFTScalarFieldEnum)[keyof typeof NFTScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'IdentityTier'
   */
  export type EnumIdentityTierFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'IdentityTier'>
    


  /**
   * Reference to a field of type 'IdentityTier[]'
   */
  export type ListEnumIdentityTierFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'IdentityTier[]'>
    


  /**
   * Reference to a field of type 'ProfileType'
   */
  export type EnumProfileTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ProfileType'>
    


  /**
   * Reference to a field of type 'ProfileType[]'
   */
  export type ListEnumProfileTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ProfileType[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'ProfileRole'
   */
  export type EnumProfileRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ProfileRole'>
    


  /**
   * Reference to a field of type 'ProfileRole[]'
   */
  export type ListEnumProfileRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ProfileRole[]'>
    


  /**
   * Reference to a field of type 'IdentityCheckStatus'
   */
  export type EnumIdentityCheckStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'IdentityCheckStatus'>
    


  /**
   * Reference to a field of type 'IdentityCheckStatus[]'
   */
  export type ListEnumIdentityCheckStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'IdentityCheckStatus[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'MediaType'
   */
  export type EnumMediaTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MediaType'>
    


  /**
   * Reference to a field of type 'MediaType[]'
   */
  export type ListEnumMediaTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MediaType[]'>
    


  /**
   * Reference to a field of type 'NFTType'
   */
  export type EnumNFTTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'NFTType'>
    


  /**
   * Reference to a field of type 'NFTType[]'
   */
  export type ListEnumNFTTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'NFTType[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type AuthUserWhereInput = {
    AND?: AuthUserWhereInput | AuthUserWhereInput[]
    OR?: AuthUserWhereInput[]
    NOT?: AuthUserWhereInput | AuthUserWhereInput[]
    id?: StringFilter<"AuthUser"> | string
    name?: StringFilter<"AuthUser"> | string
    email?: StringFilter<"AuthUser"> | string
    emailVerified?: BoolFilter<"AuthUser"> | boolean
    image?: StringNullableFilter<"AuthUser"> | string | null
    createdAt?: DateTimeFilter<"AuthUser"> | Date | string
    updatedAt?: DateTimeFilter<"AuthUser"> | Date | string
    sessions?: SessionListRelationFilter
    accounts?: AuthAccountListRelationFilter
    domainAccount?: XOR<AccountNullableScalarRelationFilter, AccountWhereInput> | null
  }

  export type AuthUserOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    emailVerified?: SortOrder
    image?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    sessions?: SessionOrderByRelationAggregateInput
    accounts?: AuthAccountOrderByRelationAggregateInput
    domainAccount?: AccountOrderByWithRelationInput
  }

  export type AuthUserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: AuthUserWhereInput | AuthUserWhereInput[]
    OR?: AuthUserWhereInput[]
    NOT?: AuthUserWhereInput | AuthUserWhereInput[]
    name?: StringFilter<"AuthUser"> | string
    emailVerified?: BoolFilter<"AuthUser"> | boolean
    image?: StringNullableFilter<"AuthUser"> | string | null
    createdAt?: DateTimeFilter<"AuthUser"> | Date | string
    updatedAt?: DateTimeFilter<"AuthUser"> | Date | string
    sessions?: SessionListRelationFilter
    accounts?: AuthAccountListRelationFilter
    domainAccount?: XOR<AccountNullableScalarRelationFilter, AccountWhereInput> | null
  }, "id" | "email">

  export type AuthUserOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    emailVerified?: SortOrder
    image?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AuthUserCountOrderByAggregateInput
    _max?: AuthUserMaxOrderByAggregateInput
    _min?: AuthUserMinOrderByAggregateInput
  }

  export type AuthUserScalarWhereWithAggregatesInput = {
    AND?: AuthUserScalarWhereWithAggregatesInput | AuthUserScalarWhereWithAggregatesInput[]
    OR?: AuthUserScalarWhereWithAggregatesInput[]
    NOT?: AuthUserScalarWhereWithAggregatesInput | AuthUserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AuthUser"> | string
    name?: StringWithAggregatesFilter<"AuthUser"> | string
    email?: StringWithAggregatesFilter<"AuthUser"> | string
    emailVerified?: BoolWithAggregatesFilter<"AuthUser"> | boolean
    image?: StringNullableWithAggregatesFilter<"AuthUser"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"AuthUser"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"AuthUser"> | Date | string
  }

  export type SessionWhereInput = {
    AND?: SessionWhereInput | SessionWhereInput[]
    OR?: SessionWhereInput[]
    NOT?: SessionWhereInput | SessionWhereInput[]
    id?: StringFilter<"Session"> | string
    expiresAt?: DateTimeFilter<"Session"> | Date | string
    token?: StringFilter<"Session"> | string
    createdAt?: DateTimeFilter<"Session"> | Date | string
    updatedAt?: DateTimeFilter<"Session"> | Date | string
    ipAddress?: StringNullableFilter<"Session"> | string | null
    userAgent?: StringNullableFilter<"Session"> | string | null
    userId?: StringFilter<"Session"> | string
    user?: XOR<AuthUserScalarRelationFilter, AuthUserWhereInput>
  }

  export type SessionOrderByWithRelationInput = {
    id?: SortOrder
    expiresAt?: SortOrder
    token?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    ipAddress?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    userId?: SortOrder
    user?: AuthUserOrderByWithRelationInput
  }

  export type SessionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    token?: string
    AND?: SessionWhereInput | SessionWhereInput[]
    OR?: SessionWhereInput[]
    NOT?: SessionWhereInput | SessionWhereInput[]
    expiresAt?: DateTimeFilter<"Session"> | Date | string
    createdAt?: DateTimeFilter<"Session"> | Date | string
    updatedAt?: DateTimeFilter<"Session"> | Date | string
    ipAddress?: StringNullableFilter<"Session"> | string | null
    userAgent?: StringNullableFilter<"Session"> | string | null
    userId?: StringFilter<"Session"> | string
    user?: XOR<AuthUserScalarRelationFilter, AuthUserWhereInput>
  }, "id" | "token">

  export type SessionOrderByWithAggregationInput = {
    id?: SortOrder
    expiresAt?: SortOrder
    token?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    ipAddress?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    userId?: SortOrder
    _count?: SessionCountOrderByAggregateInput
    _max?: SessionMaxOrderByAggregateInput
    _min?: SessionMinOrderByAggregateInput
  }

  export type SessionScalarWhereWithAggregatesInput = {
    AND?: SessionScalarWhereWithAggregatesInput | SessionScalarWhereWithAggregatesInput[]
    OR?: SessionScalarWhereWithAggregatesInput[]
    NOT?: SessionScalarWhereWithAggregatesInput | SessionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Session"> | string
    expiresAt?: DateTimeWithAggregatesFilter<"Session"> | Date | string
    token?: StringWithAggregatesFilter<"Session"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Session"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Session"> | Date | string
    ipAddress?: StringNullableWithAggregatesFilter<"Session"> | string | null
    userAgent?: StringNullableWithAggregatesFilter<"Session"> | string | null
    userId?: StringWithAggregatesFilter<"Session"> | string
  }

  export type AuthAccountWhereInput = {
    AND?: AuthAccountWhereInput | AuthAccountWhereInput[]
    OR?: AuthAccountWhereInput[]
    NOT?: AuthAccountWhereInput | AuthAccountWhereInput[]
    id?: StringFilter<"AuthAccount"> | string
    accountId?: StringFilter<"AuthAccount"> | string
    providerId?: StringFilter<"AuthAccount"> | string
    userId?: StringFilter<"AuthAccount"> | string
    accessToken?: StringNullableFilter<"AuthAccount"> | string | null
    refreshToken?: StringNullableFilter<"AuthAccount"> | string | null
    idToken?: StringNullableFilter<"AuthAccount"> | string | null
    accessTokenExpiresAt?: DateTimeNullableFilter<"AuthAccount"> | Date | string | null
    refreshTokenExpiresAt?: DateTimeNullableFilter<"AuthAccount"> | Date | string | null
    scope?: StringNullableFilter<"AuthAccount"> | string | null
    password?: StringNullableFilter<"AuthAccount"> | string | null
    createdAt?: DateTimeFilter<"AuthAccount"> | Date | string
    updatedAt?: DateTimeFilter<"AuthAccount"> | Date | string
    user?: XOR<AuthUserScalarRelationFilter, AuthUserWhereInput>
  }

  export type AuthAccountOrderByWithRelationInput = {
    id?: SortOrder
    accountId?: SortOrder
    providerId?: SortOrder
    userId?: SortOrder
    accessToken?: SortOrderInput | SortOrder
    refreshToken?: SortOrderInput | SortOrder
    idToken?: SortOrderInput | SortOrder
    accessTokenExpiresAt?: SortOrderInput | SortOrder
    refreshTokenExpiresAt?: SortOrderInput | SortOrder
    scope?: SortOrderInput | SortOrder
    password?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: AuthUserOrderByWithRelationInput
  }

  export type AuthAccountWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    providerId_accountId?: AuthAccountProviderIdAccountIdCompoundUniqueInput
    AND?: AuthAccountWhereInput | AuthAccountWhereInput[]
    OR?: AuthAccountWhereInput[]
    NOT?: AuthAccountWhereInput | AuthAccountWhereInput[]
    accountId?: StringFilter<"AuthAccount"> | string
    providerId?: StringFilter<"AuthAccount"> | string
    userId?: StringFilter<"AuthAccount"> | string
    accessToken?: StringNullableFilter<"AuthAccount"> | string | null
    refreshToken?: StringNullableFilter<"AuthAccount"> | string | null
    idToken?: StringNullableFilter<"AuthAccount"> | string | null
    accessTokenExpiresAt?: DateTimeNullableFilter<"AuthAccount"> | Date | string | null
    refreshTokenExpiresAt?: DateTimeNullableFilter<"AuthAccount"> | Date | string | null
    scope?: StringNullableFilter<"AuthAccount"> | string | null
    password?: StringNullableFilter<"AuthAccount"> | string | null
    createdAt?: DateTimeFilter<"AuthAccount"> | Date | string
    updatedAt?: DateTimeFilter<"AuthAccount"> | Date | string
    user?: XOR<AuthUserScalarRelationFilter, AuthUserWhereInput>
  }, "id" | "providerId_accountId">

  export type AuthAccountOrderByWithAggregationInput = {
    id?: SortOrder
    accountId?: SortOrder
    providerId?: SortOrder
    userId?: SortOrder
    accessToken?: SortOrderInput | SortOrder
    refreshToken?: SortOrderInput | SortOrder
    idToken?: SortOrderInput | SortOrder
    accessTokenExpiresAt?: SortOrderInput | SortOrder
    refreshTokenExpiresAt?: SortOrderInput | SortOrder
    scope?: SortOrderInput | SortOrder
    password?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AuthAccountCountOrderByAggregateInput
    _max?: AuthAccountMaxOrderByAggregateInput
    _min?: AuthAccountMinOrderByAggregateInput
  }

  export type AuthAccountScalarWhereWithAggregatesInput = {
    AND?: AuthAccountScalarWhereWithAggregatesInput | AuthAccountScalarWhereWithAggregatesInput[]
    OR?: AuthAccountScalarWhereWithAggregatesInput[]
    NOT?: AuthAccountScalarWhereWithAggregatesInput | AuthAccountScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AuthAccount"> | string
    accountId?: StringWithAggregatesFilter<"AuthAccount"> | string
    providerId?: StringWithAggregatesFilter<"AuthAccount"> | string
    userId?: StringWithAggregatesFilter<"AuthAccount"> | string
    accessToken?: StringNullableWithAggregatesFilter<"AuthAccount"> | string | null
    refreshToken?: StringNullableWithAggregatesFilter<"AuthAccount"> | string | null
    idToken?: StringNullableWithAggregatesFilter<"AuthAccount"> | string | null
    accessTokenExpiresAt?: DateTimeNullableWithAggregatesFilter<"AuthAccount"> | Date | string | null
    refreshTokenExpiresAt?: DateTimeNullableWithAggregatesFilter<"AuthAccount"> | Date | string | null
    scope?: StringNullableWithAggregatesFilter<"AuthAccount"> | string | null
    password?: StringNullableWithAggregatesFilter<"AuthAccount"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"AuthAccount"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"AuthAccount"> | Date | string
  }

  export type VerificationWhereInput = {
    AND?: VerificationWhereInput | VerificationWhereInput[]
    OR?: VerificationWhereInput[]
    NOT?: VerificationWhereInput | VerificationWhereInput[]
    id?: StringFilter<"Verification"> | string
    identifier?: StringFilter<"Verification"> | string
    value?: StringFilter<"Verification"> | string
    expiresAt?: DateTimeFilter<"Verification"> | Date | string
    createdAt?: DateTimeFilter<"Verification"> | Date | string
    updatedAt?: DateTimeFilter<"Verification"> | Date | string
  }

  export type VerificationOrderByWithRelationInput = {
    id?: SortOrder
    identifier?: SortOrder
    value?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VerificationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: VerificationWhereInput | VerificationWhereInput[]
    OR?: VerificationWhereInput[]
    NOT?: VerificationWhereInput | VerificationWhereInput[]
    identifier?: StringFilter<"Verification"> | string
    value?: StringFilter<"Verification"> | string
    expiresAt?: DateTimeFilter<"Verification"> | Date | string
    createdAt?: DateTimeFilter<"Verification"> | Date | string
    updatedAt?: DateTimeFilter<"Verification"> | Date | string
  }, "id">

  export type VerificationOrderByWithAggregationInput = {
    id?: SortOrder
    identifier?: SortOrder
    value?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: VerificationCountOrderByAggregateInput
    _max?: VerificationMaxOrderByAggregateInput
    _min?: VerificationMinOrderByAggregateInput
  }

  export type VerificationScalarWhereWithAggregatesInput = {
    AND?: VerificationScalarWhereWithAggregatesInput | VerificationScalarWhereWithAggregatesInput[]
    OR?: VerificationScalarWhereWithAggregatesInput[]
    NOT?: VerificationScalarWhereWithAggregatesInput | VerificationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Verification"> | string
    identifier?: StringWithAggregatesFilter<"Verification"> | string
    value?: StringWithAggregatesFilter<"Verification"> | string
    expiresAt?: DateTimeWithAggregatesFilter<"Verification"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"Verification"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Verification"> | Date | string
  }

  export type AccountWhereInput = {
    AND?: AccountWhereInput | AccountWhereInput[]
    OR?: AccountWhereInput[]
    NOT?: AccountWhereInput | AccountWhereInput[]
    id?: StringFilter<"Account"> | string
    createdAt?: DateTimeFilter<"Account"> | Date | string
    updatedAt?: DateTimeFilter<"Account"> | Date | string
    lastActiveAt?: DateTimeFilter<"Account"> | Date | string
    authUserId?: StringFilter<"Account"> | string
    email?: StringNullableFilter<"Account"> | string | null
    walletAddress?: StringNullableFilter<"Account"> | string | null
    isBanned?: BoolFilter<"Account"> | boolean
    identityTier?: EnumIdentityTierFilter<"Account"> | $Enums.IdentityTier
    identityVerifiedAt?: DateTimeNullableFilter<"Account"> | Date | string | null
    authUser?: XOR<AuthUserScalarRelationFilter, AuthUserWhereInput>
    profiles?: ProfileMemberListRelationFilter
    identityChecks?: IdentityCheckListRelationFilter
  }

  export type AccountOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastActiveAt?: SortOrder
    authUserId?: SortOrder
    email?: SortOrderInput | SortOrder
    walletAddress?: SortOrderInput | SortOrder
    isBanned?: SortOrder
    identityTier?: SortOrder
    identityVerifiedAt?: SortOrderInput | SortOrder
    authUser?: AuthUserOrderByWithRelationInput
    profiles?: ProfileMemberOrderByRelationAggregateInput
    identityChecks?: IdentityCheckOrderByRelationAggregateInput
  }

  export type AccountWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    authUserId?: string
    email?: string
    walletAddress?: string
    AND?: AccountWhereInput | AccountWhereInput[]
    OR?: AccountWhereInput[]
    NOT?: AccountWhereInput | AccountWhereInput[]
    createdAt?: DateTimeFilter<"Account"> | Date | string
    updatedAt?: DateTimeFilter<"Account"> | Date | string
    lastActiveAt?: DateTimeFilter<"Account"> | Date | string
    isBanned?: BoolFilter<"Account"> | boolean
    identityTier?: EnumIdentityTierFilter<"Account"> | $Enums.IdentityTier
    identityVerifiedAt?: DateTimeNullableFilter<"Account"> | Date | string | null
    authUser?: XOR<AuthUserScalarRelationFilter, AuthUserWhereInput>
    profiles?: ProfileMemberListRelationFilter
    identityChecks?: IdentityCheckListRelationFilter
  }, "id" | "authUserId" | "email" | "walletAddress">

  export type AccountOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastActiveAt?: SortOrder
    authUserId?: SortOrder
    email?: SortOrderInput | SortOrder
    walletAddress?: SortOrderInput | SortOrder
    isBanned?: SortOrder
    identityTier?: SortOrder
    identityVerifiedAt?: SortOrderInput | SortOrder
    _count?: AccountCountOrderByAggregateInput
    _max?: AccountMaxOrderByAggregateInput
    _min?: AccountMinOrderByAggregateInput
  }

  export type AccountScalarWhereWithAggregatesInput = {
    AND?: AccountScalarWhereWithAggregatesInput | AccountScalarWhereWithAggregatesInput[]
    OR?: AccountScalarWhereWithAggregatesInput[]
    NOT?: AccountScalarWhereWithAggregatesInput | AccountScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Account"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Account"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Account"> | Date | string
    lastActiveAt?: DateTimeWithAggregatesFilter<"Account"> | Date | string
    authUserId?: StringWithAggregatesFilter<"Account"> | string
    email?: StringNullableWithAggregatesFilter<"Account"> | string | null
    walletAddress?: StringNullableWithAggregatesFilter<"Account"> | string | null
    isBanned?: BoolWithAggregatesFilter<"Account"> | boolean
    identityTier?: EnumIdentityTierWithAggregatesFilter<"Account"> | $Enums.IdentityTier
    identityVerifiedAt?: DateTimeNullableWithAggregatesFilter<"Account"> | Date | string | null
  }

  export type ProfileWhereInput = {
    AND?: ProfileWhereInput | ProfileWhereInput[]
    OR?: ProfileWhereInput[]
    NOT?: ProfileWhereInput | ProfileWhereInput[]
    id?: StringFilter<"Profile"> | string
    handle?: StringFilter<"Profile"> | string
    displayName?: StringFilter<"Profile"> | string
    bio?: StringNullableFilter<"Profile"> | string | null
    avatar?: StringNullableFilter<"Profile"> | string | null
    type?: EnumProfileTypeFilter<"Profile"> | $Enums.ProfileType
    createdAt?: DateTimeFilter<"Profile"> | Date | string
    updatedAt?: DateTimeFilter<"Profile"> | Date | string
    isBanned?: BoolFilter<"Profile"> | boolean
    reportCount?: IntFilter<"Profile"> | number
    isVerified?: BoolFilter<"Profile"> | boolean
    reputation?: IntFilter<"Profile"> | number
    members?: ProfileMemberListRelationFilter
    posts?: PostListRelationFilter
    comments?: CommentListRelationFilter
    likes?: LikeListRelationFilter
    nfts?: NFTListRelationFilter
    follows?: FollowListRelationFilter
    followers?: FollowListRelationFilter
  }

  export type ProfileOrderByWithRelationInput = {
    id?: SortOrder
    handle?: SortOrder
    displayName?: SortOrder
    bio?: SortOrderInput | SortOrder
    avatar?: SortOrderInput | SortOrder
    type?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    isBanned?: SortOrder
    reportCount?: SortOrder
    isVerified?: SortOrder
    reputation?: SortOrder
    members?: ProfileMemberOrderByRelationAggregateInput
    posts?: PostOrderByRelationAggregateInput
    comments?: CommentOrderByRelationAggregateInput
    likes?: LikeOrderByRelationAggregateInput
    nfts?: NFTOrderByRelationAggregateInput
    follows?: FollowOrderByRelationAggregateInput
    followers?: FollowOrderByRelationAggregateInput
  }

  export type ProfileWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    handle?: string
    AND?: ProfileWhereInput | ProfileWhereInput[]
    OR?: ProfileWhereInput[]
    NOT?: ProfileWhereInput | ProfileWhereInput[]
    displayName?: StringFilter<"Profile"> | string
    bio?: StringNullableFilter<"Profile"> | string | null
    avatar?: StringNullableFilter<"Profile"> | string | null
    type?: EnumProfileTypeFilter<"Profile"> | $Enums.ProfileType
    createdAt?: DateTimeFilter<"Profile"> | Date | string
    updatedAt?: DateTimeFilter<"Profile"> | Date | string
    isBanned?: BoolFilter<"Profile"> | boolean
    reportCount?: IntFilter<"Profile"> | number
    isVerified?: BoolFilter<"Profile"> | boolean
    reputation?: IntFilter<"Profile"> | number
    members?: ProfileMemberListRelationFilter
    posts?: PostListRelationFilter
    comments?: CommentListRelationFilter
    likes?: LikeListRelationFilter
    nfts?: NFTListRelationFilter
    follows?: FollowListRelationFilter
    followers?: FollowListRelationFilter
  }, "id" | "handle">

  export type ProfileOrderByWithAggregationInput = {
    id?: SortOrder
    handle?: SortOrder
    displayName?: SortOrder
    bio?: SortOrderInput | SortOrder
    avatar?: SortOrderInput | SortOrder
    type?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    isBanned?: SortOrder
    reportCount?: SortOrder
    isVerified?: SortOrder
    reputation?: SortOrder
    _count?: ProfileCountOrderByAggregateInput
    _avg?: ProfileAvgOrderByAggregateInput
    _max?: ProfileMaxOrderByAggregateInput
    _min?: ProfileMinOrderByAggregateInput
    _sum?: ProfileSumOrderByAggregateInput
  }

  export type ProfileScalarWhereWithAggregatesInput = {
    AND?: ProfileScalarWhereWithAggregatesInput | ProfileScalarWhereWithAggregatesInput[]
    OR?: ProfileScalarWhereWithAggregatesInput[]
    NOT?: ProfileScalarWhereWithAggregatesInput | ProfileScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Profile"> | string
    handle?: StringWithAggregatesFilter<"Profile"> | string
    displayName?: StringWithAggregatesFilter<"Profile"> | string
    bio?: StringNullableWithAggregatesFilter<"Profile"> | string | null
    avatar?: StringNullableWithAggregatesFilter<"Profile"> | string | null
    type?: EnumProfileTypeWithAggregatesFilter<"Profile"> | $Enums.ProfileType
    createdAt?: DateTimeWithAggregatesFilter<"Profile"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Profile"> | Date | string
    isBanned?: BoolWithAggregatesFilter<"Profile"> | boolean
    reportCount?: IntWithAggregatesFilter<"Profile"> | number
    isVerified?: BoolWithAggregatesFilter<"Profile"> | boolean
    reputation?: IntWithAggregatesFilter<"Profile"> | number
  }

  export type ProfileMemberWhereInput = {
    AND?: ProfileMemberWhereInput | ProfileMemberWhereInput[]
    OR?: ProfileMemberWhereInput[]
    NOT?: ProfileMemberWhereInput | ProfileMemberWhereInput[]
    id?: StringFilter<"ProfileMember"> | string
    accountId?: StringFilter<"ProfileMember"> | string
    profileId?: StringFilter<"ProfileMember"> | string
    role?: EnumProfileRoleFilter<"ProfileMember"> | $Enums.ProfileRole
    createdAt?: DateTimeFilter<"ProfileMember"> | Date | string
    account?: XOR<AccountScalarRelationFilter, AccountWhereInput>
    profile?: XOR<ProfileScalarRelationFilter, ProfileWhereInput>
  }

  export type ProfileMemberOrderByWithRelationInput = {
    id?: SortOrder
    accountId?: SortOrder
    profileId?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    account?: AccountOrderByWithRelationInput
    profile?: ProfileOrderByWithRelationInput
  }

  export type ProfileMemberWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    accountId_profileId?: ProfileMemberAccountIdProfileIdCompoundUniqueInput
    AND?: ProfileMemberWhereInput | ProfileMemberWhereInput[]
    OR?: ProfileMemberWhereInput[]
    NOT?: ProfileMemberWhereInput | ProfileMemberWhereInput[]
    accountId?: StringFilter<"ProfileMember"> | string
    profileId?: StringFilter<"ProfileMember"> | string
    role?: EnumProfileRoleFilter<"ProfileMember"> | $Enums.ProfileRole
    createdAt?: DateTimeFilter<"ProfileMember"> | Date | string
    account?: XOR<AccountScalarRelationFilter, AccountWhereInput>
    profile?: XOR<ProfileScalarRelationFilter, ProfileWhereInput>
  }, "id" | "accountId_profileId">

  export type ProfileMemberOrderByWithAggregationInput = {
    id?: SortOrder
    accountId?: SortOrder
    profileId?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    _count?: ProfileMemberCountOrderByAggregateInput
    _max?: ProfileMemberMaxOrderByAggregateInput
    _min?: ProfileMemberMinOrderByAggregateInput
  }

  export type ProfileMemberScalarWhereWithAggregatesInput = {
    AND?: ProfileMemberScalarWhereWithAggregatesInput | ProfileMemberScalarWhereWithAggregatesInput[]
    OR?: ProfileMemberScalarWhereWithAggregatesInput[]
    NOT?: ProfileMemberScalarWhereWithAggregatesInput | ProfileMemberScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ProfileMember"> | string
    accountId?: StringWithAggregatesFilter<"ProfileMember"> | string
    profileId?: StringWithAggregatesFilter<"ProfileMember"> | string
    role?: EnumProfileRoleWithAggregatesFilter<"ProfileMember"> | $Enums.ProfileRole
    createdAt?: DateTimeWithAggregatesFilter<"ProfileMember"> | Date | string
  }

  export type IdentityCheckWhereInput = {
    AND?: IdentityCheckWhereInput | IdentityCheckWhereInput[]
    OR?: IdentityCheckWhereInput[]
    NOT?: IdentityCheckWhereInput | IdentityCheckWhereInput[]
    id?: StringFilter<"IdentityCheck"> | string
    accountId?: StringFilter<"IdentityCheck"> | string
    provider?: StringFilter<"IdentityCheck"> | string
    externalId?: StringFilter<"IdentityCheck"> | string
    tier?: EnumIdentityTierFilter<"IdentityCheck"> | $Enums.IdentityTier
    status?: EnumIdentityCheckStatusFilter<"IdentityCheck"> | $Enums.IdentityCheckStatus
    initiatedAt?: DateTimeFilter<"IdentityCheck"> | Date | string
    resolvedAt?: DateTimeNullableFilter<"IdentityCheck"> | Date | string | null
    expiresAt?: DateTimeNullableFilter<"IdentityCheck"> | Date | string | null
    providerPayload?: JsonNullableFilter<"IdentityCheck">
    account?: XOR<AccountScalarRelationFilter, AccountWhereInput>
  }

  export type IdentityCheckOrderByWithRelationInput = {
    id?: SortOrder
    accountId?: SortOrder
    provider?: SortOrder
    externalId?: SortOrder
    tier?: SortOrder
    status?: SortOrder
    initiatedAt?: SortOrder
    resolvedAt?: SortOrderInput | SortOrder
    expiresAt?: SortOrderInput | SortOrder
    providerPayload?: SortOrderInput | SortOrder
    account?: AccountOrderByWithRelationInput
  }

  export type IdentityCheckWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: IdentityCheckWhereInput | IdentityCheckWhereInput[]
    OR?: IdentityCheckWhereInput[]
    NOT?: IdentityCheckWhereInput | IdentityCheckWhereInput[]
    accountId?: StringFilter<"IdentityCheck"> | string
    provider?: StringFilter<"IdentityCheck"> | string
    externalId?: StringFilter<"IdentityCheck"> | string
    tier?: EnumIdentityTierFilter<"IdentityCheck"> | $Enums.IdentityTier
    status?: EnumIdentityCheckStatusFilter<"IdentityCheck"> | $Enums.IdentityCheckStatus
    initiatedAt?: DateTimeFilter<"IdentityCheck"> | Date | string
    resolvedAt?: DateTimeNullableFilter<"IdentityCheck"> | Date | string | null
    expiresAt?: DateTimeNullableFilter<"IdentityCheck"> | Date | string | null
    providerPayload?: JsonNullableFilter<"IdentityCheck">
    account?: XOR<AccountScalarRelationFilter, AccountWhereInput>
  }, "id">

  export type IdentityCheckOrderByWithAggregationInput = {
    id?: SortOrder
    accountId?: SortOrder
    provider?: SortOrder
    externalId?: SortOrder
    tier?: SortOrder
    status?: SortOrder
    initiatedAt?: SortOrder
    resolvedAt?: SortOrderInput | SortOrder
    expiresAt?: SortOrderInput | SortOrder
    providerPayload?: SortOrderInput | SortOrder
    _count?: IdentityCheckCountOrderByAggregateInput
    _max?: IdentityCheckMaxOrderByAggregateInput
    _min?: IdentityCheckMinOrderByAggregateInput
  }

  export type IdentityCheckScalarWhereWithAggregatesInput = {
    AND?: IdentityCheckScalarWhereWithAggregatesInput | IdentityCheckScalarWhereWithAggregatesInput[]
    OR?: IdentityCheckScalarWhereWithAggregatesInput[]
    NOT?: IdentityCheckScalarWhereWithAggregatesInput | IdentityCheckScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"IdentityCheck"> | string
    accountId?: StringWithAggregatesFilter<"IdentityCheck"> | string
    provider?: StringWithAggregatesFilter<"IdentityCheck"> | string
    externalId?: StringWithAggregatesFilter<"IdentityCheck"> | string
    tier?: EnumIdentityTierWithAggregatesFilter<"IdentityCheck"> | $Enums.IdentityTier
    status?: EnumIdentityCheckStatusWithAggregatesFilter<"IdentityCheck"> | $Enums.IdentityCheckStatus
    initiatedAt?: DateTimeWithAggregatesFilter<"IdentityCheck"> | Date | string
    resolvedAt?: DateTimeNullableWithAggregatesFilter<"IdentityCheck"> | Date | string | null
    expiresAt?: DateTimeNullableWithAggregatesFilter<"IdentityCheck"> | Date | string | null
    providerPayload?: JsonNullableWithAggregatesFilter<"IdentityCheck">
  }

  export type PostWhereInput = {
    AND?: PostWhereInput | PostWhereInput[]
    OR?: PostWhereInput[]
    NOT?: PostWhereInput | PostWhereInput[]
    id?: StringFilter<"Post"> | string
    profileId?: StringFilter<"Post"> | string
    content?: StringFilter<"Post"> | string
    mediaUrls?: StringNullableListFilter<"Post">
    mediaType?: EnumMediaTypeFilter<"Post"> | $Enums.MediaType
    createdAt?: DateTimeFilter<"Post"> | Date | string
    updatedAt?: DateTimeFilter<"Post"> | Date | string
    likesCount?: IntFilter<"Post"> | number
    commentsCount?: IntFilter<"Post"> | number
    isHidden?: BoolFilter<"Post"> | boolean
    reportCount?: IntFilter<"Post"> | number
    profile?: XOR<ProfileScalarRelationFilter, ProfileWhereInput>
    comments?: CommentListRelationFilter
    likes?: LikeListRelationFilter
    nft?: XOR<NFTNullableScalarRelationFilter, NFTWhereInput> | null
  }

  export type PostOrderByWithRelationInput = {
    id?: SortOrder
    profileId?: SortOrder
    content?: SortOrder
    mediaUrls?: SortOrder
    mediaType?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    likesCount?: SortOrder
    commentsCount?: SortOrder
    isHidden?: SortOrder
    reportCount?: SortOrder
    profile?: ProfileOrderByWithRelationInput
    comments?: CommentOrderByRelationAggregateInput
    likes?: LikeOrderByRelationAggregateInput
    nft?: NFTOrderByWithRelationInput
  }

  export type PostWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PostWhereInput | PostWhereInput[]
    OR?: PostWhereInput[]
    NOT?: PostWhereInput | PostWhereInput[]
    profileId?: StringFilter<"Post"> | string
    content?: StringFilter<"Post"> | string
    mediaUrls?: StringNullableListFilter<"Post">
    mediaType?: EnumMediaTypeFilter<"Post"> | $Enums.MediaType
    createdAt?: DateTimeFilter<"Post"> | Date | string
    updatedAt?: DateTimeFilter<"Post"> | Date | string
    likesCount?: IntFilter<"Post"> | number
    commentsCount?: IntFilter<"Post"> | number
    isHidden?: BoolFilter<"Post"> | boolean
    reportCount?: IntFilter<"Post"> | number
    profile?: XOR<ProfileScalarRelationFilter, ProfileWhereInput>
    comments?: CommentListRelationFilter
    likes?: LikeListRelationFilter
    nft?: XOR<NFTNullableScalarRelationFilter, NFTWhereInput> | null
  }, "id">

  export type PostOrderByWithAggregationInput = {
    id?: SortOrder
    profileId?: SortOrder
    content?: SortOrder
    mediaUrls?: SortOrder
    mediaType?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    likesCount?: SortOrder
    commentsCount?: SortOrder
    isHidden?: SortOrder
    reportCount?: SortOrder
    _count?: PostCountOrderByAggregateInput
    _avg?: PostAvgOrderByAggregateInput
    _max?: PostMaxOrderByAggregateInput
    _min?: PostMinOrderByAggregateInput
    _sum?: PostSumOrderByAggregateInput
  }

  export type PostScalarWhereWithAggregatesInput = {
    AND?: PostScalarWhereWithAggregatesInput | PostScalarWhereWithAggregatesInput[]
    OR?: PostScalarWhereWithAggregatesInput[]
    NOT?: PostScalarWhereWithAggregatesInput | PostScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Post"> | string
    profileId?: StringWithAggregatesFilter<"Post"> | string
    content?: StringWithAggregatesFilter<"Post"> | string
    mediaUrls?: StringNullableListFilter<"Post">
    mediaType?: EnumMediaTypeWithAggregatesFilter<"Post"> | $Enums.MediaType
    createdAt?: DateTimeWithAggregatesFilter<"Post"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Post"> | Date | string
    likesCount?: IntWithAggregatesFilter<"Post"> | number
    commentsCount?: IntWithAggregatesFilter<"Post"> | number
    isHidden?: BoolWithAggregatesFilter<"Post"> | boolean
    reportCount?: IntWithAggregatesFilter<"Post"> | number
  }

  export type CommentWhereInput = {
    AND?: CommentWhereInput | CommentWhereInput[]
    OR?: CommentWhereInput[]
    NOT?: CommentWhereInput | CommentWhereInput[]
    id?: StringFilter<"Comment"> | string
    postId?: StringFilter<"Comment"> | string
    profileId?: StringFilter<"Comment"> | string
    content?: StringFilter<"Comment"> | string
    createdAt?: DateTimeFilter<"Comment"> | Date | string
    updatedAt?: DateTimeFilter<"Comment"> | Date | string
    isHidden?: BoolFilter<"Comment"> | boolean
    post?: XOR<PostScalarRelationFilter, PostWhereInput>
    profile?: XOR<ProfileScalarRelationFilter, ProfileWhereInput>
  }

  export type CommentOrderByWithRelationInput = {
    id?: SortOrder
    postId?: SortOrder
    profileId?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    isHidden?: SortOrder
    post?: PostOrderByWithRelationInput
    profile?: ProfileOrderByWithRelationInput
  }

  export type CommentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CommentWhereInput | CommentWhereInput[]
    OR?: CommentWhereInput[]
    NOT?: CommentWhereInput | CommentWhereInput[]
    postId?: StringFilter<"Comment"> | string
    profileId?: StringFilter<"Comment"> | string
    content?: StringFilter<"Comment"> | string
    createdAt?: DateTimeFilter<"Comment"> | Date | string
    updatedAt?: DateTimeFilter<"Comment"> | Date | string
    isHidden?: BoolFilter<"Comment"> | boolean
    post?: XOR<PostScalarRelationFilter, PostWhereInput>
    profile?: XOR<ProfileScalarRelationFilter, ProfileWhereInput>
  }, "id">

  export type CommentOrderByWithAggregationInput = {
    id?: SortOrder
    postId?: SortOrder
    profileId?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    isHidden?: SortOrder
    _count?: CommentCountOrderByAggregateInput
    _max?: CommentMaxOrderByAggregateInput
    _min?: CommentMinOrderByAggregateInput
  }

  export type CommentScalarWhereWithAggregatesInput = {
    AND?: CommentScalarWhereWithAggregatesInput | CommentScalarWhereWithAggregatesInput[]
    OR?: CommentScalarWhereWithAggregatesInput[]
    NOT?: CommentScalarWhereWithAggregatesInput | CommentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Comment"> | string
    postId?: StringWithAggregatesFilter<"Comment"> | string
    profileId?: StringWithAggregatesFilter<"Comment"> | string
    content?: StringWithAggregatesFilter<"Comment"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Comment"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Comment"> | Date | string
    isHidden?: BoolWithAggregatesFilter<"Comment"> | boolean
  }

  export type LikeWhereInput = {
    AND?: LikeWhereInput | LikeWhereInput[]
    OR?: LikeWhereInput[]
    NOT?: LikeWhereInput | LikeWhereInput[]
    id?: StringFilter<"Like"> | string
    postId?: StringFilter<"Like"> | string
    profileId?: StringFilter<"Like"> | string
    createdAt?: DateTimeFilter<"Like"> | Date | string
    post?: XOR<PostScalarRelationFilter, PostWhereInput>
    profile?: XOR<ProfileScalarRelationFilter, ProfileWhereInput>
  }

  export type LikeOrderByWithRelationInput = {
    id?: SortOrder
    postId?: SortOrder
    profileId?: SortOrder
    createdAt?: SortOrder
    post?: PostOrderByWithRelationInput
    profile?: ProfileOrderByWithRelationInput
  }

  export type LikeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    postId_profileId?: LikePostIdProfileIdCompoundUniqueInput
    AND?: LikeWhereInput | LikeWhereInput[]
    OR?: LikeWhereInput[]
    NOT?: LikeWhereInput | LikeWhereInput[]
    postId?: StringFilter<"Like"> | string
    profileId?: StringFilter<"Like"> | string
    createdAt?: DateTimeFilter<"Like"> | Date | string
    post?: XOR<PostScalarRelationFilter, PostWhereInput>
    profile?: XOR<ProfileScalarRelationFilter, ProfileWhereInput>
  }, "id" | "postId_profileId">

  export type LikeOrderByWithAggregationInput = {
    id?: SortOrder
    postId?: SortOrder
    profileId?: SortOrder
    createdAt?: SortOrder
    _count?: LikeCountOrderByAggregateInput
    _max?: LikeMaxOrderByAggregateInput
    _min?: LikeMinOrderByAggregateInput
  }

  export type LikeScalarWhereWithAggregatesInput = {
    AND?: LikeScalarWhereWithAggregatesInput | LikeScalarWhereWithAggregatesInput[]
    OR?: LikeScalarWhereWithAggregatesInput[]
    NOT?: LikeScalarWhereWithAggregatesInput | LikeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Like"> | string
    postId?: StringWithAggregatesFilter<"Like"> | string
    profileId?: StringWithAggregatesFilter<"Like"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Like"> | Date | string
  }

  export type FollowWhereInput = {
    AND?: FollowWhereInput | FollowWhereInput[]
    OR?: FollowWhereInput[]
    NOT?: FollowWhereInput | FollowWhereInput[]
    id?: StringFilter<"Follow"> | string
    followerId?: StringFilter<"Follow"> | string
    followingId?: StringFilter<"Follow"> | string
    createdAt?: DateTimeFilter<"Follow"> | Date | string
    follower?: XOR<ProfileScalarRelationFilter, ProfileWhereInput>
    following?: XOR<ProfileScalarRelationFilter, ProfileWhereInput>
  }

  export type FollowOrderByWithRelationInput = {
    id?: SortOrder
    followerId?: SortOrder
    followingId?: SortOrder
    createdAt?: SortOrder
    follower?: ProfileOrderByWithRelationInput
    following?: ProfileOrderByWithRelationInput
  }

  export type FollowWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    followerId_followingId?: FollowFollowerIdFollowingIdCompoundUniqueInput
    AND?: FollowWhereInput | FollowWhereInput[]
    OR?: FollowWhereInput[]
    NOT?: FollowWhereInput | FollowWhereInput[]
    followerId?: StringFilter<"Follow"> | string
    followingId?: StringFilter<"Follow"> | string
    createdAt?: DateTimeFilter<"Follow"> | Date | string
    follower?: XOR<ProfileScalarRelationFilter, ProfileWhereInput>
    following?: XOR<ProfileScalarRelationFilter, ProfileWhereInput>
  }, "id" | "followerId_followingId">

  export type FollowOrderByWithAggregationInput = {
    id?: SortOrder
    followerId?: SortOrder
    followingId?: SortOrder
    createdAt?: SortOrder
    _count?: FollowCountOrderByAggregateInput
    _max?: FollowMaxOrderByAggregateInput
    _min?: FollowMinOrderByAggregateInput
  }

  export type FollowScalarWhereWithAggregatesInput = {
    AND?: FollowScalarWhereWithAggregatesInput | FollowScalarWhereWithAggregatesInput[]
    OR?: FollowScalarWhereWithAggregatesInput[]
    NOT?: FollowScalarWhereWithAggregatesInput | FollowScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Follow"> | string
    followerId?: StringWithAggregatesFilter<"Follow"> | string
    followingId?: StringWithAggregatesFilter<"Follow"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Follow"> | Date | string
  }

  export type NFTWhereInput = {
    AND?: NFTWhereInput | NFTWhereInput[]
    OR?: NFTWhereInput[]
    NOT?: NFTWhereInput | NFTWhereInput[]
    id?: StringFilter<"NFT"> | string
    profileId?: StringFilter<"NFT"> | string
    postId?: StringNullableFilter<"NFT"> | string | null
    objectId?: StringFilter<"NFT"> | string
    packageId?: StringFilter<"NFT"> | string
    moduleId?: StringFilter<"NFT"> | string
    type?: EnumNFTTypeFilter<"NFT"> | $Enums.NFTType
    name?: StringFilter<"NFT"> | string
    description?: StringNullableFilter<"NFT"> | string | null
    imageUrl?: StringFilter<"NFT"> | string
    metadataUri?: StringFilter<"NFT"> | string
    isListed?: BoolFilter<"NFT"> | boolean
    price?: StringNullableFilter<"NFT"> | string | null
    createdAt?: DateTimeFilter<"NFT"> | Date | string
    profile?: XOR<ProfileScalarRelationFilter, ProfileWhereInput>
    post?: XOR<PostNullableScalarRelationFilter, PostWhereInput> | null
  }

  export type NFTOrderByWithRelationInput = {
    id?: SortOrder
    profileId?: SortOrder
    postId?: SortOrderInput | SortOrder
    objectId?: SortOrder
    packageId?: SortOrder
    moduleId?: SortOrder
    type?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    imageUrl?: SortOrder
    metadataUri?: SortOrder
    isListed?: SortOrder
    price?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    profile?: ProfileOrderByWithRelationInput
    post?: PostOrderByWithRelationInput
  }

  export type NFTWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    postId?: string
    objectId?: string
    AND?: NFTWhereInput | NFTWhereInput[]
    OR?: NFTWhereInput[]
    NOT?: NFTWhereInput | NFTWhereInput[]
    profileId?: StringFilter<"NFT"> | string
    packageId?: StringFilter<"NFT"> | string
    moduleId?: StringFilter<"NFT"> | string
    type?: EnumNFTTypeFilter<"NFT"> | $Enums.NFTType
    name?: StringFilter<"NFT"> | string
    description?: StringNullableFilter<"NFT"> | string | null
    imageUrl?: StringFilter<"NFT"> | string
    metadataUri?: StringFilter<"NFT"> | string
    isListed?: BoolFilter<"NFT"> | boolean
    price?: StringNullableFilter<"NFT"> | string | null
    createdAt?: DateTimeFilter<"NFT"> | Date | string
    profile?: XOR<ProfileScalarRelationFilter, ProfileWhereInput>
    post?: XOR<PostNullableScalarRelationFilter, PostWhereInput> | null
  }, "id" | "postId" | "objectId">

  export type NFTOrderByWithAggregationInput = {
    id?: SortOrder
    profileId?: SortOrder
    postId?: SortOrderInput | SortOrder
    objectId?: SortOrder
    packageId?: SortOrder
    moduleId?: SortOrder
    type?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    imageUrl?: SortOrder
    metadataUri?: SortOrder
    isListed?: SortOrder
    price?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: NFTCountOrderByAggregateInput
    _max?: NFTMaxOrderByAggregateInput
    _min?: NFTMinOrderByAggregateInput
  }

  export type NFTScalarWhereWithAggregatesInput = {
    AND?: NFTScalarWhereWithAggregatesInput | NFTScalarWhereWithAggregatesInput[]
    OR?: NFTScalarWhereWithAggregatesInput[]
    NOT?: NFTScalarWhereWithAggregatesInput | NFTScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"NFT"> | string
    profileId?: StringWithAggregatesFilter<"NFT"> | string
    postId?: StringNullableWithAggregatesFilter<"NFT"> | string | null
    objectId?: StringWithAggregatesFilter<"NFT"> | string
    packageId?: StringWithAggregatesFilter<"NFT"> | string
    moduleId?: StringWithAggregatesFilter<"NFT"> | string
    type?: EnumNFTTypeWithAggregatesFilter<"NFT"> | $Enums.NFTType
    name?: StringWithAggregatesFilter<"NFT"> | string
    description?: StringNullableWithAggregatesFilter<"NFT"> | string | null
    imageUrl?: StringWithAggregatesFilter<"NFT"> | string
    metadataUri?: StringWithAggregatesFilter<"NFT"> | string
    isListed?: BoolWithAggregatesFilter<"NFT"> | boolean
    price?: StringNullableWithAggregatesFilter<"NFT"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"NFT"> | Date | string
  }

  export type AuthUserCreateInput = {
    id: string
    name: string
    email: string
    emailVerified?: boolean
    image?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sessions?: SessionCreateNestedManyWithoutUserInput
    accounts?: AuthAccountCreateNestedManyWithoutUserInput
    domainAccount?: AccountCreateNestedOneWithoutAuthUserInput
  }

  export type AuthUserUncheckedCreateInput = {
    id: string
    name: string
    email: string
    emailVerified?: boolean
    image?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    accounts?: AuthAccountUncheckedCreateNestedManyWithoutUserInput
    domainAccount?: AccountUncheckedCreateNestedOneWithoutAuthUserInput
  }

  export type AuthUserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    image?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessions?: SessionUpdateManyWithoutUserNestedInput
    accounts?: AuthAccountUpdateManyWithoutUserNestedInput
    domainAccount?: AccountUpdateOneWithoutAuthUserNestedInput
  }

  export type AuthUserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    image?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    accounts?: AuthAccountUncheckedUpdateManyWithoutUserNestedInput
    domainAccount?: AccountUncheckedUpdateOneWithoutAuthUserNestedInput
  }

  export type AuthUserCreateManyInput = {
    id: string
    name: string
    email: string
    emailVerified?: boolean
    image?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AuthUserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    image?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuthUserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    image?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionCreateInput = {
    id: string
    expiresAt: Date | string
    token: string
    createdAt?: Date | string
    updatedAt?: Date | string
    ipAddress?: string | null
    userAgent?: string | null
    user: AuthUserCreateNestedOneWithoutSessionsInput
  }

  export type SessionUncheckedCreateInput = {
    id: string
    expiresAt: Date | string
    token: string
    createdAt?: Date | string
    updatedAt?: Date | string
    ipAddress?: string | null
    userAgent?: string | null
    userId: string
  }

  export type SessionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    token?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    user?: AuthUserUpdateOneRequiredWithoutSessionsNestedInput
  }

  export type SessionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    token?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type SessionCreateManyInput = {
    id: string
    expiresAt: Date | string
    token: string
    createdAt?: Date | string
    updatedAt?: Date | string
    ipAddress?: string | null
    userAgent?: string | null
    userId: string
  }

  export type SessionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    token?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SessionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    token?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type AuthAccountCreateInput = {
    id: string
    accountId: string
    providerId: string
    accessToken?: string | null
    refreshToken?: string | null
    idToken?: string | null
    accessTokenExpiresAt?: Date | string | null
    refreshTokenExpiresAt?: Date | string | null
    scope?: string | null
    password?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: AuthUserCreateNestedOneWithoutAccountsInput
  }

  export type AuthAccountUncheckedCreateInput = {
    id: string
    accountId: string
    providerId: string
    userId: string
    accessToken?: string | null
    refreshToken?: string | null
    idToken?: string | null
    accessTokenExpiresAt?: Date | string | null
    refreshTokenExpiresAt?: Date | string | null
    scope?: string | null
    password?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AuthAccountUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    accountId?: StringFieldUpdateOperationsInput | string
    providerId?: StringFieldUpdateOperationsInput | string
    accessToken?: NullableStringFieldUpdateOperationsInput | string | null
    refreshToken?: NullableStringFieldUpdateOperationsInput | string | null
    idToken?: NullableStringFieldUpdateOperationsInput | string | null
    accessTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    refreshTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: AuthUserUpdateOneRequiredWithoutAccountsNestedInput
  }

  export type AuthAccountUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    accountId?: StringFieldUpdateOperationsInput | string
    providerId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    accessToken?: NullableStringFieldUpdateOperationsInput | string | null
    refreshToken?: NullableStringFieldUpdateOperationsInput | string | null
    idToken?: NullableStringFieldUpdateOperationsInput | string | null
    accessTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    refreshTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuthAccountCreateManyInput = {
    id: string
    accountId: string
    providerId: string
    userId: string
    accessToken?: string | null
    refreshToken?: string | null
    idToken?: string | null
    accessTokenExpiresAt?: Date | string | null
    refreshTokenExpiresAt?: Date | string | null
    scope?: string | null
    password?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AuthAccountUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    accountId?: StringFieldUpdateOperationsInput | string
    providerId?: StringFieldUpdateOperationsInput | string
    accessToken?: NullableStringFieldUpdateOperationsInput | string | null
    refreshToken?: NullableStringFieldUpdateOperationsInput | string | null
    idToken?: NullableStringFieldUpdateOperationsInput | string | null
    accessTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    refreshTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuthAccountUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    accountId?: StringFieldUpdateOperationsInput | string
    providerId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    accessToken?: NullableStringFieldUpdateOperationsInput | string | null
    refreshToken?: NullableStringFieldUpdateOperationsInput | string | null
    idToken?: NullableStringFieldUpdateOperationsInput | string | null
    accessTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    refreshTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationCreateInput = {
    id: string
    identifier: string
    value: string
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VerificationUncheckedCreateInput = {
    id: string
    identifier: string
    value: string
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VerificationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    identifier?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    identifier?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationCreateManyInput = {
    id: string
    identifier: string
    value: string
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VerificationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    identifier?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    identifier?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    lastActiveAt?: Date | string
    email?: string | null
    walletAddress?: string | null
    isBanned?: boolean
    identityTier?: $Enums.IdentityTier
    identityVerifiedAt?: Date | string | null
    authUser: AuthUserCreateNestedOneWithoutDomainAccountInput
    profiles?: ProfileMemberCreateNestedManyWithoutAccountInput
    identityChecks?: IdentityCheckCreateNestedManyWithoutAccountInput
  }

  export type AccountUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    lastActiveAt?: Date | string
    authUserId: string
    email?: string | null
    walletAddress?: string | null
    isBanned?: boolean
    identityTier?: $Enums.IdentityTier
    identityVerifiedAt?: Date | string | null
    profiles?: ProfileMemberUncheckedCreateNestedManyWithoutAccountInput
    identityChecks?: IdentityCheckUncheckedCreateNestedManyWithoutAccountInput
  }

  export type AccountUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastActiveAt?: DateTimeFieldUpdateOperationsInput | Date | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    walletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    identityTier?: EnumIdentityTierFieldUpdateOperationsInput | $Enums.IdentityTier
    identityVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    authUser?: AuthUserUpdateOneRequiredWithoutDomainAccountNestedInput
    profiles?: ProfileMemberUpdateManyWithoutAccountNestedInput
    identityChecks?: IdentityCheckUpdateManyWithoutAccountNestedInput
  }

  export type AccountUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastActiveAt?: DateTimeFieldUpdateOperationsInput | Date | string
    authUserId?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    walletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    identityTier?: EnumIdentityTierFieldUpdateOperationsInput | $Enums.IdentityTier
    identityVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profiles?: ProfileMemberUncheckedUpdateManyWithoutAccountNestedInput
    identityChecks?: IdentityCheckUncheckedUpdateManyWithoutAccountNestedInput
  }

  export type AccountCreateManyInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    lastActiveAt?: Date | string
    authUserId: string
    email?: string | null
    walletAddress?: string | null
    isBanned?: boolean
    identityTier?: $Enums.IdentityTier
    identityVerifiedAt?: Date | string | null
  }

  export type AccountUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastActiveAt?: DateTimeFieldUpdateOperationsInput | Date | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    walletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    identityTier?: EnumIdentityTierFieldUpdateOperationsInput | $Enums.IdentityTier
    identityVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type AccountUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastActiveAt?: DateTimeFieldUpdateOperationsInput | Date | string
    authUserId?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    walletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    identityTier?: EnumIdentityTierFieldUpdateOperationsInput | $Enums.IdentityTier
    identityVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ProfileCreateInput = {
    id?: string
    handle: string
    displayName: string
    bio?: string | null
    avatar?: string | null
    type: $Enums.ProfileType
    createdAt?: Date | string
    updatedAt?: Date | string
    isBanned?: boolean
    reportCount?: number
    isVerified?: boolean
    reputation?: number
    members?: ProfileMemberCreateNestedManyWithoutProfileInput
    posts?: PostCreateNestedManyWithoutProfileInput
    comments?: CommentCreateNestedManyWithoutProfileInput
    likes?: LikeCreateNestedManyWithoutProfileInput
    nfts?: NFTCreateNestedManyWithoutProfileInput
    follows?: FollowCreateNestedManyWithoutFollowerInput
    followers?: FollowCreateNestedManyWithoutFollowingInput
  }

  export type ProfileUncheckedCreateInput = {
    id?: string
    handle: string
    displayName: string
    bio?: string | null
    avatar?: string | null
    type: $Enums.ProfileType
    createdAt?: Date | string
    updatedAt?: Date | string
    isBanned?: boolean
    reportCount?: number
    isVerified?: boolean
    reputation?: number
    members?: ProfileMemberUncheckedCreateNestedManyWithoutProfileInput
    posts?: PostUncheckedCreateNestedManyWithoutProfileInput
    comments?: CommentUncheckedCreateNestedManyWithoutProfileInput
    likes?: LikeUncheckedCreateNestedManyWithoutProfileInput
    nfts?: NFTUncheckedCreateNestedManyWithoutProfileInput
    follows?: FollowUncheckedCreateNestedManyWithoutFollowerInput
    followers?: FollowUncheckedCreateNestedManyWithoutFollowingInput
  }

  export type ProfileUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    handle?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumProfileTypeFieldUpdateOperationsInput | $Enums.ProfileType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    reportCount?: IntFieldUpdateOperationsInput | number
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    reputation?: IntFieldUpdateOperationsInput | number
    members?: ProfileMemberUpdateManyWithoutProfileNestedInput
    posts?: PostUpdateManyWithoutProfileNestedInput
    comments?: CommentUpdateManyWithoutProfileNestedInput
    likes?: LikeUpdateManyWithoutProfileNestedInput
    nfts?: NFTUpdateManyWithoutProfileNestedInput
    follows?: FollowUpdateManyWithoutFollowerNestedInput
    followers?: FollowUpdateManyWithoutFollowingNestedInput
  }

  export type ProfileUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    handle?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumProfileTypeFieldUpdateOperationsInput | $Enums.ProfileType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    reportCount?: IntFieldUpdateOperationsInput | number
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    reputation?: IntFieldUpdateOperationsInput | number
    members?: ProfileMemberUncheckedUpdateManyWithoutProfileNestedInput
    posts?: PostUncheckedUpdateManyWithoutProfileNestedInput
    comments?: CommentUncheckedUpdateManyWithoutProfileNestedInput
    likes?: LikeUncheckedUpdateManyWithoutProfileNestedInput
    nfts?: NFTUncheckedUpdateManyWithoutProfileNestedInput
    follows?: FollowUncheckedUpdateManyWithoutFollowerNestedInput
    followers?: FollowUncheckedUpdateManyWithoutFollowingNestedInput
  }

  export type ProfileCreateManyInput = {
    id?: string
    handle: string
    displayName: string
    bio?: string | null
    avatar?: string | null
    type: $Enums.ProfileType
    createdAt?: Date | string
    updatedAt?: Date | string
    isBanned?: boolean
    reportCount?: number
    isVerified?: boolean
    reputation?: number
  }

  export type ProfileUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    handle?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumProfileTypeFieldUpdateOperationsInput | $Enums.ProfileType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    reportCount?: IntFieldUpdateOperationsInput | number
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    reputation?: IntFieldUpdateOperationsInput | number
  }

  export type ProfileUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    handle?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumProfileTypeFieldUpdateOperationsInput | $Enums.ProfileType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    reportCount?: IntFieldUpdateOperationsInput | number
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    reputation?: IntFieldUpdateOperationsInput | number
  }

  export type ProfileMemberCreateInput = {
    id?: string
    role?: $Enums.ProfileRole
    createdAt?: Date | string
    account: AccountCreateNestedOneWithoutProfilesInput
    profile: ProfileCreateNestedOneWithoutMembersInput
  }

  export type ProfileMemberUncheckedCreateInput = {
    id?: string
    accountId: string
    profileId: string
    role?: $Enums.ProfileRole
    createdAt?: Date | string
  }

  export type ProfileMemberUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumProfileRoleFieldUpdateOperationsInput | $Enums.ProfileRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    account?: AccountUpdateOneRequiredWithoutProfilesNestedInput
    profile?: ProfileUpdateOneRequiredWithoutMembersNestedInput
  }

  export type ProfileMemberUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    accountId?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    role?: EnumProfileRoleFieldUpdateOperationsInput | $Enums.ProfileRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProfileMemberCreateManyInput = {
    id?: string
    accountId: string
    profileId: string
    role?: $Enums.ProfileRole
    createdAt?: Date | string
  }

  export type ProfileMemberUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumProfileRoleFieldUpdateOperationsInput | $Enums.ProfileRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProfileMemberUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    accountId?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    role?: EnumProfileRoleFieldUpdateOperationsInput | $Enums.ProfileRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IdentityCheckCreateInput = {
    id?: string
    provider: string
    externalId: string
    tier: $Enums.IdentityTier
    status: $Enums.IdentityCheckStatus
    initiatedAt?: Date | string
    resolvedAt?: Date | string | null
    expiresAt?: Date | string | null
    providerPayload?: NullableJsonNullValueInput | InputJsonValue
    account: AccountCreateNestedOneWithoutIdentityChecksInput
  }

  export type IdentityCheckUncheckedCreateInput = {
    id?: string
    accountId: string
    provider: string
    externalId: string
    tier: $Enums.IdentityTier
    status: $Enums.IdentityCheckStatus
    initiatedAt?: Date | string
    resolvedAt?: Date | string | null
    expiresAt?: Date | string | null
    providerPayload?: NullableJsonNullValueInput | InputJsonValue
  }

  export type IdentityCheckUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    tier?: EnumIdentityTierFieldUpdateOperationsInput | $Enums.IdentityTier
    status?: EnumIdentityCheckStatusFieldUpdateOperationsInput | $Enums.IdentityCheckStatus
    initiatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    providerPayload?: NullableJsonNullValueInput | InputJsonValue
    account?: AccountUpdateOneRequiredWithoutIdentityChecksNestedInput
  }

  export type IdentityCheckUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    accountId?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    tier?: EnumIdentityTierFieldUpdateOperationsInput | $Enums.IdentityTier
    status?: EnumIdentityCheckStatusFieldUpdateOperationsInput | $Enums.IdentityCheckStatus
    initiatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    providerPayload?: NullableJsonNullValueInput | InputJsonValue
  }

  export type IdentityCheckCreateManyInput = {
    id?: string
    accountId: string
    provider: string
    externalId: string
    tier: $Enums.IdentityTier
    status: $Enums.IdentityCheckStatus
    initiatedAt?: Date | string
    resolvedAt?: Date | string | null
    expiresAt?: Date | string | null
    providerPayload?: NullableJsonNullValueInput | InputJsonValue
  }

  export type IdentityCheckUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    tier?: EnumIdentityTierFieldUpdateOperationsInput | $Enums.IdentityTier
    status?: EnumIdentityCheckStatusFieldUpdateOperationsInput | $Enums.IdentityCheckStatus
    initiatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    providerPayload?: NullableJsonNullValueInput | InputJsonValue
  }

  export type IdentityCheckUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    accountId?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    tier?: EnumIdentityTierFieldUpdateOperationsInput | $Enums.IdentityTier
    status?: EnumIdentityCheckStatusFieldUpdateOperationsInput | $Enums.IdentityCheckStatus
    initiatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    providerPayload?: NullableJsonNullValueInput | InputJsonValue
  }

  export type PostCreateInput = {
    id?: string
    content: string
    mediaUrls?: PostCreatemediaUrlsInput | string[]
    mediaType?: $Enums.MediaType
    createdAt?: Date | string
    updatedAt?: Date | string
    likesCount?: number
    commentsCount?: number
    isHidden?: boolean
    reportCount?: number
    profile: ProfileCreateNestedOneWithoutPostsInput
    comments?: CommentCreateNestedManyWithoutPostInput
    likes?: LikeCreateNestedManyWithoutPostInput
    nft?: NFTCreateNestedOneWithoutPostInput
  }

  export type PostUncheckedCreateInput = {
    id?: string
    profileId: string
    content: string
    mediaUrls?: PostCreatemediaUrlsInput | string[]
    mediaType?: $Enums.MediaType
    createdAt?: Date | string
    updatedAt?: Date | string
    likesCount?: number
    commentsCount?: number
    isHidden?: boolean
    reportCount?: number
    comments?: CommentUncheckedCreateNestedManyWithoutPostInput
    likes?: LikeUncheckedCreateNestedManyWithoutPostInput
    nft?: NFTUncheckedCreateNestedOneWithoutPostInput
  }

  export type PostUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    mediaUrls?: PostUpdatemediaUrlsInput | string[]
    mediaType?: EnumMediaTypeFieldUpdateOperationsInput | $Enums.MediaType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    likesCount?: IntFieldUpdateOperationsInput | number
    commentsCount?: IntFieldUpdateOperationsInput | number
    isHidden?: BoolFieldUpdateOperationsInput | boolean
    reportCount?: IntFieldUpdateOperationsInput | number
    profile?: ProfileUpdateOneRequiredWithoutPostsNestedInput
    comments?: CommentUpdateManyWithoutPostNestedInput
    likes?: LikeUpdateManyWithoutPostNestedInput
    nft?: NFTUpdateOneWithoutPostNestedInput
  }

  export type PostUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    mediaUrls?: PostUpdatemediaUrlsInput | string[]
    mediaType?: EnumMediaTypeFieldUpdateOperationsInput | $Enums.MediaType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    likesCount?: IntFieldUpdateOperationsInput | number
    commentsCount?: IntFieldUpdateOperationsInput | number
    isHidden?: BoolFieldUpdateOperationsInput | boolean
    reportCount?: IntFieldUpdateOperationsInput | number
    comments?: CommentUncheckedUpdateManyWithoutPostNestedInput
    likes?: LikeUncheckedUpdateManyWithoutPostNestedInput
    nft?: NFTUncheckedUpdateOneWithoutPostNestedInput
  }

  export type PostCreateManyInput = {
    id?: string
    profileId: string
    content: string
    mediaUrls?: PostCreatemediaUrlsInput | string[]
    mediaType?: $Enums.MediaType
    createdAt?: Date | string
    updatedAt?: Date | string
    likesCount?: number
    commentsCount?: number
    isHidden?: boolean
    reportCount?: number
  }

  export type PostUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    mediaUrls?: PostUpdatemediaUrlsInput | string[]
    mediaType?: EnumMediaTypeFieldUpdateOperationsInput | $Enums.MediaType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    likesCount?: IntFieldUpdateOperationsInput | number
    commentsCount?: IntFieldUpdateOperationsInput | number
    isHidden?: BoolFieldUpdateOperationsInput | boolean
    reportCount?: IntFieldUpdateOperationsInput | number
  }

  export type PostUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    mediaUrls?: PostUpdatemediaUrlsInput | string[]
    mediaType?: EnumMediaTypeFieldUpdateOperationsInput | $Enums.MediaType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    likesCount?: IntFieldUpdateOperationsInput | number
    commentsCount?: IntFieldUpdateOperationsInput | number
    isHidden?: BoolFieldUpdateOperationsInput | boolean
    reportCount?: IntFieldUpdateOperationsInput | number
  }

  export type CommentCreateInput = {
    id?: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    isHidden?: boolean
    post: PostCreateNestedOneWithoutCommentsInput
    profile: ProfileCreateNestedOneWithoutCommentsInput
  }

  export type CommentUncheckedCreateInput = {
    id?: string
    postId: string
    profileId: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    isHidden?: boolean
  }

  export type CommentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isHidden?: BoolFieldUpdateOperationsInput | boolean
    post?: PostUpdateOneRequiredWithoutCommentsNestedInput
    profile?: ProfileUpdateOneRequiredWithoutCommentsNestedInput
  }

  export type CommentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    postId?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isHidden?: BoolFieldUpdateOperationsInput | boolean
  }

  export type CommentCreateManyInput = {
    id?: string
    postId: string
    profileId: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    isHidden?: boolean
  }

  export type CommentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isHidden?: BoolFieldUpdateOperationsInput | boolean
  }

  export type CommentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    postId?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isHidden?: BoolFieldUpdateOperationsInput | boolean
  }

  export type LikeCreateInput = {
    id?: string
    createdAt?: Date | string
    post: PostCreateNestedOneWithoutLikesInput
    profile: ProfileCreateNestedOneWithoutLikesInput
  }

  export type LikeUncheckedCreateInput = {
    id?: string
    postId: string
    profileId: string
    createdAt?: Date | string
  }

  export type LikeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    post?: PostUpdateOneRequiredWithoutLikesNestedInput
    profile?: ProfileUpdateOneRequiredWithoutLikesNestedInput
  }

  export type LikeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    postId?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LikeCreateManyInput = {
    id?: string
    postId: string
    profileId: string
    createdAt?: Date | string
  }

  export type LikeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LikeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    postId?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FollowCreateInput = {
    id?: string
    createdAt?: Date | string
    follower: ProfileCreateNestedOneWithoutFollowsInput
    following: ProfileCreateNestedOneWithoutFollowersInput
  }

  export type FollowUncheckedCreateInput = {
    id?: string
    followerId: string
    followingId: string
    createdAt?: Date | string
  }

  export type FollowUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    follower?: ProfileUpdateOneRequiredWithoutFollowsNestedInput
    following?: ProfileUpdateOneRequiredWithoutFollowersNestedInput
  }

  export type FollowUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    followerId?: StringFieldUpdateOperationsInput | string
    followingId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FollowCreateManyInput = {
    id?: string
    followerId: string
    followingId: string
    createdAt?: Date | string
  }

  export type FollowUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FollowUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    followerId?: StringFieldUpdateOperationsInput | string
    followingId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NFTCreateInput = {
    id?: string
    objectId: string
    packageId: string
    moduleId: string
    type: $Enums.NFTType
    name: string
    description?: string | null
    imageUrl: string
    metadataUri: string
    isListed?: boolean
    price?: string | null
    createdAt?: Date | string
    profile: ProfileCreateNestedOneWithoutNftsInput
    post?: PostCreateNestedOneWithoutNftInput
  }

  export type NFTUncheckedCreateInput = {
    id?: string
    profileId: string
    postId?: string | null
    objectId: string
    packageId: string
    moduleId: string
    type: $Enums.NFTType
    name: string
    description?: string | null
    imageUrl: string
    metadataUri: string
    isListed?: boolean
    price?: string | null
    createdAt?: Date | string
  }

  export type NFTUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    objectId?: StringFieldUpdateOperationsInput | string
    packageId?: StringFieldUpdateOperationsInput | string
    moduleId?: StringFieldUpdateOperationsInput | string
    type?: EnumNFTTypeFieldUpdateOperationsInput | $Enums.NFTType
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: StringFieldUpdateOperationsInput | string
    metadataUri?: StringFieldUpdateOperationsInput | string
    isListed?: BoolFieldUpdateOperationsInput | boolean
    price?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    profile?: ProfileUpdateOneRequiredWithoutNftsNestedInput
    post?: PostUpdateOneWithoutNftNestedInput
  }

  export type NFTUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    postId?: NullableStringFieldUpdateOperationsInput | string | null
    objectId?: StringFieldUpdateOperationsInput | string
    packageId?: StringFieldUpdateOperationsInput | string
    moduleId?: StringFieldUpdateOperationsInput | string
    type?: EnumNFTTypeFieldUpdateOperationsInput | $Enums.NFTType
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: StringFieldUpdateOperationsInput | string
    metadataUri?: StringFieldUpdateOperationsInput | string
    isListed?: BoolFieldUpdateOperationsInput | boolean
    price?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NFTCreateManyInput = {
    id?: string
    profileId: string
    postId?: string | null
    objectId: string
    packageId: string
    moduleId: string
    type: $Enums.NFTType
    name: string
    description?: string | null
    imageUrl: string
    metadataUri: string
    isListed?: boolean
    price?: string | null
    createdAt?: Date | string
  }

  export type NFTUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    objectId?: StringFieldUpdateOperationsInput | string
    packageId?: StringFieldUpdateOperationsInput | string
    moduleId?: StringFieldUpdateOperationsInput | string
    type?: EnumNFTTypeFieldUpdateOperationsInput | $Enums.NFTType
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: StringFieldUpdateOperationsInput | string
    metadataUri?: StringFieldUpdateOperationsInput | string
    isListed?: BoolFieldUpdateOperationsInput | boolean
    price?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NFTUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    postId?: NullableStringFieldUpdateOperationsInput | string | null
    objectId?: StringFieldUpdateOperationsInput | string
    packageId?: StringFieldUpdateOperationsInput | string
    moduleId?: StringFieldUpdateOperationsInput | string
    type?: EnumNFTTypeFieldUpdateOperationsInput | $Enums.NFTType
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: StringFieldUpdateOperationsInput | string
    metadataUri?: StringFieldUpdateOperationsInput | string
    isListed?: BoolFieldUpdateOperationsInput | boolean
    price?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SessionListRelationFilter = {
    every?: SessionWhereInput
    some?: SessionWhereInput
    none?: SessionWhereInput
  }

  export type AuthAccountListRelationFilter = {
    every?: AuthAccountWhereInput
    some?: AuthAccountWhereInput
    none?: AuthAccountWhereInput
  }

  export type AccountNullableScalarRelationFilter = {
    is?: AccountWhereInput | null
    isNot?: AccountWhereInput | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type SessionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AuthAccountOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AuthUserCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    emailVerified?: SortOrder
    image?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AuthUserMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    emailVerified?: SortOrder
    image?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AuthUserMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    emailVerified?: SortOrder
    image?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type AuthUserScalarRelationFilter = {
    is?: AuthUserWhereInput
    isNot?: AuthUserWhereInput
  }

  export type SessionCountOrderByAggregateInput = {
    id?: SortOrder
    expiresAt?: SortOrder
    token?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    userId?: SortOrder
  }

  export type SessionMaxOrderByAggregateInput = {
    id?: SortOrder
    expiresAt?: SortOrder
    token?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    userId?: SortOrder
  }

  export type SessionMinOrderByAggregateInput = {
    id?: SortOrder
    expiresAt?: SortOrder
    token?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    userId?: SortOrder
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type AuthAccountProviderIdAccountIdCompoundUniqueInput = {
    providerId: string
    accountId: string
  }

  export type AuthAccountCountOrderByAggregateInput = {
    id?: SortOrder
    accountId?: SortOrder
    providerId?: SortOrder
    userId?: SortOrder
    accessToken?: SortOrder
    refreshToken?: SortOrder
    idToken?: SortOrder
    accessTokenExpiresAt?: SortOrder
    refreshTokenExpiresAt?: SortOrder
    scope?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AuthAccountMaxOrderByAggregateInput = {
    id?: SortOrder
    accountId?: SortOrder
    providerId?: SortOrder
    userId?: SortOrder
    accessToken?: SortOrder
    refreshToken?: SortOrder
    idToken?: SortOrder
    accessTokenExpiresAt?: SortOrder
    refreshTokenExpiresAt?: SortOrder
    scope?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AuthAccountMinOrderByAggregateInput = {
    id?: SortOrder
    accountId?: SortOrder
    providerId?: SortOrder
    userId?: SortOrder
    accessToken?: SortOrder
    refreshToken?: SortOrder
    idToken?: SortOrder
    accessTokenExpiresAt?: SortOrder
    refreshTokenExpiresAt?: SortOrder
    scope?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type VerificationCountOrderByAggregateInput = {
    id?: SortOrder
    identifier?: SortOrder
    value?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VerificationMaxOrderByAggregateInput = {
    id?: SortOrder
    identifier?: SortOrder
    value?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VerificationMinOrderByAggregateInput = {
    id?: SortOrder
    identifier?: SortOrder
    value?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumIdentityTierFilter<$PrismaModel = never> = {
    equals?: $Enums.IdentityTier | EnumIdentityTierFieldRefInput<$PrismaModel>
    in?: $Enums.IdentityTier[] | ListEnumIdentityTierFieldRefInput<$PrismaModel>
    notIn?: $Enums.IdentityTier[] | ListEnumIdentityTierFieldRefInput<$PrismaModel>
    not?: NestedEnumIdentityTierFilter<$PrismaModel> | $Enums.IdentityTier
  }

  export type ProfileMemberListRelationFilter = {
    every?: ProfileMemberWhereInput
    some?: ProfileMemberWhereInput
    none?: ProfileMemberWhereInput
  }

  export type IdentityCheckListRelationFilter = {
    every?: IdentityCheckWhereInput
    some?: IdentityCheckWhereInput
    none?: IdentityCheckWhereInput
  }

  export type ProfileMemberOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type IdentityCheckOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AccountCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastActiveAt?: SortOrder
    authUserId?: SortOrder
    email?: SortOrder
    walletAddress?: SortOrder
    isBanned?: SortOrder
    identityTier?: SortOrder
    identityVerifiedAt?: SortOrder
  }

  export type AccountMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastActiveAt?: SortOrder
    authUserId?: SortOrder
    email?: SortOrder
    walletAddress?: SortOrder
    isBanned?: SortOrder
    identityTier?: SortOrder
    identityVerifiedAt?: SortOrder
  }

  export type AccountMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastActiveAt?: SortOrder
    authUserId?: SortOrder
    email?: SortOrder
    walletAddress?: SortOrder
    isBanned?: SortOrder
    identityTier?: SortOrder
    identityVerifiedAt?: SortOrder
  }

  export type EnumIdentityTierWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.IdentityTier | EnumIdentityTierFieldRefInput<$PrismaModel>
    in?: $Enums.IdentityTier[] | ListEnumIdentityTierFieldRefInput<$PrismaModel>
    notIn?: $Enums.IdentityTier[] | ListEnumIdentityTierFieldRefInput<$PrismaModel>
    not?: NestedEnumIdentityTierWithAggregatesFilter<$PrismaModel> | $Enums.IdentityTier
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumIdentityTierFilter<$PrismaModel>
    _max?: NestedEnumIdentityTierFilter<$PrismaModel>
  }

  export type EnumProfileTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ProfileType | EnumProfileTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ProfileType[] | ListEnumProfileTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProfileType[] | ListEnumProfileTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumProfileTypeFilter<$PrismaModel> | $Enums.ProfileType
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type PostListRelationFilter = {
    every?: PostWhereInput
    some?: PostWhereInput
    none?: PostWhereInput
  }

  export type CommentListRelationFilter = {
    every?: CommentWhereInput
    some?: CommentWhereInput
    none?: CommentWhereInput
  }

  export type LikeListRelationFilter = {
    every?: LikeWhereInput
    some?: LikeWhereInput
    none?: LikeWhereInput
  }

  export type NFTListRelationFilter = {
    every?: NFTWhereInput
    some?: NFTWhereInput
    none?: NFTWhereInput
  }

  export type FollowListRelationFilter = {
    every?: FollowWhereInput
    some?: FollowWhereInput
    none?: FollowWhereInput
  }

  export type PostOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CommentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type LikeOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type NFTOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type FollowOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProfileCountOrderByAggregateInput = {
    id?: SortOrder
    handle?: SortOrder
    displayName?: SortOrder
    bio?: SortOrder
    avatar?: SortOrder
    type?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    isBanned?: SortOrder
    reportCount?: SortOrder
    isVerified?: SortOrder
    reputation?: SortOrder
  }

  export type ProfileAvgOrderByAggregateInput = {
    reportCount?: SortOrder
    reputation?: SortOrder
  }

  export type ProfileMaxOrderByAggregateInput = {
    id?: SortOrder
    handle?: SortOrder
    displayName?: SortOrder
    bio?: SortOrder
    avatar?: SortOrder
    type?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    isBanned?: SortOrder
    reportCount?: SortOrder
    isVerified?: SortOrder
    reputation?: SortOrder
  }

  export type ProfileMinOrderByAggregateInput = {
    id?: SortOrder
    handle?: SortOrder
    displayName?: SortOrder
    bio?: SortOrder
    avatar?: SortOrder
    type?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    isBanned?: SortOrder
    reportCount?: SortOrder
    isVerified?: SortOrder
    reputation?: SortOrder
  }

  export type ProfileSumOrderByAggregateInput = {
    reportCount?: SortOrder
    reputation?: SortOrder
  }

  export type EnumProfileTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ProfileType | EnumProfileTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ProfileType[] | ListEnumProfileTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProfileType[] | ListEnumProfileTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumProfileTypeWithAggregatesFilter<$PrismaModel> | $Enums.ProfileType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumProfileTypeFilter<$PrismaModel>
    _max?: NestedEnumProfileTypeFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type EnumProfileRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.ProfileRole | EnumProfileRoleFieldRefInput<$PrismaModel>
    in?: $Enums.ProfileRole[] | ListEnumProfileRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProfileRole[] | ListEnumProfileRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumProfileRoleFilter<$PrismaModel> | $Enums.ProfileRole
  }

  export type AccountScalarRelationFilter = {
    is?: AccountWhereInput
    isNot?: AccountWhereInput
  }

  export type ProfileScalarRelationFilter = {
    is?: ProfileWhereInput
    isNot?: ProfileWhereInput
  }

  export type ProfileMemberAccountIdProfileIdCompoundUniqueInput = {
    accountId: string
    profileId: string
  }

  export type ProfileMemberCountOrderByAggregateInput = {
    id?: SortOrder
    accountId?: SortOrder
    profileId?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
  }

  export type ProfileMemberMaxOrderByAggregateInput = {
    id?: SortOrder
    accountId?: SortOrder
    profileId?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
  }

  export type ProfileMemberMinOrderByAggregateInput = {
    id?: SortOrder
    accountId?: SortOrder
    profileId?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumProfileRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ProfileRole | EnumProfileRoleFieldRefInput<$PrismaModel>
    in?: $Enums.ProfileRole[] | ListEnumProfileRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProfileRole[] | ListEnumProfileRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumProfileRoleWithAggregatesFilter<$PrismaModel> | $Enums.ProfileRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumProfileRoleFilter<$PrismaModel>
    _max?: NestedEnumProfileRoleFilter<$PrismaModel>
  }

  export type EnumIdentityCheckStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.IdentityCheckStatus | EnumIdentityCheckStatusFieldRefInput<$PrismaModel>
    in?: $Enums.IdentityCheckStatus[] | ListEnumIdentityCheckStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.IdentityCheckStatus[] | ListEnumIdentityCheckStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumIdentityCheckStatusFilter<$PrismaModel> | $Enums.IdentityCheckStatus
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type IdentityCheckCountOrderByAggregateInput = {
    id?: SortOrder
    accountId?: SortOrder
    provider?: SortOrder
    externalId?: SortOrder
    tier?: SortOrder
    status?: SortOrder
    initiatedAt?: SortOrder
    resolvedAt?: SortOrder
    expiresAt?: SortOrder
    providerPayload?: SortOrder
  }

  export type IdentityCheckMaxOrderByAggregateInput = {
    id?: SortOrder
    accountId?: SortOrder
    provider?: SortOrder
    externalId?: SortOrder
    tier?: SortOrder
    status?: SortOrder
    initiatedAt?: SortOrder
    resolvedAt?: SortOrder
    expiresAt?: SortOrder
  }

  export type IdentityCheckMinOrderByAggregateInput = {
    id?: SortOrder
    accountId?: SortOrder
    provider?: SortOrder
    externalId?: SortOrder
    tier?: SortOrder
    status?: SortOrder
    initiatedAt?: SortOrder
    resolvedAt?: SortOrder
    expiresAt?: SortOrder
  }

  export type EnumIdentityCheckStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.IdentityCheckStatus | EnumIdentityCheckStatusFieldRefInput<$PrismaModel>
    in?: $Enums.IdentityCheckStatus[] | ListEnumIdentityCheckStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.IdentityCheckStatus[] | ListEnumIdentityCheckStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumIdentityCheckStatusWithAggregatesFilter<$PrismaModel> | $Enums.IdentityCheckStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumIdentityCheckStatusFilter<$PrismaModel>
    _max?: NestedEnumIdentityCheckStatusFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type EnumMediaTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.MediaType | EnumMediaTypeFieldRefInput<$PrismaModel>
    in?: $Enums.MediaType[] | ListEnumMediaTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MediaType[] | ListEnumMediaTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumMediaTypeFilter<$PrismaModel> | $Enums.MediaType
  }

  export type NFTNullableScalarRelationFilter = {
    is?: NFTWhereInput | null
    isNot?: NFTWhereInput | null
  }

  export type PostCountOrderByAggregateInput = {
    id?: SortOrder
    profileId?: SortOrder
    content?: SortOrder
    mediaUrls?: SortOrder
    mediaType?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    likesCount?: SortOrder
    commentsCount?: SortOrder
    isHidden?: SortOrder
    reportCount?: SortOrder
  }

  export type PostAvgOrderByAggregateInput = {
    likesCount?: SortOrder
    commentsCount?: SortOrder
    reportCount?: SortOrder
  }

  export type PostMaxOrderByAggregateInput = {
    id?: SortOrder
    profileId?: SortOrder
    content?: SortOrder
    mediaType?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    likesCount?: SortOrder
    commentsCount?: SortOrder
    isHidden?: SortOrder
    reportCount?: SortOrder
  }

  export type PostMinOrderByAggregateInput = {
    id?: SortOrder
    profileId?: SortOrder
    content?: SortOrder
    mediaType?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    likesCount?: SortOrder
    commentsCount?: SortOrder
    isHidden?: SortOrder
    reportCount?: SortOrder
  }

  export type PostSumOrderByAggregateInput = {
    likesCount?: SortOrder
    commentsCount?: SortOrder
    reportCount?: SortOrder
  }

  export type EnumMediaTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MediaType | EnumMediaTypeFieldRefInput<$PrismaModel>
    in?: $Enums.MediaType[] | ListEnumMediaTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MediaType[] | ListEnumMediaTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumMediaTypeWithAggregatesFilter<$PrismaModel> | $Enums.MediaType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMediaTypeFilter<$PrismaModel>
    _max?: NestedEnumMediaTypeFilter<$PrismaModel>
  }

  export type PostScalarRelationFilter = {
    is?: PostWhereInput
    isNot?: PostWhereInput
  }

  export type CommentCountOrderByAggregateInput = {
    id?: SortOrder
    postId?: SortOrder
    profileId?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    isHidden?: SortOrder
  }

  export type CommentMaxOrderByAggregateInput = {
    id?: SortOrder
    postId?: SortOrder
    profileId?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    isHidden?: SortOrder
  }

  export type CommentMinOrderByAggregateInput = {
    id?: SortOrder
    postId?: SortOrder
    profileId?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    isHidden?: SortOrder
  }

  export type LikePostIdProfileIdCompoundUniqueInput = {
    postId: string
    profileId: string
  }

  export type LikeCountOrderByAggregateInput = {
    id?: SortOrder
    postId?: SortOrder
    profileId?: SortOrder
    createdAt?: SortOrder
  }

  export type LikeMaxOrderByAggregateInput = {
    id?: SortOrder
    postId?: SortOrder
    profileId?: SortOrder
    createdAt?: SortOrder
  }

  export type LikeMinOrderByAggregateInput = {
    id?: SortOrder
    postId?: SortOrder
    profileId?: SortOrder
    createdAt?: SortOrder
  }

  export type FollowFollowerIdFollowingIdCompoundUniqueInput = {
    followerId: string
    followingId: string
  }

  export type FollowCountOrderByAggregateInput = {
    id?: SortOrder
    followerId?: SortOrder
    followingId?: SortOrder
    createdAt?: SortOrder
  }

  export type FollowMaxOrderByAggregateInput = {
    id?: SortOrder
    followerId?: SortOrder
    followingId?: SortOrder
    createdAt?: SortOrder
  }

  export type FollowMinOrderByAggregateInput = {
    id?: SortOrder
    followerId?: SortOrder
    followingId?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumNFTTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.NFTType | EnumNFTTypeFieldRefInput<$PrismaModel>
    in?: $Enums.NFTType[] | ListEnumNFTTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.NFTType[] | ListEnumNFTTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumNFTTypeFilter<$PrismaModel> | $Enums.NFTType
  }

  export type PostNullableScalarRelationFilter = {
    is?: PostWhereInput | null
    isNot?: PostWhereInput | null
  }

  export type NFTCountOrderByAggregateInput = {
    id?: SortOrder
    profileId?: SortOrder
    postId?: SortOrder
    objectId?: SortOrder
    packageId?: SortOrder
    moduleId?: SortOrder
    type?: SortOrder
    name?: SortOrder
    description?: SortOrder
    imageUrl?: SortOrder
    metadataUri?: SortOrder
    isListed?: SortOrder
    price?: SortOrder
    createdAt?: SortOrder
  }

  export type NFTMaxOrderByAggregateInput = {
    id?: SortOrder
    profileId?: SortOrder
    postId?: SortOrder
    objectId?: SortOrder
    packageId?: SortOrder
    moduleId?: SortOrder
    type?: SortOrder
    name?: SortOrder
    description?: SortOrder
    imageUrl?: SortOrder
    metadataUri?: SortOrder
    isListed?: SortOrder
    price?: SortOrder
    createdAt?: SortOrder
  }

  export type NFTMinOrderByAggregateInput = {
    id?: SortOrder
    profileId?: SortOrder
    postId?: SortOrder
    objectId?: SortOrder
    packageId?: SortOrder
    moduleId?: SortOrder
    type?: SortOrder
    name?: SortOrder
    description?: SortOrder
    imageUrl?: SortOrder
    metadataUri?: SortOrder
    isListed?: SortOrder
    price?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumNFTTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.NFTType | EnumNFTTypeFieldRefInput<$PrismaModel>
    in?: $Enums.NFTType[] | ListEnumNFTTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.NFTType[] | ListEnumNFTTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumNFTTypeWithAggregatesFilter<$PrismaModel> | $Enums.NFTType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumNFTTypeFilter<$PrismaModel>
    _max?: NestedEnumNFTTypeFilter<$PrismaModel>
  }

  export type SessionCreateNestedManyWithoutUserInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
  }

  export type AuthAccountCreateNestedManyWithoutUserInput = {
    create?: XOR<AuthAccountCreateWithoutUserInput, AuthAccountUncheckedCreateWithoutUserInput> | AuthAccountCreateWithoutUserInput[] | AuthAccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AuthAccountCreateOrConnectWithoutUserInput | AuthAccountCreateOrConnectWithoutUserInput[]
    createMany?: AuthAccountCreateManyUserInputEnvelope
    connect?: AuthAccountWhereUniqueInput | AuthAccountWhereUniqueInput[]
  }

  export type AccountCreateNestedOneWithoutAuthUserInput = {
    create?: XOR<AccountCreateWithoutAuthUserInput, AccountUncheckedCreateWithoutAuthUserInput>
    connectOrCreate?: AccountCreateOrConnectWithoutAuthUserInput
    connect?: AccountWhereUniqueInput
  }

  export type SessionUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
  }

  export type AuthAccountUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<AuthAccountCreateWithoutUserInput, AuthAccountUncheckedCreateWithoutUserInput> | AuthAccountCreateWithoutUserInput[] | AuthAccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AuthAccountCreateOrConnectWithoutUserInput | AuthAccountCreateOrConnectWithoutUserInput[]
    createMany?: AuthAccountCreateManyUserInputEnvelope
    connect?: AuthAccountWhereUniqueInput | AuthAccountWhereUniqueInput[]
  }

  export type AccountUncheckedCreateNestedOneWithoutAuthUserInput = {
    create?: XOR<AccountCreateWithoutAuthUserInput, AccountUncheckedCreateWithoutAuthUserInput>
    connectOrCreate?: AccountCreateOrConnectWithoutAuthUserInput
    connect?: AccountWhereUniqueInput
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type SessionUpdateManyWithoutUserNestedInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    upsert?: SessionUpsertWithWhereUniqueWithoutUserInput | SessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    set?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    disconnect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    delete?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    update?: SessionUpdateWithWhereUniqueWithoutUserInput | SessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SessionUpdateManyWithWhereWithoutUserInput | SessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SessionScalarWhereInput | SessionScalarWhereInput[]
  }

  export type AuthAccountUpdateManyWithoutUserNestedInput = {
    create?: XOR<AuthAccountCreateWithoutUserInput, AuthAccountUncheckedCreateWithoutUserInput> | AuthAccountCreateWithoutUserInput[] | AuthAccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AuthAccountCreateOrConnectWithoutUserInput | AuthAccountCreateOrConnectWithoutUserInput[]
    upsert?: AuthAccountUpsertWithWhereUniqueWithoutUserInput | AuthAccountUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AuthAccountCreateManyUserInputEnvelope
    set?: AuthAccountWhereUniqueInput | AuthAccountWhereUniqueInput[]
    disconnect?: AuthAccountWhereUniqueInput | AuthAccountWhereUniqueInput[]
    delete?: AuthAccountWhereUniqueInput | AuthAccountWhereUniqueInput[]
    connect?: AuthAccountWhereUniqueInput | AuthAccountWhereUniqueInput[]
    update?: AuthAccountUpdateWithWhereUniqueWithoutUserInput | AuthAccountUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AuthAccountUpdateManyWithWhereWithoutUserInput | AuthAccountUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AuthAccountScalarWhereInput | AuthAccountScalarWhereInput[]
  }

  export type AccountUpdateOneWithoutAuthUserNestedInput = {
    create?: XOR<AccountCreateWithoutAuthUserInput, AccountUncheckedCreateWithoutAuthUserInput>
    connectOrCreate?: AccountCreateOrConnectWithoutAuthUserInput
    upsert?: AccountUpsertWithoutAuthUserInput
    disconnect?: AccountWhereInput | boolean
    delete?: AccountWhereInput | boolean
    connect?: AccountWhereUniqueInput
    update?: XOR<XOR<AccountUpdateToOneWithWhereWithoutAuthUserInput, AccountUpdateWithoutAuthUserInput>, AccountUncheckedUpdateWithoutAuthUserInput>
  }

  export type SessionUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    upsert?: SessionUpsertWithWhereUniqueWithoutUserInput | SessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    set?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    disconnect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    delete?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    update?: SessionUpdateWithWhereUniqueWithoutUserInput | SessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SessionUpdateManyWithWhereWithoutUserInput | SessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SessionScalarWhereInput | SessionScalarWhereInput[]
  }

  export type AuthAccountUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<AuthAccountCreateWithoutUserInput, AuthAccountUncheckedCreateWithoutUserInput> | AuthAccountCreateWithoutUserInput[] | AuthAccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AuthAccountCreateOrConnectWithoutUserInput | AuthAccountCreateOrConnectWithoutUserInput[]
    upsert?: AuthAccountUpsertWithWhereUniqueWithoutUserInput | AuthAccountUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AuthAccountCreateManyUserInputEnvelope
    set?: AuthAccountWhereUniqueInput | AuthAccountWhereUniqueInput[]
    disconnect?: AuthAccountWhereUniqueInput | AuthAccountWhereUniqueInput[]
    delete?: AuthAccountWhereUniqueInput | AuthAccountWhereUniqueInput[]
    connect?: AuthAccountWhereUniqueInput | AuthAccountWhereUniqueInput[]
    update?: AuthAccountUpdateWithWhereUniqueWithoutUserInput | AuthAccountUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AuthAccountUpdateManyWithWhereWithoutUserInput | AuthAccountUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AuthAccountScalarWhereInput | AuthAccountScalarWhereInput[]
  }

  export type AccountUncheckedUpdateOneWithoutAuthUserNestedInput = {
    create?: XOR<AccountCreateWithoutAuthUserInput, AccountUncheckedCreateWithoutAuthUserInput>
    connectOrCreate?: AccountCreateOrConnectWithoutAuthUserInput
    upsert?: AccountUpsertWithoutAuthUserInput
    disconnect?: AccountWhereInput | boolean
    delete?: AccountWhereInput | boolean
    connect?: AccountWhereUniqueInput
    update?: XOR<XOR<AccountUpdateToOneWithWhereWithoutAuthUserInput, AccountUpdateWithoutAuthUserInput>, AccountUncheckedUpdateWithoutAuthUserInput>
  }

  export type AuthUserCreateNestedOneWithoutSessionsInput = {
    create?: XOR<AuthUserCreateWithoutSessionsInput, AuthUserUncheckedCreateWithoutSessionsInput>
    connectOrCreate?: AuthUserCreateOrConnectWithoutSessionsInput
    connect?: AuthUserWhereUniqueInput
  }

  export type AuthUserUpdateOneRequiredWithoutSessionsNestedInput = {
    create?: XOR<AuthUserCreateWithoutSessionsInput, AuthUserUncheckedCreateWithoutSessionsInput>
    connectOrCreate?: AuthUserCreateOrConnectWithoutSessionsInput
    upsert?: AuthUserUpsertWithoutSessionsInput
    connect?: AuthUserWhereUniqueInput
    update?: XOR<XOR<AuthUserUpdateToOneWithWhereWithoutSessionsInput, AuthUserUpdateWithoutSessionsInput>, AuthUserUncheckedUpdateWithoutSessionsInput>
  }

  export type AuthUserCreateNestedOneWithoutAccountsInput = {
    create?: XOR<AuthUserCreateWithoutAccountsInput, AuthUserUncheckedCreateWithoutAccountsInput>
    connectOrCreate?: AuthUserCreateOrConnectWithoutAccountsInput
    connect?: AuthUserWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type AuthUserUpdateOneRequiredWithoutAccountsNestedInput = {
    create?: XOR<AuthUserCreateWithoutAccountsInput, AuthUserUncheckedCreateWithoutAccountsInput>
    connectOrCreate?: AuthUserCreateOrConnectWithoutAccountsInput
    upsert?: AuthUserUpsertWithoutAccountsInput
    connect?: AuthUserWhereUniqueInput
    update?: XOR<XOR<AuthUserUpdateToOneWithWhereWithoutAccountsInput, AuthUserUpdateWithoutAccountsInput>, AuthUserUncheckedUpdateWithoutAccountsInput>
  }

  export type AuthUserCreateNestedOneWithoutDomainAccountInput = {
    create?: XOR<AuthUserCreateWithoutDomainAccountInput, AuthUserUncheckedCreateWithoutDomainAccountInput>
    connectOrCreate?: AuthUserCreateOrConnectWithoutDomainAccountInput
    connect?: AuthUserWhereUniqueInput
  }

  export type ProfileMemberCreateNestedManyWithoutAccountInput = {
    create?: XOR<ProfileMemberCreateWithoutAccountInput, ProfileMemberUncheckedCreateWithoutAccountInput> | ProfileMemberCreateWithoutAccountInput[] | ProfileMemberUncheckedCreateWithoutAccountInput[]
    connectOrCreate?: ProfileMemberCreateOrConnectWithoutAccountInput | ProfileMemberCreateOrConnectWithoutAccountInput[]
    createMany?: ProfileMemberCreateManyAccountInputEnvelope
    connect?: ProfileMemberWhereUniqueInput | ProfileMemberWhereUniqueInput[]
  }

  export type IdentityCheckCreateNestedManyWithoutAccountInput = {
    create?: XOR<IdentityCheckCreateWithoutAccountInput, IdentityCheckUncheckedCreateWithoutAccountInput> | IdentityCheckCreateWithoutAccountInput[] | IdentityCheckUncheckedCreateWithoutAccountInput[]
    connectOrCreate?: IdentityCheckCreateOrConnectWithoutAccountInput | IdentityCheckCreateOrConnectWithoutAccountInput[]
    createMany?: IdentityCheckCreateManyAccountInputEnvelope
    connect?: IdentityCheckWhereUniqueInput | IdentityCheckWhereUniqueInput[]
  }

  export type ProfileMemberUncheckedCreateNestedManyWithoutAccountInput = {
    create?: XOR<ProfileMemberCreateWithoutAccountInput, ProfileMemberUncheckedCreateWithoutAccountInput> | ProfileMemberCreateWithoutAccountInput[] | ProfileMemberUncheckedCreateWithoutAccountInput[]
    connectOrCreate?: ProfileMemberCreateOrConnectWithoutAccountInput | ProfileMemberCreateOrConnectWithoutAccountInput[]
    createMany?: ProfileMemberCreateManyAccountInputEnvelope
    connect?: ProfileMemberWhereUniqueInput | ProfileMemberWhereUniqueInput[]
  }

  export type IdentityCheckUncheckedCreateNestedManyWithoutAccountInput = {
    create?: XOR<IdentityCheckCreateWithoutAccountInput, IdentityCheckUncheckedCreateWithoutAccountInput> | IdentityCheckCreateWithoutAccountInput[] | IdentityCheckUncheckedCreateWithoutAccountInput[]
    connectOrCreate?: IdentityCheckCreateOrConnectWithoutAccountInput | IdentityCheckCreateOrConnectWithoutAccountInput[]
    createMany?: IdentityCheckCreateManyAccountInputEnvelope
    connect?: IdentityCheckWhereUniqueInput | IdentityCheckWhereUniqueInput[]
  }

  export type EnumIdentityTierFieldUpdateOperationsInput = {
    set?: $Enums.IdentityTier
  }

  export type AuthUserUpdateOneRequiredWithoutDomainAccountNestedInput = {
    create?: XOR<AuthUserCreateWithoutDomainAccountInput, AuthUserUncheckedCreateWithoutDomainAccountInput>
    connectOrCreate?: AuthUserCreateOrConnectWithoutDomainAccountInput
    upsert?: AuthUserUpsertWithoutDomainAccountInput
    connect?: AuthUserWhereUniqueInput
    update?: XOR<XOR<AuthUserUpdateToOneWithWhereWithoutDomainAccountInput, AuthUserUpdateWithoutDomainAccountInput>, AuthUserUncheckedUpdateWithoutDomainAccountInput>
  }

  export type ProfileMemberUpdateManyWithoutAccountNestedInput = {
    create?: XOR<ProfileMemberCreateWithoutAccountInput, ProfileMemberUncheckedCreateWithoutAccountInput> | ProfileMemberCreateWithoutAccountInput[] | ProfileMemberUncheckedCreateWithoutAccountInput[]
    connectOrCreate?: ProfileMemberCreateOrConnectWithoutAccountInput | ProfileMemberCreateOrConnectWithoutAccountInput[]
    upsert?: ProfileMemberUpsertWithWhereUniqueWithoutAccountInput | ProfileMemberUpsertWithWhereUniqueWithoutAccountInput[]
    createMany?: ProfileMemberCreateManyAccountInputEnvelope
    set?: ProfileMemberWhereUniqueInput | ProfileMemberWhereUniqueInput[]
    disconnect?: ProfileMemberWhereUniqueInput | ProfileMemberWhereUniqueInput[]
    delete?: ProfileMemberWhereUniqueInput | ProfileMemberWhereUniqueInput[]
    connect?: ProfileMemberWhereUniqueInput | ProfileMemberWhereUniqueInput[]
    update?: ProfileMemberUpdateWithWhereUniqueWithoutAccountInput | ProfileMemberUpdateWithWhereUniqueWithoutAccountInput[]
    updateMany?: ProfileMemberUpdateManyWithWhereWithoutAccountInput | ProfileMemberUpdateManyWithWhereWithoutAccountInput[]
    deleteMany?: ProfileMemberScalarWhereInput | ProfileMemberScalarWhereInput[]
  }

  export type IdentityCheckUpdateManyWithoutAccountNestedInput = {
    create?: XOR<IdentityCheckCreateWithoutAccountInput, IdentityCheckUncheckedCreateWithoutAccountInput> | IdentityCheckCreateWithoutAccountInput[] | IdentityCheckUncheckedCreateWithoutAccountInput[]
    connectOrCreate?: IdentityCheckCreateOrConnectWithoutAccountInput | IdentityCheckCreateOrConnectWithoutAccountInput[]
    upsert?: IdentityCheckUpsertWithWhereUniqueWithoutAccountInput | IdentityCheckUpsertWithWhereUniqueWithoutAccountInput[]
    createMany?: IdentityCheckCreateManyAccountInputEnvelope
    set?: IdentityCheckWhereUniqueInput | IdentityCheckWhereUniqueInput[]
    disconnect?: IdentityCheckWhereUniqueInput | IdentityCheckWhereUniqueInput[]
    delete?: IdentityCheckWhereUniqueInput | IdentityCheckWhereUniqueInput[]
    connect?: IdentityCheckWhereUniqueInput | IdentityCheckWhereUniqueInput[]
    update?: IdentityCheckUpdateWithWhereUniqueWithoutAccountInput | IdentityCheckUpdateWithWhereUniqueWithoutAccountInput[]
    updateMany?: IdentityCheckUpdateManyWithWhereWithoutAccountInput | IdentityCheckUpdateManyWithWhereWithoutAccountInput[]
    deleteMany?: IdentityCheckScalarWhereInput | IdentityCheckScalarWhereInput[]
  }

  export type ProfileMemberUncheckedUpdateManyWithoutAccountNestedInput = {
    create?: XOR<ProfileMemberCreateWithoutAccountInput, ProfileMemberUncheckedCreateWithoutAccountInput> | ProfileMemberCreateWithoutAccountInput[] | ProfileMemberUncheckedCreateWithoutAccountInput[]
    connectOrCreate?: ProfileMemberCreateOrConnectWithoutAccountInput | ProfileMemberCreateOrConnectWithoutAccountInput[]
    upsert?: ProfileMemberUpsertWithWhereUniqueWithoutAccountInput | ProfileMemberUpsertWithWhereUniqueWithoutAccountInput[]
    createMany?: ProfileMemberCreateManyAccountInputEnvelope
    set?: ProfileMemberWhereUniqueInput | ProfileMemberWhereUniqueInput[]
    disconnect?: ProfileMemberWhereUniqueInput | ProfileMemberWhereUniqueInput[]
    delete?: ProfileMemberWhereUniqueInput | ProfileMemberWhereUniqueInput[]
    connect?: ProfileMemberWhereUniqueInput | ProfileMemberWhereUniqueInput[]
    update?: ProfileMemberUpdateWithWhereUniqueWithoutAccountInput | ProfileMemberUpdateWithWhereUniqueWithoutAccountInput[]
    updateMany?: ProfileMemberUpdateManyWithWhereWithoutAccountInput | ProfileMemberUpdateManyWithWhereWithoutAccountInput[]
    deleteMany?: ProfileMemberScalarWhereInput | ProfileMemberScalarWhereInput[]
  }

  export type IdentityCheckUncheckedUpdateManyWithoutAccountNestedInput = {
    create?: XOR<IdentityCheckCreateWithoutAccountInput, IdentityCheckUncheckedCreateWithoutAccountInput> | IdentityCheckCreateWithoutAccountInput[] | IdentityCheckUncheckedCreateWithoutAccountInput[]
    connectOrCreate?: IdentityCheckCreateOrConnectWithoutAccountInput | IdentityCheckCreateOrConnectWithoutAccountInput[]
    upsert?: IdentityCheckUpsertWithWhereUniqueWithoutAccountInput | IdentityCheckUpsertWithWhereUniqueWithoutAccountInput[]
    createMany?: IdentityCheckCreateManyAccountInputEnvelope
    set?: IdentityCheckWhereUniqueInput | IdentityCheckWhereUniqueInput[]
    disconnect?: IdentityCheckWhereUniqueInput | IdentityCheckWhereUniqueInput[]
    delete?: IdentityCheckWhereUniqueInput | IdentityCheckWhereUniqueInput[]
    connect?: IdentityCheckWhereUniqueInput | IdentityCheckWhereUniqueInput[]
    update?: IdentityCheckUpdateWithWhereUniqueWithoutAccountInput | IdentityCheckUpdateWithWhereUniqueWithoutAccountInput[]
    updateMany?: IdentityCheckUpdateManyWithWhereWithoutAccountInput | IdentityCheckUpdateManyWithWhereWithoutAccountInput[]
    deleteMany?: IdentityCheckScalarWhereInput | IdentityCheckScalarWhereInput[]
  }

  export type ProfileMemberCreateNestedManyWithoutProfileInput = {
    create?: XOR<ProfileMemberCreateWithoutProfileInput, ProfileMemberUncheckedCreateWithoutProfileInput> | ProfileMemberCreateWithoutProfileInput[] | ProfileMemberUncheckedCreateWithoutProfileInput[]
    connectOrCreate?: ProfileMemberCreateOrConnectWithoutProfileInput | ProfileMemberCreateOrConnectWithoutProfileInput[]
    createMany?: ProfileMemberCreateManyProfileInputEnvelope
    connect?: ProfileMemberWhereUniqueInput | ProfileMemberWhereUniqueInput[]
  }

  export type PostCreateNestedManyWithoutProfileInput = {
    create?: XOR<PostCreateWithoutProfileInput, PostUncheckedCreateWithoutProfileInput> | PostCreateWithoutProfileInput[] | PostUncheckedCreateWithoutProfileInput[]
    connectOrCreate?: PostCreateOrConnectWithoutProfileInput | PostCreateOrConnectWithoutProfileInput[]
    createMany?: PostCreateManyProfileInputEnvelope
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
  }

  export type CommentCreateNestedManyWithoutProfileInput = {
    create?: XOR<CommentCreateWithoutProfileInput, CommentUncheckedCreateWithoutProfileInput> | CommentCreateWithoutProfileInput[] | CommentUncheckedCreateWithoutProfileInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutProfileInput | CommentCreateOrConnectWithoutProfileInput[]
    createMany?: CommentCreateManyProfileInputEnvelope
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
  }

  export type LikeCreateNestedManyWithoutProfileInput = {
    create?: XOR<LikeCreateWithoutProfileInput, LikeUncheckedCreateWithoutProfileInput> | LikeCreateWithoutProfileInput[] | LikeUncheckedCreateWithoutProfileInput[]
    connectOrCreate?: LikeCreateOrConnectWithoutProfileInput | LikeCreateOrConnectWithoutProfileInput[]
    createMany?: LikeCreateManyProfileInputEnvelope
    connect?: LikeWhereUniqueInput | LikeWhereUniqueInput[]
  }

  export type NFTCreateNestedManyWithoutProfileInput = {
    create?: XOR<NFTCreateWithoutProfileInput, NFTUncheckedCreateWithoutProfileInput> | NFTCreateWithoutProfileInput[] | NFTUncheckedCreateWithoutProfileInput[]
    connectOrCreate?: NFTCreateOrConnectWithoutProfileInput | NFTCreateOrConnectWithoutProfileInput[]
    createMany?: NFTCreateManyProfileInputEnvelope
    connect?: NFTWhereUniqueInput | NFTWhereUniqueInput[]
  }

  export type FollowCreateNestedManyWithoutFollowerInput = {
    create?: XOR<FollowCreateWithoutFollowerInput, FollowUncheckedCreateWithoutFollowerInput> | FollowCreateWithoutFollowerInput[] | FollowUncheckedCreateWithoutFollowerInput[]
    connectOrCreate?: FollowCreateOrConnectWithoutFollowerInput | FollowCreateOrConnectWithoutFollowerInput[]
    createMany?: FollowCreateManyFollowerInputEnvelope
    connect?: FollowWhereUniqueInput | FollowWhereUniqueInput[]
  }

  export type FollowCreateNestedManyWithoutFollowingInput = {
    create?: XOR<FollowCreateWithoutFollowingInput, FollowUncheckedCreateWithoutFollowingInput> | FollowCreateWithoutFollowingInput[] | FollowUncheckedCreateWithoutFollowingInput[]
    connectOrCreate?: FollowCreateOrConnectWithoutFollowingInput | FollowCreateOrConnectWithoutFollowingInput[]
    createMany?: FollowCreateManyFollowingInputEnvelope
    connect?: FollowWhereUniqueInput | FollowWhereUniqueInput[]
  }

  export type ProfileMemberUncheckedCreateNestedManyWithoutProfileInput = {
    create?: XOR<ProfileMemberCreateWithoutProfileInput, ProfileMemberUncheckedCreateWithoutProfileInput> | ProfileMemberCreateWithoutProfileInput[] | ProfileMemberUncheckedCreateWithoutProfileInput[]
    connectOrCreate?: ProfileMemberCreateOrConnectWithoutProfileInput | ProfileMemberCreateOrConnectWithoutProfileInput[]
    createMany?: ProfileMemberCreateManyProfileInputEnvelope
    connect?: ProfileMemberWhereUniqueInput | ProfileMemberWhereUniqueInput[]
  }

  export type PostUncheckedCreateNestedManyWithoutProfileInput = {
    create?: XOR<PostCreateWithoutProfileInput, PostUncheckedCreateWithoutProfileInput> | PostCreateWithoutProfileInput[] | PostUncheckedCreateWithoutProfileInput[]
    connectOrCreate?: PostCreateOrConnectWithoutProfileInput | PostCreateOrConnectWithoutProfileInput[]
    createMany?: PostCreateManyProfileInputEnvelope
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
  }

  export type CommentUncheckedCreateNestedManyWithoutProfileInput = {
    create?: XOR<CommentCreateWithoutProfileInput, CommentUncheckedCreateWithoutProfileInput> | CommentCreateWithoutProfileInput[] | CommentUncheckedCreateWithoutProfileInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutProfileInput | CommentCreateOrConnectWithoutProfileInput[]
    createMany?: CommentCreateManyProfileInputEnvelope
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
  }

  export type LikeUncheckedCreateNestedManyWithoutProfileInput = {
    create?: XOR<LikeCreateWithoutProfileInput, LikeUncheckedCreateWithoutProfileInput> | LikeCreateWithoutProfileInput[] | LikeUncheckedCreateWithoutProfileInput[]
    connectOrCreate?: LikeCreateOrConnectWithoutProfileInput | LikeCreateOrConnectWithoutProfileInput[]
    createMany?: LikeCreateManyProfileInputEnvelope
    connect?: LikeWhereUniqueInput | LikeWhereUniqueInput[]
  }

  export type NFTUncheckedCreateNestedManyWithoutProfileInput = {
    create?: XOR<NFTCreateWithoutProfileInput, NFTUncheckedCreateWithoutProfileInput> | NFTCreateWithoutProfileInput[] | NFTUncheckedCreateWithoutProfileInput[]
    connectOrCreate?: NFTCreateOrConnectWithoutProfileInput | NFTCreateOrConnectWithoutProfileInput[]
    createMany?: NFTCreateManyProfileInputEnvelope
    connect?: NFTWhereUniqueInput | NFTWhereUniqueInput[]
  }

  export type FollowUncheckedCreateNestedManyWithoutFollowerInput = {
    create?: XOR<FollowCreateWithoutFollowerInput, FollowUncheckedCreateWithoutFollowerInput> | FollowCreateWithoutFollowerInput[] | FollowUncheckedCreateWithoutFollowerInput[]
    connectOrCreate?: FollowCreateOrConnectWithoutFollowerInput | FollowCreateOrConnectWithoutFollowerInput[]
    createMany?: FollowCreateManyFollowerInputEnvelope
    connect?: FollowWhereUniqueInput | FollowWhereUniqueInput[]
  }

  export type FollowUncheckedCreateNestedManyWithoutFollowingInput = {
    create?: XOR<FollowCreateWithoutFollowingInput, FollowUncheckedCreateWithoutFollowingInput> | FollowCreateWithoutFollowingInput[] | FollowUncheckedCreateWithoutFollowingInput[]
    connectOrCreate?: FollowCreateOrConnectWithoutFollowingInput | FollowCreateOrConnectWithoutFollowingInput[]
    createMany?: FollowCreateManyFollowingInputEnvelope
    connect?: FollowWhereUniqueInput | FollowWhereUniqueInput[]
  }

  export type EnumProfileTypeFieldUpdateOperationsInput = {
    set?: $Enums.ProfileType
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ProfileMemberUpdateManyWithoutProfileNestedInput = {
    create?: XOR<ProfileMemberCreateWithoutProfileInput, ProfileMemberUncheckedCreateWithoutProfileInput> | ProfileMemberCreateWithoutProfileInput[] | ProfileMemberUncheckedCreateWithoutProfileInput[]
    connectOrCreate?: ProfileMemberCreateOrConnectWithoutProfileInput | ProfileMemberCreateOrConnectWithoutProfileInput[]
    upsert?: ProfileMemberUpsertWithWhereUniqueWithoutProfileInput | ProfileMemberUpsertWithWhereUniqueWithoutProfileInput[]
    createMany?: ProfileMemberCreateManyProfileInputEnvelope
    set?: ProfileMemberWhereUniqueInput | ProfileMemberWhereUniqueInput[]
    disconnect?: ProfileMemberWhereUniqueInput | ProfileMemberWhereUniqueInput[]
    delete?: ProfileMemberWhereUniqueInput | ProfileMemberWhereUniqueInput[]
    connect?: ProfileMemberWhereUniqueInput | ProfileMemberWhereUniqueInput[]
    update?: ProfileMemberUpdateWithWhereUniqueWithoutProfileInput | ProfileMemberUpdateWithWhereUniqueWithoutProfileInput[]
    updateMany?: ProfileMemberUpdateManyWithWhereWithoutProfileInput | ProfileMemberUpdateManyWithWhereWithoutProfileInput[]
    deleteMany?: ProfileMemberScalarWhereInput | ProfileMemberScalarWhereInput[]
  }

  export type PostUpdateManyWithoutProfileNestedInput = {
    create?: XOR<PostCreateWithoutProfileInput, PostUncheckedCreateWithoutProfileInput> | PostCreateWithoutProfileInput[] | PostUncheckedCreateWithoutProfileInput[]
    connectOrCreate?: PostCreateOrConnectWithoutProfileInput | PostCreateOrConnectWithoutProfileInput[]
    upsert?: PostUpsertWithWhereUniqueWithoutProfileInput | PostUpsertWithWhereUniqueWithoutProfileInput[]
    createMany?: PostCreateManyProfileInputEnvelope
    set?: PostWhereUniqueInput | PostWhereUniqueInput[]
    disconnect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    delete?: PostWhereUniqueInput | PostWhereUniqueInput[]
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    update?: PostUpdateWithWhereUniqueWithoutProfileInput | PostUpdateWithWhereUniqueWithoutProfileInput[]
    updateMany?: PostUpdateManyWithWhereWithoutProfileInput | PostUpdateManyWithWhereWithoutProfileInput[]
    deleteMany?: PostScalarWhereInput | PostScalarWhereInput[]
  }

  export type CommentUpdateManyWithoutProfileNestedInput = {
    create?: XOR<CommentCreateWithoutProfileInput, CommentUncheckedCreateWithoutProfileInput> | CommentCreateWithoutProfileInput[] | CommentUncheckedCreateWithoutProfileInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutProfileInput | CommentCreateOrConnectWithoutProfileInput[]
    upsert?: CommentUpsertWithWhereUniqueWithoutProfileInput | CommentUpsertWithWhereUniqueWithoutProfileInput[]
    createMany?: CommentCreateManyProfileInputEnvelope
    set?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    disconnect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    delete?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    update?: CommentUpdateWithWhereUniqueWithoutProfileInput | CommentUpdateWithWhereUniqueWithoutProfileInput[]
    updateMany?: CommentUpdateManyWithWhereWithoutProfileInput | CommentUpdateManyWithWhereWithoutProfileInput[]
    deleteMany?: CommentScalarWhereInput | CommentScalarWhereInput[]
  }

  export type LikeUpdateManyWithoutProfileNestedInput = {
    create?: XOR<LikeCreateWithoutProfileInput, LikeUncheckedCreateWithoutProfileInput> | LikeCreateWithoutProfileInput[] | LikeUncheckedCreateWithoutProfileInput[]
    connectOrCreate?: LikeCreateOrConnectWithoutProfileInput | LikeCreateOrConnectWithoutProfileInput[]
    upsert?: LikeUpsertWithWhereUniqueWithoutProfileInput | LikeUpsertWithWhereUniqueWithoutProfileInput[]
    createMany?: LikeCreateManyProfileInputEnvelope
    set?: LikeWhereUniqueInput | LikeWhereUniqueInput[]
    disconnect?: LikeWhereUniqueInput | LikeWhereUniqueInput[]
    delete?: LikeWhereUniqueInput | LikeWhereUniqueInput[]
    connect?: LikeWhereUniqueInput | LikeWhereUniqueInput[]
    update?: LikeUpdateWithWhereUniqueWithoutProfileInput | LikeUpdateWithWhereUniqueWithoutProfileInput[]
    updateMany?: LikeUpdateManyWithWhereWithoutProfileInput | LikeUpdateManyWithWhereWithoutProfileInput[]
    deleteMany?: LikeScalarWhereInput | LikeScalarWhereInput[]
  }

  export type NFTUpdateManyWithoutProfileNestedInput = {
    create?: XOR<NFTCreateWithoutProfileInput, NFTUncheckedCreateWithoutProfileInput> | NFTCreateWithoutProfileInput[] | NFTUncheckedCreateWithoutProfileInput[]
    connectOrCreate?: NFTCreateOrConnectWithoutProfileInput | NFTCreateOrConnectWithoutProfileInput[]
    upsert?: NFTUpsertWithWhereUniqueWithoutProfileInput | NFTUpsertWithWhereUniqueWithoutProfileInput[]
    createMany?: NFTCreateManyProfileInputEnvelope
    set?: NFTWhereUniqueInput | NFTWhereUniqueInput[]
    disconnect?: NFTWhereUniqueInput | NFTWhereUniqueInput[]
    delete?: NFTWhereUniqueInput | NFTWhereUniqueInput[]
    connect?: NFTWhereUniqueInput | NFTWhereUniqueInput[]
    update?: NFTUpdateWithWhereUniqueWithoutProfileInput | NFTUpdateWithWhereUniqueWithoutProfileInput[]
    updateMany?: NFTUpdateManyWithWhereWithoutProfileInput | NFTUpdateManyWithWhereWithoutProfileInput[]
    deleteMany?: NFTScalarWhereInput | NFTScalarWhereInput[]
  }

  export type FollowUpdateManyWithoutFollowerNestedInput = {
    create?: XOR<FollowCreateWithoutFollowerInput, FollowUncheckedCreateWithoutFollowerInput> | FollowCreateWithoutFollowerInput[] | FollowUncheckedCreateWithoutFollowerInput[]
    connectOrCreate?: FollowCreateOrConnectWithoutFollowerInput | FollowCreateOrConnectWithoutFollowerInput[]
    upsert?: FollowUpsertWithWhereUniqueWithoutFollowerInput | FollowUpsertWithWhereUniqueWithoutFollowerInput[]
    createMany?: FollowCreateManyFollowerInputEnvelope
    set?: FollowWhereUniqueInput | FollowWhereUniqueInput[]
    disconnect?: FollowWhereUniqueInput | FollowWhereUniqueInput[]
    delete?: FollowWhereUniqueInput | FollowWhereUniqueInput[]
    connect?: FollowWhereUniqueInput | FollowWhereUniqueInput[]
    update?: FollowUpdateWithWhereUniqueWithoutFollowerInput | FollowUpdateWithWhereUniqueWithoutFollowerInput[]
    updateMany?: FollowUpdateManyWithWhereWithoutFollowerInput | FollowUpdateManyWithWhereWithoutFollowerInput[]
    deleteMany?: FollowScalarWhereInput | FollowScalarWhereInput[]
  }

  export type FollowUpdateManyWithoutFollowingNestedInput = {
    create?: XOR<FollowCreateWithoutFollowingInput, FollowUncheckedCreateWithoutFollowingInput> | FollowCreateWithoutFollowingInput[] | FollowUncheckedCreateWithoutFollowingInput[]
    connectOrCreate?: FollowCreateOrConnectWithoutFollowingInput | FollowCreateOrConnectWithoutFollowingInput[]
    upsert?: FollowUpsertWithWhereUniqueWithoutFollowingInput | FollowUpsertWithWhereUniqueWithoutFollowingInput[]
    createMany?: FollowCreateManyFollowingInputEnvelope
    set?: FollowWhereUniqueInput | FollowWhereUniqueInput[]
    disconnect?: FollowWhereUniqueInput | FollowWhereUniqueInput[]
    delete?: FollowWhereUniqueInput | FollowWhereUniqueInput[]
    connect?: FollowWhereUniqueInput | FollowWhereUniqueInput[]
    update?: FollowUpdateWithWhereUniqueWithoutFollowingInput | FollowUpdateWithWhereUniqueWithoutFollowingInput[]
    updateMany?: FollowUpdateManyWithWhereWithoutFollowingInput | FollowUpdateManyWithWhereWithoutFollowingInput[]
    deleteMany?: FollowScalarWhereInput | FollowScalarWhereInput[]
  }

  export type ProfileMemberUncheckedUpdateManyWithoutProfileNestedInput = {
    create?: XOR<ProfileMemberCreateWithoutProfileInput, ProfileMemberUncheckedCreateWithoutProfileInput> | ProfileMemberCreateWithoutProfileInput[] | ProfileMemberUncheckedCreateWithoutProfileInput[]
    connectOrCreate?: ProfileMemberCreateOrConnectWithoutProfileInput | ProfileMemberCreateOrConnectWithoutProfileInput[]
    upsert?: ProfileMemberUpsertWithWhereUniqueWithoutProfileInput | ProfileMemberUpsertWithWhereUniqueWithoutProfileInput[]
    createMany?: ProfileMemberCreateManyProfileInputEnvelope
    set?: ProfileMemberWhereUniqueInput | ProfileMemberWhereUniqueInput[]
    disconnect?: ProfileMemberWhereUniqueInput | ProfileMemberWhereUniqueInput[]
    delete?: ProfileMemberWhereUniqueInput | ProfileMemberWhereUniqueInput[]
    connect?: ProfileMemberWhereUniqueInput | ProfileMemberWhereUniqueInput[]
    update?: ProfileMemberUpdateWithWhereUniqueWithoutProfileInput | ProfileMemberUpdateWithWhereUniqueWithoutProfileInput[]
    updateMany?: ProfileMemberUpdateManyWithWhereWithoutProfileInput | ProfileMemberUpdateManyWithWhereWithoutProfileInput[]
    deleteMany?: ProfileMemberScalarWhereInput | ProfileMemberScalarWhereInput[]
  }

  export type PostUncheckedUpdateManyWithoutProfileNestedInput = {
    create?: XOR<PostCreateWithoutProfileInput, PostUncheckedCreateWithoutProfileInput> | PostCreateWithoutProfileInput[] | PostUncheckedCreateWithoutProfileInput[]
    connectOrCreate?: PostCreateOrConnectWithoutProfileInput | PostCreateOrConnectWithoutProfileInput[]
    upsert?: PostUpsertWithWhereUniqueWithoutProfileInput | PostUpsertWithWhereUniqueWithoutProfileInput[]
    createMany?: PostCreateManyProfileInputEnvelope
    set?: PostWhereUniqueInput | PostWhereUniqueInput[]
    disconnect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    delete?: PostWhereUniqueInput | PostWhereUniqueInput[]
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    update?: PostUpdateWithWhereUniqueWithoutProfileInput | PostUpdateWithWhereUniqueWithoutProfileInput[]
    updateMany?: PostUpdateManyWithWhereWithoutProfileInput | PostUpdateManyWithWhereWithoutProfileInput[]
    deleteMany?: PostScalarWhereInput | PostScalarWhereInput[]
  }

  export type CommentUncheckedUpdateManyWithoutProfileNestedInput = {
    create?: XOR<CommentCreateWithoutProfileInput, CommentUncheckedCreateWithoutProfileInput> | CommentCreateWithoutProfileInput[] | CommentUncheckedCreateWithoutProfileInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutProfileInput | CommentCreateOrConnectWithoutProfileInput[]
    upsert?: CommentUpsertWithWhereUniqueWithoutProfileInput | CommentUpsertWithWhereUniqueWithoutProfileInput[]
    createMany?: CommentCreateManyProfileInputEnvelope
    set?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    disconnect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    delete?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    update?: CommentUpdateWithWhereUniqueWithoutProfileInput | CommentUpdateWithWhereUniqueWithoutProfileInput[]
    updateMany?: CommentUpdateManyWithWhereWithoutProfileInput | CommentUpdateManyWithWhereWithoutProfileInput[]
    deleteMany?: CommentScalarWhereInput | CommentScalarWhereInput[]
  }

  export type LikeUncheckedUpdateManyWithoutProfileNestedInput = {
    create?: XOR<LikeCreateWithoutProfileInput, LikeUncheckedCreateWithoutProfileInput> | LikeCreateWithoutProfileInput[] | LikeUncheckedCreateWithoutProfileInput[]
    connectOrCreate?: LikeCreateOrConnectWithoutProfileInput | LikeCreateOrConnectWithoutProfileInput[]
    upsert?: LikeUpsertWithWhereUniqueWithoutProfileInput | LikeUpsertWithWhereUniqueWithoutProfileInput[]
    createMany?: LikeCreateManyProfileInputEnvelope
    set?: LikeWhereUniqueInput | LikeWhereUniqueInput[]
    disconnect?: LikeWhereUniqueInput | LikeWhereUniqueInput[]
    delete?: LikeWhereUniqueInput | LikeWhereUniqueInput[]
    connect?: LikeWhereUniqueInput | LikeWhereUniqueInput[]
    update?: LikeUpdateWithWhereUniqueWithoutProfileInput | LikeUpdateWithWhereUniqueWithoutProfileInput[]
    updateMany?: LikeUpdateManyWithWhereWithoutProfileInput | LikeUpdateManyWithWhereWithoutProfileInput[]
    deleteMany?: LikeScalarWhereInput | LikeScalarWhereInput[]
  }

  export type NFTUncheckedUpdateManyWithoutProfileNestedInput = {
    create?: XOR<NFTCreateWithoutProfileInput, NFTUncheckedCreateWithoutProfileInput> | NFTCreateWithoutProfileInput[] | NFTUncheckedCreateWithoutProfileInput[]
    connectOrCreate?: NFTCreateOrConnectWithoutProfileInput | NFTCreateOrConnectWithoutProfileInput[]
    upsert?: NFTUpsertWithWhereUniqueWithoutProfileInput | NFTUpsertWithWhereUniqueWithoutProfileInput[]
    createMany?: NFTCreateManyProfileInputEnvelope
    set?: NFTWhereUniqueInput | NFTWhereUniqueInput[]
    disconnect?: NFTWhereUniqueInput | NFTWhereUniqueInput[]
    delete?: NFTWhereUniqueInput | NFTWhereUniqueInput[]
    connect?: NFTWhereUniqueInput | NFTWhereUniqueInput[]
    update?: NFTUpdateWithWhereUniqueWithoutProfileInput | NFTUpdateWithWhereUniqueWithoutProfileInput[]
    updateMany?: NFTUpdateManyWithWhereWithoutProfileInput | NFTUpdateManyWithWhereWithoutProfileInput[]
    deleteMany?: NFTScalarWhereInput | NFTScalarWhereInput[]
  }

  export type FollowUncheckedUpdateManyWithoutFollowerNestedInput = {
    create?: XOR<FollowCreateWithoutFollowerInput, FollowUncheckedCreateWithoutFollowerInput> | FollowCreateWithoutFollowerInput[] | FollowUncheckedCreateWithoutFollowerInput[]
    connectOrCreate?: FollowCreateOrConnectWithoutFollowerInput | FollowCreateOrConnectWithoutFollowerInput[]
    upsert?: FollowUpsertWithWhereUniqueWithoutFollowerInput | FollowUpsertWithWhereUniqueWithoutFollowerInput[]
    createMany?: FollowCreateManyFollowerInputEnvelope
    set?: FollowWhereUniqueInput | FollowWhereUniqueInput[]
    disconnect?: FollowWhereUniqueInput | FollowWhereUniqueInput[]
    delete?: FollowWhereUniqueInput | FollowWhereUniqueInput[]
    connect?: FollowWhereUniqueInput | FollowWhereUniqueInput[]
    update?: FollowUpdateWithWhereUniqueWithoutFollowerInput | FollowUpdateWithWhereUniqueWithoutFollowerInput[]
    updateMany?: FollowUpdateManyWithWhereWithoutFollowerInput | FollowUpdateManyWithWhereWithoutFollowerInput[]
    deleteMany?: FollowScalarWhereInput | FollowScalarWhereInput[]
  }

  export type FollowUncheckedUpdateManyWithoutFollowingNestedInput = {
    create?: XOR<FollowCreateWithoutFollowingInput, FollowUncheckedCreateWithoutFollowingInput> | FollowCreateWithoutFollowingInput[] | FollowUncheckedCreateWithoutFollowingInput[]
    connectOrCreate?: FollowCreateOrConnectWithoutFollowingInput | FollowCreateOrConnectWithoutFollowingInput[]
    upsert?: FollowUpsertWithWhereUniqueWithoutFollowingInput | FollowUpsertWithWhereUniqueWithoutFollowingInput[]
    createMany?: FollowCreateManyFollowingInputEnvelope
    set?: FollowWhereUniqueInput | FollowWhereUniqueInput[]
    disconnect?: FollowWhereUniqueInput | FollowWhereUniqueInput[]
    delete?: FollowWhereUniqueInput | FollowWhereUniqueInput[]
    connect?: FollowWhereUniqueInput | FollowWhereUniqueInput[]
    update?: FollowUpdateWithWhereUniqueWithoutFollowingInput | FollowUpdateWithWhereUniqueWithoutFollowingInput[]
    updateMany?: FollowUpdateManyWithWhereWithoutFollowingInput | FollowUpdateManyWithWhereWithoutFollowingInput[]
    deleteMany?: FollowScalarWhereInput | FollowScalarWhereInput[]
  }

  export type AccountCreateNestedOneWithoutProfilesInput = {
    create?: XOR<AccountCreateWithoutProfilesInput, AccountUncheckedCreateWithoutProfilesInput>
    connectOrCreate?: AccountCreateOrConnectWithoutProfilesInput
    connect?: AccountWhereUniqueInput
  }

  export type ProfileCreateNestedOneWithoutMembersInput = {
    create?: XOR<ProfileCreateWithoutMembersInput, ProfileUncheckedCreateWithoutMembersInput>
    connectOrCreate?: ProfileCreateOrConnectWithoutMembersInput
    connect?: ProfileWhereUniqueInput
  }

  export type EnumProfileRoleFieldUpdateOperationsInput = {
    set?: $Enums.ProfileRole
  }

  export type AccountUpdateOneRequiredWithoutProfilesNestedInput = {
    create?: XOR<AccountCreateWithoutProfilesInput, AccountUncheckedCreateWithoutProfilesInput>
    connectOrCreate?: AccountCreateOrConnectWithoutProfilesInput
    upsert?: AccountUpsertWithoutProfilesInput
    connect?: AccountWhereUniqueInput
    update?: XOR<XOR<AccountUpdateToOneWithWhereWithoutProfilesInput, AccountUpdateWithoutProfilesInput>, AccountUncheckedUpdateWithoutProfilesInput>
  }

  export type ProfileUpdateOneRequiredWithoutMembersNestedInput = {
    create?: XOR<ProfileCreateWithoutMembersInput, ProfileUncheckedCreateWithoutMembersInput>
    connectOrCreate?: ProfileCreateOrConnectWithoutMembersInput
    upsert?: ProfileUpsertWithoutMembersInput
    connect?: ProfileWhereUniqueInput
    update?: XOR<XOR<ProfileUpdateToOneWithWhereWithoutMembersInput, ProfileUpdateWithoutMembersInput>, ProfileUncheckedUpdateWithoutMembersInput>
  }

  export type AccountCreateNestedOneWithoutIdentityChecksInput = {
    create?: XOR<AccountCreateWithoutIdentityChecksInput, AccountUncheckedCreateWithoutIdentityChecksInput>
    connectOrCreate?: AccountCreateOrConnectWithoutIdentityChecksInput
    connect?: AccountWhereUniqueInput
  }

  export type EnumIdentityCheckStatusFieldUpdateOperationsInput = {
    set?: $Enums.IdentityCheckStatus
  }

  export type AccountUpdateOneRequiredWithoutIdentityChecksNestedInput = {
    create?: XOR<AccountCreateWithoutIdentityChecksInput, AccountUncheckedCreateWithoutIdentityChecksInput>
    connectOrCreate?: AccountCreateOrConnectWithoutIdentityChecksInput
    upsert?: AccountUpsertWithoutIdentityChecksInput
    connect?: AccountWhereUniqueInput
    update?: XOR<XOR<AccountUpdateToOneWithWhereWithoutIdentityChecksInput, AccountUpdateWithoutIdentityChecksInput>, AccountUncheckedUpdateWithoutIdentityChecksInput>
  }

  export type PostCreatemediaUrlsInput = {
    set: string[]
  }

  export type ProfileCreateNestedOneWithoutPostsInput = {
    create?: XOR<ProfileCreateWithoutPostsInput, ProfileUncheckedCreateWithoutPostsInput>
    connectOrCreate?: ProfileCreateOrConnectWithoutPostsInput
    connect?: ProfileWhereUniqueInput
  }

  export type CommentCreateNestedManyWithoutPostInput = {
    create?: XOR<CommentCreateWithoutPostInput, CommentUncheckedCreateWithoutPostInput> | CommentCreateWithoutPostInput[] | CommentUncheckedCreateWithoutPostInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutPostInput | CommentCreateOrConnectWithoutPostInput[]
    createMany?: CommentCreateManyPostInputEnvelope
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
  }

  export type LikeCreateNestedManyWithoutPostInput = {
    create?: XOR<LikeCreateWithoutPostInput, LikeUncheckedCreateWithoutPostInput> | LikeCreateWithoutPostInput[] | LikeUncheckedCreateWithoutPostInput[]
    connectOrCreate?: LikeCreateOrConnectWithoutPostInput | LikeCreateOrConnectWithoutPostInput[]
    createMany?: LikeCreateManyPostInputEnvelope
    connect?: LikeWhereUniqueInput | LikeWhereUniqueInput[]
  }

  export type NFTCreateNestedOneWithoutPostInput = {
    create?: XOR<NFTCreateWithoutPostInput, NFTUncheckedCreateWithoutPostInput>
    connectOrCreate?: NFTCreateOrConnectWithoutPostInput
    connect?: NFTWhereUniqueInput
  }

  export type CommentUncheckedCreateNestedManyWithoutPostInput = {
    create?: XOR<CommentCreateWithoutPostInput, CommentUncheckedCreateWithoutPostInput> | CommentCreateWithoutPostInput[] | CommentUncheckedCreateWithoutPostInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutPostInput | CommentCreateOrConnectWithoutPostInput[]
    createMany?: CommentCreateManyPostInputEnvelope
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
  }

  export type LikeUncheckedCreateNestedManyWithoutPostInput = {
    create?: XOR<LikeCreateWithoutPostInput, LikeUncheckedCreateWithoutPostInput> | LikeCreateWithoutPostInput[] | LikeUncheckedCreateWithoutPostInput[]
    connectOrCreate?: LikeCreateOrConnectWithoutPostInput | LikeCreateOrConnectWithoutPostInput[]
    createMany?: LikeCreateManyPostInputEnvelope
    connect?: LikeWhereUniqueInput | LikeWhereUniqueInput[]
  }

  export type NFTUncheckedCreateNestedOneWithoutPostInput = {
    create?: XOR<NFTCreateWithoutPostInput, NFTUncheckedCreateWithoutPostInput>
    connectOrCreate?: NFTCreateOrConnectWithoutPostInput
    connect?: NFTWhereUniqueInput
  }

  export type PostUpdatemediaUrlsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type EnumMediaTypeFieldUpdateOperationsInput = {
    set?: $Enums.MediaType
  }

  export type ProfileUpdateOneRequiredWithoutPostsNestedInput = {
    create?: XOR<ProfileCreateWithoutPostsInput, ProfileUncheckedCreateWithoutPostsInput>
    connectOrCreate?: ProfileCreateOrConnectWithoutPostsInput
    upsert?: ProfileUpsertWithoutPostsInput
    connect?: ProfileWhereUniqueInput
    update?: XOR<XOR<ProfileUpdateToOneWithWhereWithoutPostsInput, ProfileUpdateWithoutPostsInput>, ProfileUncheckedUpdateWithoutPostsInput>
  }

  export type CommentUpdateManyWithoutPostNestedInput = {
    create?: XOR<CommentCreateWithoutPostInput, CommentUncheckedCreateWithoutPostInput> | CommentCreateWithoutPostInput[] | CommentUncheckedCreateWithoutPostInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutPostInput | CommentCreateOrConnectWithoutPostInput[]
    upsert?: CommentUpsertWithWhereUniqueWithoutPostInput | CommentUpsertWithWhereUniqueWithoutPostInput[]
    createMany?: CommentCreateManyPostInputEnvelope
    set?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    disconnect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    delete?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    update?: CommentUpdateWithWhereUniqueWithoutPostInput | CommentUpdateWithWhereUniqueWithoutPostInput[]
    updateMany?: CommentUpdateManyWithWhereWithoutPostInput | CommentUpdateManyWithWhereWithoutPostInput[]
    deleteMany?: CommentScalarWhereInput | CommentScalarWhereInput[]
  }

  export type LikeUpdateManyWithoutPostNestedInput = {
    create?: XOR<LikeCreateWithoutPostInput, LikeUncheckedCreateWithoutPostInput> | LikeCreateWithoutPostInput[] | LikeUncheckedCreateWithoutPostInput[]
    connectOrCreate?: LikeCreateOrConnectWithoutPostInput | LikeCreateOrConnectWithoutPostInput[]
    upsert?: LikeUpsertWithWhereUniqueWithoutPostInput | LikeUpsertWithWhereUniqueWithoutPostInput[]
    createMany?: LikeCreateManyPostInputEnvelope
    set?: LikeWhereUniqueInput | LikeWhereUniqueInput[]
    disconnect?: LikeWhereUniqueInput | LikeWhereUniqueInput[]
    delete?: LikeWhereUniqueInput | LikeWhereUniqueInput[]
    connect?: LikeWhereUniqueInput | LikeWhereUniqueInput[]
    update?: LikeUpdateWithWhereUniqueWithoutPostInput | LikeUpdateWithWhereUniqueWithoutPostInput[]
    updateMany?: LikeUpdateManyWithWhereWithoutPostInput | LikeUpdateManyWithWhereWithoutPostInput[]
    deleteMany?: LikeScalarWhereInput | LikeScalarWhereInput[]
  }

  export type NFTUpdateOneWithoutPostNestedInput = {
    create?: XOR<NFTCreateWithoutPostInput, NFTUncheckedCreateWithoutPostInput>
    connectOrCreate?: NFTCreateOrConnectWithoutPostInput
    upsert?: NFTUpsertWithoutPostInput
    disconnect?: NFTWhereInput | boolean
    delete?: NFTWhereInput | boolean
    connect?: NFTWhereUniqueInput
    update?: XOR<XOR<NFTUpdateToOneWithWhereWithoutPostInput, NFTUpdateWithoutPostInput>, NFTUncheckedUpdateWithoutPostInput>
  }

  export type CommentUncheckedUpdateManyWithoutPostNestedInput = {
    create?: XOR<CommentCreateWithoutPostInput, CommentUncheckedCreateWithoutPostInput> | CommentCreateWithoutPostInput[] | CommentUncheckedCreateWithoutPostInput[]
    connectOrCreate?: CommentCreateOrConnectWithoutPostInput | CommentCreateOrConnectWithoutPostInput[]
    upsert?: CommentUpsertWithWhereUniqueWithoutPostInput | CommentUpsertWithWhereUniqueWithoutPostInput[]
    createMany?: CommentCreateManyPostInputEnvelope
    set?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    disconnect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    delete?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    connect?: CommentWhereUniqueInput | CommentWhereUniqueInput[]
    update?: CommentUpdateWithWhereUniqueWithoutPostInput | CommentUpdateWithWhereUniqueWithoutPostInput[]
    updateMany?: CommentUpdateManyWithWhereWithoutPostInput | CommentUpdateManyWithWhereWithoutPostInput[]
    deleteMany?: CommentScalarWhereInput | CommentScalarWhereInput[]
  }

  export type LikeUncheckedUpdateManyWithoutPostNestedInput = {
    create?: XOR<LikeCreateWithoutPostInput, LikeUncheckedCreateWithoutPostInput> | LikeCreateWithoutPostInput[] | LikeUncheckedCreateWithoutPostInput[]
    connectOrCreate?: LikeCreateOrConnectWithoutPostInput | LikeCreateOrConnectWithoutPostInput[]
    upsert?: LikeUpsertWithWhereUniqueWithoutPostInput | LikeUpsertWithWhereUniqueWithoutPostInput[]
    createMany?: LikeCreateManyPostInputEnvelope
    set?: LikeWhereUniqueInput | LikeWhereUniqueInput[]
    disconnect?: LikeWhereUniqueInput | LikeWhereUniqueInput[]
    delete?: LikeWhereUniqueInput | LikeWhereUniqueInput[]
    connect?: LikeWhereUniqueInput | LikeWhereUniqueInput[]
    update?: LikeUpdateWithWhereUniqueWithoutPostInput | LikeUpdateWithWhereUniqueWithoutPostInput[]
    updateMany?: LikeUpdateManyWithWhereWithoutPostInput | LikeUpdateManyWithWhereWithoutPostInput[]
    deleteMany?: LikeScalarWhereInput | LikeScalarWhereInput[]
  }

  export type NFTUncheckedUpdateOneWithoutPostNestedInput = {
    create?: XOR<NFTCreateWithoutPostInput, NFTUncheckedCreateWithoutPostInput>
    connectOrCreate?: NFTCreateOrConnectWithoutPostInput
    upsert?: NFTUpsertWithoutPostInput
    disconnect?: NFTWhereInput | boolean
    delete?: NFTWhereInput | boolean
    connect?: NFTWhereUniqueInput
    update?: XOR<XOR<NFTUpdateToOneWithWhereWithoutPostInput, NFTUpdateWithoutPostInput>, NFTUncheckedUpdateWithoutPostInput>
  }

  export type PostCreateNestedOneWithoutCommentsInput = {
    create?: XOR<PostCreateWithoutCommentsInput, PostUncheckedCreateWithoutCommentsInput>
    connectOrCreate?: PostCreateOrConnectWithoutCommentsInput
    connect?: PostWhereUniqueInput
  }

  export type ProfileCreateNestedOneWithoutCommentsInput = {
    create?: XOR<ProfileCreateWithoutCommentsInput, ProfileUncheckedCreateWithoutCommentsInput>
    connectOrCreate?: ProfileCreateOrConnectWithoutCommentsInput
    connect?: ProfileWhereUniqueInput
  }

  export type PostUpdateOneRequiredWithoutCommentsNestedInput = {
    create?: XOR<PostCreateWithoutCommentsInput, PostUncheckedCreateWithoutCommentsInput>
    connectOrCreate?: PostCreateOrConnectWithoutCommentsInput
    upsert?: PostUpsertWithoutCommentsInput
    connect?: PostWhereUniqueInput
    update?: XOR<XOR<PostUpdateToOneWithWhereWithoutCommentsInput, PostUpdateWithoutCommentsInput>, PostUncheckedUpdateWithoutCommentsInput>
  }

  export type ProfileUpdateOneRequiredWithoutCommentsNestedInput = {
    create?: XOR<ProfileCreateWithoutCommentsInput, ProfileUncheckedCreateWithoutCommentsInput>
    connectOrCreate?: ProfileCreateOrConnectWithoutCommentsInput
    upsert?: ProfileUpsertWithoutCommentsInput
    connect?: ProfileWhereUniqueInput
    update?: XOR<XOR<ProfileUpdateToOneWithWhereWithoutCommentsInput, ProfileUpdateWithoutCommentsInput>, ProfileUncheckedUpdateWithoutCommentsInput>
  }

  export type PostCreateNestedOneWithoutLikesInput = {
    create?: XOR<PostCreateWithoutLikesInput, PostUncheckedCreateWithoutLikesInput>
    connectOrCreate?: PostCreateOrConnectWithoutLikesInput
    connect?: PostWhereUniqueInput
  }

  export type ProfileCreateNestedOneWithoutLikesInput = {
    create?: XOR<ProfileCreateWithoutLikesInput, ProfileUncheckedCreateWithoutLikesInput>
    connectOrCreate?: ProfileCreateOrConnectWithoutLikesInput
    connect?: ProfileWhereUniqueInput
  }

  export type PostUpdateOneRequiredWithoutLikesNestedInput = {
    create?: XOR<PostCreateWithoutLikesInput, PostUncheckedCreateWithoutLikesInput>
    connectOrCreate?: PostCreateOrConnectWithoutLikesInput
    upsert?: PostUpsertWithoutLikesInput
    connect?: PostWhereUniqueInput
    update?: XOR<XOR<PostUpdateToOneWithWhereWithoutLikesInput, PostUpdateWithoutLikesInput>, PostUncheckedUpdateWithoutLikesInput>
  }

  export type ProfileUpdateOneRequiredWithoutLikesNestedInput = {
    create?: XOR<ProfileCreateWithoutLikesInput, ProfileUncheckedCreateWithoutLikesInput>
    connectOrCreate?: ProfileCreateOrConnectWithoutLikesInput
    upsert?: ProfileUpsertWithoutLikesInput
    connect?: ProfileWhereUniqueInput
    update?: XOR<XOR<ProfileUpdateToOneWithWhereWithoutLikesInput, ProfileUpdateWithoutLikesInput>, ProfileUncheckedUpdateWithoutLikesInput>
  }

  export type ProfileCreateNestedOneWithoutFollowsInput = {
    create?: XOR<ProfileCreateWithoutFollowsInput, ProfileUncheckedCreateWithoutFollowsInput>
    connectOrCreate?: ProfileCreateOrConnectWithoutFollowsInput
    connect?: ProfileWhereUniqueInput
  }

  export type ProfileCreateNestedOneWithoutFollowersInput = {
    create?: XOR<ProfileCreateWithoutFollowersInput, ProfileUncheckedCreateWithoutFollowersInput>
    connectOrCreate?: ProfileCreateOrConnectWithoutFollowersInput
    connect?: ProfileWhereUniqueInput
  }

  export type ProfileUpdateOneRequiredWithoutFollowsNestedInput = {
    create?: XOR<ProfileCreateWithoutFollowsInput, ProfileUncheckedCreateWithoutFollowsInput>
    connectOrCreate?: ProfileCreateOrConnectWithoutFollowsInput
    upsert?: ProfileUpsertWithoutFollowsInput
    connect?: ProfileWhereUniqueInput
    update?: XOR<XOR<ProfileUpdateToOneWithWhereWithoutFollowsInput, ProfileUpdateWithoutFollowsInput>, ProfileUncheckedUpdateWithoutFollowsInput>
  }

  export type ProfileUpdateOneRequiredWithoutFollowersNestedInput = {
    create?: XOR<ProfileCreateWithoutFollowersInput, ProfileUncheckedCreateWithoutFollowersInput>
    connectOrCreate?: ProfileCreateOrConnectWithoutFollowersInput
    upsert?: ProfileUpsertWithoutFollowersInput
    connect?: ProfileWhereUniqueInput
    update?: XOR<XOR<ProfileUpdateToOneWithWhereWithoutFollowersInput, ProfileUpdateWithoutFollowersInput>, ProfileUncheckedUpdateWithoutFollowersInput>
  }

  export type ProfileCreateNestedOneWithoutNftsInput = {
    create?: XOR<ProfileCreateWithoutNftsInput, ProfileUncheckedCreateWithoutNftsInput>
    connectOrCreate?: ProfileCreateOrConnectWithoutNftsInput
    connect?: ProfileWhereUniqueInput
  }

  export type PostCreateNestedOneWithoutNftInput = {
    create?: XOR<PostCreateWithoutNftInput, PostUncheckedCreateWithoutNftInput>
    connectOrCreate?: PostCreateOrConnectWithoutNftInput
    connect?: PostWhereUniqueInput
  }

  export type EnumNFTTypeFieldUpdateOperationsInput = {
    set?: $Enums.NFTType
  }

  export type ProfileUpdateOneRequiredWithoutNftsNestedInput = {
    create?: XOR<ProfileCreateWithoutNftsInput, ProfileUncheckedCreateWithoutNftsInput>
    connectOrCreate?: ProfileCreateOrConnectWithoutNftsInput
    upsert?: ProfileUpsertWithoutNftsInput
    connect?: ProfileWhereUniqueInput
    update?: XOR<XOR<ProfileUpdateToOneWithWhereWithoutNftsInput, ProfileUpdateWithoutNftsInput>, ProfileUncheckedUpdateWithoutNftsInput>
  }

  export type PostUpdateOneWithoutNftNestedInput = {
    create?: XOR<PostCreateWithoutNftInput, PostUncheckedCreateWithoutNftInput>
    connectOrCreate?: PostCreateOrConnectWithoutNftInput
    upsert?: PostUpsertWithoutNftInput
    disconnect?: PostWhereInput | boolean
    delete?: PostWhereInput | boolean
    connect?: PostWhereUniqueInput
    update?: XOR<XOR<PostUpdateToOneWithWhereWithoutNftInput, PostUpdateWithoutNftInput>, PostUncheckedUpdateWithoutNftInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumIdentityTierFilter<$PrismaModel = never> = {
    equals?: $Enums.IdentityTier | EnumIdentityTierFieldRefInput<$PrismaModel>
    in?: $Enums.IdentityTier[] | ListEnumIdentityTierFieldRefInput<$PrismaModel>
    notIn?: $Enums.IdentityTier[] | ListEnumIdentityTierFieldRefInput<$PrismaModel>
    not?: NestedEnumIdentityTierFilter<$PrismaModel> | $Enums.IdentityTier
  }

  export type NestedEnumIdentityTierWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.IdentityTier | EnumIdentityTierFieldRefInput<$PrismaModel>
    in?: $Enums.IdentityTier[] | ListEnumIdentityTierFieldRefInput<$PrismaModel>
    notIn?: $Enums.IdentityTier[] | ListEnumIdentityTierFieldRefInput<$PrismaModel>
    not?: NestedEnumIdentityTierWithAggregatesFilter<$PrismaModel> | $Enums.IdentityTier
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumIdentityTierFilter<$PrismaModel>
    _max?: NestedEnumIdentityTierFilter<$PrismaModel>
  }

  export type NestedEnumProfileTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ProfileType | EnumProfileTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ProfileType[] | ListEnumProfileTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProfileType[] | ListEnumProfileTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumProfileTypeFilter<$PrismaModel> | $Enums.ProfileType
  }

  export type NestedEnumProfileTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ProfileType | EnumProfileTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ProfileType[] | ListEnumProfileTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProfileType[] | ListEnumProfileTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumProfileTypeWithAggregatesFilter<$PrismaModel> | $Enums.ProfileType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumProfileTypeFilter<$PrismaModel>
    _max?: NestedEnumProfileTypeFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumProfileRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.ProfileRole | EnumProfileRoleFieldRefInput<$PrismaModel>
    in?: $Enums.ProfileRole[] | ListEnumProfileRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProfileRole[] | ListEnumProfileRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumProfileRoleFilter<$PrismaModel> | $Enums.ProfileRole
  }

  export type NestedEnumProfileRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ProfileRole | EnumProfileRoleFieldRefInput<$PrismaModel>
    in?: $Enums.ProfileRole[] | ListEnumProfileRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProfileRole[] | ListEnumProfileRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumProfileRoleWithAggregatesFilter<$PrismaModel> | $Enums.ProfileRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumProfileRoleFilter<$PrismaModel>
    _max?: NestedEnumProfileRoleFilter<$PrismaModel>
  }

  export type NestedEnumIdentityCheckStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.IdentityCheckStatus | EnumIdentityCheckStatusFieldRefInput<$PrismaModel>
    in?: $Enums.IdentityCheckStatus[] | ListEnumIdentityCheckStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.IdentityCheckStatus[] | ListEnumIdentityCheckStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumIdentityCheckStatusFilter<$PrismaModel> | $Enums.IdentityCheckStatus
  }

  export type NestedEnumIdentityCheckStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.IdentityCheckStatus | EnumIdentityCheckStatusFieldRefInput<$PrismaModel>
    in?: $Enums.IdentityCheckStatus[] | ListEnumIdentityCheckStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.IdentityCheckStatus[] | ListEnumIdentityCheckStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumIdentityCheckStatusWithAggregatesFilter<$PrismaModel> | $Enums.IdentityCheckStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumIdentityCheckStatusFilter<$PrismaModel>
    _max?: NestedEnumIdentityCheckStatusFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumMediaTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.MediaType | EnumMediaTypeFieldRefInput<$PrismaModel>
    in?: $Enums.MediaType[] | ListEnumMediaTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MediaType[] | ListEnumMediaTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumMediaTypeFilter<$PrismaModel> | $Enums.MediaType
  }

  export type NestedEnumMediaTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MediaType | EnumMediaTypeFieldRefInput<$PrismaModel>
    in?: $Enums.MediaType[] | ListEnumMediaTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MediaType[] | ListEnumMediaTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumMediaTypeWithAggregatesFilter<$PrismaModel> | $Enums.MediaType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMediaTypeFilter<$PrismaModel>
    _max?: NestedEnumMediaTypeFilter<$PrismaModel>
  }

  export type NestedEnumNFTTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.NFTType | EnumNFTTypeFieldRefInput<$PrismaModel>
    in?: $Enums.NFTType[] | ListEnumNFTTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.NFTType[] | ListEnumNFTTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumNFTTypeFilter<$PrismaModel> | $Enums.NFTType
  }

  export type NestedEnumNFTTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.NFTType | EnumNFTTypeFieldRefInput<$PrismaModel>
    in?: $Enums.NFTType[] | ListEnumNFTTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.NFTType[] | ListEnumNFTTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumNFTTypeWithAggregatesFilter<$PrismaModel> | $Enums.NFTType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumNFTTypeFilter<$PrismaModel>
    _max?: NestedEnumNFTTypeFilter<$PrismaModel>
  }

  export type SessionCreateWithoutUserInput = {
    id: string
    expiresAt: Date | string
    token: string
    createdAt?: Date | string
    updatedAt?: Date | string
    ipAddress?: string | null
    userAgent?: string | null
  }

  export type SessionUncheckedCreateWithoutUserInput = {
    id: string
    expiresAt: Date | string
    token: string
    createdAt?: Date | string
    updatedAt?: Date | string
    ipAddress?: string | null
    userAgent?: string | null
  }

  export type SessionCreateOrConnectWithoutUserInput = {
    where: SessionWhereUniqueInput
    create: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput>
  }

  export type SessionCreateManyUserInputEnvelope = {
    data: SessionCreateManyUserInput | SessionCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type AuthAccountCreateWithoutUserInput = {
    id: string
    accountId: string
    providerId: string
    accessToken?: string | null
    refreshToken?: string | null
    idToken?: string | null
    accessTokenExpiresAt?: Date | string | null
    refreshTokenExpiresAt?: Date | string | null
    scope?: string | null
    password?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AuthAccountUncheckedCreateWithoutUserInput = {
    id: string
    accountId: string
    providerId: string
    accessToken?: string | null
    refreshToken?: string | null
    idToken?: string | null
    accessTokenExpiresAt?: Date | string | null
    refreshTokenExpiresAt?: Date | string | null
    scope?: string | null
    password?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AuthAccountCreateOrConnectWithoutUserInput = {
    where: AuthAccountWhereUniqueInput
    create: XOR<AuthAccountCreateWithoutUserInput, AuthAccountUncheckedCreateWithoutUserInput>
  }

  export type AuthAccountCreateManyUserInputEnvelope = {
    data: AuthAccountCreateManyUserInput | AuthAccountCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type AccountCreateWithoutAuthUserInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    lastActiveAt?: Date | string
    email?: string | null
    walletAddress?: string | null
    isBanned?: boolean
    identityTier?: $Enums.IdentityTier
    identityVerifiedAt?: Date | string | null
    profiles?: ProfileMemberCreateNestedManyWithoutAccountInput
    identityChecks?: IdentityCheckCreateNestedManyWithoutAccountInput
  }

  export type AccountUncheckedCreateWithoutAuthUserInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    lastActiveAt?: Date | string
    email?: string | null
    walletAddress?: string | null
    isBanned?: boolean
    identityTier?: $Enums.IdentityTier
    identityVerifiedAt?: Date | string | null
    profiles?: ProfileMemberUncheckedCreateNestedManyWithoutAccountInput
    identityChecks?: IdentityCheckUncheckedCreateNestedManyWithoutAccountInput
  }

  export type AccountCreateOrConnectWithoutAuthUserInput = {
    where: AccountWhereUniqueInput
    create: XOR<AccountCreateWithoutAuthUserInput, AccountUncheckedCreateWithoutAuthUserInput>
  }

  export type SessionUpsertWithWhereUniqueWithoutUserInput = {
    where: SessionWhereUniqueInput
    update: XOR<SessionUpdateWithoutUserInput, SessionUncheckedUpdateWithoutUserInput>
    create: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput>
  }

  export type SessionUpdateWithWhereUniqueWithoutUserInput = {
    where: SessionWhereUniqueInput
    data: XOR<SessionUpdateWithoutUserInput, SessionUncheckedUpdateWithoutUserInput>
  }

  export type SessionUpdateManyWithWhereWithoutUserInput = {
    where: SessionScalarWhereInput
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyWithoutUserInput>
  }

  export type SessionScalarWhereInput = {
    AND?: SessionScalarWhereInput | SessionScalarWhereInput[]
    OR?: SessionScalarWhereInput[]
    NOT?: SessionScalarWhereInput | SessionScalarWhereInput[]
    id?: StringFilter<"Session"> | string
    expiresAt?: DateTimeFilter<"Session"> | Date | string
    token?: StringFilter<"Session"> | string
    createdAt?: DateTimeFilter<"Session"> | Date | string
    updatedAt?: DateTimeFilter<"Session"> | Date | string
    ipAddress?: StringNullableFilter<"Session"> | string | null
    userAgent?: StringNullableFilter<"Session"> | string | null
    userId?: StringFilter<"Session"> | string
  }

  export type AuthAccountUpsertWithWhereUniqueWithoutUserInput = {
    where: AuthAccountWhereUniqueInput
    update: XOR<AuthAccountUpdateWithoutUserInput, AuthAccountUncheckedUpdateWithoutUserInput>
    create: XOR<AuthAccountCreateWithoutUserInput, AuthAccountUncheckedCreateWithoutUserInput>
  }

  export type AuthAccountUpdateWithWhereUniqueWithoutUserInput = {
    where: AuthAccountWhereUniqueInput
    data: XOR<AuthAccountUpdateWithoutUserInput, AuthAccountUncheckedUpdateWithoutUserInput>
  }

  export type AuthAccountUpdateManyWithWhereWithoutUserInput = {
    where: AuthAccountScalarWhereInput
    data: XOR<AuthAccountUpdateManyMutationInput, AuthAccountUncheckedUpdateManyWithoutUserInput>
  }

  export type AuthAccountScalarWhereInput = {
    AND?: AuthAccountScalarWhereInput | AuthAccountScalarWhereInput[]
    OR?: AuthAccountScalarWhereInput[]
    NOT?: AuthAccountScalarWhereInput | AuthAccountScalarWhereInput[]
    id?: StringFilter<"AuthAccount"> | string
    accountId?: StringFilter<"AuthAccount"> | string
    providerId?: StringFilter<"AuthAccount"> | string
    userId?: StringFilter<"AuthAccount"> | string
    accessToken?: StringNullableFilter<"AuthAccount"> | string | null
    refreshToken?: StringNullableFilter<"AuthAccount"> | string | null
    idToken?: StringNullableFilter<"AuthAccount"> | string | null
    accessTokenExpiresAt?: DateTimeNullableFilter<"AuthAccount"> | Date | string | null
    refreshTokenExpiresAt?: DateTimeNullableFilter<"AuthAccount"> | Date | string | null
    scope?: StringNullableFilter<"AuthAccount"> | string | null
    password?: StringNullableFilter<"AuthAccount"> | string | null
    createdAt?: DateTimeFilter<"AuthAccount"> | Date | string
    updatedAt?: DateTimeFilter<"AuthAccount"> | Date | string
  }

  export type AccountUpsertWithoutAuthUserInput = {
    update: XOR<AccountUpdateWithoutAuthUserInput, AccountUncheckedUpdateWithoutAuthUserInput>
    create: XOR<AccountCreateWithoutAuthUserInput, AccountUncheckedCreateWithoutAuthUserInput>
    where?: AccountWhereInput
  }

  export type AccountUpdateToOneWithWhereWithoutAuthUserInput = {
    where?: AccountWhereInput
    data: XOR<AccountUpdateWithoutAuthUserInput, AccountUncheckedUpdateWithoutAuthUserInput>
  }

  export type AccountUpdateWithoutAuthUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastActiveAt?: DateTimeFieldUpdateOperationsInput | Date | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    walletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    identityTier?: EnumIdentityTierFieldUpdateOperationsInput | $Enums.IdentityTier
    identityVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profiles?: ProfileMemberUpdateManyWithoutAccountNestedInput
    identityChecks?: IdentityCheckUpdateManyWithoutAccountNestedInput
  }

  export type AccountUncheckedUpdateWithoutAuthUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastActiveAt?: DateTimeFieldUpdateOperationsInput | Date | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    walletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    identityTier?: EnumIdentityTierFieldUpdateOperationsInput | $Enums.IdentityTier
    identityVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profiles?: ProfileMemberUncheckedUpdateManyWithoutAccountNestedInput
    identityChecks?: IdentityCheckUncheckedUpdateManyWithoutAccountNestedInput
  }

  export type AuthUserCreateWithoutSessionsInput = {
    id: string
    name: string
    email: string
    emailVerified?: boolean
    image?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    accounts?: AuthAccountCreateNestedManyWithoutUserInput
    domainAccount?: AccountCreateNestedOneWithoutAuthUserInput
  }

  export type AuthUserUncheckedCreateWithoutSessionsInput = {
    id: string
    name: string
    email: string
    emailVerified?: boolean
    image?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    accounts?: AuthAccountUncheckedCreateNestedManyWithoutUserInput
    domainAccount?: AccountUncheckedCreateNestedOneWithoutAuthUserInput
  }

  export type AuthUserCreateOrConnectWithoutSessionsInput = {
    where: AuthUserWhereUniqueInput
    create: XOR<AuthUserCreateWithoutSessionsInput, AuthUserUncheckedCreateWithoutSessionsInput>
  }

  export type AuthUserUpsertWithoutSessionsInput = {
    update: XOR<AuthUserUpdateWithoutSessionsInput, AuthUserUncheckedUpdateWithoutSessionsInput>
    create: XOR<AuthUserCreateWithoutSessionsInput, AuthUserUncheckedCreateWithoutSessionsInput>
    where?: AuthUserWhereInput
  }

  export type AuthUserUpdateToOneWithWhereWithoutSessionsInput = {
    where?: AuthUserWhereInput
    data: XOR<AuthUserUpdateWithoutSessionsInput, AuthUserUncheckedUpdateWithoutSessionsInput>
  }

  export type AuthUserUpdateWithoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    image?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    accounts?: AuthAccountUpdateManyWithoutUserNestedInput
    domainAccount?: AccountUpdateOneWithoutAuthUserNestedInput
  }

  export type AuthUserUncheckedUpdateWithoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    image?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    accounts?: AuthAccountUncheckedUpdateManyWithoutUserNestedInput
    domainAccount?: AccountUncheckedUpdateOneWithoutAuthUserNestedInput
  }

  export type AuthUserCreateWithoutAccountsInput = {
    id: string
    name: string
    email: string
    emailVerified?: boolean
    image?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sessions?: SessionCreateNestedManyWithoutUserInput
    domainAccount?: AccountCreateNestedOneWithoutAuthUserInput
  }

  export type AuthUserUncheckedCreateWithoutAccountsInput = {
    id: string
    name: string
    email: string
    emailVerified?: boolean
    image?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    domainAccount?: AccountUncheckedCreateNestedOneWithoutAuthUserInput
  }

  export type AuthUserCreateOrConnectWithoutAccountsInput = {
    where: AuthUserWhereUniqueInput
    create: XOR<AuthUserCreateWithoutAccountsInput, AuthUserUncheckedCreateWithoutAccountsInput>
  }

  export type AuthUserUpsertWithoutAccountsInput = {
    update: XOR<AuthUserUpdateWithoutAccountsInput, AuthUserUncheckedUpdateWithoutAccountsInput>
    create: XOR<AuthUserCreateWithoutAccountsInput, AuthUserUncheckedCreateWithoutAccountsInput>
    where?: AuthUserWhereInput
  }

  export type AuthUserUpdateToOneWithWhereWithoutAccountsInput = {
    where?: AuthUserWhereInput
    data: XOR<AuthUserUpdateWithoutAccountsInput, AuthUserUncheckedUpdateWithoutAccountsInput>
  }

  export type AuthUserUpdateWithoutAccountsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    image?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessions?: SessionUpdateManyWithoutUserNestedInput
    domainAccount?: AccountUpdateOneWithoutAuthUserNestedInput
  }

  export type AuthUserUncheckedUpdateWithoutAccountsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    image?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    domainAccount?: AccountUncheckedUpdateOneWithoutAuthUserNestedInput
  }

  export type AuthUserCreateWithoutDomainAccountInput = {
    id: string
    name: string
    email: string
    emailVerified?: boolean
    image?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sessions?: SessionCreateNestedManyWithoutUserInput
    accounts?: AuthAccountCreateNestedManyWithoutUserInput
  }

  export type AuthUserUncheckedCreateWithoutDomainAccountInput = {
    id: string
    name: string
    email: string
    emailVerified?: boolean
    image?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    accounts?: AuthAccountUncheckedCreateNestedManyWithoutUserInput
  }

  export type AuthUserCreateOrConnectWithoutDomainAccountInput = {
    where: AuthUserWhereUniqueInput
    create: XOR<AuthUserCreateWithoutDomainAccountInput, AuthUserUncheckedCreateWithoutDomainAccountInput>
  }

  export type ProfileMemberCreateWithoutAccountInput = {
    id?: string
    role?: $Enums.ProfileRole
    createdAt?: Date | string
    profile: ProfileCreateNestedOneWithoutMembersInput
  }

  export type ProfileMemberUncheckedCreateWithoutAccountInput = {
    id?: string
    profileId: string
    role?: $Enums.ProfileRole
    createdAt?: Date | string
  }

  export type ProfileMemberCreateOrConnectWithoutAccountInput = {
    where: ProfileMemberWhereUniqueInput
    create: XOR<ProfileMemberCreateWithoutAccountInput, ProfileMemberUncheckedCreateWithoutAccountInput>
  }

  export type ProfileMemberCreateManyAccountInputEnvelope = {
    data: ProfileMemberCreateManyAccountInput | ProfileMemberCreateManyAccountInput[]
    skipDuplicates?: boolean
  }

  export type IdentityCheckCreateWithoutAccountInput = {
    id?: string
    provider: string
    externalId: string
    tier: $Enums.IdentityTier
    status: $Enums.IdentityCheckStatus
    initiatedAt?: Date | string
    resolvedAt?: Date | string | null
    expiresAt?: Date | string | null
    providerPayload?: NullableJsonNullValueInput | InputJsonValue
  }

  export type IdentityCheckUncheckedCreateWithoutAccountInput = {
    id?: string
    provider: string
    externalId: string
    tier: $Enums.IdentityTier
    status: $Enums.IdentityCheckStatus
    initiatedAt?: Date | string
    resolvedAt?: Date | string | null
    expiresAt?: Date | string | null
    providerPayload?: NullableJsonNullValueInput | InputJsonValue
  }

  export type IdentityCheckCreateOrConnectWithoutAccountInput = {
    where: IdentityCheckWhereUniqueInput
    create: XOR<IdentityCheckCreateWithoutAccountInput, IdentityCheckUncheckedCreateWithoutAccountInput>
  }

  export type IdentityCheckCreateManyAccountInputEnvelope = {
    data: IdentityCheckCreateManyAccountInput | IdentityCheckCreateManyAccountInput[]
    skipDuplicates?: boolean
  }

  export type AuthUserUpsertWithoutDomainAccountInput = {
    update: XOR<AuthUserUpdateWithoutDomainAccountInput, AuthUserUncheckedUpdateWithoutDomainAccountInput>
    create: XOR<AuthUserCreateWithoutDomainAccountInput, AuthUserUncheckedCreateWithoutDomainAccountInput>
    where?: AuthUserWhereInput
  }

  export type AuthUserUpdateToOneWithWhereWithoutDomainAccountInput = {
    where?: AuthUserWhereInput
    data: XOR<AuthUserUpdateWithoutDomainAccountInput, AuthUserUncheckedUpdateWithoutDomainAccountInput>
  }

  export type AuthUserUpdateWithoutDomainAccountInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    image?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessions?: SessionUpdateManyWithoutUserNestedInput
    accounts?: AuthAccountUpdateManyWithoutUserNestedInput
  }

  export type AuthUserUncheckedUpdateWithoutDomainAccountInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    emailVerified?: BoolFieldUpdateOperationsInput | boolean
    image?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    accounts?: AuthAccountUncheckedUpdateManyWithoutUserNestedInput
  }

  export type ProfileMemberUpsertWithWhereUniqueWithoutAccountInput = {
    where: ProfileMemberWhereUniqueInput
    update: XOR<ProfileMemberUpdateWithoutAccountInput, ProfileMemberUncheckedUpdateWithoutAccountInput>
    create: XOR<ProfileMemberCreateWithoutAccountInput, ProfileMemberUncheckedCreateWithoutAccountInput>
  }

  export type ProfileMemberUpdateWithWhereUniqueWithoutAccountInput = {
    where: ProfileMemberWhereUniqueInput
    data: XOR<ProfileMemberUpdateWithoutAccountInput, ProfileMemberUncheckedUpdateWithoutAccountInput>
  }

  export type ProfileMemberUpdateManyWithWhereWithoutAccountInput = {
    where: ProfileMemberScalarWhereInput
    data: XOR<ProfileMemberUpdateManyMutationInput, ProfileMemberUncheckedUpdateManyWithoutAccountInput>
  }

  export type ProfileMemberScalarWhereInput = {
    AND?: ProfileMemberScalarWhereInput | ProfileMemberScalarWhereInput[]
    OR?: ProfileMemberScalarWhereInput[]
    NOT?: ProfileMemberScalarWhereInput | ProfileMemberScalarWhereInput[]
    id?: StringFilter<"ProfileMember"> | string
    accountId?: StringFilter<"ProfileMember"> | string
    profileId?: StringFilter<"ProfileMember"> | string
    role?: EnumProfileRoleFilter<"ProfileMember"> | $Enums.ProfileRole
    createdAt?: DateTimeFilter<"ProfileMember"> | Date | string
  }

  export type IdentityCheckUpsertWithWhereUniqueWithoutAccountInput = {
    where: IdentityCheckWhereUniqueInput
    update: XOR<IdentityCheckUpdateWithoutAccountInput, IdentityCheckUncheckedUpdateWithoutAccountInput>
    create: XOR<IdentityCheckCreateWithoutAccountInput, IdentityCheckUncheckedCreateWithoutAccountInput>
  }

  export type IdentityCheckUpdateWithWhereUniqueWithoutAccountInput = {
    where: IdentityCheckWhereUniqueInput
    data: XOR<IdentityCheckUpdateWithoutAccountInput, IdentityCheckUncheckedUpdateWithoutAccountInput>
  }

  export type IdentityCheckUpdateManyWithWhereWithoutAccountInput = {
    where: IdentityCheckScalarWhereInput
    data: XOR<IdentityCheckUpdateManyMutationInput, IdentityCheckUncheckedUpdateManyWithoutAccountInput>
  }

  export type IdentityCheckScalarWhereInput = {
    AND?: IdentityCheckScalarWhereInput | IdentityCheckScalarWhereInput[]
    OR?: IdentityCheckScalarWhereInput[]
    NOT?: IdentityCheckScalarWhereInput | IdentityCheckScalarWhereInput[]
    id?: StringFilter<"IdentityCheck"> | string
    accountId?: StringFilter<"IdentityCheck"> | string
    provider?: StringFilter<"IdentityCheck"> | string
    externalId?: StringFilter<"IdentityCheck"> | string
    tier?: EnumIdentityTierFilter<"IdentityCheck"> | $Enums.IdentityTier
    status?: EnumIdentityCheckStatusFilter<"IdentityCheck"> | $Enums.IdentityCheckStatus
    initiatedAt?: DateTimeFilter<"IdentityCheck"> | Date | string
    resolvedAt?: DateTimeNullableFilter<"IdentityCheck"> | Date | string | null
    expiresAt?: DateTimeNullableFilter<"IdentityCheck"> | Date | string | null
    providerPayload?: JsonNullableFilter<"IdentityCheck">
  }

  export type ProfileMemberCreateWithoutProfileInput = {
    id?: string
    role?: $Enums.ProfileRole
    createdAt?: Date | string
    account: AccountCreateNestedOneWithoutProfilesInput
  }

  export type ProfileMemberUncheckedCreateWithoutProfileInput = {
    id?: string
    accountId: string
    role?: $Enums.ProfileRole
    createdAt?: Date | string
  }

  export type ProfileMemberCreateOrConnectWithoutProfileInput = {
    where: ProfileMemberWhereUniqueInput
    create: XOR<ProfileMemberCreateWithoutProfileInput, ProfileMemberUncheckedCreateWithoutProfileInput>
  }

  export type ProfileMemberCreateManyProfileInputEnvelope = {
    data: ProfileMemberCreateManyProfileInput | ProfileMemberCreateManyProfileInput[]
    skipDuplicates?: boolean
  }

  export type PostCreateWithoutProfileInput = {
    id?: string
    content: string
    mediaUrls?: PostCreatemediaUrlsInput | string[]
    mediaType?: $Enums.MediaType
    createdAt?: Date | string
    updatedAt?: Date | string
    likesCount?: number
    commentsCount?: number
    isHidden?: boolean
    reportCount?: number
    comments?: CommentCreateNestedManyWithoutPostInput
    likes?: LikeCreateNestedManyWithoutPostInput
    nft?: NFTCreateNestedOneWithoutPostInput
  }

  export type PostUncheckedCreateWithoutProfileInput = {
    id?: string
    content: string
    mediaUrls?: PostCreatemediaUrlsInput | string[]
    mediaType?: $Enums.MediaType
    createdAt?: Date | string
    updatedAt?: Date | string
    likesCount?: number
    commentsCount?: number
    isHidden?: boolean
    reportCount?: number
    comments?: CommentUncheckedCreateNestedManyWithoutPostInput
    likes?: LikeUncheckedCreateNestedManyWithoutPostInput
    nft?: NFTUncheckedCreateNestedOneWithoutPostInput
  }

  export type PostCreateOrConnectWithoutProfileInput = {
    where: PostWhereUniqueInput
    create: XOR<PostCreateWithoutProfileInput, PostUncheckedCreateWithoutProfileInput>
  }

  export type PostCreateManyProfileInputEnvelope = {
    data: PostCreateManyProfileInput | PostCreateManyProfileInput[]
    skipDuplicates?: boolean
  }

  export type CommentCreateWithoutProfileInput = {
    id?: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    isHidden?: boolean
    post: PostCreateNestedOneWithoutCommentsInput
  }

  export type CommentUncheckedCreateWithoutProfileInput = {
    id?: string
    postId: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    isHidden?: boolean
  }

  export type CommentCreateOrConnectWithoutProfileInput = {
    where: CommentWhereUniqueInput
    create: XOR<CommentCreateWithoutProfileInput, CommentUncheckedCreateWithoutProfileInput>
  }

  export type CommentCreateManyProfileInputEnvelope = {
    data: CommentCreateManyProfileInput | CommentCreateManyProfileInput[]
    skipDuplicates?: boolean
  }

  export type LikeCreateWithoutProfileInput = {
    id?: string
    createdAt?: Date | string
    post: PostCreateNestedOneWithoutLikesInput
  }

  export type LikeUncheckedCreateWithoutProfileInput = {
    id?: string
    postId: string
    createdAt?: Date | string
  }

  export type LikeCreateOrConnectWithoutProfileInput = {
    where: LikeWhereUniqueInput
    create: XOR<LikeCreateWithoutProfileInput, LikeUncheckedCreateWithoutProfileInput>
  }

  export type LikeCreateManyProfileInputEnvelope = {
    data: LikeCreateManyProfileInput | LikeCreateManyProfileInput[]
    skipDuplicates?: boolean
  }

  export type NFTCreateWithoutProfileInput = {
    id?: string
    objectId: string
    packageId: string
    moduleId: string
    type: $Enums.NFTType
    name: string
    description?: string | null
    imageUrl: string
    metadataUri: string
    isListed?: boolean
    price?: string | null
    createdAt?: Date | string
    post?: PostCreateNestedOneWithoutNftInput
  }

  export type NFTUncheckedCreateWithoutProfileInput = {
    id?: string
    postId?: string | null
    objectId: string
    packageId: string
    moduleId: string
    type: $Enums.NFTType
    name: string
    description?: string | null
    imageUrl: string
    metadataUri: string
    isListed?: boolean
    price?: string | null
    createdAt?: Date | string
  }

  export type NFTCreateOrConnectWithoutProfileInput = {
    where: NFTWhereUniqueInput
    create: XOR<NFTCreateWithoutProfileInput, NFTUncheckedCreateWithoutProfileInput>
  }

  export type NFTCreateManyProfileInputEnvelope = {
    data: NFTCreateManyProfileInput | NFTCreateManyProfileInput[]
    skipDuplicates?: boolean
  }

  export type FollowCreateWithoutFollowerInput = {
    id?: string
    createdAt?: Date | string
    following: ProfileCreateNestedOneWithoutFollowersInput
  }

  export type FollowUncheckedCreateWithoutFollowerInput = {
    id?: string
    followingId: string
    createdAt?: Date | string
  }

  export type FollowCreateOrConnectWithoutFollowerInput = {
    where: FollowWhereUniqueInput
    create: XOR<FollowCreateWithoutFollowerInput, FollowUncheckedCreateWithoutFollowerInput>
  }

  export type FollowCreateManyFollowerInputEnvelope = {
    data: FollowCreateManyFollowerInput | FollowCreateManyFollowerInput[]
    skipDuplicates?: boolean
  }

  export type FollowCreateWithoutFollowingInput = {
    id?: string
    createdAt?: Date | string
    follower: ProfileCreateNestedOneWithoutFollowsInput
  }

  export type FollowUncheckedCreateWithoutFollowingInput = {
    id?: string
    followerId: string
    createdAt?: Date | string
  }

  export type FollowCreateOrConnectWithoutFollowingInput = {
    where: FollowWhereUniqueInput
    create: XOR<FollowCreateWithoutFollowingInput, FollowUncheckedCreateWithoutFollowingInput>
  }

  export type FollowCreateManyFollowingInputEnvelope = {
    data: FollowCreateManyFollowingInput | FollowCreateManyFollowingInput[]
    skipDuplicates?: boolean
  }

  export type ProfileMemberUpsertWithWhereUniqueWithoutProfileInput = {
    where: ProfileMemberWhereUniqueInput
    update: XOR<ProfileMemberUpdateWithoutProfileInput, ProfileMemberUncheckedUpdateWithoutProfileInput>
    create: XOR<ProfileMemberCreateWithoutProfileInput, ProfileMemberUncheckedCreateWithoutProfileInput>
  }

  export type ProfileMemberUpdateWithWhereUniqueWithoutProfileInput = {
    where: ProfileMemberWhereUniqueInput
    data: XOR<ProfileMemberUpdateWithoutProfileInput, ProfileMemberUncheckedUpdateWithoutProfileInput>
  }

  export type ProfileMemberUpdateManyWithWhereWithoutProfileInput = {
    where: ProfileMemberScalarWhereInput
    data: XOR<ProfileMemberUpdateManyMutationInput, ProfileMemberUncheckedUpdateManyWithoutProfileInput>
  }

  export type PostUpsertWithWhereUniqueWithoutProfileInput = {
    where: PostWhereUniqueInput
    update: XOR<PostUpdateWithoutProfileInput, PostUncheckedUpdateWithoutProfileInput>
    create: XOR<PostCreateWithoutProfileInput, PostUncheckedCreateWithoutProfileInput>
  }

  export type PostUpdateWithWhereUniqueWithoutProfileInput = {
    where: PostWhereUniqueInput
    data: XOR<PostUpdateWithoutProfileInput, PostUncheckedUpdateWithoutProfileInput>
  }

  export type PostUpdateManyWithWhereWithoutProfileInput = {
    where: PostScalarWhereInput
    data: XOR<PostUpdateManyMutationInput, PostUncheckedUpdateManyWithoutProfileInput>
  }

  export type PostScalarWhereInput = {
    AND?: PostScalarWhereInput | PostScalarWhereInput[]
    OR?: PostScalarWhereInput[]
    NOT?: PostScalarWhereInput | PostScalarWhereInput[]
    id?: StringFilter<"Post"> | string
    profileId?: StringFilter<"Post"> | string
    content?: StringFilter<"Post"> | string
    mediaUrls?: StringNullableListFilter<"Post">
    mediaType?: EnumMediaTypeFilter<"Post"> | $Enums.MediaType
    createdAt?: DateTimeFilter<"Post"> | Date | string
    updatedAt?: DateTimeFilter<"Post"> | Date | string
    likesCount?: IntFilter<"Post"> | number
    commentsCount?: IntFilter<"Post"> | number
    isHidden?: BoolFilter<"Post"> | boolean
    reportCount?: IntFilter<"Post"> | number
  }

  export type CommentUpsertWithWhereUniqueWithoutProfileInput = {
    where: CommentWhereUniqueInput
    update: XOR<CommentUpdateWithoutProfileInput, CommentUncheckedUpdateWithoutProfileInput>
    create: XOR<CommentCreateWithoutProfileInput, CommentUncheckedCreateWithoutProfileInput>
  }

  export type CommentUpdateWithWhereUniqueWithoutProfileInput = {
    where: CommentWhereUniqueInput
    data: XOR<CommentUpdateWithoutProfileInput, CommentUncheckedUpdateWithoutProfileInput>
  }

  export type CommentUpdateManyWithWhereWithoutProfileInput = {
    where: CommentScalarWhereInput
    data: XOR<CommentUpdateManyMutationInput, CommentUncheckedUpdateManyWithoutProfileInput>
  }

  export type CommentScalarWhereInput = {
    AND?: CommentScalarWhereInput | CommentScalarWhereInput[]
    OR?: CommentScalarWhereInput[]
    NOT?: CommentScalarWhereInput | CommentScalarWhereInput[]
    id?: StringFilter<"Comment"> | string
    postId?: StringFilter<"Comment"> | string
    profileId?: StringFilter<"Comment"> | string
    content?: StringFilter<"Comment"> | string
    createdAt?: DateTimeFilter<"Comment"> | Date | string
    updatedAt?: DateTimeFilter<"Comment"> | Date | string
    isHidden?: BoolFilter<"Comment"> | boolean
  }

  export type LikeUpsertWithWhereUniqueWithoutProfileInput = {
    where: LikeWhereUniqueInput
    update: XOR<LikeUpdateWithoutProfileInput, LikeUncheckedUpdateWithoutProfileInput>
    create: XOR<LikeCreateWithoutProfileInput, LikeUncheckedCreateWithoutProfileInput>
  }

  export type LikeUpdateWithWhereUniqueWithoutProfileInput = {
    where: LikeWhereUniqueInput
    data: XOR<LikeUpdateWithoutProfileInput, LikeUncheckedUpdateWithoutProfileInput>
  }

  export type LikeUpdateManyWithWhereWithoutProfileInput = {
    where: LikeScalarWhereInput
    data: XOR<LikeUpdateManyMutationInput, LikeUncheckedUpdateManyWithoutProfileInput>
  }

  export type LikeScalarWhereInput = {
    AND?: LikeScalarWhereInput | LikeScalarWhereInput[]
    OR?: LikeScalarWhereInput[]
    NOT?: LikeScalarWhereInput | LikeScalarWhereInput[]
    id?: StringFilter<"Like"> | string
    postId?: StringFilter<"Like"> | string
    profileId?: StringFilter<"Like"> | string
    createdAt?: DateTimeFilter<"Like"> | Date | string
  }

  export type NFTUpsertWithWhereUniqueWithoutProfileInput = {
    where: NFTWhereUniqueInput
    update: XOR<NFTUpdateWithoutProfileInput, NFTUncheckedUpdateWithoutProfileInput>
    create: XOR<NFTCreateWithoutProfileInput, NFTUncheckedCreateWithoutProfileInput>
  }

  export type NFTUpdateWithWhereUniqueWithoutProfileInput = {
    where: NFTWhereUniqueInput
    data: XOR<NFTUpdateWithoutProfileInput, NFTUncheckedUpdateWithoutProfileInput>
  }

  export type NFTUpdateManyWithWhereWithoutProfileInput = {
    where: NFTScalarWhereInput
    data: XOR<NFTUpdateManyMutationInput, NFTUncheckedUpdateManyWithoutProfileInput>
  }

  export type NFTScalarWhereInput = {
    AND?: NFTScalarWhereInput | NFTScalarWhereInput[]
    OR?: NFTScalarWhereInput[]
    NOT?: NFTScalarWhereInput | NFTScalarWhereInput[]
    id?: StringFilter<"NFT"> | string
    profileId?: StringFilter<"NFT"> | string
    postId?: StringNullableFilter<"NFT"> | string | null
    objectId?: StringFilter<"NFT"> | string
    packageId?: StringFilter<"NFT"> | string
    moduleId?: StringFilter<"NFT"> | string
    type?: EnumNFTTypeFilter<"NFT"> | $Enums.NFTType
    name?: StringFilter<"NFT"> | string
    description?: StringNullableFilter<"NFT"> | string | null
    imageUrl?: StringFilter<"NFT"> | string
    metadataUri?: StringFilter<"NFT"> | string
    isListed?: BoolFilter<"NFT"> | boolean
    price?: StringNullableFilter<"NFT"> | string | null
    createdAt?: DateTimeFilter<"NFT"> | Date | string
  }

  export type FollowUpsertWithWhereUniqueWithoutFollowerInput = {
    where: FollowWhereUniqueInput
    update: XOR<FollowUpdateWithoutFollowerInput, FollowUncheckedUpdateWithoutFollowerInput>
    create: XOR<FollowCreateWithoutFollowerInput, FollowUncheckedCreateWithoutFollowerInput>
  }

  export type FollowUpdateWithWhereUniqueWithoutFollowerInput = {
    where: FollowWhereUniqueInput
    data: XOR<FollowUpdateWithoutFollowerInput, FollowUncheckedUpdateWithoutFollowerInput>
  }

  export type FollowUpdateManyWithWhereWithoutFollowerInput = {
    where: FollowScalarWhereInput
    data: XOR<FollowUpdateManyMutationInput, FollowUncheckedUpdateManyWithoutFollowerInput>
  }

  export type FollowScalarWhereInput = {
    AND?: FollowScalarWhereInput | FollowScalarWhereInput[]
    OR?: FollowScalarWhereInput[]
    NOT?: FollowScalarWhereInput | FollowScalarWhereInput[]
    id?: StringFilter<"Follow"> | string
    followerId?: StringFilter<"Follow"> | string
    followingId?: StringFilter<"Follow"> | string
    createdAt?: DateTimeFilter<"Follow"> | Date | string
  }

  export type FollowUpsertWithWhereUniqueWithoutFollowingInput = {
    where: FollowWhereUniqueInput
    update: XOR<FollowUpdateWithoutFollowingInput, FollowUncheckedUpdateWithoutFollowingInput>
    create: XOR<FollowCreateWithoutFollowingInput, FollowUncheckedCreateWithoutFollowingInput>
  }

  export type FollowUpdateWithWhereUniqueWithoutFollowingInput = {
    where: FollowWhereUniqueInput
    data: XOR<FollowUpdateWithoutFollowingInput, FollowUncheckedUpdateWithoutFollowingInput>
  }

  export type FollowUpdateManyWithWhereWithoutFollowingInput = {
    where: FollowScalarWhereInput
    data: XOR<FollowUpdateManyMutationInput, FollowUncheckedUpdateManyWithoutFollowingInput>
  }

  export type AccountCreateWithoutProfilesInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    lastActiveAt?: Date | string
    email?: string | null
    walletAddress?: string | null
    isBanned?: boolean
    identityTier?: $Enums.IdentityTier
    identityVerifiedAt?: Date | string | null
    authUser: AuthUserCreateNestedOneWithoutDomainAccountInput
    identityChecks?: IdentityCheckCreateNestedManyWithoutAccountInput
  }

  export type AccountUncheckedCreateWithoutProfilesInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    lastActiveAt?: Date | string
    authUserId: string
    email?: string | null
    walletAddress?: string | null
    isBanned?: boolean
    identityTier?: $Enums.IdentityTier
    identityVerifiedAt?: Date | string | null
    identityChecks?: IdentityCheckUncheckedCreateNestedManyWithoutAccountInput
  }

  export type AccountCreateOrConnectWithoutProfilesInput = {
    where: AccountWhereUniqueInput
    create: XOR<AccountCreateWithoutProfilesInput, AccountUncheckedCreateWithoutProfilesInput>
  }

  export type ProfileCreateWithoutMembersInput = {
    id?: string
    handle: string
    displayName: string
    bio?: string | null
    avatar?: string | null
    type: $Enums.ProfileType
    createdAt?: Date | string
    updatedAt?: Date | string
    isBanned?: boolean
    reportCount?: number
    isVerified?: boolean
    reputation?: number
    posts?: PostCreateNestedManyWithoutProfileInput
    comments?: CommentCreateNestedManyWithoutProfileInput
    likes?: LikeCreateNestedManyWithoutProfileInput
    nfts?: NFTCreateNestedManyWithoutProfileInput
    follows?: FollowCreateNestedManyWithoutFollowerInput
    followers?: FollowCreateNestedManyWithoutFollowingInput
  }

  export type ProfileUncheckedCreateWithoutMembersInput = {
    id?: string
    handle: string
    displayName: string
    bio?: string | null
    avatar?: string | null
    type: $Enums.ProfileType
    createdAt?: Date | string
    updatedAt?: Date | string
    isBanned?: boolean
    reportCount?: number
    isVerified?: boolean
    reputation?: number
    posts?: PostUncheckedCreateNestedManyWithoutProfileInput
    comments?: CommentUncheckedCreateNestedManyWithoutProfileInput
    likes?: LikeUncheckedCreateNestedManyWithoutProfileInput
    nfts?: NFTUncheckedCreateNestedManyWithoutProfileInput
    follows?: FollowUncheckedCreateNestedManyWithoutFollowerInput
    followers?: FollowUncheckedCreateNestedManyWithoutFollowingInput
  }

  export type ProfileCreateOrConnectWithoutMembersInput = {
    where: ProfileWhereUniqueInput
    create: XOR<ProfileCreateWithoutMembersInput, ProfileUncheckedCreateWithoutMembersInput>
  }

  export type AccountUpsertWithoutProfilesInput = {
    update: XOR<AccountUpdateWithoutProfilesInput, AccountUncheckedUpdateWithoutProfilesInput>
    create: XOR<AccountCreateWithoutProfilesInput, AccountUncheckedCreateWithoutProfilesInput>
    where?: AccountWhereInput
  }

  export type AccountUpdateToOneWithWhereWithoutProfilesInput = {
    where?: AccountWhereInput
    data: XOR<AccountUpdateWithoutProfilesInput, AccountUncheckedUpdateWithoutProfilesInput>
  }

  export type AccountUpdateWithoutProfilesInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastActiveAt?: DateTimeFieldUpdateOperationsInput | Date | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    walletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    identityTier?: EnumIdentityTierFieldUpdateOperationsInput | $Enums.IdentityTier
    identityVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    authUser?: AuthUserUpdateOneRequiredWithoutDomainAccountNestedInput
    identityChecks?: IdentityCheckUpdateManyWithoutAccountNestedInput
  }

  export type AccountUncheckedUpdateWithoutProfilesInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastActiveAt?: DateTimeFieldUpdateOperationsInput | Date | string
    authUserId?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    walletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    identityTier?: EnumIdentityTierFieldUpdateOperationsInput | $Enums.IdentityTier
    identityVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    identityChecks?: IdentityCheckUncheckedUpdateManyWithoutAccountNestedInput
  }

  export type ProfileUpsertWithoutMembersInput = {
    update: XOR<ProfileUpdateWithoutMembersInput, ProfileUncheckedUpdateWithoutMembersInput>
    create: XOR<ProfileCreateWithoutMembersInput, ProfileUncheckedCreateWithoutMembersInput>
    where?: ProfileWhereInput
  }

  export type ProfileUpdateToOneWithWhereWithoutMembersInput = {
    where?: ProfileWhereInput
    data: XOR<ProfileUpdateWithoutMembersInput, ProfileUncheckedUpdateWithoutMembersInput>
  }

  export type ProfileUpdateWithoutMembersInput = {
    id?: StringFieldUpdateOperationsInput | string
    handle?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumProfileTypeFieldUpdateOperationsInput | $Enums.ProfileType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    reportCount?: IntFieldUpdateOperationsInput | number
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    reputation?: IntFieldUpdateOperationsInput | number
    posts?: PostUpdateManyWithoutProfileNestedInput
    comments?: CommentUpdateManyWithoutProfileNestedInput
    likes?: LikeUpdateManyWithoutProfileNestedInput
    nfts?: NFTUpdateManyWithoutProfileNestedInput
    follows?: FollowUpdateManyWithoutFollowerNestedInput
    followers?: FollowUpdateManyWithoutFollowingNestedInput
  }

  export type ProfileUncheckedUpdateWithoutMembersInput = {
    id?: StringFieldUpdateOperationsInput | string
    handle?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumProfileTypeFieldUpdateOperationsInput | $Enums.ProfileType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    reportCount?: IntFieldUpdateOperationsInput | number
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    reputation?: IntFieldUpdateOperationsInput | number
    posts?: PostUncheckedUpdateManyWithoutProfileNestedInput
    comments?: CommentUncheckedUpdateManyWithoutProfileNestedInput
    likes?: LikeUncheckedUpdateManyWithoutProfileNestedInput
    nfts?: NFTUncheckedUpdateManyWithoutProfileNestedInput
    follows?: FollowUncheckedUpdateManyWithoutFollowerNestedInput
    followers?: FollowUncheckedUpdateManyWithoutFollowingNestedInput
  }

  export type AccountCreateWithoutIdentityChecksInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    lastActiveAt?: Date | string
    email?: string | null
    walletAddress?: string | null
    isBanned?: boolean
    identityTier?: $Enums.IdentityTier
    identityVerifiedAt?: Date | string | null
    authUser: AuthUserCreateNestedOneWithoutDomainAccountInput
    profiles?: ProfileMemberCreateNestedManyWithoutAccountInput
  }

  export type AccountUncheckedCreateWithoutIdentityChecksInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    lastActiveAt?: Date | string
    authUserId: string
    email?: string | null
    walletAddress?: string | null
    isBanned?: boolean
    identityTier?: $Enums.IdentityTier
    identityVerifiedAt?: Date | string | null
    profiles?: ProfileMemberUncheckedCreateNestedManyWithoutAccountInput
  }

  export type AccountCreateOrConnectWithoutIdentityChecksInput = {
    where: AccountWhereUniqueInput
    create: XOR<AccountCreateWithoutIdentityChecksInput, AccountUncheckedCreateWithoutIdentityChecksInput>
  }

  export type AccountUpsertWithoutIdentityChecksInput = {
    update: XOR<AccountUpdateWithoutIdentityChecksInput, AccountUncheckedUpdateWithoutIdentityChecksInput>
    create: XOR<AccountCreateWithoutIdentityChecksInput, AccountUncheckedCreateWithoutIdentityChecksInput>
    where?: AccountWhereInput
  }

  export type AccountUpdateToOneWithWhereWithoutIdentityChecksInput = {
    where?: AccountWhereInput
    data: XOR<AccountUpdateWithoutIdentityChecksInput, AccountUncheckedUpdateWithoutIdentityChecksInput>
  }

  export type AccountUpdateWithoutIdentityChecksInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastActiveAt?: DateTimeFieldUpdateOperationsInput | Date | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    walletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    identityTier?: EnumIdentityTierFieldUpdateOperationsInput | $Enums.IdentityTier
    identityVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    authUser?: AuthUserUpdateOneRequiredWithoutDomainAccountNestedInput
    profiles?: ProfileMemberUpdateManyWithoutAccountNestedInput
  }

  export type AccountUncheckedUpdateWithoutIdentityChecksInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastActiveAt?: DateTimeFieldUpdateOperationsInput | Date | string
    authUserId?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    walletAddress?: NullableStringFieldUpdateOperationsInput | string | null
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    identityTier?: EnumIdentityTierFieldUpdateOperationsInput | $Enums.IdentityTier
    identityVerifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profiles?: ProfileMemberUncheckedUpdateManyWithoutAccountNestedInput
  }

  export type ProfileCreateWithoutPostsInput = {
    id?: string
    handle: string
    displayName: string
    bio?: string | null
    avatar?: string | null
    type: $Enums.ProfileType
    createdAt?: Date | string
    updatedAt?: Date | string
    isBanned?: boolean
    reportCount?: number
    isVerified?: boolean
    reputation?: number
    members?: ProfileMemberCreateNestedManyWithoutProfileInput
    comments?: CommentCreateNestedManyWithoutProfileInput
    likes?: LikeCreateNestedManyWithoutProfileInput
    nfts?: NFTCreateNestedManyWithoutProfileInput
    follows?: FollowCreateNestedManyWithoutFollowerInput
    followers?: FollowCreateNestedManyWithoutFollowingInput
  }

  export type ProfileUncheckedCreateWithoutPostsInput = {
    id?: string
    handle: string
    displayName: string
    bio?: string | null
    avatar?: string | null
    type: $Enums.ProfileType
    createdAt?: Date | string
    updatedAt?: Date | string
    isBanned?: boolean
    reportCount?: number
    isVerified?: boolean
    reputation?: number
    members?: ProfileMemberUncheckedCreateNestedManyWithoutProfileInput
    comments?: CommentUncheckedCreateNestedManyWithoutProfileInput
    likes?: LikeUncheckedCreateNestedManyWithoutProfileInput
    nfts?: NFTUncheckedCreateNestedManyWithoutProfileInput
    follows?: FollowUncheckedCreateNestedManyWithoutFollowerInput
    followers?: FollowUncheckedCreateNestedManyWithoutFollowingInput
  }

  export type ProfileCreateOrConnectWithoutPostsInput = {
    where: ProfileWhereUniqueInput
    create: XOR<ProfileCreateWithoutPostsInput, ProfileUncheckedCreateWithoutPostsInput>
  }

  export type CommentCreateWithoutPostInput = {
    id?: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    isHidden?: boolean
    profile: ProfileCreateNestedOneWithoutCommentsInput
  }

  export type CommentUncheckedCreateWithoutPostInput = {
    id?: string
    profileId: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    isHidden?: boolean
  }

  export type CommentCreateOrConnectWithoutPostInput = {
    where: CommentWhereUniqueInput
    create: XOR<CommentCreateWithoutPostInput, CommentUncheckedCreateWithoutPostInput>
  }

  export type CommentCreateManyPostInputEnvelope = {
    data: CommentCreateManyPostInput | CommentCreateManyPostInput[]
    skipDuplicates?: boolean
  }

  export type LikeCreateWithoutPostInput = {
    id?: string
    createdAt?: Date | string
    profile: ProfileCreateNestedOneWithoutLikesInput
  }

  export type LikeUncheckedCreateWithoutPostInput = {
    id?: string
    profileId: string
    createdAt?: Date | string
  }

  export type LikeCreateOrConnectWithoutPostInput = {
    where: LikeWhereUniqueInput
    create: XOR<LikeCreateWithoutPostInput, LikeUncheckedCreateWithoutPostInput>
  }

  export type LikeCreateManyPostInputEnvelope = {
    data: LikeCreateManyPostInput | LikeCreateManyPostInput[]
    skipDuplicates?: boolean
  }

  export type NFTCreateWithoutPostInput = {
    id?: string
    objectId: string
    packageId: string
    moduleId: string
    type: $Enums.NFTType
    name: string
    description?: string | null
    imageUrl: string
    metadataUri: string
    isListed?: boolean
    price?: string | null
    createdAt?: Date | string
    profile: ProfileCreateNestedOneWithoutNftsInput
  }

  export type NFTUncheckedCreateWithoutPostInput = {
    id?: string
    profileId: string
    objectId: string
    packageId: string
    moduleId: string
    type: $Enums.NFTType
    name: string
    description?: string | null
    imageUrl: string
    metadataUri: string
    isListed?: boolean
    price?: string | null
    createdAt?: Date | string
  }

  export type NFTCreateOrConnectWithoutPostInput = {
    where: NFTWhereUniqueInput
    create: XOR<NFTCreateWithoutPostInput, NFTUncheckedCreateWithoutPostInput>
  }

  export type ProfileUpsertWithoutPostsInput = {
    update: XOR<ProfileUpdateWithoutPostsInput, ProfileUncheckedUpdateWithoutPostsInput>
    create: XOR<ProfileCreateWithoutPostsInput, ProfileUncheckedCreateWithoutPostsInput>
    where?: ProfileWhereInput
  }

  export type ProfileUpdateToOneWithWhereWithoutPostsInput = {
    where?: ProfileWhereInput
    data: XOR<ProfileUpdateWithoutPostsInput, ProfileUncheckedUpdateWithoutPostsInput>
  }

  export type ProfileUpdateWithoutPostsInput = {
    id?: StringFieldUpdateOperationsInput | string
    handle?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumProfileTypeFieldUpdateOperationsInput | $Enums.ProfileType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    reportCount?: IntFieldUpdateOperationsInput | number
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    reputation?: IntFieldUpdateOperationsInput | number
    members?: ProfileMemberUpdateManyWithoutProfileNestedInput
    comments?: CommentUpdateManyWithoutProfileNestedInput
    likes?: LikeUpdateManyWithoutProfileNestedInput
    nfts?: NFTUpdateManyWithoutProfileNestedInput
    follows?: FollowUpdateManyWithoutFollowerNestedInput
    followers?: FollowUpdateManyWithoutFollowingNestedInput
  }

  export type ProfileUncheckedUpdateWithoutPostsInput = {
    id?: StringFieldUpdateOperationsInput | string
    handle?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumProfileTypeFieldUpdateOperationsInput | $Enums.ProfileType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    reportCount?: IntFieldUpdateOperationsInput | number
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    reputation?: IntFieldUpdateOperationsInput | number
    members?: ProfileMemberUncheckedUpdateManyWithoutProfileNestedInput
    comments?: CommentUncheckedUpdateManyWithoutProfileNestedInput
    likes?: LikeUncheckedUpdateManyWithoutProfileNestedInput
    nfts?: NFTUncheckedUpdateManyWithoutProfileNestedInput
    follows?: FollowUncheckedUpdateManyWithoutFollowerNestedInput
    followers?: FollowUncheckedUpdateManyWithoutFollowingNestedInput
  }

  export type CommentUpsertWithWhereUniqueWithoutPostInput = {
    where: CommentWhereUniqueInput
    update: XOR<CommentUpdateWithoutPostInput, CommentUncheckedUpdateWithoutPostInput>
    create: XOR<CommentCreateWithoutPostInput, CommentUncheckedCreateWithoutPostInput>
  }

  export type CommentUpdateWithWhereUniqueWithoutPostInput = {
    where: CommentWhereUniqueInput
    data: XOR<CommentUpdateWithoutPostInput, CommentUncheckedUpdateWithoutPostInput>
  }

  export type CommentUpdateManyWithWhereWithoutPostInput = {
    where: CommentScalarWhereInput
    data: XOR<CommentUpdateManyMutationInput, CommentUncheckedUpdateManyWithoutPostInput>
  }

  export type LikeUpsertWithWhereUniqueWithoutPostInput = {
    where: LikeWhereUniqueInput
    update: XOR<LikeUpdateWithoutPostInput, LikeUncheckedUpdateWithoutPostInput>
    create: XOR<LikeCreateWithoutPostInput, LikeUncheckedCreateWithoutPostInput>
  }

  export type LikeUpdateWithWhereUniqueWithoutPostInput = {
    where: LikeWhereUniqueInput
    data: XOR<LikeUpdateWithoutPostInput, LikeUncheckedUpdateWithoutPostInput>
  }

  export type LikeUpdateManyWithWhereWithoutPostInput = {
    where: LikeScalarWhereInput
    data: XOR<LikeUpdateManyMutationInput, LikeUncheckedUpdateManyWithoutPostInput>
  }

  export type NFTUpsertWithoutPostInput = {
    update: XOR<NFTUpdateWithoutPostInput, NFTUncheckedUpdateWithoutPostInput>
    create: XOR<NFTCreateWithoutPostInput, NFTUncheckedCreateWithoutPostInput>
    where?: NFTWhereInput
  }

  export type NFTUpdateToOneWithWhereWithoutPostInput = {
    where?: NFTWhereInput
    data: XOR<NFTUpdateWithoutPostInput, NFTUncheckedUpdateWithoutPostInput>
  }

  export type NFTUpdateWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    objectId?: StringFieldUpdateOperationsInput | string
    packageId?: StringFieldUpdateOperationsInput | string
    moduleId?: StringFieldUpdateOperationsInput | string
    type?: EnumNFTTypeFieldUpdateOperationsInput | $Enums.NFTType
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: StringFieldUpdateOperationsInput | string
    metadataUri?: StringFieldUpdateOperationsInput | string
    isListed?: BoolFieldUpdateOperationsInput | boolean
    price?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    profile?: ProfileUpdateOneRequiredWithoutNftsNestedInput
  }

  export type NFTUncheckedUpdateWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    objectId?: StringFieldUpdateOperationsInput | string
    packageId?: StringFieldUpdateOperationsInput | string
    moduleId?: StringFieldUpdateOperationsInput | string
    type?: EnumNFTTypeFieldUpdateOperationsInput | $Enums.NFTType
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: StringFieldUpdateOperationsInput | string
    metadataUri?: StringFieldUpdateOperationsInput | string
    isListed?: BoolFieldUpdateOperationsInput | boolean
    price?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PostCreateWithoutCommentsInput = {
    id?: string
    content: string
    mediaUrls?: PostCreatemediaUrlsInput | string[]
    mediaType?: $Enums.MediaType
    createdAt?: Date | string
    updatedAt?: Date | string
    likesCount?: number
    commentsCount?: number
    isHidden?: boolean
    reportCount?: number
    profile: ProfileCreateNestedOneWithoutPostsInput
    likes?: LikeCreateNestedManyWithoutPostInput
    nft?: NFTCreateNestedOneWithoutPostInput
  }

  export type PostUncheckedCreateWithoutCommentsInput = {
    id?: string
    profileId: string
    content: string
    mediaUrls?: PostCreatemediaUrlsInput | string[]
    mediaType?: $Enums.MediaType
    createdAt?: Date | string
    updatedAt?: Date | string
    likesCount?: number
    commentsCount?: number
    isHidden?: boolean
    reportCount?: number
    likes?: LikeUncheckedCreateNestedManyWithoutPostInput
    nft?: NFTUncheckedCreateNestedOneWithoutPostInput
  }

  export type PostCreateOrConnectWithoutCommentsInput = {
    where: PostWhereUniqueInput
    create: XOR<PostCreateWithoutCommentsInput, PostUncheckedCreateWithoutCommentsInput>
  }

  export type ProfileCreateWithoutCommentsInput = {
    id?: string
    handle: string
    displayName: string
    bio?: string | null
    avatar?: string | null
    type: $Enums.ProfileType
    createdAt?: Date | string
    updatedAt?: Date | string
    isBanned?: boolean
    reportCount?: number
    isVerified?: boolean
    reputation?: number
    members?: ProfileMemberCreateNestedManyWithoutProfileInput
    posts?: PostCreateNestedManyWithoutProfileInput
    likes?: LikeCreateNestedManyWithoutProfileInput
    nfts?: NFTCreateNestedManyWithoutProfileInput
    follows?: FollowCreateNestedManyWithoutFollowerInput
    followers?: FollowCreateNestedManyWithoutFollowingInput
  }

  export type ProfileUncheckedCreateWithoutCommentsInput = {
    id?: string
    handle: string
    displayName: string
    bio?: string | null
    avatar?: string | null
    type: $Enums.ProfileType
    createdAt?: Date | string
    updatedAt?: Date | string
    isBanned?: boolean
    reportCount?: number
    isVerified?: boolean
    reputation?: number
    members?: ProfileMemberUncheckedCreateNestedManyWithoutProfileInput
    posts?: PostUncheckedCreateNestedManyWithoutProfileInput
    likes?: LikeUncheckedCreateNestedManyWithoutProfileInput
    nfts?: NFTUncheckedCreateNestedManyWithoutProfileInput
    follows?: FollowUncheckedCreateNestedManyWithoutFollowerInput
    followers?: FollowUncheckedCreateNestedManyWithoutFollowingInput
  }

  export type ProfileCreateOrConnectWithoutCommentsInput = {
    where: ProfileWhereUniqueInput
    create: XOR<ProfileCreateWithoutCommentsInput, ProfileUncheckedCreateWithoutCommentsInput>
  }

  export type PostUpsertWithoutCommentsInput = {
    update: XOR<PostUpdateWithoutCommentsInput, PostUncheckedUpdateWithoutCommentsInput>
    create: XOR<PostCreateWithoutCommentsInput, PostUncheckedCreateWithoutCommentsInput>
    where?: PostWhereInput
  }

  export type PostUpdateToOneWithWhereWithoutCommentsInput = {
    where?: PostWhereInput
    data: XOR<PostUpdateWithoutCommentsInput, PostUncheckedUpdateWithoutCommentsInput>
  }

  export type PostUpdateWithoutCommentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    mediaUrls?: PostUpdatemediaUrlsInput | string[]
    mediaType?: EnumMediaTypeFieldUpdateOperationsInput | $Enums.MediaType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    likesCount?: IntFieldUpdateOperationsInput | number
    commentsCount?: IntFieldUpdateOperationsInput | number
    isHidden?: BoolFieldUpdateOperationsInput | boolean
    reportCount?: IntFieldUpdateOperationsInput | number
    profile?: ProfileUpdateOneRequiredWithoutPostsNestedInput
    likes?: LikeUpdateManyWithoutPostNestedInput
    nft?: NFTUpdateOneWithoutPostNestedInput
  }

  export type PostUncheckedUpdateWithoutCommentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    mediaUrls?: PostUpdatemediaUrlsInput | string[]
    mediaType?: EnumMediaTypeFieldUpdateOperationsInput | $Enums.MediaType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    likesCount?: IntFieldUpdateOperationsInput | number
    commentsCount?: IntFieldUpdateOperationsInput | number
    isHidden?: BoolFieldUpdateOperationsInput | boolean
    reportCount?: IntFieldUpdateOperationsInput | number
    likes?: LikeUncheckedUpdateManyWithoutPostNestedInput
    nft?: NFTUncheckedUpdateOneWithoutPostNestedInput
  }

  export type ProfileUpsertWithoutCommentsInput = {
    update: XOR<ProfileUpdateWithoutCommentsInput, ProfileUncheckedUpdateWithoutCommentsInput>
    create: XOR<ProfileCreateWithoutCommentsInput, ProfileUncheckedCreateWithoutCommentsInput>
    where?: ProfileWhereInput
  }

  export type ProfileUpdateToOneWithWhereWithoutCommentsInput = {
    where?: ProfileWhereInput
    data: XOR<ProfileUpdateWithoutCommentsInput, ProfileUncheckedUpdateWithoutCommentsInput>
  }

  export type ProfileUpdateWithoutCommentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    handle?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumProfileTypeFieldUpdateOperationsInput | $Enums.ProfileType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    reportCount?: IntFieldUpdateOperationsInput | number
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    reputation?: IntFieldUpdateOperationsInput | number
    members?: ProfileMemberUpdateManyWithoutProfileNestedInput
    posts?: PostUpdateManyWithoutProfileNestedInput
    likes?: LikeUpdateManyWithoutProfileNestedInput
    nfts?: NFTUpdateManyWithoutProfileNestedInput
    follows?: FollowUpdateManyWithoutFollowerNestedInput
    followers?: FollowUpdateManyWithoutFollowingNestedInput
  }

  export type ProfileUncheckedUpdateWithoutCommentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    handle?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumProfileTypeFieldUpdateOperationsInput | $Enums.ProfileType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    reportCount?: IntFieldUpdateOperationsInput | number
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    reputation?: IntFieldUpdateOperationsInput | number
    members?: ProfileMemberUncheckedUpdateManyWithoutProfileNestedInput
    posts?: PostUncheckedUpdateManyWithoutProfileNestedInput
    likes?: LikeUncheckedUpdateManyWithoutProfileNestedInput
    nfts?: NFTUncheckedUpdateManyWithoutProfileNestedInput
    follows?: FollowUncheckedUpdateManyWithoutFollowerNestedInput
    followers?: FollowUncheckedUpdateManyWithoutFollowingNestedInput
  }

  export type PostCreateWithoutLikesInput = {
    id?: string
    content: string
    mediaUrls?: PostCreatemediaUrlsInput | string[]
    mediaType?: $Enums.MediaType
    createdAt?: Date | string
    updatedAt?: Date | string
    likesCount?: number
    commentsCount?: number
    isHidden?: boolean
    reportCount?: number
    profile: ProfileCreateNestedOneWithoutPostsInput
    comments?: CommentCreateNestedManyWithoutPostInput
    nft?: NFTCreateNestedOneWithoutPostInput
  }

  export type PostUncheckedCreateWithoutLikesInput = {
    id?: string
    profileId: string
    content: string
    mediaUrls?: PostCreatemediaUrlsInput | string[]
    mediaType?: $Enums.MediaType
    createdAt?: Date | string
    updatedAt?: Date | string
    likesCount?: number
    commentsCount?: number
    isHidden?: boolean
    reportCount?: number
    comments?: CommentUncheckedCreateNestedManyWithoutPostInput
    nft?: NFTUncheckedCreateNestedOneWithoutPostInput
  }

  export type PostCreateOrConnectWithoutLikesInput = {
    where: PostWhereUniqueInput
    create: XOR<PostCreateWithoutLikesInput, PostUncheckedCreateWithoutLikesInput>
  }

  export type ProfileCreateWithoutLikesInput = {
    id?: string
    handle: string
    displayName: string
    bio?: string | null
    avatar?: string | null
    type: $Enums.ProfileType
    createdAt?: Date | string
    updatedAt?: Date | string
    isBanned?: boolean
    reportCount?: number
    isVerified?: boolean
    reputation?: number
    members?: ProfileMemberCreateNestedManyWithoutProfileInput
    posts?: PostCreateNestedManyWithoutProfileInput
    comments?: CommentCreateNestedManyWithoutProfileInput
    nfts?: NFTCreateNestedManyWithoutProfileInput
    follows?: FollowCreateNestedManyWithoutFollowerInput
    followers?: FollowCreateNestedManyWithoutFollowingInput
  }

  export type ProfileUncheckedCreateWithoutLikesInput = {
    id?: string
    handle: string
    displayName: string
    bio?: string | null
    avatar?: string | null
    type: $Enums.ProfileType
    createdAt?: Date | string
    updatedAt?: Date | string
    isBanned?: boolean
    reportCount?: number
    isVerified?: boolean
    reputation?: number
    members?: ProfileMemberUncheckedCreateNestedManyWithoutProfileInput
    posts?: PostUncheckedCreateNestedManyWithoutProfileInput
    comments?: CommentUncheckedCreateNestedManyWithoutProfileInput
    nfts?: NFTUncheckedCreateNestedManyWithoutProfileInput
    follows?: FollowUncheckedCreateNestedManyWithoutFollowerInput
    followers?: FollowUncheckedCreateNestedManyWithoutFollowingInput
  }

  export type ProfileCreateOrConnectWithoutLikesInput = {
    where: ProfileWhereUniqueInput
    create: XOR<ProfileCreateWithoutLikesInput, ProfileUncheckedCreateWithoutLikesInput>
  }

  export type PostUpsertWithoutLikesInput = {
    update: XOR<PostUpdateWithoutLikesInput, PostUncheckedUpdateWithoutLikesInput>
    create: XOR<PostCreateWithoutLikesInput, PostUncheckedCreateWithoutLikesInput>
    where?: PostWhereInput
  }

  export type PostUpdateToOneWithWhereWithoutLikesInput = {
    where?: PostWhereInput
    data: XOR<PostUpdateWithoutLikesInput, PostUncheckedUpdateWithoutLikesInput>
  }

  export type PostUpdateWithoutLikesInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    mediaUrls?: PostUpdatemediaUrlsInput | string[]
    mediaType?: EnumMediaTypeFieldUpdateOperationsInput | $Enums.MediaType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    likesCount?: IntFieldUpdateOperationsInput | number
    commentsCount?: IntFieldUpdateOperationsInput | number
    isHidden?: BoolFieldUpdateOperationsInput | boolean
    reportCount?: IntFieldUpdateOperationsInput | number
    profile?: ProfileUpdateOneRequiredWithoutPostsNestedInput
    comments?: CommentUpdateManyWithoutPostNestedInput
    nft?: NFTUpdateOneWithoutPostNestedInput
  }

  export type PostUncheckedUpdateWithoutLikesInput = {
    id?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    mediaUrls?: PostUpdatemediaUrlsInput | string[]
    mediaType?: EnumMediaTypeFieldUpdateOperationsInput | $Enums.MediaType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    likesCount?: IntFieldUpdateOperationsInput | number
    commentsCount?: IntFieldUpdateOperationsInput | number
    isHidden?: BoolFieldUpdateOperationsInput | boolean
    reportCount?: IntFieldUpdateOperationsInput | number
    comments?: CommentUncheckedUpdateManyWithoutPostNestedInput
    nft?: NFTUncheckedUpdateOneWithoutPostNestedInput
  }

  export type ProfileUpsertWithoutLikesInput = {
    update: XOR<ProfileUpdateWithoutLikesInput, ProfileUncheckedUpdateWithoutLikesInput>
    create: XOR<ProfileCreateWithoutLikesInput, ProfileUncheckedCreateWithoutLikesInput>
    where?: ProfileWhereInput
  }

  export type ProfileUpdateToOneWithWhereWithoutLikesInput = {
    where?: ProfileWhereInput
    data: XOR<ProfileUpdateWithoutLikesInput, ProfileUncheckedUpdateWithoutLikesInput>
  }

  export type ProfileUpdateWithoutLikesInput = {
    id?: StringFieldUpdateOperationsInput | string
    handle?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumProfileTypeFieldUpdateOperationsInput | $Enums.ProfileType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    reportCount?: IntFieldUpdateOperationsInput | number
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    reputation?: IntFieldUpdateOperationsInput | number
    members?: ProfileMemberUpdateManyWithoutProfileNestedInput
    posts?: PostUpdateManyWithoutProfileNestedInput
    comments?: CommentUpdateManyWithoutProfileNestedInput
    nfts?: NFTUpdateManyWithoutProfileNestedInput
    follows?: FollowUpdateManyWithoutFollowerNestedInput
    followers?: FollowUpdateManyWithoutFollowingNestedInput
  }

  export type ProfileUncheckedUpdateWithoutLikesInput = {
    id?: StringFieldUpdateOperationsInput | string
    handle?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumProfileTypeFieldUpdateOperationsInput | $Enums.ProfileType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    reportCount?: IntFieldUpdateOperationsInput | number
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    reputation?: IntFieldUpdateOperationsInput | number
    members?: ProfileMemberUncheckedUpdateManyWithoutProfileNestedInput
    posts?: PostUncheckedUpdateManyWithoutProfileNestedInput
    comments?: CommentUncheckedUpdateManyWithoutProfileNestedInput
    nfts?: NFTUncheckedUpdateManyWithoutProfileNestedInput
    follows?: FollowUncheckedUpdateManyWithoutFollowerNestedInput
    followers?: FollowUncheckedUpdateManyWithoutFollowingNestedInput
  }

  export type ProfileCreateWithoutFollowsInput = {
    id?: string
    handle: string
    displayName: string
    bio?: string | null
    avatar?: string | null
    type: $Enums.ProfileType
    createdAt?: Date | string
    updatedAt?: Date | string
    isBanned?: boolean
    reportCount?: number
    isVerified?: boolean
    reputation?: number
    members?: ProfileMemberCreateNestedManyWithoutProfileInput
    posts?: PostCreateNestedManyWithoutProfileInput
    comments?: CommentCreateNestedManyWithoutProfileInput
    likes?: LikeCreateNestedManyWithoutProfileInput
    nfts?: NFTCreateNestedManyWithoutProfileInput
    followers?: FollowCreateNestedManyWithoutFollowingInput
  }

  export type ProfileUncheckedCreateWithoutFollowsInput = {
    id?: string
    handle: string
    displayName: string
    bio?: string | null
    avatar?: string | null
    type: $Enums.ProfileType
    createdAt?: Date | string
    updatedAt?: Date | string
    isBanned?: boolean
    reportCount?: number
    isVerified?: boolean
    reputation?: number
    members?: ProfileMemberUncheckedCreateNestedManyWithoutProfileInput
    posts?: PostUncheckedCreateNestedManyWithoutProfileInput
    comments?: CommentUncheckedCreateNestedManyWithoutProfileInput
    likes?: LikeUncheckedCreateNestedManyWithoutProfileInput
    nfts?: NFTUncheckedCreateNestedManyWithoutProfileInput
    followers?: FollowUncheckedCreateNestedManyWithoutFollowingInput
  }

  export type ProfileCreateOrConnectWithoutFollowsInput = {
    where: ProfileWhereUniqueInput
    create: XOR<ProfileCreateWithoutFollowsInput, ProfileUncheckedCreateWithoutFollowsInput>
  }

  export type ProfileCreateWithoutFollowersInput = {
    id?: string
    handle: string
    displayName: string
    bio?: string | null
    avatar?: string | null
    type: $Enums.ProfileType
    createdAt?: Date | string
    updatedAt?: Date | string
    isBanned?: boolean
    reportCount?: number
    isVerified?: boolean
    reputation?: number
    members?: ProfileMemberCreateNestedManyWithoutProfileInput
    posts?: PostCreateNestedManyWithoutProfileInput
    comments?: CommentCreateNestedManyWithoutProfileInput
    likes?: LikeCreateNestedManyWithoutProfileInput
    nfts?: NFTCreateNestedManyWithoutProfileInput
    follows?: FollowCreateNestedManyWithoutFollowerInput
  }

  export type ProfileUncheckedCreateWithoutFollowersInput = {
    id?: string
    handle: string
    displayName: string
    bio?: string | null
    avatar?: string | null
    type: $Enums.ProfileType
    createdAt?: Date | string
    updatedAt?: Date | string
    isBanned?: boolean
    reportCount?: number
    isVerified?: boolean
    reputation?: number
    members?: ProfileMemberUncheckedCreateNestedManyWithoutProfileInput
    posts?: PostUncheckedCreateNestedManyWithoutProfileInput
    comments?: CommentUncheckedCreateNestedManyWithoutProfileInput
    likes?: LikeUncheckedCreateNestedManyWithoutProfileInput
    nfts?: NFTUncheckedCreateNestedManyWithoutProfileInput
    follows?: FollowUncheckedCreateNestedManyWithoutFollowerInput
  }

  export type ProfileCreateOrConnectWithoutFollowersInput = {
    where: ProfileWhereUniqueInput
    create: XOR<ProfileCreateWithoutFollowersInput, ProfileUncheckedCreateWithoutFollowersInput>
  }

  export type ProfileUpsertWithoutFollowsInput = {
    update: XOR<ProfileUpdateWithoutFollowsInput, ProfileUncheckedUpdateWithoutFollowsInput>
    create: XOR<ProfileCreateWithoutFollowsInput, ProfileUncheckedCreateWithoutFollowsInput>
    where?: ProfileWhereInput
  }

  export type ProfileUpdateToOneWithWhereWithoutFollowsInput = {
    where?: ProfileWhereInput
    data: XOR<ProfileUpdateWithoutFollowsInput, ProfileUncheckedUpdateWithoutFollowsInput>
  }

  export type ProfileUpdateWithoutFollowsInput = {
    id?: StringFieldUpdateOperationsInput | string
    handle?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumProfileTypeFieldUpdateOperationsInput | $Enums.ProfileType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    reportCount?: IntFieldUpdateOperationsInput | number
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    reputation?: IntFieldUpdateOperationsInput | number
    members?: ProfileMemberUpdateManyWithoutProfileNestedInput
    posts?: PostUpdateManyWithoutProfileNestedInput
    comments?: CommentUpdateManyWithoutProfileNestedInput
    likes?: LikeUpdateManyWithoutProfileNestedInput
    nfts?: NFTUpdateManyWithoutProfileNestedInput
    followers?: FollowUpdateManyWithoutFollowingNestedInput
  }

  export type ProfileUncheckedUpdateWithoutFollowsInput = {
    id?: StringFieldUpdateOperationsInput | string
    handle?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumProfileTypeFieldUpdateOperationsInput | $Enums.ProfileType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    reportCount?: IntFieldUpdateOperationsInput | number
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    reputation?: IntFieldUpdateOperationsInput | number
    members?: ProfileMemberUncheckedUpdateManyWithoutProfileNestedInput
    posts?: PostUncheckedUpdateManyWithoutProfileNestedInput
    comments?: CommentUncheckedUpdateManyWithoutProfileNestedInput
    likes?: LikeUncheckedUpdateManyWithoutProfileNestedInput
    nfts?: NFTUncheckedUpdateManyWithoutProfileNestedInput
    followers?: FollowUncheckedUpdateManyWithoutFollowingNestedInput
  }

  export type ProfileUpsertWithoutFollowersInput = {
    update: XOR<ProfileUpdateWithoutFollowersInput, ProfileUncheckedUpdateWithoutFollowersInput>
    create: XOR<ProfileCreateWithoutFollowersInput, ProfileUncheckedCreateWithoutFollowersInput>
    where?: ProfileWhereInput
  }

  export type ProfileUpdateToOneWithWhereWithoutFollowersInput = {
    where?: ProfileWhereInput
    data: XOR<ProfileUpdateWithoutFollowersInput, ProfileUncheckedUpdateWithoutFollowersInput>
  }

  export type ProfileUpdateWithoutFollowersInput = {
    id?: StringFieldUpdateOperationsInput | string
    handle?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumProfileTypeFieldUpdateOperationsInput | $Enums.ProfileType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    reportCount?: IntFieldUpdateOperationsInput | number
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    reputation?: IntFieldUpdateOperationsInput | number
    members?: ProfileMemberUpdateManyWithoutProfileNestedInput
    posts?: PostUpdateManyWithoutProfileNestedInput
    comments?: CommentUpdateManyWithoutProfileNestedInput
    likes?: LikeUpdateManyWithoutProfileNestedInput
    nfts?: NFTUpdateManyWithoutProfileNestedInput
    follows?: FollowUpdateManyWithoutFollowerNestedInput
  }

  export type ProfileUncheckedUpdateWithoutFollowersInput = {
    id?: StringFieldUpdateOperationsInput | string
    handle?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumProfileTypeFieldUpdateOperationsInput | $Enums.ProfileType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    reportCount?: IntFieldUpdateOperationsInput | number
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    reputation?: IntFieldUpdateOperationsInput | number
    members?: ProfileMemberUncheckedUpdateManyWithoutProfileNestedInput
    posts?: PostUncheckedUpdateManyWithoutProfileNestedInput
    comments?: CommentUncheckedUpdateManyWithoutProfileNestedInput
    likes?: LikeUncheckedUpdateManyWithoutProfileNestedInput
    nfts?: NFTUncheckedUpdateManyWithoutProfileNestedInput
    follows?: FollowUncheckedUpdateManyWithoutFollowerNestedInput
  }

  export type ProfileCreateWithoutNftsInput = {
    id?: string
    handle: string
    displayName: string
    bio?: string | null
    avatar?: string | null
    type: $Enums.ProfileType
    createdAt?: Date | string
    updatedAt?: Date | string
    isBanned?: boolean
    reportCount?: number
    isVerified?: boolean
    reputation?: number
    members?: ProfileMemberCreateNestedManyWithoutProfileInput
    posts?: PostCreateNestedManyWithoutProfileInput
    comments?: CommentCreateNestedManyWithoutProfileInput
    likes?: LikeCreateNestedManyWithoutProfileInput
    follows?: FollowCreateNestedManyWithoutFollowerInput
    followers?: FollowCreateNestedManyWithoutFollowingInput
  }

  export type ProfileUncheckedCreateWithoutNftsInput = {
    id?: string
    handle: string
    displayName: string
    bio?: string | null
    avatar?: string | null
    type: $Enums.ProfileType
    createdAt?: Date | string
    updatedAt?: Date | string
    isBanned?: boolean
    reportCount?: number
    isVerified?: boolean
    reputation?: number
    members?: ProfileMemberUncheckedCreateNestedManyWithoutProfileInput
    posts?: PostUncheckedCreateNestedManyWithoutProfileInput
    comments?: CommentUncheckedCreateNestedManyWithoutProfileInput
    likes?: LikeUncheckedCreateNestedManyWithoutProfileInput
    follows?: FollowUncheckedCreateNestedManyWithoutFollowerInput
    followers?: FollowUncheckedCreateNestedManyWithoutFollowingInput
  }

  export type ProfileCreateOrConnectWithoutNftsInput = {
    where: ProfileWhereUniqueInput
    create: XOR<ProfileCreateWithoutNftsInput, ProfileUncheckedCreateWithoutNftsInput>
  }

  export type PostCreateWithoutNftInput = {
    id?: string
    content: string
    mediaUrls?: PostCreatemediaUrlsInput | string[]
    mediaType?: $Enums.MediaType
    createdAt?: Date | string
    updatedAt?: Date | string
    likesCount?: number
    commentsCount?: number
    isHidden?: boolean
    reportCount?: number
    profile: ProfileCreateNestedOneWithoutPostsInput
    comments?: CommentCreateNestedManyWithoutPostInput
    likes?: LikeCreateNestedManyWithoutPostInput
  }

  export type PostUncheckedCreateWithoutNftInput = {
    id?: string
    profileId: string
    content: string
    mediaUrls?: PostCreatemediaUrlsInput | string[]
    mediaType?: $Enums.MediaType
    createdAt?: Date | string
    updatedAt?: Date | string
    likesCount?: number
    commentsCount?: number
    isHidden?: boolean
    reportCount?: number
    comments?: CommentUncheckedCreateNestedManyWithoutPostInput
    likes?: LikeUncheckedCreateNestedManyWithoutPostInput
  }

  export type PostCreateOrConnectWithoutNftInput = {
    where: PostWhereUniqueInput
    create: XOR<PostCreateWithoutNftInput, PostUncheckedCreateWithoutNftInput>
  }

  export type ProfileUpsertWithoutNftsInput = {
    update: XOR<ProfileUpdateWithoutNftsInput, ProfileUncheckedUpdateWithoutNftsInput>
    create: XOR<ProfileCreateWithoutNftsInput, ProfileUncheckedCreateWithoutNftsInput>
    where?: ProfileWhereInput
  }

  export type ProfileUpdateToOneWithWhereWithoutNftsInput = {
    where?: ProfileWhereInput
    data: XOR<ProfileUpdateWithoutNftsInput, ProfileUncheckedUpdateWithoutNftsInput>
  }

  export type ProfileUpdateWithoutNftsInput = {
    id?: StringFieldUpdateOperationsInput | string
    handle?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumProfileTypeFieldUpdateOperationsInput | $Enums.ProfileType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    reportCount?: IntFieldUpdateOperationsInput | number
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    reputation?: IntFieldUpdateOperationsInput | number
    members?: ProfileMemberUpdateManyWithoutProfileNestedInput
    posts?: PostUpdateManyWithoutProfileNestedInput
    comments?: CommentUpdateManyWithoutProfileNestedInput
    likes?: LikeUpdateManyWithoutProfileNestedInput
    follows?: FollowUpdateManyWithoutFollowerNestedInput
    followers?: FollowUpdateManyWithoutFollowingNestedInput
  }

  export type ProfileUncheckedUpdateWithoutNftsInput = {
    id?: StringFieldUpdateOperationsInput | string
    handle?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumProfileTypeFieldUpdateOperationsInput | $Enums.ProfileType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isBanned?: BoolFieldUpdateOperationsInput | boolean
    reportCount?: IntFieldUpdateOperationsInput | number
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    reputation?: IntFieldUpdateOperationsInput | number
    members?: ProfileMemberUncheckedUpdateManyWithoutProfileNestedInput
    posts?: PostUncheckedUpdateManyWithoutProfileNestedInput
    comments?: CommentUncheckedUpdateManyWithoutProfileNestedInput
    likes?: LikeUncheckedUpdateManyWithoutProfileNestedInput
    follows?: FollowUncheckedUpdateManyWithoutFollowerNestedInput
    followers?: FollowUncheckedUpdateManyWithoutFollowingNestedInput
  }

  export type PostUpsertWithoutNftInput = {
    update: XOR<PostUpdateWithoutNftInput, PostUncheckedUpdateWithoutNftInput>
    create: XOR<PostCreateWithoutNftInput, PostUncheckedCreateWithoutNftInput>
    where?: PostWhereInput
  }

  export type PostUpdateToOneWithWhereWithoutNftInput = {
    where?: PostWhereInput
    data: XOR<PostUpdateWithoutNftInput, PostUncheckedUpdateWithoutNftInput>
  }

  export type PostUpdateWithoutNftInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    mediaUrls?: PostUpdatemediaUrlsInput | string[]
    mediaType?: EnumMediaTypeFieldUpdateOperationsInput | $Enums.MediaType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    likesCount?: IntFieldUpdateOperationsInput | number
    commentsCount?: IntFieldUpdateOperationsInput | number
    isHidden?: BoolFieldUpdateOperationsInput | boolean
    reportCount?: IntFieldUpdateOperationsInput | number
    profile?: ProfileUpdateOneRequiredWithoutPostsNestedInput
    comments?: CommentUpdateManyWithoutPostNestedInput
    likes?: LikeUpdateManyWithoutPostNestedInput
  }

  export type PostUncheckedUpdateWithoutNftInput = {
    id?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    mediaUrls?: PostUpdatemediaUrlsInput | string[]
    mediaType?: EnumMediaTypeFieldUpdateOperationsInput | $Enums.MediaType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    likesCount?: IntFieldUpdateOperationsInput | number
    commentsCount?: IntFieldUpdateOperationsInput | number
    isHidden?: BoolFieldUpdateOperationsInput | boolean
    reportCount?: IntFieldUpdateOperationsInput | number
    comments?: CommentUncheckedUpdateManyWithoutPostNestedInput
    likes?: LikeUncheckedUpdateManyWithoutPostNestedInput
  }

  export type SessionCreateManyUserInput = {
    id: string
    expiresAt: Date | string
    token: string
    createdAt?: Date | string
    updatedAt?: Date | string
    ipAddress?: string | null
    userAgent?: string | null
  }

  export type AuthAccountCreateManyUserInput = {
    id: string
    accountId: string
    providerId: string
    accessToken?: string | null
    refreshToken?: string | null
    idToken?: string | null
    accessTokenExpiresAt?: Date | string | null
    refreshTokenExpiresAt?: Date | string | null
    scope?: string | null
    password?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SessionUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    token?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SessionUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    token?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SessionUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    token?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AuthAccountUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    accountId?: StringFieldUpdateOperationsInput | string
    providerId?: StringFieldUpdateOperationsInput | string
    accessToken?: NullableStringFieldUpdateOperationsInput | string | null
    refreshToken?: NullableStringFieldUpdateOperationsInput | string | null
    idToken?: NullableStringFieldUpdateOperationsInput | string | null
    accessTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    refreshTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuthAccountUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    accountId?: StringFieldUpdateOperationsInput | string
    providerId?: StringFieldUpdateOperationsInput | string
    accessToken?: NullableStringFieldUpdateOperationsInput | string | null
    refreshToken?: NullableStringFieldUpdateOperationsInput | string | null
    idToken?: NullableStringFieldUpdateOperationsInput | string | null
    accessTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    refreshTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuthAccountUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    accountId?: StringFieldUpdateOperationsInput | string
    providerId?: StringFieldUpdateOperationsInput | string
    accessToken?: NullableStringFieldUpdateOperationsInput | string | null
    refreshToken?: NullableStringFieldUpdateOperationsInput | string | null
    idToken?: NullableStringFieldUpdateOperationsInput | string | null
    accessTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    refreshTokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProfileMemberCreateManyAccountInput = {
    id?: string
    profileId: string
    role?: $Enums.ProfileRole
    createdAt?: Date | string
  }

  export type IdentityCheckCreateManyAccountInput = {
    id?: string
    provider: string
    externalId: string
    tier: $Enums.IdentityTier
    status: $Enums.IdentityCheckStatus
    initiatedAt?: Date | string
    resolvedAt?: Date | string | null
    expiresAt?: Date | string | null
    providerPayload?: NullableJsonNullValueInput | InputJsonValue
  }

  export type ProfileMemberUpdateWithoutAccountInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumProfileRoleFieldUpdateOperationsInput | $Enums.ProfileRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    profile?: ProfileUpdateOneRequiredWithoutMembersNestedInput
  }

  export type ProfileMemberUncheckedUpdateWithoutAccountInput = {
    id?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    role?: EnumProfileRoleFieldUpdateOperationsInput | $Enums.ProfileRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProfileMemberUncheckedUpdateManyWithoutAccountInput = {
    id?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    role?: EnumProfileRoleFieldUpdateOperationsInput | $Enums.ProfileRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IdentityCheckUpdateWithoutAccountInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    tier?: EnumIdentityTierFieldUpdateOperationsInput | $Enums.IdentityTier
    status?: EnumIdentityCheckStatusFieldUpdateOperationsInput | $Enums.IdentityCheckStatus
    initiatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    providerPayload?: NullableJsonNullValueInput | InputJsonValue
  }

  export type IdentityCheckUncheckedUpdateWithoutAccountInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    tier?: EnumIdentityTierFieldUpdateOperationsInput | $Enums.IdentityTier
    status?: EnumIdentityCheckStatusFieldUpdateOperationsInput | $Enums.IdentityCheckStatus
    initiatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    providerPayload?: NullableJsonNullValueInput | InputJsonValue
  }

  export type IdentityCheckUncheckedUpdateManyWithoutAccountInput = {
    id?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    tier?: EnumIdentityTierFieldUpdateOperationsInput | $Enums.IdentityTier
    status?: EnumIdentityCheckStatusFieldUpdateOperationsInput | $Enums.IdentityCheckStatus
    initiatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    providerPayload?: NullableJsonNullValueInput | InputJsonValue
  }

  export type ProfileMemberCreateManyProfileInput = {
    id?: string
    accountId: string
    role?: $Enums.ProfileRole
    createdAt?: Date | string
  }

  export type PostCreateManyProfileInput = {
    id?: string
    content: string
    mediaUrls?: PostCreatemediaUrlsInput | string[]
    mediaType?: $Enums.MediaType
    createdAt?: Date | string
    updatedAt?: Date | string
    likesCount?: number
    commentsCount?: number
    isHidden?: boolean
    reportCount?: number
  }

  export type CommentCreateManyProfileInput = {
    id?: string
    postId: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    isHidden?: boolean
  }

  export type LikeCreateManyProfileInput = {
    id?: string
    postId: string
    createdAt?: Date | string
  }

  export type NFTCreateManyProfileInput = {
    id?: string
    postId?: string | null
    objectId: string
    packageId: string
    moduleId: string
    type: $Enums.NFTType
    name: string
    description?: string | null
    imageUrl: string
    metadataUri: string
    isListed?: boolean
    price?: string | null
    createdAt?: Date | string
  }

  export type FollowCreateManyFollowerInput = {
    id?: string
    followingId: string
    createdAt?: Date | string
  }

  export type FollowCreateManyFollowingInput = {
    id?: string
    followerId: string
    createdAt?: Date | string
  }

  export type ProfileMemberUpdateWithoutProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumProfileRoleFieldUpdateOperationsInput | $Enums.ProfileRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    account?: AccountUpdateOneRequiredWithoutProfilesNestedInput
  }

  export type ProfileMemberUncheckedUpdateWithoutProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    accountId?: StringFieldUpdateOperationsInput | string
    role?: EnumProfileRoleFieldUpdateOperationsInput | $Enums.ProfileRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProfileMemberUncheckedUpdateManyWithoutProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    accountId?: StringFieldUpdateOperationsInput | string
    role?: EnumProfileRoleFieldUpdateOperationsInput | $Enums.ProfileRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PostUpdateWithoutProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    mediaUrls?: PostUpdatemediaUrlsInput | string[]
    mediaType?: EnumMediaTypeFieldUpdateOperationsInput | $Enums.MediaType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    likesCount?: IntFieldUpdateOperationsInput | number
    commentsCount?: IntFieldUpdateOperationsInput | number
    isHidden?: BoolFieldUpdateOperationsInput | boolean
    reportCount?: IntFieldUpdateOperationsInput | number
    comments?: CommentUpdateManyWithoutPostNestedInput
    likes?: LikeUpdateManyWithoutPostNestedInput
    nft?: NFTUpdateOneWithoutPostNestedInput
  }

  export type PostUncheckedUpdateWithoutProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    mediaUrls?: PostUpdatemediaUrlsInput | string[]
    mediaType?: EnumMediaTypeFieldUpdateOperationsInput | $Enums.MediaType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    likesCount?: IntFieldUpdateOperationsInput | number
    commentsCount?: IntFieldUpdateOperationsInput | number
    isHidden?: BoolFieldUpdateOperationsInput | boolean
    reportCount?: IntFieldUpdateOperationsInput | number
    comments?: CommentUncheckedUpdateManyWithoutPostNestedInput
    likes?: LikeUncheckedUpdateManyWithoutPostNestedInput
    nft?: NFTUncheckedUpdateOneWithoutPostNestedInput
  }

  export type PostUncheckedUpdateManyWithoutProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    mediaUrls?: PostUpdatemediaUrlsInput | string[]
    mediaType?: EnumMediaTypeFieldUpdateOperationsInput | $Enums.MediaType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    likesCount?: IntFieldUpdateOperationsInput | number
    commentsCount?: IntFieldUpdateOperationsInput | number
    isHidden?: BoolFieldUpdateOperationsInput | boolean
    reportCount?: IntFieldUpdateOperationsInput | number
  }

  export type CommentUpdateWithoutProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isHidden?: BoolFieldUpdateOperationsInput | boolean
    post?: PostUpdateOneRequiredWithoutCommentsNestedInput
  }

  export type CommentUncheckedUpdateWithoutProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    postId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isHidden?: BoolFieldUpdateOperationsInput | boolean
  }

  export type CommentUncheckedUpdateManyWithoutProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    postId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isHidden?: BoolFieldUpdateOperationsInput | boolean
  }

  export type LikeUpdateWithoutProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    post?: PostUpdateOneRequiredWithoutLikesNestedInput
  }

  export type LikeUncheckedUpdateWithoutProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    postId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LikeUncheckedUpdateManyWithoutProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    postId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NFTUpdateWithoutProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    objectId?: StringFieldUpdateOperationsInput | string
    packageId?: StringFieldUpdateOperationsInput | string
    moduleId?: StringFieldUpdateOperationsInput | string
    type?: EnumNFTTypeFieldUpdateOperationsInput | $Enums.NFTType
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: StringFieldUpdateOperationsInput | string
    metadataUri?: StringFieldUpdateOperationsInput | string
    isListed?: BoolFieldUpdateOperationsInput | boolean
    price?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    post?: PostUpdateOneWithoutNftNestedInput
  }

  export type NFTUncheckedUpdateWithoutProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    postId?: NullableStringFieldUpdateOperationsInput | string | null
    objectId?: StringFieldUpdateOperationsInput | string
    packageId?: StringFieldUpdateOperationsInput | string
    moduleId?: StringFieldUpdateOperationsInput | string
    type?: EnumNFTTypeFieldUpdateOperationsInput | $Enums.NFTType
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: StringFieldUpdateOperationsInput | string
    metadataUri?: StringFieldUpdateOperationsInput | string
    isListed?: BoolFieldUpdateOperationsInput | boolean
    price?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NFTUncheckedUpdateManyWithoutProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    postId?: NullableStringFieldUpdateOperationsInput | string | null
    objectId?: StringFieldUpdateOperationsInput | string
    packageId?: StringFieldUpdateOperationsInput | string
    moduleId?: StringFieldUpdateOperationsInput | string
    type?: EnumNFTTypeFieldUpdateOperationsInput | $Enums.NFTType
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: StringFieldUpdateOperationsInput | string
    metadataUri?: StringFieldUpdateOperationsInput | string
    isListed?: BoolFieldUpdateOperationsInput | boolean
    price?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FollowUpdateWithoutFollowerInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    following?: ProfileUpdateOneRequiredWithoutFollowersNestedInput
  }

  export type FollowUncheckedUpdateWithoutFollowerInput = {
    id?: StringFieldUpdateOperationsInput | string
    followingId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FollowUncheckedUpdateManyWithoutFollowerInput = {
    id?: StringFieldUpdateOperationsInput | string
    followingId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FollowUpdateWithoutFollowingInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    follower?: ProfileUpdateOneRequiredWithoutFollowsNestedInput
  }

  export type FollowUncheckedUpdateWithoutFollowingInput = {
    id?: StringFieldUpdateOperationsInput | string
    followerId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FollowUncheckedUpdateManyWithoutFollowingInput = {
    id?: StringFieldUpdateOperationsInput | string
    followerId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CommentCreateManyPostInput = {
    id?: string
    profileId: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    isHidden?: boolean
  }

  export type LikeCreateManyPostInput = {
    id?: string
    profileId: string
    createdAt?: Date | string
  }

  export type CommentUpdateWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isHidden?: BoolFieldUpdateOperationsInput | boolean
    profile?: ProfileUpdateOneRequiredWithoutCommentsNestedInput
  }

  export type CommentUncheckedUpdateWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isHidden?: BoolFieldUpdateOperationsInput | boolean
  }

  export type CommentUncheckedUpdateManyWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isHidden?: BoolFieldUpdateOperationsInput | boolean
  }

  export type LikeUpdateWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    profile?: ProfileUpdateOneRequiredWithoutLikesNestedInput
  }

  export type LikeUncheckedUpdateWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LikeUncheckedUpdateManyWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    profileId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}