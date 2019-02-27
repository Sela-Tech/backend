const grantsObject={
    Admin:{

        project:{
            'create:any':['*'],
            'delete:any':['*'],
            'update:any':['*'],
            'read:any':['*'],
            'create:own':['*']
        },

        account:{
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

    Funder:{
        organization:{
            'delete:own':['*'],
            'update:own':['*'],
            'read:any':['*'],
            'create:own':['*']
        },
        project:{
            'create:own':['*'],
            'delete:own':['*'],
            'update:own':['*'],
            'read:own':['*'],
        },

        proposal:{
            'create:own':['*'],
            'delete:own':['*'],
            'update:own':['*'],
            'update:any':['*'],
            'read:own':['*'],
            'read:any':['*'],

        }

    },


    Contractor:{
        'project-view-contractor':{
            'read:any':['*'],
        },

        proposal:{
            'create:own':['*'],
            'delete:own':['*'],
            'update:own':['*'],
            'read:own':['*'],
        },
        project:{
            'create:own':['*'],
            'delete:own':['*'],
            'update:own':['*'],
            'read:own':['*'],
        },
    },

    Evaluator:{
        organization:{
            'delete:own':['*'],
            'update:own':['*'],
            'read:any':['*'],
            'create:own':['*']
        }
    },

}

module.exports=grantsObject;