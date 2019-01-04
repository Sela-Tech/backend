const emailTemplates = {
    welcomeEmail:()=>{
        return `some text`
    },

    requestResetPassword:(host, user, token)=>{
        return `<!DOCTYPE html>

        <html lang="en">
        
        <head>
        
          <meta charset="UTF-8">
        
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        
          <meta http-equiv="X-UA-Compatible" content="ie=edge">
        
          <link rel="stylesheet" type='text/css' href="https://sela-tech.github.io/assets/fonts/stylesheet.css" />
        
          <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
        
          <style type="text/css">
        
            html,body{
        
            margin: 0;
        
            font-family: 'Acumin Pro';
        
            font-weight: 300;
        
          }
        
        ​
        
          *{
        
            outline: none;
        
          }
        
        ​
        
          button{
        
            cursor: pointer;
        
          }
        
        ​
        
          body {
        
            height: 100%;
        
            width: 100%;
        
            background: #FAFAFA;
        
          }
        
          </style>
        
        </head>
        
        <body>
        
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
        
            <tr>
        
              <td 
        
                style='
        
                background: #f5f5f8;
        
                display: block;
        
                border: 0;
        
                padding: 15px;
        
              '>
        
              </td>
        
            </tr>
        
            <tr style='background: #FAFAFA;'>
        
              <td bgcolor="#FFF" 
        
              style='
        
               margin: 20px auto;
        
              padding: 30px 7%;
        
              width: 80%;
        
              display: block;
        
              border-radius: 5px;
        
              box-sizing: border-box;
        
              border: 0;
        
              max-width: 600px;
        
              '>
        
                  <img 
        
                  style='display: block;
        
                  margin: auto;
        
                  height: 35px;
        
                  '
        
                  src="https://sela-tech.github.io/assets/public-logo.png" alt="logo" />
        
                  
        
                  <p style="
        
                  line-height: 22px;
        
                  font-size: 16px;
        
                  margin: 25px 0;
        
                  color: #222829;
        
                  ">Hello, ${user}. Click the button below to reset your password.</p>
        
                  <div style="margin: 15px auto; text-align: center;">
        
                    <a href="${host}/password/reset?token=${token}"
        
                    style="
        
                      width: auto;
        
                      height: 40px;
        
                      line-height: 43px;
        
                      background: #201D41;
        
                      border-radius: 5px;
        
                      color: white;
        
                      font-size: 14px;
        
                      padding: 0 20px;
        
                      border: 0;
        
                      display: inline-block;
        
                      text-decoration: none;
        
                      font-weight: 300;
        
                    ">Reset Password</a>
        
                  </div>
        
                  <p style="
        
                  line-height: 22px;
        
                  font-size: 16px;
        
                  margin: 25px 0;
        
                  color: #222829;
        
                  ">This link will expire in 1 hour if you don’t use it. You can ignore this email if you did not request a password reset.</p>

                  <p style="
        
                  line-height: 22px;
        
                  font-size: 16px;
        
                  margin: 25px 0;
        
                  color: #222829;
        
                  ">Thanks,<br>The Sela Team</p>
        
              </td>
        
            </tr>
        
            
        
              <tr>
        
                <td style='text-align: center;'>
        
                  <p 
        
                  style='
        
            margin: 14px 0;
        
                        line-height: normal;
        
                  font-size: 12px;
        
                  color: #696F74;
        
                  '>Copyright &copy; Sela, All Rights Reserved</p>
        
                </td>
        
              </tr>
        
              
        
          </table> 
        
        </body>
        
        </html>`
    }
}

module.exports = emailTemplates;