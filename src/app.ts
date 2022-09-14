import { Action, createExpressServer } from 'routing-controllers';
import dotenv from 'dotenv';
import 'reflect-metadata';

process.env.NODE_ENV === 'production'
	? dotenv.config()
	: dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

import { createAzureDataTable, createLogger } from 'azure-table-logger';
import { getCurrentUser } from './lib/authentication';

import { sequelize } from './sequelize';
import { ErrorHandler } from './middlewares/ErrorHandler';

(async () => {
	/** create azure data table */
	if (process.env.LOG_TO_AZURE_TABLE === 'true') await createAzureDataTable();

	/** create logger */
	const logger = createLogger(__filename);

	/** exception handling */
	process.on('uncaughtException', (error) => {
		logger.error(`uncaughtException: ${error}`);
	});

	/** rejection handling */
	process.on('unhandledRejection', (reason) => {
		logger.error(`unhandledRejection: ${reason}`);
	});

	/** sequelize authentication */
	try {
		await sequelize.authenticate();
		logger.info('Connection has been established successfully.');
	} catch (err) {
		logger.error('Unable to connect to the database:', err);

		process.exit(1);
	}

	/** create express server using routing controllers */
	const app = createExpressServer({
		defaultErrorHandler: false,
		classTransformer: false,
		controllers: [`${__dirname}/controllers/*.ts`],
		middlewares: [ErrorHandler],
		currentUserChecker: async (action: Action) => {
			return await getCurrentUser(action);
		},
	});

	/** listen on port */
	app.listen(process.env.PORT);

	logger.info(`Server started at port ${process.env.PORT}`);
})();
