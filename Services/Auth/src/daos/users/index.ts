//@ts-nocheck
import USER from '../../../schemas/userSchema'
import { User, SettingsInterface, PaymentInterface } from '../../@types/user';
import { HttpCode } from '../../../utility/http.code.utils';
import { Codemessages } from '../../../utility/code.message.utils';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken'
import { v5, v4 } from 'uuid';
import sgMail from '@sendgrid/mail';
import otpGenerator from 'otp-generator';
require('dotenv').config();
import ejs from 'ejs';
import path from 'path';
import fetch from "isomorphic-fetch";
const v4Ns = v4();
import nodecache from 'node-cache';
import userSchema from '../../../schemas/userSchema';
const cache = new nodecache({ stdTTL: 100, checkperiod: 600, useClones: true });
const btoa = require('btoa');

export class UserDao {
    private readonly _saltRounds = 10;
    private readonly _jwtSecret = '0.rfyj3n9nzh'
    private readonly _controllerId: string
    public _emailTemplate: any
    constructor() {
        this._controllerId = v5(this._jwtSecret, v4Ns)
    }

    /**
     * 
     * @param userPayload User type interface - User
     * @returns {User}
    *  @param settingsPayload Settings type interface - SettingsInterface
     * @returns {SettingsInterface}
     * @param paymentPayload Payment type interface - PaymentInterface
     * @returns {PaymentInterface}
     * @param planPayload User Plan type interface - UserPlanInterface
     * @returns {UserPlanInterface}
     */
    public async editUser(userPayload: User) {
        try {
            console.log("USERPAYLOAD DAO", userPayload);
            const ExistingUser = await USER.findOne({ _id: userPayload._id, is_deleted: false });
            console.log("Exist user", ExistingUser);

            if (ExistingUser) {
                const result = await USER.findByIdAndUpdate(userPayload._id, userPayload, { new: true });
                console.log("RESUKT USER UPDATE ", result);
                return { success: true, status: HttpCode.HTTP_OK, message: "Accepted", data: result };
            } else {
                return { success: false, status: HttpCode.HTTP_BAD_REQUEST, message: Codemessages.invalid_user };
            }
        } catch (error) {
            return { success: false, status: HttpCode.HTTP_BAD_REQUEST, message: 'Invalid Request' };
        }
    }
    public async addUser(userPayload: User) {
        // write all the statements related to accesseng the addUser   
        let existingUser = await USER.findOne({ email: userPayload.email });// get user data from db
        if (existingUser?.isEmail_verified === true) {
            return { success: false, message: 'User Already Exist.', status: HttpCode.HTTP_BAD_REQUEST };
        } else {
            console.log("Register else block ", userPayload);

            // create the user and send otp
            const OTP = otpGenerator.generate(5, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
            var Data = {
                email: userPayload.email,
                otp: OTP,
                type: 'register'
            }
            console.log("Msg data", Data);

            var OtpSend: any = await this.EmailSend(Data);
            console.log("Otp send", OtpSend);

            const secret = new TextEncoder().encode(
                process.env.CLIENT_KEY
            );
            //@ts-ignore
            let otpToken = await jwt.sign({
                otp: OTP,
            }, secret, {
                expiresIn: '24h'
            });

            console.log("otp token", otpToken)
            if (OtpSend.status == true) {
                let cacheSet = cache.set(userPayload.email, OTP);
                console.log("CACHE ADD USER ", cacheSet);
                console.log("Get OTP is:", cache.get(userPayload.email));

                const encryptPassword = await bcrypt.hash(userPayload.password, this._saltRounds);
                // let result: any;

                if (!existingUser) {
                    const result = await new USER({
                        "name": userPayload.name,
                        "email": userPayload.email,
                        "password": encryptPassword,
                        "recaptcha_token": userPayload.recaptcha_token,
                        "provider": userPayload.provider,
                        "otp": otpToken
                    }).save();
                    return {
                        success: true, message: Codemessages.otp_success, status: HttpCode.HTTP_OK
                    };
                } else {
                    const result = await USER.findByIdAndUpdate(existingUser._id, {
                        "name": userPayload.name,
                        "email": userPayload.email,
                        "password": encryptPassword,
                        "recaptcha_token": userPayload.recaptcha_token,
                        "provider": userPayload.provider,
                        // "otp": OtpSend.otp
                    }, { new: true });
                    return {
                        success: true, message: Codemessages.otp_success, status: HttpCode.HTTP_OK
                    };
                }

            } else {
                return { success: false, message: 'Something Went Wrong.', status: HttpCode.HTTP_BAD_REQUEST };
            }
        }


    }


    public async EmailSend(data: any) {

        return new Promise(async (resolve, reject) => {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            var message: any;
            console.log("SENDING EMAIL FROM ", process.env.EMAIL_FORM)
            if (data.type == 'register' || data.type == 'resendOtp') {
                var template: any = await ejs
                    .renderFile(path.join(__dirname, "../../../templates/otp-verify/otp-verify.ejs"), {
                        confirm_link: "https://xyz-development-d74ps.ondigitalocean.app/",
                        OTP: data.otp,
                    });

                message = {
                    from: { email: process.env.EMAIL_FORM, name: 'Sense n Respond - Test' },
                    to: data.email,
                    subject: 'Verify your account',
                    text: 'Verify your account with OTP',
                    html: template,
                };


            } else if (data.type == 'welcomeMsg') {
                var template: any = await ejs
                    .renderFile(path.join(__dirname, "../../../templates/welcome/welcome.ejs"), {
                        confirm_link: `${process.env.HOST_URL}/mypages`,
                        userName: data.userName
                    });
                message = {
                    from: { email: process.env.EMAIL_FORM, name: 'Sense n Respond - Test' },
                    to: data.email,
                    subject: 'Welcome to Sense n Respond - Test',
                    text: 'Welcome to ButtSense n Respond - Testerfly',
                    html: template,
                };
            }

            else if (data.type == 'ResetPassword') {
                const secret = new TextEncoder().encode(
                    process.env.CLIENT_KEY
                );

                let authcode = jwt.sign({
                    email: data.email,
                    createdAt: new Date().toDateString()
                    //@ts-ignore
                }, secret)
                //@todo use public key or pvt key
                let link: any;
                if (data.is_admin) {
                    let createdAt = new Date().toDateString();
                    let encodeData = btoa(data.email);
                    console.log("Encode Data:", encodeData);
                    link = "https://admin.xyz.co/reset-password/" + encodeData
                } else {
                    link = `${process.env.HOST_URL}/auth/reset/` + authcode
                }
                var template: any = await ejs
                    .renderFile(path.join(__dirname, "../../../templates/reset-pwd/reset-pwd.ejs"), {
                        confirm_link: link
                    });

                message = {
                    from: { email: process.env.EMAIL_FORM, name: 'Sense n Respond - Test' },
                    to: data.email,
                    subject: 'Reset your password',
                    text: 'Reset your password',
                    html: template,
                };
            } else if (data.type == 'Account_Activation') {
                var template: any = await ejs
                    .renderFile(path.join(__dirname, "../../../templates/otp-verify/otp-verify.ejs"), {
                        confirm_link: "https://xyz-development-d74ps.ondigitalocean.app/",
                        OTP: data.otp
                    });

                message = {
                    from: { email: process.env.EMAIL_FORM, name: 'xyz' },
                    to: data.email,
                    subject: 'xyz: Activate Account ',
                    text: 'Activate Account',
                    html: template,
                };
            }

            sgMail
                .send(message)
                .then((_response: any) => {
                    resolve({ status: true, otp: data.otp })
                })
                .catch((error: any) => {
                    reject({ err: error, status: false })
                });

        });

    }

    // Verify the OTP
    public async EmailOtpVerify(OTPPayload: any) {
        try {
            console.log("OTP veify payload", OTPPayload);

            let ExistingUser = await USER.findOne({ email: OTPPayload.email, is_deleted: false }); // get user data from db
            const secret = new TextEncoder().encode(
                process.env.CLIENT_KEY
            );
            if (!ExistingUser?.otp) {
                return { success: false, message: "Otp expired", status: HttpCode.HTTP_BAD_REQUEST };
            }
            //@ts-ignore
            let otpJwt
            console.log("EXISTING USER OTP TOKEN ", ExistingUser?.otp);
            try {
                otpJwt = jwt.verify(ExistingUser?.otp, secret)
                console.log("otpJwt ", otpJwt);
            } catch (jwterror) {
                console.log(jwterror);
                otpJwt = null
            }
            // console.log("Cache OTP is:", cacheOTP, cache.get(OTPPayload.email));
            // console.log("verify", cacheOTP === OTPPayload.otpCode);
            if (!otpJwt) {
                console.log("OTP JWT IF CONDITION ", otpJwt);
                return { success: false, message: Codemessages.otp_expired, status: HttpCode.HTTP_BAD_REQUEST };
            } else if (otpJwt.otp === OTPPayload.otpCode) {
                let result = await USER.findByIdAndUpdate(
                    ExistingUser._id,
                    {
                        isEmail_verified: true,
                        otp: null
                    },
                    { new: true }
                );
                console.log("Update Result", result);

                let Data = {
                    email: OTPPayload.email,
                    otp: '',
                    type: 'welcomeMsg',
                    userName: ExistingUser.name
                }
                let welcomeMsg: any = await this.EmailSend(Data);
                let resultData = {
                    isEmail_verified: ExistingUser.isEmail_verified,
                    is_initiated: ExistingUser.is_initiated,
                    email: ExistingUser.email,
                    name: ExistingUser.name
                }
                if (welcomeMsg.status == true) {
                    delete ExistingUser.password;
                    delete ExistingUser.access_token;
                    delete ExistingUser.refresh_token;
                    delete ExistingUser.otp;
                    let token = await jwt.sign({
                        _id: ExistingUser._id,
                    }, secret, {
                        expiresIn: '3d'
                    });
                    delete result.password
                    delete result.otp
                    return {
                        success: true, message: Codemessages.otp_verified, data: { ...result.toObject(), token }, token, status: HttpCode.HTTP_OK
                    };
                } else {
                    return {
                        success: false, message: "Welcome mail not sent", status: HttpCode.HTTP_BAD_REQUEST
                    };
                }

            } else {
                return {
                    success: false, message: Codemessages.invalid_otp, status: HttpCode.HTTP_BAD_REQUEST
                };
            }
        } catch (error) {
            console.log(error)
            return { success: false, message: 'Invalid Request.', status: HttpCode.HTTP_BAD_REQUEST };
        }
    }

    // OTP resend for Email
    public async resendOTP(OTPPayload: any) {
        try {
            let ExistingUser = await USER.findOne({ email: OTPPayload.email, is_deleted: false });
            if (ExistingUser) {
                if (ExistingUser.isEmail_verified) {
                    return { success: false, message: "Otp already verified", status: HttpCode.HTTP_BAD_REQUEST };
                }
                let OTP = otpGenerator.generate(5, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
                var Data = {
                    email: OTPPayload.email,
                    otp: OTP,
                    type: 'resendOtp'
                }
                var OtpSend: any = await this.EmailSend(Data);
                if (OtpSend.status == true) {

                    const secret = new TextEncoder().encode(
                        process.env.CLIENT_KEY
                    );

                    let otptoken = await jwt.sign({
                        otp: OTP,
                    }, secret, {
                        expiresIn: '24h'
                    });

                    let cacheSet = cache.set(OTPPayload.email, OTP);
                    console.log("RESEND OTP ", OTP, " -- ", otptoken);
                    let result = await USER.findByIdAndUpdate(ExistingUser._id,
                        { otp: otptoken }
                    );
                    return {
                        success: true, message: Codemessages.otp_resend, status: HttpCode.HTTP_OK
                    };
                }
            } else {
                return {
                    success: false, message: 'Invalid Request.', status: HttpCode.HTTP_BAD_REQUEST
                };
            }
        } catch (error) {
            console.log(error)
            return { success: false, message: 'Internal server error', status: HttpCode.HTTP_INTERNAL_SERVER_ERROR };
        }
    }

    // Email Validation 
    public async emailValidation(userPayload: any) {
        try {
            // let res = await validateEmail(userPayload.email);
            // console.log("valid response", res);

            let ExistingUser = await USER.findOne({ email: userPayload.email, isEmail_verified: true });
            // console.log(!ExistingUser && res.valid, "first condition");
            // console.log(!ExistingUser && !res.valid, "2nd condition");

            if (!ExistingUser) {
                return { success: true, message: Codemessages.email_available, status: HttpCode.HTTP_OK };
            }
            // else if (!ExistingUser && !res.valid) {
            //     return { success: false, message: Codemessages.email_invalid, status: HttpCode.HTTP_BAD_REQUEST };
            // }        
            else {
                return { success: false, message: Codemessages.email_exist, status: HttpCode.HTTP_BAD_REQUEST };
            }
        } catch (error) {
            return { success: false, message: 'Something Went Wrong', status: HttpCode.HTTP_BAD_REQUEST };
        }
    }

    public async loginUser(userPayload: User) {

        const secret = new TextEncoder().encode(
            process.env.CLIENT_KEY
        );
        if (userPayload) {
            let userExist = await USER.findOne({ email: userPayload.email, is_deleted: false });
            if (userPayload.provider === 'google') {
                if (userExist) {
                    let sanitisedUser = userExist.toObject();
                    delete sanitisedUser.password;
                    delete sanitisedUser.access_token;
                    delete sanitisedUser.refresh_token;
                    delete sanitisedUser.otp;
                    delete sanitisedUser.is_admin;
                    let token = await jwt.sign({
                        _id: userExist._id,
                    }, secret, {
                        expiresIn: '3d'
                    });
                    return { success: true, status: HttpCode.HTTP_OK, message: Codemessages.login_success, data: sanitisedUser, token };
                } else {
                    let result = await new USER({
                        "name": userPayload.name,
                        "email": userPayload.email,
                        "password": '',
                        "recaptcha_token": '',
                        "otp": '',
                        "access_token": userPayload.access_token,
                        "google_id": userPayload.google_id,
                        "refresh_token": userPayload.refresh_token,
                        "token_expiresIn": userPayload.token_epiresIn,
                        "provider": userPayload.provider,
                        "isEmail_verified": true
                    }).save();
                    if (result) {

                        let Data = {
                            email: userPayload.email,
                            otp: '',
                            type: 'welcomeMsg'
                        }
                        const welcomeMsg: any = await this.EmailSend(Data);
                        if (welcomeMsg.status == true) {
                            const emailVerify = await USER.findByIdAndUpdate(result._id,
                                { isEmail_verified: true }
                            );
                            delete result.password;
                            delete result.otp;

                            //@ts-ignore
                            let token = await jwt.sign({
                                _id: result._id,
                            }, secret, {
                                expiresIn: '3d'
                            });
                            return { success: true, status: HttpCode.HTTP_OK, message: Codemessages.login_success, data: result, token: token };
                        } else {
                            return { success: false, status: HttpCode.HTTP_BAD_REQUEST, message: 'Invalid Request' };
                        }
                    } else {
                        return { success: false, status: HttpCode.HTTP_BAD_REQUEST, message: 'User creation failed' };
                    }
                }
            } else if (userPayload.provider === 'manual') {
                // && validUser.isEmail_verified === 0    
                if (!userExist) {
                    return {
                        success: false, status: HttpCode.HTTP_NOT_FOUND, message: Codemessages.invalid_user, error: {
                            name: "generic/not-found"
                        }
                    };
                } else {
                    // valid user block
                    // now check for password
                    const validatePassword = await bcrypt.compare(userPayload.password, userExist.password);
                    if (!validatePassword) {
                        return {
                            success: false, status: HttpCode.HTTP_BAD_REQUEST, message: Codemessages.invalid_password, error: {
                                name: "password/mismatch"
                            }
                        };
                    }
                    //this condition is redundant as this condition is already added above..
                    // this block will never be executed
                    if (!userExist) {
                        return {
                            success: false, status: HttpCode.HTTP_NOT_FOUND, message: Codemessages.invalid_user, error: {
                                name: "generic/not-found"
                            }
                        };
                    } else if (userExist?.isEmail_verified === false) {
                        const Data = {
                            isEmail_verified: userExist?.isEmail_verified,
                            is_initiated: userExist?.is_initiated,
                            user_id: userExist?.id,
                            email: userExist?.email,
                        };
                        const OTP = otpGenerator.generate(5, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
                        cache.set(userPayload.email, OTP);
                        var message = {
                            email: userPayload.email,
                            otp: OTP,
                            type: 'Account_Activation'
                        }
                        var OtpSend: any = await this.EmailSend(message);
                        console.log("OTP SEND LOGIN ", OtpSend);
                        const secret = new TextEncoder().encode(
                            process.env.CLIENT_KEY
                        );
                        //@ts-ignore
                        let token = await jwt.sign({
                            otp: OTP,
                        }, secret, {
                            expiresIn: '24h'
                        });

                        console.log("otp token", token)
                        const result = await USER.findByIdAndUpdate(userExist._id, {
                            otp: token
                        }, { new: true });
                        delete userExist?.password;
                        delete userExist?.access_token;
                        delete userExist?.refresh_token;
                        delete userExist?.otp;
                        return {
                            success: false, message: Codemessages.account_exist, status: HttpCode.HTTP_BAD_REQUEST, data: Data
                        };
                    } else {
                        const validatePassword = await bcrypt.compare(userPayload.password, userExist.password);
                        if (validatePassword) {

                            const secret = new TextEncoder().encode(
                                process.env.CLIENT_KEY
                            );
                            //@ts-ignore
                            let token = await jwt.sign({
                                _id: userExist._id,
                            }, secret, {
                                expiresIn: '3d'
                            });

                            if (!userExist.isEmail_verified) {
                                return {
                                    success: false, status: HttpCode.HTTP_NOT_ACCEPTABLE, message: "User does not exist", data: {
                                        isEmail_verified: userExist.isEmail_verified
                                    }
                                };
                            } else {
                                let sanitisedUser = userExist.toObject();
                                delete sanitisedUser.password;
                                delete sanitisedUser.access_token;
                                delete sanitisedUser.refresh_token;
                                delete sanitisedUser.otp;
                                delete sanitisedUser.is_admin;
                                return { success: true, status: HttpCode.HTTP_OK, message: Codemessages.login_success, data: sanitisedUser, token: token };
                            }
                        } else {
                            return {
                                success: false, status: HttpCode.HTTP_BAD_REQUEST, message: Codemessages.invalid_password, error: {
                                    name: "password/mismatch"
                                }
                            };
                        }
                    }

                }

            } else {
                return { success: false, status: HttpCode.HTTP_BAD_REQUEST, message: 'Invalid Request' };
            }
        }
    }

    public async forgotPassword(userPayload: any) {
        try {
            if (userPayload.is_admin) {
                let ExistAdmin = await USER.findOne({ email: userPayload.email, is_deleted: false, is_admin: true });
                if (!ExistAdmin) return { success: false, message: 'Invalid User', status: HttpCode.HTTP_BAD_REQUEST }
                var Data = {
                    email: userPayload.email,
                    otp: '',
                    type: 'ResetPassword',
                    is_admin: true
                }
                var ResetLink: any = await this.EmailSend(Data);

                if (ResetLink.status == true) {
                    return {
                        success: true, message: Codemessages.forgot_password, status: HttpCode.HTTP_OK
                    };
                } else {
                    return {
                        success: false, message: Codemessages.mail_failure, status: HttpCode.HTTP_BAD_REQUEST
                    };
                }
            } else {
                let ExistingUser = await USER.findOne({ email: userPayload.email, is_deleted: false, isEmail_verified: true });

                if (ExistingUser) {

                    if (ExistingUser.isEmail_verified === false) {
                        const OTP = otpGenerator.generate(5, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
                        var Data = {
                            email: userPayload.email,
                            otp: OTP,
                            type: 'Account_Activation'
                        }
                        var mailSend: any = await this.EmailSend(Data);
                        if (mailSend.status == true) {
                            let cacheSet = cache.set(userPayload.email, OTP);
                            console.log("CACHE forgotPass ", cacheSet);

                            const result = await USER.findByIdAndUpdate(ExistingUser._id,
                                { otp: OTP }
                            );
                            return {
                                success: true, message: Codemessages.email_notVerified, status: HttpCode.HTTP_BAD_REQUEST
                            };
                        } else {
                            return {
                                success: false, message: Codemessages.mail_failure, status: HttpCode.HTTP_BAD_REQUEST
                            };
                        }
                    } else {
                        var Data = {
                            email: userPayload.email,
                            otp: '',
                            type: 'ResetPassword'
                        }
                        var ResetLink: any = await this.EmailSend(Data);

                        if (ResetLink.status == true) {
                            return {
                                success: true, message: Codemessages.forgot_password, status: HttpCode.HTTP_OK
                            };
                        } else {
                            return {
                                success: false, message: Codemessages.mail_failure, status: HttpCode.HTTP_BAD_REQUEST
                            };
                        }
                    }
                } else {
                    return {
                        success: false, message: Codemessages.user_deactivate, status: HttpCode.HTTP_BAD_REQUEST
                    };
                }
            }

        } catch (e) {
            return {
                success: false, message: 'Something went Wrong', status: HttpCode.HTTP_BAD_REQUEST
            };
        }
    }

    public async authenticateRecaptcha(userPayload: any) {
        try {

            const url =
                `https://www.google.com/recaptcha/api/siteverify`;
            const data = await fetch(url, {
                method: "post",
                data: JSON.stringify({
                    secret: process.env.SECRETKEY,
                    response: userPayload.recaptcha_token
                })
            });
            return { success: true, message: 'Verified Successfully', status: HttpCode.HTTP_OK, data };

        } catch (error) {
            return { success: false, message: 'Something Went Wrong', status: HttpCode.HTTP_UNAUTHORIZED };
        }
    }

    public async changePassword(userPayload: any) {
        try {
            let ExistingUser: any;
            if (userPayload.is_admin) {
                ExistingUser = await USER.findOne({ email: userPayload.email, is_deleted: false, is_admin: true });
            } else {
                ExistingUser = await USER.findOne({ email: userPayload.email, is_deleted: false, isEmail_verified: true });
            }
            console.log("Exist user", ExistingUser);

            if (ExistingUser) {
                const encryptPassword = await bcrypt.hash(userPayload.password, this._saltRounds);

                const result = await USER.findByIdAndUpdate(ExistingUser._id,
                    { password: encryptPassword },
                );
                return { success: true, status: HttpCode.HTTP_OK, message: Codemessages.password_success };

            } else {
                return { success: false, status: HttpCode.HTTP_BAD_REQUEST, message: Codemessages.invalid_user };

            }

        } catch (error) {
            return { status: HttpCode.HTTP_BAD_REQUEST, message: 'Invalid Request' };
        }
    }


    public async profileUpdate(userPayload: any) {
        try {
            let user = await userSchema.findById(userPayload.user);
            if (!user) return { success: false, status: HttpCode.HTTP_BAD_REQUEST, message: 'Invalid User' };
            const result = await userSchema.findByIdAndUpdate(userPayload.user, {
                "name": userPayload.name,
                "email": userPayload.email,
                // "lastName": userPayload.lastName,
                "image": userPayload.image,
            }, { new: true });
            return { success: true, status: HttpCode.HTTP_OK, message: 'updated success' };
        } catch (error) {
            return { success: false, status: HttpCode.HTTP_BAD_REQUEST, message: 'Invalid Request' };
        }
    }

    public async changePwd(userPayload: any) {
        try {
            let user = await userSchema.findById(userPayload.user);
            if (!user) return { success: false, status: HttpCode.HTTP_BAD_REQUEST, message: 'Invalid User' };
            const validatePassword = await bcrypt.compare(userPayload.currentPassword, user.password);
            const newPasswordValid = await bcrypt.compare(userPayload.password, user.password);
            if (!validatePassword) {
                return {
                    success: false, status: HttpCode.HTTP_BAD_REQUEST, message: 'Invalid currrent password', error: {
                        name: "password/mismatch"
                    }
                };
            }
            if (validatePassword && newPasswordValid) {
                return {
                    success: false, status: HttpCode.HTTP_BAD_REQUEST, message: 'New password must be different from current password', error: {
                        name: "password/mismatch"
                    }
                };
            }

            const encryptPassword = await bcrypt.hash(userPayload.password, this._saltRounds);
            const result = await userSchema.findByIdAndUpdate(userPayload.user,
                { password: encryptPassword }, { new: true }
            );
            return { success: true, status: HttpCode.HTTP_OK, message: 'Password changed' };
        } catch (error) {
            return { success: false, status: HttpCode.HTTP_BAD_REQUEST, message: 'Invalid Request' };
        }
    }


} 
