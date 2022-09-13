import type { Sequelize } from "sequelize";
import { AuthToken as _AuthToken } from "./AuthToken";
import type { AuthTokenAttributes, AuthTokenCreationAttributes } from "./AuthToken";
import { Authority as _Authority } from "./Authority";
import type { AuthorityAttributes, AuthorityCreationAttributes } from "./Authority";
import { User as _User } from "./User";
import type { UserAttributes, UserCreationAttributes } from "./User";

export {
  _AuthToken as AuthToken,
  _Authority as Authority,
  _User as User,
};

export type {
  AuthTokenAttributes,
  AuthTokenCreationAttributes,
  AuthorityAttributes,
  AuthorityCreationAttributes,
  UserAttributes,
  UserCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const AuthToken = _AuthToken.initModel(sequelize);
  const Authority = _Authority.initModel(sequelize);
  const User = _User.initModel(sequelize);

  AuthToken.belongsTo(User, { as: "user", foreignKey: "userId"});
  User.hasMany(AuthToken, { as: "authTokens", foreignKey: "userId"});
  Authority.belongsTo(User, { as: "user", foreignKey: "userId"});
  User.hasMany(Authority, { as: "authorities", foreignKey: "userId"});

  return {
    AuthToken: AuthToken,
    Authority: Authority,
    User: User,
  };
}
