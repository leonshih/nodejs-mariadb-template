# nodejs-mariadb-template

An Node.js server side template with these features:
* Using routing-controllers to handle requests
* Using Sequelize as ORM and using MariaDB as database

## Table of contents
* [Basic](#basic)
    * [Installation](#installation)
    * [.env](#env)
* [Database](#database-using-sequelize-wmariadb)
    * [Create tables](#create-tables-db-scriptstablessql)
    * [.env](#env-2)
    * [Generate models](#generate-models)
    * [Usage](#usage-1)
* [User Authentication](#user-authentication-srclibauthentication)
    * [.env](#env-3)
* [User Authority](#user-authority)
    * [Configuration](#configuration-srcconfigauthorityts)
    * [Usage](#usage-2)
* [logger](#logger)
    * [.env](#env-1)
    * [Usage](#usage)
* [Reference](#reference)


## Basic

### Installation

```
npm install
```

or use yarn

```
yarn
```
### .env
```
PORT = <YOUR_SERVER_PORT>
```


## Database (using Sequelize w/MariaDB)

### Create tables (db-scripts/tables.sql)

* user
* auth_token
* authority


### .env
```
DB_HOST = <YOUR_DB_HOST>
DB_USERNAME = <YOUR_DB_USER_NAME>
DB_PASSWORD = <YOUR_DB_PASSWORD>
DB_NAME = <YOUR_DB_NAME>
```

### Generate models
```
npm run generateModel
```

### Usage
```js
import { UserModel } from '../sequelize/models';

await UserModel.findAll();
...
```

## User Authentication (src/lib/authentication)

### .env
```
JWT_ISSUER = <YOUR_JWT_ISSUER>
JWT_SECRET = <YOUR_JWT_SECRET>
JWT_EXPIRES_IN = 86400
JWT_REFRESH_EXPIRES_IN = 172800
```
### Current User
#### Usage
```js
import { ICurrentUser } from '../lib/authentication';

@Post('/signout')
async signout(
    @CurrentUser({ required: true }) currentUser: ICurrentUser
) {
    currentUser.id // the id of current user
    ...
}
```

## User Authority

### Configuration (src/config/authority.ts)
* Authority Map
```js
/** 權限Map */
export const authorityMap = {
    NONE: 0,
    READ: 1 << 0, // 1 讀取
    CREATE: 1 << 1, // 2 建立
    UPDATE: 1 << 2, // 4 更新
    DELETE: 1 << 3, // 8 刪除
    EXPORT: 1 << 4, // 16 匯出
    IMPORT: 1 << 5, // 32 匯入
}
```

* Determine the authority of actions in every function
```js
/** 平台功能權限 */
export const functionAuthorityMap = {
    /** 功能一 */
    F01: // 功能代碼
        authorityMap.READ |
        authorityMap.CREATE |
        authorityMap.UPDATE |
        authorityMap.DELETE,
    /** 功能二 */
    F02: // 功能代碼
        authorityMap.READ |
        authorityMap.CREATE |
        authorityMap.UPDATE |
        authorityMap.DELETE |
        authorityMap.EXPORT |
        authorityMap.IMPORT,
    /** 功能三 */
    F03: // 功能代碼
        authorityMap.READ | 
        authorityMap.EXPORT | 
        authorityMap.IMPORT,
};
```

* Determine the authority name enum (optional)
```js
/** 平台功能權限名稱 */
export enum AuthorityNameEnum {
    READ = 'READ',
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    EXPORT = 'EXPORT',
    IMPORT = 'IMPORT',
}
```

### Usage

#### Verify user's authority in a function

```js
import authorityHandler from '../lib/authority';
import { AuthorityNameEnum } from '../config/authority';

// 檢查使用者權限
authorityHandler.verifyUserFunctionAuthority(
    currentUser.authorities,
    functionKey,
    AuthorityNameEnum.CREATE
);
```

#### Verify a function


## logger
### .env

```
LOGGER = pino
LOG_LEVEL = info
LOG_TO_AZURE_TABLE = true
AZURE_STORAGE_ACCOUNT = <YOUR_AZURE_STORAGE_ACCOUNT>
AZURE_STORAGE_ACCOUNT_KEY = <YOUR_AZURE_STORAGE_ACCOUNT_KEY>
```
* LOGGER
    * pino (recommended)
    * winston
* LOG_LEVEL
    * pino levels: trace | debug | info | warn | error | fatal | silent
    * winston levels: error | warn | info | http | verbose | debug | silly
* LOG_TO_AZURE_TABLE: true | false
### Usage

```js
import { createLogger } from 'azure-table-logger';

const logger = createLogger(__filename);

logger.info('info message');
logger.error(new Error('test error'));
```

## Reference
* [routing-controllers](https://github.com/typestack/routing-controllers)
* [sequelize](https://sequelize.org/)
* [azure-table-logger](https://github.com/leonshih/azure-table-logger)
* [authority-handler](https://github.com/leonshih/authority-handler)
