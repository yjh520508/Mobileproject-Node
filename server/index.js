const express = require("express")
const app = express()
app.set('secret','i2u34y12oi3u4y8');
app.use(require("cors")())
app.use(express.json())
app.use('/upload',express.static(__dirname + '/upload'))
require('./plugins/db')(app)
require('./routes/admin')(app)
app.listen(3000,()=>{
    console.log("App listening on port 3000!")
})