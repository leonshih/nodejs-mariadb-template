import {
	Middleware,
	ExpressErrorMiddlewareInterface,
	UnauthorizedError,
	BadRequestError,
} from 'routing-controllers';
import { createLogger } from 'azure-table-logger';
import {
	createErrorResponse,
	createInvalidResponse,
	createUnauthorizedResponse,
} from '../lib/response';

const logger = createLogger(__filename);

@Middleware({ type: 'after' })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
	error(error: Error, req: Request, res: Response) {
		logger.error(error);
		if (error instanceof UnauthorizedError)
			return createUnauthorizedResponse(res, error.message);

		if (error instanceof BadRequestError)
			return createInvalidResponse(res, error.message);

		return createErrorResponse(res, error.message);
	}
}
