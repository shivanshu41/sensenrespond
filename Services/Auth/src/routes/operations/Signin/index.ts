import { Context } from "../../../../apiGateway";
// import user from "../../../../models/user";
import { User } from "../../../@types/user";
import { UserController } from "../../../controllers";
import { UserDao } from "../../../daos/users";
import jwt from 'jsonwebtoken';

export const Signin = async (payload: User,context : Context) => {
    // sign-in logic below
    let control = new UserController();
    let results = await control.siginUser(payload,context);
    return results
}

export default Signin