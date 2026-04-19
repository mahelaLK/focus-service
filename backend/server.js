import express from 'express'
import cors from 'cors'
import cropRouter from './routes/crop.js'
import 'dotenv/config';

//  App config
const app = express()
const PORT = process.env.PORT || 4000

//  Middlewares
app.use(express.json())
app.use(cors())

//  API Endpoints
app.use('/crop', cropRouter)

app.get('/', (req, res)=>{
  res.send("API Working")
})

app.listen(PORT, ()=>(console.log('Server started on PORT : ' + PORT)))