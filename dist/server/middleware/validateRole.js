'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('accesscontrol'),
    AccessControl = _require.AccessControl;

var grantsObject = require('../app/helper/access_control');
var Helper = require('../app/helper/helper');

var helper = new Helper();
var ac = new AccessControl(grantsObject);

// const role = helper.getRole(req, res);
// const permission = ac.can(role).readAny('document');

// if (permission.granted) {

var Role = function () {
    function Role() {
        _classCallCheck(this, Role);

        this.role = '';

        this.setRole = this.setRole.bind(this);
        this.validateRole = this.validateRole.bind(this);
    }

    _createClass(Role, [{
        key: 'setRole',
        value: function setRole(req) {
            this.role = helper.getRole(req.roles);
        }
    }, {
        key: 'validateRole',
        value: function validateRole(req, res, next) {
            this.setRole(req);

            var permission = ac.setGrants(this.role).readAny('project-view-contractor');

            if (permission.granted) {
                next();
            } else {
                return res.status(403).json({ message: "Forbidden" });
            }
        }
    }]);

    return Role;
}();

module.exports = Role;
//# sourceMappingURL=validateRole.js.map