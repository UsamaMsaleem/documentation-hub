import express from 'express'
import { changePassword, forgetPassword, login, logout, signupUser, verification, verifyOtp, assignRole, getAllUsers, inviteUser } from '../controller/auth.js' 
import { isAuthenticated, isAdmin} from '../midlewares/inAuthentication.js'
import { userSchema, validatorUser } from '../validator/usersValidators.js'
import { searchDocuments } from '../controller/search.js'


let route = express.Router()


route.post('/register', validatorUser(userSchema), signupUser)
route.post('/verification', verification)
route.post('/login', login)
route.post('/logout', logout)
route.post('/forgetPassword', forgetPassword)
route.post('/verifyOtp/:email', verifyOtp)
route.post('/changePassword/:email', changePassword)
route.post('/assign-role', isAuthenticated, isAdmin, assignRole) 
route.get('/all-users', isAuthenticated, isAdmin, getAllUsers);
route.get('/search-item',  searchDocuments); 
route.post('/invite', isAuthenticated, isAdmin, inviteUser);


export default route;