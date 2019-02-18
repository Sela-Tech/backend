const emailTemplates = {

  confirmEmail: (host, token) => {
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

    *{
        outline: none;
    }

    button{
        cursor: pointer;
    }

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
                    ">You’re almost there. Please click the button below to confirm your email address and activate your account.</p>
                    <div style="margin: 15px auto; text-align: center;">
                            <a 
                            href="${host}/email/verify?token=${token}"
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
                            ">Confirm Email</a>
                    </div>
                    <p style="
                    line-height: 22px;
                    font-size: 16px;
                    margin: 25px 0;
                    color: #222829;
                    ">Once confirmed, you'll be able to log in to the Sela platform with your new account.</p>
            </td>
        </tr>
        
        <tr>
                <td style='text-align: center; background: #FAFAFA; height: 100px;'>
                    <p style=" margin: 14px 0;
                    line-height: normal;
                    font-size: 14px;
                    color: #696F74;
                    width: 80%;
                    margin: auto;
                    ">
                        You are receiving this email because you signed up on <strong>Sela</strong>
                    </p>
                    <p 
                        style='
                    margin: 14px 0;
                    line-height: normal;
                    font-size: 12px;
                    color: #696F74;
                    '>Copyright &copy; Sela, All Rights Reserved</p>
            
                    <p  style='
                    margin: 14px 0;
                    line-height: normal;
                    font-size: 12px;
                    color: #696F74;
                    '> 43W 23rd Str, 6th Floor, New York NY 10010 </p>

                </td>
            </tr>


            
            
    </table>  
</body>
</html>`
  },

  welcomeEmail: (host, name) => {
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
        
        
        
            *{
        
                outline: none;
        
            }
        
        
        
            button{
        
                cursor: pointer;
        
            }
        
        
        
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
        
                            ">Welcome, ${name}. Thanks for confirming your email address. Sela enables transparent execution and measurement of sustainable development projects. </p>
        
                          
        
                          <p style="
        
                          line-height: 22px;
        
                          font-size: 16px;
        
                          margin: 25px 0;
        
                          color: #222829;
        
                          ">On your dashboard you can fund, propose, initiate or monitor projects on the platform.</p>
        
                          
        
                          <div style="margin: 15px auto; text-align: center;">
        
                                <a 
        
                                href="${host}/signin"
        
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
        
                                ">Go to Dashboard</a>
        
                            </div>
        
        
        
                         
        
                    </td>
        
                </tr>
        
        
                <tr>
                <td style='text-align: center; background: #FAFAFA; height: 100px;'>
                    <p style=" margin: 14px 0;
                    line-height: normal;
                    font-size: 14px;
                    color: #696F74;
                    width: 80%;
                    margin: auto;
                    ">
                        You are receiving this email because you signed up on <strong>Sela</strong>
                    </p>
                    <p 
                        style='
                    margin: 14px 0;
                    line-height: normal;
                    font-size: 12px;
                    color: #696F74;
                    '>Copyright &copy; Sela, All Rights Reserved</p>
            
                    <p  style='
                    margin: 14px 0;
                    line-height: normal;
                    font-size: 12px;
                    color: #696F74;
                    '> 43W 23rd Str, 6th Floor, New York NY 10010 </p>

                </td>
            </tr>


                    
        
            </table>  
        
        </body>
        
        </html>`
  },

  requestResetPassword: (host, user, token) => {
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
            <td style='text-align: center; background: #FAFAFA; height: 100px;'>
                <p style=" margin: 14px 0;
                line-height: normal;
                font-size: 14px;
                color: #696F74;
                width: 80%;
                margin: auto;
                ">
                    You are receiving this email because you signed up on <strong>Sela</strong>
                </p>
                <p 
                    style='
                margin: 14px 0;
                line-height: normal;
                font-size: 12px;
                color: #696F74;
                '>Copyright &copy; Sela, All Rights Reserved</p>
        
                <p  style='
                margin: 14px 0;
                line-height: normal;
                font-size: 12px;
                color: #696F74;
                '> 43W 23rd Str, 6th Floor, New York NY 10010 </p>

            </td>
        </tr>


        
              
        
          </table> 
        
        </body>
        
        </html>`
  },

  resetPasswordSuccess: (user) => {
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
      
                ">Hello, ${user}. Your Sela password has been successfully changed.</p>
      
             
      
      ​
      
                <p style="
      
                line-height: 22px;
      
                font-size: 16px;
      
                margin: 25px 0;
      
                color: #222829;
      
                ">If you did not request a password reset, please contact support@sela-labs.co</p>
      
      ​
      
                <p style="
      
                line-height: 22px;
      
                font-size: 16px;
      
                margin: 25px 0;
      
                color: #222829;
      
                ">Thanks,<br>The Sela Team</p>
      
      ​
      
            </td>
      
          </tr>
      
      
          <tr>
          <td style='text-align: center; background: #FAFAFA; height: 100px;'>
              <p style=" margin: 14px 0;
              line-height: normal;
              font-size: 14px;
              color: #696F74;
              width: 80%;
              margin: auto;
              ">
                  You are receiving this email because you signed up on <strong>Sela</strong>
              </p>
              <p 
                  style='
              margin: 14px 0;
              line-height: normal;
              font-size: 12px;
              color: #696F74;
              '>Copyright &copy; Sela, All Rights Reserved</p>
      
              <p  style='
              margin: 14px 0;
              line-height: normal;
              font-size: 12px;
              color: #696F74;
              '> 43W 23rd Str, 6th Floor, New York NY 10010 </p>

          </td>
      </tr>


      
            
      
        </table> 
      
      </body>
      
      </html>`
  },

  inviteToJoinProject:(host, project, user)=>{
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
    
        *{
            outline: none;
        }
    
        .text{
            line-height: 22px;
            font-size: 16px;
            margin: 5px 0 25px;
            color: #222829;
            width: 75%;
            float: left;
        }
    
        .img-container {
            width: 25%;
            text-align: center;
            float: left;
            max-width: 60px;
            
        }
    
        
        .img-container img{
            display: block;
            border-radius: 50%;
            margin: auto;
            float: left;
        }
    
        button{
            cursor: pointer;
        }
    
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
                        font-weight: 500;
                        "> Hello, ${user.firstName} </p>
                      
                      <div class="img-container">
                        <img src="${project.owner.profilePhoto || "http://placehold.it/50"}" alt='profile-image'/>
                      </div>
                      
                      <p  class='text'> <strong>${project.owner.firstName} ${project.owner.lastName}</strong> has invited you to join the <strong>${project.name}</strong></p>
                      
                      <div style="margin: 15px auto; text-align: center;">
                            <a 
                            href="${host}/dashboard/notifications"
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
                            ">Join Project</a>
                        </div>
    
                     
                </td>
            </tr>
            
            <tr>
            <td style='text-align: center; background: #FAFAFA; height: 100px;'>
                <p style=" margin: 14px 0;
                line-height: normal;
                font-size: 14px;
                color: #696F74;
                width: 80%;
                margin: auto;
                ">
                    You are receiving this email because you signed up on <strong>Sela</strong>
                </p>
                <p 
                    style='
                margin: 14px 0;
                line-height: normal;
                font-size: 12px;
                color: #696F74;
                '>Copyright &copy; Sela, All Rights Reserved</p>
        
                <p  style='
                margin: 14px 0;
                line-height: normal;
                font-size: 12px;
                color: #696F74;
                '> 43W 23rd Str, 6th Floor, New York NY 10010 </p>

            </td>
        </tr>


                
        </table>  
    </body>
    </html>`
  },

  stakeholderInvitationStatus:(host,msg, project, user)=>{
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
      
          *{
              outline: none;
          }
      
          .text{
              line-height: 22px;
              font-size: 16px;
              margin: 5px 0 25px;
              color: #222829;
              width: 75%;
              float: left;
          }
      
          .img-container {
              width: 25%;
              text-align: center;
              float: left;
              max-width: 60px;
              
          }
      
          
          .img-container img{
              display: block;
              border-radius: 50%;
              margin: auto;
              float: left;
          }
      
          button{
              cursor: pointer;
          }
      
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
                          font-weight: 500;
                          "> Hello, Dotun </p>
                        
                        <div class="img-container">
                          <img src=${user.photo || "http://placehold.it/50"} alt='50'/>
                        </div>
                        <p  class='text'> <strong>${user.name}</strong> ${msg} <strong>${project.name}</strong></p>
                        
                        <div style="margin: 15px auto; text-align: center;">
                              <a 
                              href="${host}/dashboard/project/${project._id}/overview"
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
                              ">View Project</a>
                          </div>
                       
                  </td>
              </tr>
              
                  <tr>
                      <td style='text-align: center;'>
                          <p style=" margin: 14px 0;
                          line-height: normal;
                          font-size: 14px;
                          color: #696F74;
                          width: 80%;
                          margin: auto;
                          ">
                              You are receiving this email because you signed up on <strong>Sela</strong>
                          </p>
                          <p 
                              style='
                          margin: 14px 0;
                          line-height: normal;
                          font-size: 12px;
                          color: #696F74;
                          '>Copyright &copy; Sela, All Rights Reserved</p>
                  
                          <p  style='
                          margin: 14px 0;
                          line-height: normal;
                          font-size: 12px;
                          color: #696F74;
                          '> 43W 23rd Str, 6th Floor, New York NY 10010 </p>
      
                      </td>
                  </tr>
                  
          </table>  
      </body>
      </html>`
  }
}

module.exports = emailTemplates;