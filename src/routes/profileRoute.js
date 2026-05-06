// import express from "express";
// import { isAuthenticated } from "../midlewares/inAuthentication.js";
// import { updateProfileController } from "../controller/updateProfile.js";
// import { upload } from "../utils/cloudinary.js";

// const profileRoute = express.Router()

// profileRoute.put('/update-profile',isAuthenticated,  upload.single("image"), updateProfileController); 

// export default profileRoute 







import express from "express";
import { isAuthenticated } from "../midlewares/inAuthentication.js";
import { updateProfile } from "../controller/updateProfile.js";
import upload from "../utils/multer.js";

const profileRoute = express.Router()


profileRoute.put('/update-profile', isAuthenticated, upload.single("image"), updateProfile)


export default profileRoute