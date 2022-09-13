import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { User, UserId } from './User';

export interface AuthTokenAttributes {
  id: number;
  userId: number;
  token: string;
  refreshToken: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export type AuthTokenPk = "id";
export type AuthTokenId = AuthToken[AuthTokenPk];
export type AuthTokenOptionalAttributes = "id" | "createdAt" | "updatedAt" | "deletedAt";
export type AuthTokenCreationAttributes = Optional<AuthTokenAttributes, AuthTokenOptionalAttributes>;

export class AuthToken extends Model<AuthTokenAttributes, AuthTokenCreationAttributes> implements AuthTokenAttributes {
  id!: number;
  userId!: number;
  token!: string;
  refreshToken!: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;

  // AuthToken belongsTo User via userId
  user!: User;
  getUser!: Sequelize.BelongsToGetAssociationMixin<User>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<User, UserId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<User>;

  static initModel(sequelize: Sequelize.Sequelize): typeof AuthToken {
    return AuthToken.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      },
      field: 'user_id'
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'refresh_token'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp'),
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'updated_at'
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deleted_at'
    }
  }, {
    sequelize,
    tableName: 'auth_token',
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
      {
        name: "auth_token_FK",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
  }
}
