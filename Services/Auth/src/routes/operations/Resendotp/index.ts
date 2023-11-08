import { User } from "../../../@types/user";
import { UserController } from "../../../controllers";
import { UserDao } from "../../../daos/users";


export const Resendotp = async (payload: User) => {
    let control = new UserController();
    let results = await control.resendOTP(payload);
  return results
}
export default Resendotp