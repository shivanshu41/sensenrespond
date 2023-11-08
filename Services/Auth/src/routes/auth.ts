//@ts-nocheck
import {UserController} from '../controllers/index';
import {Router} from 'express'
import { OPERATION } from './operations';
import { SettingsInterface, User, PaymentInterface } from '../@types/user';
import { authenticateToken } from '../../middlewares/authenticate';

let router = Router()

router.all('/',(req,res)=>{
    res.send("Welcome to Sense and Respond LLC ! "+process.env.SERVICE_NAME)
})
router.post('/changePassword', async(req: Express.Request, res:Express.Response)=> {
    let control = new UserController();
    let results = await control.changePassword(req.body);
    res.json(results);
});
router.post('/:operation',async (req:Express.Request,res:Express.Response)=>{
    let param = req.params.operation.toUpperCase() as string;
    console.log("Param data", param);
    
    let operation = new OPERATION(param,req,res);
    operation.set()
    let results = await operation.execute(req.body);
    res.json(results);
})

router.post('/otpVerify', async(req: Express.Request, res:Express.Response)=> {
    let control = new UserController();    
    let results = await control.emailOTPVerify(req.body);
    res.json(results);
});

router.post('/resendOtp', async(req: Express.Request, res:Express.Response)=> {
    let control = new UserController();
    let results = await control.resendOTP(req.body);
    res.json(results);
});

router.post('/forgot-password', async(req: Express.Request, res:Express.Response)=> {
    let control = new UserController();
    let results = await control.forgotpwd(req.body);
    res.json(results);
});

router.post('/emailValidation', async(req: Express.Request, res:Express.Response)=> {
    let control = new UserController();
    let results = await control.emailValidation(req.body);
    res.json(results);
});

router.post('/authenticateRecaptcha', async(req: Express.Request, res:Express.Response)=> {
    let control = new UserController();
    let results = await control.authenticateRecaptcha(req.body);
    res.json(results);
});


router.put('/user/edit', authenticateToken, async(req: Express.Request, res:Express.Response)=> {
    let control = new UserController();
    console.log("ROUTE ",req.body);
    let results = await control.editUser(req.body);
    res.json(results);
});



router.put('/profileUpdate/:userId', authenticateToken, async (req: Express.Request, res: Express.Response) => {
    let payload: User = {
       user: req.params.userId,
       name: req.body.firstName,   
       email: req.body.email,
       image: req.body.image  
    };
    let control = new UserController();
    let results = await control.profileUpdate(payload);
    res.json(results);
});


export default router
