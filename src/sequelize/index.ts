import { Options, Sequelize } from 'sequelize';
import snakecaseKeys from 'snakecase-keys';

import { initModels } from './models/init-models';
import { createLogger } from 'azure-table-logger';
import { config } from '../config/sequelize';

const logger = createLogger(__filename);

class customSequelize extends Sequelize {
	constructor(config: Options) {
		super(config);
	}

	async customDestroy(
		model: any,
		{
			where,
			deletedBy,
			transaction,
		}: { where: any; deletedBy: number; transaction?: any }
	) {
		try {
			const whereSql = Object.keys(snakecaseKeys(where))
				.map((key) => {
					return `${key} = '${where[key]}'`;
				})
				.join(' AND ');

			const sql = `UPDATE ${model.tableName} SET deleted_by = ${deletedBy}, deleted_at = NOW() WHERE 1=1 AND ${whereSql}`;

			return await this.query(sql, { transaction });
		} catch (err) {
			logger.error(err);
			throw err;
		}
	}
}

const sequelize = new customSequelize({
	...config,
	logging: (args) => logger.trace(args),
});

const models = initModels(sequelize);

export { sequelize, models };

// 擴充方法
/**
 * 將權限數值列表轉為權限名稱列表
 * @example
 * authorities: [{
 *      functionKey: 'P_P01',
 *      authority: 7,
 * }]
 * to
 * authorityList: [{
 *      functionKey: 'P_P01',
 *      authorityList: ['read', 'update', 'delete']
 * }]
 */
//models.User.prototype.getUserAuthorityNameList = function () {
//  const authorityList = this.authorities.map(
//    ({
//      functionKey,
//      authority,
//    }: {
//      functionKey: string;
//      authority: number;
//    }) => ({
//      functionKey,
//      authority: getNameListByAuthority(authority),
//    })
//  );
//  return authorityList;
//};
