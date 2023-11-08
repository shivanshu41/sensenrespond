import { Context } from "../../../apiGateway";
import { Gateway } from "../../../apiGateway"
import { HttpCode } from "../../../utility/http.code.utils"
import { User } from "../../@types/user"
import Authenticate_Recaptcha from "./Authenticate_Recaptcha"
import Emailvalidation from "./Emailvalidation"
import Forgot_password from "./Forgot_password"
import Otpverify from "./Otpverify"
import Resendotp from "./Resendotp"
import Signin from "./Signin"
import Signup from "./Signup"
import { OperationalMetadata } from "./opMetadata"

export enum AUTH_OPS {
    signin = 'SIGNIN',
    signup = 'SIGNUP',
    otpveirfy = 'OTPVERIFY',
    forgot_password = 'FORGOTPASSWORDOP',
    emailValidation = 'EMAILVALIDATION',
    authenticateRecaptcha = 'AUTHENTICATE_RECAPTCHA',
    resendOtp = 'RESENDOTP'
}
interface OPERATION_RESPONSE {
    data: {} | any[],
    status: string,
    success: boolean,
    message: string

}
interface OPERATION_METHOD {
    (payload: User , context :Context): any
}

type OPERATION_SET = {
    [key in AUTH_OPS]: OPERATION_METHOD

}
/**
 * @class
 * This class is used to execute operation on basis of operation set that is provided in the constructor.
 * The operation set can also be in any form be it JSON or any other 
 */
export class OPERATION extends Gateway {
    operation: AUTH_OPS.signin | AUTH_OPS.signup
    operationMethod?: OPERATION_METHOD
    private readonly operationSet: OPERATION_SET
    private readonly currentContext : Context
    constructor(operation: AUTH_OPS.signin | AUTH_OPS.signup,req:Express.Request,res:Express.Response) {
        super(req,res);
        this.operation = operation
        this.currentContext = this.getCurrentContext(); 
            
        this.operationMethod = undefined
        this.operationSet = {
            // this set can also be in form of JSON or any other
            [AUTH_OPS.signin]: Signin,
            [AUTH_OPS.signup]: Signup,
            [AUTH_OPS.otpveirfy]: Otpverify,
            [AUTH_OPS.forgot_password]: Forgot_password,
            [AUTH_OPS.emailValidation]: Emailvalidation,
            [AUTH_OPS.authenticateRecaptcha]: Authenticate_Recaptcha,
            [AUTH_OPS.resendOtp]: Resendotp,

        }
    }
    /**
     * @member execute used to execute the operation set in the constructor.
     * Note - This method requires the this.set() to correctly set the operation instance
     * @returns 
     */
    public async execute(payload: any) {
        // Execute the operation method by determining the exact operation
        let results = await this.operationMethod && this.operationMethod!.call(this, payload,this.currentContext);
        return results
    }
    /**
     *  
     * @returns 
     */
    public set() {
        // Set the operation method here
        // first get the operation
        let operationKey = this.operation.toString();
        //@ts-ignore
        this.operationMethod = this.operationSet[operationKey];
        return false

    }

}