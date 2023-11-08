import { User } from "../../../@types/user";
import { UserController } from "../../../controllers";
import { UserDao } from "../../../daos/users";


export const Otpverify = async (payload: User) => {
    let control = new UserController();
    let results = await control.emailOTPVerify(payload);
  return results
}
export default Otpverify