import {
	BadRequestError,
	ExpressMiddlewareInterface,
} from 'routing-controllers';
import { Request, Response } from 'express';
import validator from 'validator';

const operators = ['greater', 'equal', 'less'];

export class QueryValidator implements ExpressMiddlewareInterface {
	use(req: Request, res: Response, next: any) {
		const { page, limit, orderby, order } = req.query;

		if (page && !validator.isInt(page + '', { min: 1 }))
			throw new BadRequestError('page格式錯誤');

		if (limit && !validator.isInt(limit + '', { min: 1 }))
			throw new BadRequestError('limit格式錯誤');

		if (
			orderby &&
      !validator.isIn(orderby as string, ['id', 'name', 'mobile', 'email'])
		)
			throw new BadRequestError('orderby格式錯誤');

		if (order && !validator.isIn(order as string, ['asc', 'desc']))
			throw new BadRequestError('order格式錯誤');

		if (next) next();
	}
}

export class UserQueryValidator extends QueryValidator {
	use(req: Request, res: Response, next: (err?: Error) => any) {
		super.use(req, res, null);
		const { name, mobile, email } = req.query;

		if (name && !validator.isLength(name as string, { min: 1, max: 50 }))
			throw new BadRequestError('name格式錯誤');

		if (mobile && !validator.isMobilePhone(mobile as string, 'zh-TW'))
			throw new BadRequestError('mobile格式錯誤');

		if (email && !validator.isEmail(email as string))
			throw new BadRequestError('email格式錯誤');

		next();
	}
}

export class EnterpriseQueryValidator extends QueryValidator {
	use(req: Request, res: Response, next: (err?: Error) => any) {
		super.use(req, res, null);

		const {
			code,
			name,
			identityId,
			deleted,
			carQty,
			carQtyOperator,
			enabledCarQty,
			enabledCarQtyOperator,
			userQty,
			userQtyOperator,
		} = req.query;

		if (code && !validator.isLength(code as string, { min: 1, max: 50 }))
			throw new BadRequestError('code格式錯誤');

		if (name && !validator.isLength(name as string, { min: 1, max: 50 }))
			throw new BadRequestError('name格式錯誤');

		if (
			identityId &&
      !validator.isLength(identityId as string, { min: 1, max: 50 })
		)
			throw new BadRequestError('identityId格式錯誤');

		if (deleted && !validator.isBoolean(deleted as string))
			throw new BadRequestError('deleted格式錯誤');

		if (carQty && !validator.isInt(carQty as string, { min: 1 }))
			throw new BadRequestError('carQty格式錯誤');

		if (carQtyOperator && !validator.isIn(carQtyOperator as string, operators))
			throw new BadRequestError('carQtyOperator格式錯誤');

		if (enabledCarQty && !validator.isInt(enabledCarQty + '', { min: 1 }))
			throw new BadRequestError('enabledCarQty格式錯誤');

		if (
			enabledCarQtyOperator &&
      !validator.isIn(enabledCarQtyOperator as string, operators)
		)
			throw new BadRequestError('enabledCarQtyOperator格式錯誤');

		if (userQty && !validator.isInt(userQty + '', { min: 1 }))
			throw new BadRequestError('userQty格式錯誤');

		if (
			userQtyOperator &&
      !validator.isIn(userQtyOperator as string, operators)
		)
			throw new BadRequestError('userQtyOperator格式錯誤');

		next();
	}
}
