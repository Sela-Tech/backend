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


  validateAddTask(req, res){
    req
    .checkBody("name",
      "Task name can't be empty."
    )
    .notEmpty();
  req
    .checkBody("dueDate", "please specify due date")
    .notEmpty();

    req
    .checkBody("description", "Decription cannot empty")
    .notEmpty();

    req
    .checkBody("estimatedCost", "Please enter an estimated cost")
    .notEmpty();
  },

  validateAddMilestone(req, res){
    req
    .checkBody("title",
      "Milestone title can't be empty."
    )
    .notEmpty()

    req
    .checkBody("projectId",
      "Invalid projectId."
    )
    .notEmpty()
   
    req
    .checkBody("tasks", "You must add atleast one task")
    .isArray()
    .notEmpty();
  },
  

  validateAddAreaOfInterest(req, res){
    req
    .checkBody("areasOfInterest", "Add atleast one area of interest")
    .isArray()
    .notEmpty();
  },

  validateAddComment(req, res){
    req
    .checkBody("comment",
      "comment cannot be empty."
    )
    .notEmpty()
  },

  validateAddEvidenceRequest(req, res){
    req
    .checkBody("title","title cannot be empty.")
    .notEmpty()
    req
    .checkBody("project","Please specify project.")
    .notEmpty()
    req
    .checkBody("level","Please specify level(task or project).")
    .notEmpty()
    req
    .checkBody("quote","Please specify quote for this request")
    .notEmpty()
    req
    .checkBody("stakeholders","Please add who submits the evidence")
    .isArray()
    .notEmpty()
    req
    .checkBody("datatype","Please specify datatype(video, audio, image, e.t.c)")
    .notEmpty()
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