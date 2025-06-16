const express = require('express')
const router = express.Router()
const { getDepartments, createDepartment } = require('../controllers/departmentsController')
const verifyToken = require('../middleware/verifyToken')

router.get('/departments', verifyToken, getDepartments)
router.post('/departments', verifyToken, createDepartment)

module.exports = router
