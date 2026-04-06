;import express from 'express';
const router=express.Router();
import authMiddleware from '..middleware/auth.middleware.js'

router.get('/',authMiddleware,(req,res)=>{
  res.json({message:'dashboard data(protected)' });
})

module.exports=router;