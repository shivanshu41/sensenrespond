import { User } from "../../../@types/user";
import { UserController } from "../../../controllers";
import { UserDao } from "../../../daos/users";


export const Authenticate_Recaptcha = async (payload: User) => {
    let control = new UserController();
    let results = await control.authenticateRecaptcha(payload);
  return results
}
export default Authenticate_Recaptcha