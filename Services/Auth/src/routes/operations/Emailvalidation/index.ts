import { User } from "../../../@types/user";
import { UserController } from "../../../controllers";
import { UserDao } from "../../../daos/users";


export const Emailvalidation = async (payload: User) => {
    let control = new UserController();
    let results = await control.emailValidation(payload);
  return results
}
export default Emailvalidation