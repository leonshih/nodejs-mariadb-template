import jwt from 'jsonwebtoken';
import randomstring from 'randomstring';
import { Request } from 'express';

import { UnauthorizedError } from 'routing-controllers';
import { AuthorityAttributes } from '../sequelize/models/init-models';
import { UserModel, AuthTokenModel, AuthorityModel } from '../sequelize/models';

//const { User, AuthToken, Authority } = models;

interface ITokenPayload {
  id: number;
  name: string;
  mobile: string;
  email: string | undefined;
  authorities: AuthorityAttributes[];
}

export interface ICurrentUser extends ITokenPayload {
  token: string;
}


/**
 * 產生token
 * @param user
 * @returns {string}
 */
export function createToken(user: ITokenPayload) {
	const payload = {
		id: user.id,
		name: user.name,
		mobile: user.mobile,
		email: user.email,
		authorities: user.authorities,
	};

	return jwt.sign(payload, process.env.JWT_SECRET as jwt.Secret, {
		algorithm: 'HS256',
		expiresIn: `${process.env.JWT_EXPIRES_IN}s`,
		issuer: 'ops3-api',
		subject: 'user',
	});
}

/**
 * 產生refresh token
 * @returns {string}
 */
export function createRefreshToken() {
	return randomstring.generate(64);
}

/**
 * 檢查token期限是否有效
 * @param token
 * @returns
 */
export function verifyToken(token: string): ITokenPayload | null {
	try {
		return jwt.verify(
			token,
      process.env.JWT_SECRET as jwt.Secret
		) as ITokenPayload;
	} catch (error) {
		return null;
	}
}

/**
 * 取得當下使用者
 * @param req
 * @returns
 */
export async function getCurrentUser({
	request: req,
}: {
  request: Request;
}): Promise<ICurrentUser> {
	const { authorization } = req.headers;

	// 檢查有無在header中傳入token
	if (!authorization) throw new UnauthorizedError('沒有提供授權資訊');

	const token = authorization.split(' ')[1];

	// 檢查token是否傳入正確
	if (!token) throw new UnauthorizedError('token不得為空');

	// 檢查token是否有效並取得token中的資料
	const payload = verifyToken(token);

	if (!payload) throw new UnauthorizedError('token無效');

	// 取得token中的userId
	const { id: userId } = payload;

	// 若token中的userId與資料庫中的userId不同則回傳錯誤
	if (!userId) throw new UnauthorizedError('token無效');

	// 從db抓取對應的token資料
	const authToken = await AuthTokenModel.findOne({ where: { token } });

	// 若沒有找到對應的token則回傳錯誤
	if (!authToken) throw new UnauthorizedError('該token不存在或已過期');

	// 若找到對應的token則檢查token是否有效
	if (authToken.userId !== userId)
		throw new UnauthorizedError('token與資料庫不符');

	const currentUser = await UserModel.findOne({
		where: { id: userId },
		include: [
			{
				model: AuthorityModel,
				as: 'authorities',
				attributes: ['functionKey', 'authority'],
			},
		],
	});

	if (!currentUser) throw new UnauthorizedError('該使用者不存在');

	const { id, name, mobile, email, authorities } = currentUser;

	return {
		id,
		name,
		mobile,
		email: email as string,
		authorities: authorities as AuthorityAttributes[],
		token,
	};
}
