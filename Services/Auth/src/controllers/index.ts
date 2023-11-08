import { SettingsInterface, User, PaymentInterface } from "../@types/user";
import { UserDao } from "../daos/users";
import { v4 } from "uuid";
import jwt from 'jsonwebtoken'
import { Context, Gateway } from "../../apiGateway";
import { OPERATION } from "../routes/operations";
export class UserController {
    inFlightToken: string | null
    controllerId: string
    // Controller Id should be in a parent class Gateway and parent class should handle all the inflight operation 
    // in-flight tokens can be temporarily stored in closure of the parent class.
    constructor() {
        this.inFlightToken = null;
        this.controllerId = v4();
    }
    public async registerUser(user: User) {
        try {
            let results = await new UserDao().addUser(user);
            return results
        } catch (e) {
            return e
        }
    }

    public async siginUser(user: User, context: Context) {
        try {
            console.log("Signin user controller",user);
            let results = await new UserDao().loginUser(user);
            console.log("sign ihn results",results);
            return results
        } catch (error) {
            console.log(error)
            return error
        }
    }

    public async emailOTPVerify(user: User) {
        let results = await new UserDao().EmailOtpVerify(user);
        return results
    }

    public async resendOTP(user: User) {
        let results = await new UserDao().resendOTP(user);
        return results
    }

    public async forgotpwd(user: User) {
        let results = await new UserDao().forgotPassword(user);
        return results
    }

    public async emailValidation(user: User) {
        let results = await new UserDao().emailValidation(user);
        return results
    }

    public async authenticateRecaptcha(user: User) {
        let results = await new UserDao().authenticateRecaptcha(user);
        return results
    }

    public async changePassword(user: User) {
        let results = await new UserDao().changePassword(user);
        return results
    }

    public async editUser(userPayload:User){
        console.log("USERPAYLOAD ",userPayload);
        let results = await new UserDao().editUser(userPayload);
        return results
    }

    public async profileUpdate(payload: User) {
        let results = await new UserDao().profileUpdate(payload);
        return results
    }

    public async changePwd(payload: any) {
        let results = await new UserDao().changePwd(payload);
        return results
    }

} 
