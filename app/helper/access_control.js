const grantsObject={
    isAdmin:{

        Project:{
            'create:any':['*'],
            'delete:any':['*'],
            'update:any':['*'],
            'read:any':['*'],
            'create:own':['*']
        },

        Account:{
            'update:any':['*'],
            'read:any':['*'],
        },

        organization:{
            'create:any':['*'],
            'delete:any':['*'],
            'update:any':['*'],
            'read:any':['*'],
            'create:own':['*']
        }


    },

    isFunder:{
        organization:{
            'delete:own':['*'],
            'update:own':['*'],
            'read:any':['*'],
            'create:own':['*']
        },
        Project:{
            'create:own':['*'],
            'delete:own':['*'],
            'update:own':['*'],
            'read:own':['*'],
        },
    },

    isEvaluator:{
        organization:{
            'delete:own':['*'],
            'update:own':['*'],
            'read:any':['*'],
            'create:own':['*']
        }
    },

    isContractor:{
        organization:{
            'delete:own':['*'],
            'update:own':['*'],
            'read:any':['*'],
            'create:own':['*']
        }
    }

}

module.exports=grantsObject;