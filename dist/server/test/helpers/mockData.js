'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var faker = require('faker');
var jsonwebtoken = require('jsonwebtoken');
var mongoose = require("mongoose");
var User = mongoose.model("User");
var Organization = mongoose.model("Organization");
var Project = mongoose.model("Project");
var Transaction = mongoose.model("Transaction");
var Uploads = mongoose.model("Upload");
var Document = mongoose.model("Document");
var tokenValidityPeriod = 86400; // in seconds; 86400 seconds = 24 hours
var bcrypt = require("bcrypt");

var users = [{
	email: "somethree@mail.com",
	phone: "894738903584",
	firstName: "userthree",
	lastName: "mylastname",
	username: "userthree",
	isEvaluator: false,
	isContractor: false,
	isFunder: true,
	password: "mypassword",
	activation: "approved"

}];

var projects = [{
	name: "test project 1",
	description: "this is a simple test project 1",
	startDate: "2018-11-29",
	location: "5bffe86b0dccba6f553d7257"
}, {
	name: "test project 2",
	description: "this is a simple test project 2",
	startDate: "2018-11-29",
	location: "5bffe86b0dccba6f553d7257"
}];

/**
 * @description Insert seed data in user model
 *
 * @returns {object} Nothing
 */
var insertUserSeed = function () {
	var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
		var organization_id, newUser, user;
		return regeneratorRuntime.wrap(function _callee$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						_context.next = 2;
						return insertOrganisation();

					case 2:
						organization_id = _context.sent;

						users[0].organization = organization_id;
						newUser = new User(users[0]);
						_context.next = 7;
						return newUser.save();

					case 7:
						user = _context.sent;
						return _context.abrupt('return', user);

					case 9:
					case 'end':
						return _context.stop();
				}
			}
		}, _callee, undefined);
	}));

	return function insertUserSeed() {
		return _ref.apply(this, arguments);
	};
}();

/**
 * @description Insert seed data in project model
 *
 * @returns {object} Nothing
 */
var insertProjectSeed = function () {
	var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
		var newProjects;
		return regeneratorRuntime.wrap(function _callee2$(_context2) {
			while (1) {
				switch (_context2.prev = _context2.next) {
					case 0:
						newProjects = Project.insertMany(projects);
						return _context2.abrupt('return', newProjects);

					case 2:
					case 'end':
						return _context2.stop();
				}
			}
		}, _callee2, undefined);
	}));

	return function insertProjectSeed() {
		return _ref2.apply(this, arguments);
	};
}();

var insertProject = function () {
	var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(userId) {
		var project, newProject;
		return regeneratorRuntime.wrap(function _callee3$(_context3) {
			while (1) {
				switch (_context3.prev = _context3.next) {
					case 0:
						project = {
							name: faker.name.jobType(),
							description: faker.random.words(),
							startDate: "2018-11-29",
							location: "5bffe86b0dccba6f553d7257",
							owner: userId
						};
						_context3.next = 3;
						return new Project(project).save();

					case 3:
						newProject = _context3.sent;
						return _context3.abrupt('return', newProject);

					case 5:
					case 'end':
						return _context3.stop();
				}
			}
		}, _callee3, undefined);
	}));

	return function insertProject(_x) {
		return _ref3.apply(this, arguments);
	};
}();

/**
 * @description Insert seed data in organization model
 *
 * @returns {object}
 */
var insertOrganisation = function () {
	var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
		var organization, org, obj, org_id;
		return regeneratorRuntime.wrap(function _callee4$(_context4) {
			while (1) {
				switch (_context4.prev = _context4.next) {
					case 0:
						organization = {
							name: "my very own"
						};
						org = new Organization(organization);
						_context4.next = 4;
						return org.save();

					case 4:
						obj = _context4.sent;
						org_id = obj._id;
						return _context4.abrupt('return', org_id);

					case 7:
					case 'end':
						return _context4.stop();
				}
			}
		}, _callee4, undefined);
	}));

	return function insertOrganisation() {
		return _ref4.apply(this, arguments);
	};
}();

/**
 * @description Generates token from seed data
 *
 * @param {Number} id - User object
 *
 * @returns {string} token - Generated token
 */

var generateToken = function generateToken(user) {
	var isFunder = user.isFunder,
	    isEvaluator = user.isEvaluator,
	    isContractor = user.isContractor,
	    signThis = {
		profilePhoto: user.profilePhoto,
		id: user._id,
		isFunder: isFunder,
		isEvaluator: isEvaluator,
		isContractor: isContractor,
		firstName: user.firstName,
		phone: user.phone,
		email: user.email,
		organization: {
			name: user.organization.name,
			id: user.organization._id
		},
		lastName: user.lastName
	};


	var tokenValidityPeriod = 86400;
	var SECRET = process.env.SECRET;


	var token = jsonwebtoken.sign(signThis, SECRET, {
		expiresIn: tokenValidityPeriod
	});
	return token;
};

var validUser = {
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

var validUser2 = {
	email: "user10@mail.com",
	phone: "9309582038",
	organization: { id: "", name: "test organisaction2" },
	firstName: "user10",
	lastName: "mylastname10",
	username: "user10",
	isEvaluator: false,
	isContractor: false,
	isFunder: true,
	password: "mypassword"
};

var validUserUpdateInfo = {
	firstName: "newname",
	lastName: "mylastname",
	username: "userthree",
	password: 'mypassword',
	oldPassword: "mypassword"
};

var invalidUserUpdateInfo = {
	firstName: "newname",
	lastName: "mylastname",
	username: "userthree",
	password: 'mypassword', //same as the current password
	oldPassword: "mypasswor" //same as the current password
};

var invalidUserUpdateInfo2 = {
	newPassword: 'mypasswording',
	verifyPassword: 'weirdo',
	oldPassword: "mypassword" //same as the current password
};

var userWithExistingEmail = {
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

var userWithExistingPhone = {
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

var userWithWrongEmail = {
	email: "user@mail.com"
	// phone:"890384",
};

var userWithWrongPhone = {
	// email:"user@mail.com",
	phone: "890384"
};

var userWithWrongPassword = {
	email: "usertwo@mail.com",
	password: "mypasword"
};

var userWithPendingAccount = {
	email: "user10@mail.com",
	password: "mypassword"
};

var validProject = {
	name: "test project 1",
	description: "this is a simple test project 1",
	startDate: "2018-11-29",
	location: {
		name: "south-west",
		lat: 945054,
		lng: 744738
	}
};

var validStakeholders = {

	id: "5bffe8da0dccba6f553d725a", //placeholder project_id
	stakeholders: ["5bfea5d6f85a44271f4c3416"]

};

var invalidStakeholders = {

	id: "5bffe8da0dccba6f553d725a", //placeholder project_id
	stakeholders: []

};

var validTask = {
	projectId: "5bffe8da0dccba6f553d725a", //placeholder id
	name: faker.random.word(),
	description: faker.random.word(),
	dueDate: "2019-11-29"
};

var invalidTask = {
	projectId: "5bffe8da0dcjfirj725a", //placeholder id
	name: faker.random.word(),
	description: faker.random.word(),
	dueDate: "2019-11-29"
};

var validDocument = {
	projectId: "5bffe8da0dccba6f553d725a", //placeholder id
	name: faker.random.word(),
	filetype: ".doc",
	doc: faker.internet.url()
};

valideOrganization = {
	name: faker.random.word()
}, validTrnInfo = {
	projectId: "84y389hfni43u858guhfn3", // placeholder projectId. will be replaced by an actual projectId
	hash: "0xae86805b18560084383a69ebfad7ac740c7b57907e079117fd09ad60a5d862b7" // hash from etherscan.io 
	// with reasonable confirmations
};

invalidTrnInfo = {
	projectId: "gfb3h98y347gfc 20394",
	hash: "0x28524eac7b663f0db3e614749058c13eb9eb1fde2fe476aafe733802ee9d466f" //get a fresh block hash
	// with less 30 confirmation 
	//from etherscan.io
	//before running the test
};

module.exports = {
	insertUserSeed: insertUserSeed, validUser: validUser, userWithExistingEmail: userWithExistingEmail,
	userWithWrongEmail: userWithWrongEmail, userWithWrongPhone: userWithWrongPhone, userWithWrongPassword: userWithWrongPassword,
	validUser2: validUser2, userWithPendingAccount: userWithPendingAccount, generateToken: generateToken, validUserUpdateInfo: validUserUpdateInfo, invalidUserUpdateInfo: invalidUserUpdateInfo,
	invalidUserUpdateInfo2: invalidUserUpdateInfo2, validProject: validProject, insertProjectSeed: insertProjectSeed, validStakeholders: validStakeholders, invalidStakeholders: invalidStakeholders,
	validDocument: validDocument, insertProject: insertProject, valideOrganization: valideOrganization, validTrnInfo: validTrnInfo, invalidTrnInfo: invalidTrnInfo, validTask: validTask, invalidTask: invalidTask,
	userWithExistingPhone: userWithExistingPhone
};
//# sourceMappingURL=mockData.js.map