// const bcrypt = require('bcrypt-nodejs');
const dotenv = require('dotenv');

dotenv.config();

const options = {
  enforce: {
    lowercase: true,
    uppercase: true,
    specialCharacters: true,
    numbers: true
  }
};


const validator = {

  //validates reset password request email
  validateRequestResetPasswordEmail(request, response) {
    request
      .checkBody("email", "Please enter a valid email.")
      .isEmail();
  },

  // validates reset password
  validateResetPassword(request, response) {
  request
    .checkBody("newPassword",
      "Password can't be less than 8 characters and must not contain spaces."
    )
    .matches(/^[a-zA-Z0-9!@#$%^&*()_\-.]{8,32}$/);

  request
    .checkBody("confirmPassword",
      "Password confirmation field can't be empty."
    )
    .notEmpty();
  request
    .checkBody("newPassword", "Password didn't match")
    .equals(request.body.confirmPassword);
  },


  
  // validates id
  validateId(id) {
    if (isNaN(id)) {
      return false
    }
    return true
  },

  // capitalize First letter
  capitalizeFirst(name) {
    return name.charAt(0).toUpperCase() + name.slice(1)
  },


  // compared password
  comparePassword(password1, hashedPassword) {
    if (bcrypt.compareSync(password1, hashedPassword)) {
      return true;
    }
    return false;
  },


  // hash password
  hashPassword(password) {
    const salt = bcrypt.genSaltSync(8);
    return bcrypt.hashSync(password, salt);
  },

  // convert string to title case
  toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  },
  
}





module.exports =validator;