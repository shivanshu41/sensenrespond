import { Context } from "../../../../apiGateway";
import { User } from "../../../@types/user";
import { UserController } from "../../../controllers";
import { UserDao } from "../../../daos/users";


export const Signup = async (payload: User , context : Context) => {
    // sign-up logic below
    let control = new UserController();
    let results = await control.registerUser(payload);
  return results
}
export default Signup