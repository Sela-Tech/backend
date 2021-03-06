const faker = require('faker');
const jsonwebtoken = require('jsonwebtoken');
var mongoose = require("mongoose");
var User = mongoose.model("User");
var Organization = mongoose.model("Organization");
var Project = mongoose.model("Project");
var Transaction = mongoose.model("Transaction");
var Uploads = mongoose.model("Upload");
var Document = mongoose.model("Document");
var tokenValidityPeriod = 86400; // in seconds; 86400 seconds = 24 hours
var bcrypt = require("bcrypt");

const users = [
	{
		email: "somethree@mail.com",
		phone: "894738903584",
		firstName: "userthree",
		lastName: "mylastname",
		username: "userthree",
		isEvaluator: false,
		isContractor: false,
		isFunder: true,
		password: "mypassword",
		activation: "approved",

	}
];


const projects = [
	{
		name: "test project 1",
		description: "this is a simple test project 1",
		startDate: "2018-11-29",
		location: "5bffe86b0dccba6f553d7257"
	},
	{
		name: "test project 2",
		description: "this is a simple test project 2",
		startDate: "2018-11-29",
		location: "5bffe86b0dccba6f553d7257"
	}
];



/**
 * @description Insert seed data in user model
 *
 * @returns {object} Nothing
 */
const insertUserSeed = async () => {
	let organization_id = await insertOrganisation();
	users[0].organization = organization_id
	let newUser = new User(users[0])
	let user = await newUser.save();
	return user;
};



/**
 * @description Insert seed data in project model
 *
 * @returns {object} Nothing
 */
const insertProjectSeed=async()=>{
	let newProjects = Project.insertMany(projects);
	return newProjects;
}


const insertProject =async(userId)=>{

	const project ={
		name: faker.name.jobType(),
		description: faker.random.words(),
		startDate: "2018-11-29",
		location: "5bffe86b0dccba6f553d7257",
		owner:userId
	}
	let newProject = await new Project(project).save();
	return newProject;
}

/**
 * @description Insert seed data in organization model
 *
 * @returns {object}
 */
const insertOrganisation = async () => {
	const organization = {
		name: "my very own"
	}
	let org = new Organization(organization);
	let obj = await org.save();
	let org_id = obj._id;
	return org_id;
}



/**
 * @description Generates token from seed data
 *
 * @param {Number} id - User object
 *
 * @returns {string} token - Generated token
 */

const generateToken = (user) => {

	const { isFunder, isEvaluator, isContractor } = user,
		signThis = {
			profilePhoto: user.profilePhoto,
			id: user._id,
			isFunder,
			isEvaluator,
			isContractor,
			firstName: user.firstName,
			phone: user.phone,
			email: user.email,
			organization: {
				name: user.organization.name,
				id: user.organization._id
			},
			lastName: user.lastName
		};

	const tokenValidityPeriod = 86400
	const { SECRET } = process.env;

	const token = jsonwebtoken.sign(signThis, SECRET, {
		expiresIn: tokenValidityPeriod
	});
	return token;
};


const validUser = {
	email: "usertwo@mail.com",
	phone: "8949000384",
	organization: { name: "test organisaction2" },
	firstName: "usertwo",
	lastName: "mylastname2",
	username: "usertwo",
	isEvaluator: false,
	isContractor: false,
	isFunder: true,
	password: "mypassword",
	activation: "approved"
};

const validUser2 = {
	email: "user10@mail.com",
	phone: "9309582038",
	organization: {id:"", name: "test organisaction2" },
	firstName: "user10",
	lastName: "mylastname10",
	username: "user10",
	isEvaluator: false,
	isContractor: false,
	isFunder: true,
	password: "mypassword",
};

const validUserUpdateInfo = {
	firstName: "newname",
	lastName: "mylastname",
	username: "userthree",
	password: 'mypassword',
	oldPassword: "mypassword",
};


const invalidUserUpdateInfo = {
	firstName: "newname",
	lastName: "mylastname",
	username: "userthree",
	password: 'mypassword',//same as the current password
	oldPassword: "mypasswor", //same as the current password
};

const invalidUserUpdateInfo2 = {
	newPassword: 'mypasswording',
	verifyPassword: 'weirdo',
	oldPassword: "mypassword", //same as the current password
};

const userWithExistingEmail = {
	email: "usertwo@mail.com",
	phone: "890384",
	organization: { name: "test organisaction2" },
	firstName: "usertwo",
	lastName: "mylastname2",
	username: "usertwo",
	isEvaluator: false,
	isContractor: false,
	isFunder: true,
	password: "mypassword"
};

const userWithExistingPhone = {
	phone: "8949000384",
	organization: { name: "test organisaction2" },
	firstName: "usertwo",
	lastName: "mylastname2",
	username: "usertwo",
	isEvaluator: false,
	isContractor: false,
	isFunder: true,
	password: "mypassword"
};

const userWithWrongEmail = {
	email: "user@mail.com",
	// phone:"890384",
};

const userWithWrongPhone = {
	// email:"user@mail.com",
	phone: "890384",
};


const userWithWrongPassword = {
	email: "usertwo@mail.com",
	password: "mypasword"
}

const userWithPendingAccount = {
	email: "user10@mail.com",
	password: "mypassword"
}

const validProject = {
	name: "test project 1",
	description: "this is a simple test project 1",
	startDate: "2018-11-29",
	location: {
		name: "south-west",
		lat: 945054,
		lng: 744738
	}
}

const validStakeholders={
	
		id:"5bffe8da0dccba6f553d725a",//placeholder project_id
		stakeholders:[
			"5bfea5d6f85a44271f4c3416"
	]
	
}

const invalidStakeholders={
	
	id:"5bffe8da0dccba6f553d725a", //placeholder project_id
	stakeholders:[]

}

const validTask={
	projectId:"5bffe8da0dccba6f553d725a", //placeholder id
	  name:faker.random.word(),
	  description:faker.random.word(),
	  dueDate: "2019-11-29",
}

const invalidTask={
	projectId:"5bffe8da0dcjfirj725a", //placeholder id
	  name:faker.random.word(),
	  description:faker.random.word(),
	  dueDate: "2019-11-29",
}


const validDocument={
	projectId:"5bffe8da0dccba6f553d725a", //placeholder id
	  name:faker.random.word(),
      filetype:".doc",
      doc:faker.internet.url(),
}

valideOrganization={
	name:faker.random.word()
},
 validTrnInfo={
	 projectId:"84y389hfni43u858guhfn3",// placeholder projectId. will be replaced by an actual projectId
	 hash:"0xae86805b18560084383a69ebfad7ac740c7b57907e079117fd09ad60a5d862b7" // hash from etherscan.io 
	 																			// with reasonable confirmations
 }

 invalidTrnInfo={
	 projectId:"gfb3h98y347gfc 20394",
	 hash:"0x28524eac7b663f0db3e614749058c13eb9eb1fde2fe476aafe733802ee9d466f"//get a fresh block hash
																			 // with less 30 confirmation 
																			 //from etherscan.io
																			 //before running the test
 }
 

module.exports = {
	insertUserSeed, validUser, userWithExistingEmail,
	userWithWrongEmail, userWithWrongPhone, userWithWrongPassword,
	validUser2, userWithPendingAccount, generateToken, validUserUpdateInfo, invalidUserUpdateInfo,
	invalidUserUpdateInfo2, validProject,insertProjectSeed,validStakeholders,invalidStakeholders,
	validDocument,insertProject,valideOrganization,validTrnInfo,invalidTrnInfo, validTask, invalidTask,
	userWithExistingPhone
}