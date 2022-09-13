import {
	BadRequestError,
	Body,
	CurrentUser,
	Delete,
	Get,
	InternalServerError,
	JsonController,
	Param,
	Post,
	Put,
	QueryParam,
	Res,
	UseBefore,
} from 'routing-controllers';
import validator from 'validator';
import bcrypt from 'bcrypt';
import { Response } from 'express';
import { Op } from 'sequelize';

import { sequelize } from '../sequelize';
import { createSuccessResponse } from '../lib/response';
import { ICurrentUser } from '../lib/authentication';
import authorityHandler from '../lib/authority';

import { functionAuthorityMap, AuthorityNameEnum } from '../config/authority';

import { AuthorityAttributes } from '../sequelize/models/init-models';
import { UserModel, AuthorityModel } from '../sequelize/models';
import { UserQueryValidator } from '../middlewares/QueryValidator';

// 平台功能代碼 e.g. "P_P11" => "平台帳號管理"
const functionKey = 'P_P11';

@JsonController('/user')
export class UserController {
  /** 使用者列表 */
  @UseBefore(UserQueryValidator)
  @Get('/')
	async getUserList(
    @QueryParam('page') page: number,
    @QueryParam('limit') limit: number,
    @QueryParam('orderby') orderby: string,
    @QueryParam('order') order: string,
    @QueryParam('name') name: string,
    @QueryParam('mobile') mobile: string,
    @QueryParam('email') email: string,
    @Res() res: Response,
    @CurrentUser({ required: true }) currentUser: ICurrentUser
	) {
		// 檢查使用者權限
		authorityHandler.verifyUserFunctionAuthority(
			currentUser.authorities, 
			functionKey, 
			AuthorityNameEnum.READ
		);

		const where: { [key: string]: any } = {};
		if (name) where.name = { [Op.like]: `%${name}%` };
		if (mobile) where.mobile = { [Op.like]: `%${mobile}%` };
		if (email) where.email = { [Op.like]: `%${email}%` };

		const userList = await UserModel.findAll({
			where,
			attributes: ['id', 'name', 'mobile', 'email'],
			include: [
				{
					model: sequelize.models.Authority,
					as: 'authorities',
					attributes: ['functionKey', 'authority'],
				},
			],
			order: orderby && order ? [[orderby, order]] : [['mobile', 'DESC']],
			offset: (page - 1) * limit,
			limit: limit >> 0,
		});

		return createSuccessResponse(res, userList);
	}

  /** 取得單一使用者 */
  @Get('/:id')
  async getUser(
    @Res() res: Response,
    @Param('id') id: number,
    @CurrentUser({ required: true }) currentUser: ICurrentUser
  ) {
  	// 檢查使用者權限
  	authorityHandler.verifyUserFunctionAuthority(
  		currentUser.authorities, 
  		functionKey, 
  		AuthorityNameEnum.READ
  	);

  	const user = await UserModel.findOne({
  		where: {
  			id,
  		},
  		attributes: ['id', 'name', 'mobile', 'email'],
  		include: [
  			{
  				model: AuthorityModel,
  				as: 'authorities',
  				attributes: ['functionKey', 'authority'],
  			},
  		],
  	});

  	if (!user) throw new BadRequestError('找不到該帳號');

  	return createSuccessResponse(res, user);
  }

  /** 新增帳號 */
  @Post('/')
  async createUser(
    @Res() res: Response,
    @Body()
    	{
    		name,
    		mobile,
    		email,
    		authorities,
    	}: {
      name: string;
      mobile: string;
      email: string;
      authorities: AuthorityAttributes[];
    },
    @CurrentUser({ required: true }) currentUser: ICurrentUser
  ) {
  	// 檢查使用者權限
  	authorityHandler.verifyUserFunctionAuthority(
  		currentUser.authorities, 
  		functionKey, 
  		AuthorityNameEnum.CREATE
  	);

  	if (!name || !mobile || !email || !authorities)
  		throw new BadRequestError('姓名、手機號碼、電子信箱、權限不得為空');

  	if (!validator.isMobilePhone(mobile, 'zh-TW'))
  		throw new BadRequestError('手機號碼格式不正確');

  	if (!validator.isEmail(email))
  		throw new BadRequestError('電子信箱格式不正確');

  	if (!validator.isLength(name, { min: 1, max: 32 }))
  		throw new BadRequestError('姓名長度不得超過32個字');

  	if (!Array.isArray(authorities))
  		throw new BadRequestError('權限必須是陣列');

  	for (const { functionKey, authority } of authorities) {
  		if (!functionKey || !authority)
  			throw new BadRequestError('權限欄位必須包含功能代號與權限');

  		if (typeof authority !== 'number')
  			throw new BadRequestError('權限必須是陣列');

  		if (!Object.keys(functionAuthorityMap).includes(functionKey))
  			throw new BadRequestError('功能代號不存在');

  		const verifyRes = authorityHandler.verifyFunctionAuthority(functionKey, authority);

  		if (!verifyRes.isValid)
  			throw new BadRequestError(
  				`${functionKey}功能並不包含以下權限：${verifyRes.invalidAuthorityList}`
  			);
  	}

  	// 驗證手機是否存在
  	const sameMobileUser = await UserModel.findOne({
  		where: {
  			mobile,
  		},
  	});

  	if (sameMobileUser) throw new BadRequestError('手機號碼已被使用');

  	// 驗證電子信箱是否存在
  	const sameEmailUser = await UserModel.findOne({
  		where: {
  			email,
  		},
  	});

  	if (sameEmailUser) throw new BadRequestError('電子信箱已被使用');

  	// 建立預設密碼並加密
  	const password = `${mobile.substring(
  		mobile.length - 6,
  		mobile.length
  	)}AAAA`;
  	const passwordEncrypted = bcrypt.hashSync(password, 10);

  	try {
  		// 新增使用者到資料庫
  		const user = await UserModel.create(
  			{
  				name,
  				mobile,
  				email,
  				passwordEncrypted,
  				//  authorities,
  				createdBy: currentUser.id,
  			},
  			{
  				include: [
  					{
  						model: sequelize.models.Authority,
  						as: 'authorities',
  						attributes: ['functionKey', 'authority'],
  					},
  				],
  			}
  		);

  		// 新增權限到資料庫
  		for (const { functionKey, authority } of authorities) {
  			await AuthorityModel.create({
  				functionKey,
  				authority,
  				userId: user.id,
  			});
  		}
  	} catch (error) {
  		throw new InternalServerError('新增失敗');
  	}

  	return createSuccessResponse(res);
  }

  /** 編輯帳號 */
  @Put('/:id')
  async updateUser(
    @Res() res: Response,
    @Param('id') id: number,
    @Body()
    	{
    		name,
    		mobile,
    		email,
    		authorities,
    	}: {
      name: string;
      mobile: string;
      email: string;
      authorities: AuthorityAttributes[];
    },
    @CurrentUser({ required: true }) currentUser: ICurrentUser
  ) {
  	// 檢查使用者權限
  	authorityHandler.verifyUserFunctionAuthority(
  		currentUser.authorities, 
  		functionKey, 
  		AuthorityNameEnum.UPDATE
  	);

  	// 參數檢查
  	if (!id) throw new BadRequestError('id不得為空');
  	if (!name || !mobile || !email || !authorities)
  		throw new BadRequestError('姓名、手機號碼、電子信箱、權限不得為空');

  	if (!validator.isMobilePhone(mobile, 'zh-TW'))
  		throw new BadRequestError('手機號碼格式不正確');
  	if (!validator.isEmail(email))
  		throw new BadRequestError('電子信箱格式不正確');
  	if (!validator.isLength(name, { min: 1, max: 32 }))
  		throw new BadRequestError('姓名長度不得超過32個字');
  	if (!Array.isArray(authorities))
  		throw new BadRequestError('權限必須是陣列');

  	for (const { functionKey, authority } of authorities) {
  		if (!functionKey || !authority)
  			throw new BadRequestError('權限欄位必須包含功能代號與權限');

  		if (typeof authority !== 'number')
  			throw new BadRequestError('權限值必須是數字');

  		if (!Object.keys(functionAuthorityMap).includes(functionKey))
  			throw new BadRequestError('功能代號不存在');

  		const verifyRes = authorityHandler.verifyFunctionAuthority(functionKey, authority);

  		if (!verifyRes.isValid) {
  			throw new BadRequestError(
  				`${functionKey}功能並不包含以下權限：${verifyRes.invalidAuthorityList}`
  			);
  		}
  	}

  	// 找出該帳號
  	const user = await UserModel.findOne({
  		where: {
  			id,
  		},
  		include: [
  			{
  				model: sequelize.models.Authority,
  				as: 'authorities',
  				attributes: ['functionKey', 'authority'],
  			},
  		],
  	});

  	if (!user) throw new BadRequestError('找不到該帳號');

  	// 若手機號碼改變，檢查手機號碼是否已被使用
  	if (user.mobile !== mobile) {
  		const existUser = await UserModel.findOne({
  			where: {
  				mobile,
  			},
  		});

  		if (existUser) throw new BadRequestError('手機號碼已被使用');
  	}

  	// 若電子信箱改變，檢查電子信箱是否已被使用
  	if (user.email !== email) {
  		const existUser = await UserModel.findOne({
  			where: {
  				email,
  			},
  		});

  		if (existUser) throw new BadRequestError('電子信箱已被使用');
  	}

  	const transaction = await sequelize.transaction();

  	try {
  		// 更新使用者資料
  		await UserModel.update(
  			{
  				name,
  				mobile,
  				email,
  				updatedBy: currentUser.id,
  			},
  			{
  				where: {
  					id,
  				},
  				transaction,
  			}
  		);

  		// 更新使用者權限
  		await AuthorityModel.destroy({
  			where: {
  				userId: id,
  			},
  			transaction,
  		});

  		await AuthorityModel.bulkCreate(
  			authorities.map(({ functionKey, authority }) => ({
  				userId: id,
  				functionKey,
  				authority,
  			})),
  			{ transaction }
  		);

  		await transaction.commit();
  	} catch (error) {
  		throw new InternalServerError('編輯失敗');
  	}

  	return createSuccessResponse(res);
  }

  /** 刪除帳號 */
  @Delete('/:id')
  async deleteUser(
    @Res() res: Response,
    @Param('id') id: number,
    @CurrentUser({ required: true }) currentUser: ICurrentUser
  ) {
  	// 檢查使用者權限
  	authorityHandler.verifyUserFunctionAuthority(
  		currentUser.authorities, 
  		functionKey, 
  		AuthorityNameEnum.DELETE
  	);

  	// 參數檢查
  	if (!id) throw new BadRequestError('id不得為空');
  	if (!validator.isInt(id + '', { min: 1 }))
  		throw new BadRequestError('id格式錯誤');

  	// 找出該帳號
  	const user = await UserModel.findOne({
  		where: {
  			id,
  		},
  		include: [
  			{
  				model: sequelize.models.Authority,
  				as: 'authorities',
  				attributes: ['functionKey', 'authority'],
  			},
  		],
  	});

  	if (!user) throw new BadRequestError('找不到該帳號');

  	const transaction = await sequelize.transaction();

  	try {
  		// 刪除使用者權限
  		await sequelize.customDestroy(AuthorityModel, {
  			where: {
  				userId: id,
  			},
  			deletedBy: currentUser.id,
  			transaction,
  		});

  		// 刪除使用者
  		await sequelize.customDestroy(UserModel, {
  			where: {
  				id,
  			},
  			deletedBy: currentUser.id,
  			transaction,
  		});
  		await transaction.commit();
  	} catch (error) {
  		throw new InternalServerError('刪除失敗');
  	}
  	return createSuccessResponse(res);
  }
}
