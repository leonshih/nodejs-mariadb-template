// ref: https://sequelize.org/api/v6/class/src/sequelize.js~sequelize#instance-constructor-constructor

import {
	CaseFileOption,
	CaseOption,
	LangOption,
} from 'sequelize-auto/types/types';
import { Dialect } from 'sequelize/types';

const autoConfig = {
	useDefine: false,
	database: process.env.DB_NAME as string,
	username: process.env.DB_USERNAME as string,
	password: process.env.DB_PASSWORD as string,
	host: process.env.DB_HOST,
	dialect: 'mariadb' as Dialect,
	directory: './src/sequelize/models', // where to write files
	port: 3306,
	caseModel: 'p' as CaseOption, // convert snake_case column names to camelCase field names: user_id -> userId
	caseFile: 'p' as CaseFileOption, // file names created for each model use camelCase.js not snake_case.js
	caseProp: 'c' as CaseOption, // convert snake_case column names to camelCase field names: user_id -> userId
	singularize: false, // convert plural table names to singular model names
	additional: {
		timestamps: true,
		paranoid: true,
		createdAt: 'createdAt',
		updatedAt: 'updatedAt',
		deletedAt: 'deletedAt',
		// ...options added to each model
	},
	timezone: '+00:00',
	lang: 'ts' as LangOption,
};

const config =
  process.env.DB_SSL === '1'
  	? {
  		...autoConfig,
  		ssl: true,
  		dialectOptions: {
  			ssl: {
  				require: true,
  			},
  		},
  	}
  	: autoConfig;

export { config, autoConfig };
