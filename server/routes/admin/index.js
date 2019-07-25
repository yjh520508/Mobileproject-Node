module.exports = app => {
    const express = require('express')
    const jwt = require('jsonwebtoken');
    const assert = require("http-assert")
    const AdminUser = require('../../models/AdminUser');
    //登录校验中间件
    const authMiddleware = require('../../middleware/auth')
    const resourceMiddleware = require('../../middleware/resource')
    const router = express.Router({
        mergeParams: true
    })
    //创建
    router.post("/", authMiddleware(), async (req, res) => {
        const model = await req.Model.create(req.body)
        res.send(model)
    })
    //修改
    router.put("/:id", authMiddleware(), async (req, res) => {
        const model = await req.Model.findByIdAndUpdate(req.params.id, req.body)
        res.send(model)
    })
    //删除
    router.delete("/:id", authMiddleware(), async (req, res) => {
        await req.Model.findByIdAndDelete(req.params.id, req.body)
        res.send({
            success: true
        })
    })
    //列表
    router.get("/", authMiddleware(), async (req, res) => {
        const queryOptions = {}
        if (req.Model === 'categorory') {
            queryOptions = 'parent'
        }
        const items = await req.Model.find().setOptions(queryOptions).limit(10)
        res.send(items)
    })
    //详情
    router.get("/:id", async (req, res) => {
        const model = await req.Model.findById(req.params.id)
        res.send(model)
    })

 
    app.use('/admin/api/rest/:resource', authMiddleware(), resourceMiddleware(), router)
    const multer = require("multer")
    const upload = multer({
        dest: __dirname + '/../../upload'
    })
    app.post('/admin/api/upload', authMiddleware(), upload.single('file'), async (req, res) => {
        const file = req.file;
        file.url = `http://localhost:3000/upload/${file.filename}`
        res.send(file)

    })

    app.post('/admin/api/login', async (req, res) => {
        const {
            username,
            password
        } = req.body;
        // 1.根据用户名找用户

        const user = await AdminUser.findOne({
            username
        }).select('+password')
        assert(user, 422, '用户不存在')
        // 2.校验密码
        const isValid = require('bcrypt').compareSync(password, user.password)
        assert(isValid, 422, '密码错误')
        // 3.返回token
        const token = jwt.sign({
            id: user._id
        }, app.get('secret'))

        res.send({
            token
        });
    })
    //错误处理
    app.use(async (err, req, res, next) => {
        console.log(err)
        res.status(err.statusCode || 500).send({
            message: err.message
        })
    })
}