import * as jwt from 'jsonwebtoken';

export function authenticateToken(req:any, res:any, next:any) {
    
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const secret = process.env.CLIENT_KEY as string;
    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }
  
    jwt.verify(token, secret, (err:any, user:any) => {
      console.log(err);
      if (err) return res.status(403).json({ msg: "Token is not valid" });
      req.user = user;      
      next();
    });
}
  