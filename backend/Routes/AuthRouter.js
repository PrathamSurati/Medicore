const { signup, login, addPatient} = require('../Controllers/AuthController');
const { signupValidation, loginValidation, patientValidation } = require('../Middlewares/AuthValidation');

const router = require('express').Router();

router.post('/login', loginValidation, login);
router.post('/signup', signupValidation, signup);
router.post('/newpatient', patientValidation, addPatient);

module.exports = router;