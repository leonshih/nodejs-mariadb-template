import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { User, UserId } from './User';

export interface AuthorityAttributes {
  id: number;
  userId: number;
  functionKey: string;
  authority: number;
  createdAt?: Date;
  createdBy?: number;
  updatedAt?: Date;
  updatedBy?: number;
  deletedAt?: Date;
  deletedBy?: number;
  deleted: number;
}

export type AuthorityPk = "id";
export type AuthorityId = Authority[AuthorityPk];
export type AuthorityOptionalAttributes = "id" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy" | "deletedAt" | "deletedBy" | "deleted";
export type AuthorityCreationAttributes = Optional<AuthorityAttributes, AuthorityOptionalAttributes>;

export class Authority extends Model<AuthorityAttributes, AuthorityCreationAttributes> implements AuthorityAttributes {
  id!: number;
  userId!: number;
  functionKey!: string;
  authority!: number;
  createdAt?: Date;
  createdBy?: number;
  updatedAt?: Date;
  updatedBy?: number;
  deletedAt?: Date;
  deletedBy?: number;
  deleted!: number;

  // Authority belongsTo User via userId
  user!: User;
  getUser!: Sequelize.BelongsToGetAssociationMixin<User>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<User, UserId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<User>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Authority {
    return Authority.init({
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
    functionKey: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "平台功能key值(e.g. P_P01)",
      field: 'function_key'
    },
    authority: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: "權限值"
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
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'authority',
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
        name: "authority_FK",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
  }
}
