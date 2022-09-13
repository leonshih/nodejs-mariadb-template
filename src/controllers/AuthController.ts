import {
	BadRequestError,
	Body,
	CurrentUser,
	InternalServerError,
	JsonController,
	Post,
	Req,
	Res,
} from 'routing-controllers';
import validator from 'validator';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';

import { createSuccessResponse } from '../lib/response';
import { createToken, createRefreshToken, ICurrentUser } from '../lib/authentication';
import { UserModel, AuthTokenModel, AuthorityModel } from '../sequelize/models';

@JsonController('/auth') // routing prefix
export class UserController {
  /** 登入 */
  @Post('/signin') // routing path
	async signin(
    @Req() req: Request,
    @Res() res: Response,
    @Body()
    	{ 
    		account, 
    		password 
    	}:
        {
            account: string,
            password: string 
        }
	) {
		// 檢查是否有空值
		if (!account || !password)
			throw new BadRequestError('帳號、密碼不得為空');

		// 檢查帳號格式
		if (
			!validator.isEmail(account) &&
            !validator.isMobilePhone(account, 'zh-TW')
		)
			throw new BadRequestError('帳號格式不正確');

		// 根據帳號類型查詢使用者
		const user = validator.isEmail(account)
			? await UserModel.findOne({
				where: { email: account },
				include: [
					{
						model: AuthorityModel,
						as: 'authorities',
						attributes: ['functionKey', 'authority'],
					},
				],
			})
			: await UserModel.findOne({
				where: { mobile: account },
				include: [
					{
						model: AuthorityModel,
						as: 'authorities',
						attributes: ['functionKey', 'authority'],
					},
				],
			});

		// 檢查使用者是否存在
		if (!user) throw new BadRequestError('帳號不存在');

		// 檢查密碼是否正確
		if (!bcrypt.compareSync(password, user.passwordEncrypted))
			throw new BadRequestError('密碼不正確');

		// 產生token
		const token = createToken(user);

		// 產生refresh token
		const refreshToken = createRefreshToken();

		try {
			// 寫入token資料庫
			await AuthTokenModel.create({
				userId: user.id,
				token,
				refreshToken,
			});
		} catch (error) {
			throw new InternalServerError('寫入token資料庫失敗');
		}

		// 回傳成功訊息
		return createSuccessResponse(res, {
			token,
			refreshToken,
			authorities: user.authorities
		});
	}

  /** 登出 */
  @Post('/signout') // routing path
  async signout(
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser({ required: true }) currentUser: ICurrentUser
  ) {
  	try {
  		await AuthTokenModel.destroy({ where: { token: currentUser.token } });
  	} catch (error) {
  		throw new InternalServerError('刪除token資料庫失敗');
  	}

  	return createSuccessResponse(res);
  }


  /** 刷新token */
  @Post('/refresh')
  async createUser(
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser({ required: true }) currentUser: ICurrentUser
  ) {
  	const { token } = currentUser;
  	const refreshToken = req.headers['refresh-token'];

  	// 檢查refresh token是否正確
  	if (!refreshToken || !token)
  		throw new BadRequestError('refresh token不正確');

  	const authTokenData = await AuthTokenModel.findOne({
  		where: { token },
  	});

  	if (!authTokenData) throw new BadRequestError('token不存在');

  	if (authTokenData.refreshToken !== refreshToken)
  		throw new BadRequestError('refreshToken不正確');

  	const newToken = createToken(currentUser);

  	try {
  		await AuthTokenModel.update({ token: newToken }, { where: { token } });
  	} catch (error) {
  		throw new InternalServerError('更新token資料庫失敗');
  	}

  	return createSuccessResponse(res, {
  		token: newToken,
  		refreshToken: authTokenData.refreshToken,
  		authorities: currentUser.authorities,
  	});
  }
}
