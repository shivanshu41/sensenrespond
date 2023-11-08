import { User } from "../../../@types/user";
import { UserController } from "../../../controllers";
import { UserDao } from "../../../daos/users";


export const Forgot_password = async (payload: User) => {
    let control = new UserController();
    let results = await control.forgotpwd(payload);
  return results
}
export default Forgot_password