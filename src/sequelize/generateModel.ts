/* eslint-disable @typescript-eslint/no-var-requires */
import dotenv from 'dotenv';
import SequelizeAuto from 'sequelize-auto';
import camelCase from 'camelcase';
import fs from 'fs';

process.env.NODE_ENV === 'production'
	? dotenv.config()
	: dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

import { autoConfig } from '../config/sequelize';

const auto = new SequelizeAuto(
	autoConfig.database,
	autoConfig.username,
	autoConfig.password,
	autoConfig
);

auto.run().then((models: any) => {
	const exportList = Object.keys(models.tables).map((key) => {
		const name = camelCase(key.replace(autoConfig.database, ''), {
			pascalCase: true,
		});

		return `export const ${name}Model = models.${name};`;
	});

	fs.writeFile(
		'./src/sequelize/models/index.ts',
		`import { models } from '../';
    \n` + exportList.join('\n'),
		(err) => {
			if (err) {
				console.log(err);
			}
		}
	);
});
