interface IResponse {
  status: number;
  message: string;
  data: unknown;
}

class SuccessResponse implements IResponse {
	status: number;
	message: string;
	data: object;
	constructor(data: object) {
		this.status = 200;
		this.message = 'success';
		this.data = data;
	}
}

class ErrorResponse implements IResponse {
	status: number;
	message: string;
	data: null;
	constructor(message: string) {
		this.status = 500;
		this.message = message;
		this.data = null;
	}
}

class InvalidResponse implements IResponse {
	status: number;
	message: string;
	data: null;
	constructor(message: string) {
		this.status = 400;
		this.message = message;
		this.data = null;
	}
}

class UnauthorizedResponse implements IResponse {
	status: number;
	message: string;
	data: null;
	constructor(message: string) {
		this.status = 401;
		this.message = message;
		this.data = null;
	}
}

export function createSuccessResponse(res: any, data: object = {}) {
	const response = new SuccessResponse(data);
	return res.status(response.status).send(response);
}

export function createErrorResponse(res: any, message: string) {
	const response = new ErrorResponse(message);
	return res.status(response.status).send(response);
}

export function createInvalidResponse(res: any, message: string) {
	const response = new InvalidResponse(message);
	return res.status(response.status).send(response);
}

export function createUnauthorizedResponse(res: any, message: string) {
	const response = new UnauthorizedResponse(message);
	return res.status(response.status).send(response);
}
