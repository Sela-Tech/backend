const { AccessControl } = require('accesscontrol');

const grantsObject = require('../app/helper/access_control');
const Helper = require('../app/helper/helper');


const helper = new Helper();
const ac = new AccessControl(grantsObject);

// const role = helper.getRole(req, res);
  // const permission = ac.can(role).readAny('document');

  // if (permission.granted) {

class Role {
    constructor(){
        this.role='';

        this.setRole=this.setRole.bind(this);
        this.validateRole=this.validateRole.bind(this)
    }

    setRole(req){
       this.role = helper.getRole(req.roles);
    }

    validateRole(req, res, next){
        this.setRole(req);

         const permission = ac.setGrants(this.role).readAny('project-view-contractor');

        if (permission.granted) {
            next();
        }else{
            return res.status(403).json({message:"Forbidden"});
        }
        
    }
}

module.exports=
    Role

