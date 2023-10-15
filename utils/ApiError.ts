class ApiError extends Error{
    statusCode:Number;
    status:string;
    isOperation:boolean;
    constructor(message :any, statusCode :Number) {
        super(message)
        this.statusCode = statusCode
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperation = true
        Error.captureStackTrace(this,this.constructor)
    }
}
export default ApiError