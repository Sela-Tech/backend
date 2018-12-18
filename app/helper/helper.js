const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SEND_GRID_API);

class Helper{


    welcomeMail(receiver, sender){
        const url = 'https:sela.now.sh';
        const msg = {
            to: `${receiver}`,
            from: 'Sela Labs' + '<' + `${sender}` + '>',
            subject: "Hello from Sela",
            text: 'Welcome to Sela Platform. You have just joined over 1000 people who use the sela Platform to manage' +
            'their projects. We are glad to have you here. \n\n Excited to try it out? Use the link below '+
            'to get up and running.\n' +url+'. \n Any Questions? "Click reply" and we will be glad to help.'
        };

        sgMail.send(msg, false, (error, result) => {
            if (error) return console.log(error);

            // console.log(result);
        });
    }

    getRole(req){
        const roles = req.roles;
       
        let role = Object.keys(roles).filter(k=>roles[k]===true);

        if(role.length=1){
            return role[0];
        }

    }
}

module.exports=Helper;