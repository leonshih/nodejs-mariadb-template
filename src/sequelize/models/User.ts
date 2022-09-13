import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { AuthToken, AuthTokenId } from './AuthToken';
import type { Authority, AuthorityId } from './Authority';

export interface UserAttributes {
  id: number;
  name: string;
  mobile: string;
  email: string;
  passwordEncrypted: string;
  createdAt?: Date;
  createdBy?: number;
  updatedAt?: Date;
  updatedBy?: number;
  deletedAt?: Date;
  deletedBy?: number;
}

export type UserPk = "id";
export type UserId = User[UserPk];
export type UserOptionalAttributes = "id" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy" | "deletedAt" | "deletedBy";
export type UserCreationAttributes = Optional<UserAttributes, UserOptionalAttributes>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  id!: number;
  name!: string;
  mobile!: string;
  email!: string;
  passwordEncrypted!: string;
  createdAt?: Date;
  createdBy?: number;
  updatedAt?: Date;
  updatedBy?: number;
  deletedAt?: Date;
  deletedBy?: number;

  // User hasMany AuthToken via userId
  authTokens!: AuthToken[];
  getAuthTokens!: Sequelize.HasManyGetAssociationsMixin<AuthToken>;
  setAuthTokens!: Sequelize.HasManySetAssociationsMixin<AuthToken, AuthTokenId>;
  addAuthToken!: Sequelize.HasManyAddAssociationMixin<AuthToken, AuthTokenId>;
  addAuthTokens!: Sequelize.HasManyAddAssociationsMixin<AuthToken, AuthTokenId>;
  createAuthToken!: Sequelize.HasManyCreateAssociationMixin<AuthToken>;
  removeAuthToken!: Sequelize.HasManyRemoveAssociationMixin<AuthToken, AuthTokenId>;
  removeAuthTokens!: Sequelize.HasManyRemoveAssociationsMixin<AuthToken, AuthTokenId>;
  hasAuthToken!: Sequelize.HasManyHasAssociationMixin<AuthToken, AuthTokenId>;
  hasAuthTokens!: Sequelize.HasManyHasAssociationsMixin<AuthToken, AuthTokenId>;
  countAuthTokens!: Sequelize.HasManyCountAssociationsMixin;
  // User hasMany Authority via userId
  authorities!: Authority[];
  getAuthorities!: Sequelize.HasManyGetAssociationsMixin<Authority>;
  setAuthorities!: Sequelize.HasManySetAssociationsMixin<Authority, AuthorityId>;
  addAuthority!: Sequelize.HasManyAddAssociationMixin<Authority, AuthorityId>;
  addAuthorities!: Sequelize.HasManyAddAssociationsMixin<Authority, AuthorityId>;
  createAuthority!: Sequelize.HasManyCreateAssociationMixin<Authority>;
  removeAuthority!: Sequelize.HasManyRemoveAssociationMixin<Authority, AuthorityId>;
  removeAuthorities!: Sequelize.HasManyRemoveAssociationsMixin<Authority, AuthorityId>;
  hasAuthority!: Sequelize.HasManyHasAssociationMixin<Authority, AuthorityId>;
  hasAuthorities!: Sequelize.HasManyHasAssociationsMixin<Authority, AuthorityId>;
  countAuthorities!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof User {
    return User.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    mobile: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    passwordEncrypted: {
      type: DataTypes.STRING(128),
      allowNull: false,
      field: 'password_encrypted'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp'),
      field: 'created_at'
    },
    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'created_by'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'updated_at'
    },
    updatedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'updated_by'
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deleted_at'
    },
    deletedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'deleted_by'
    }
  }, {
    sequelize,
    tableName: 'user',
    timestamps: true,
    paranoid: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt',
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
