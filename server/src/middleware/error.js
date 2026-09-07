export function notFound(req,res){res.status(404).json({message:`Route ${req.originalUrl} not found`})}
export function errorHandler(err,req,res,next){console.error(err);if(res.headersSent)return next(err);res.status(err.status||500).json({message:process.env.NODE_ENV==='production'?'Something went wrong':err.message})}
