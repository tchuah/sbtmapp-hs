import { CommonMessage } from "src/@sbt/messages/en";

export const locale = {
    lang: 'en',
    data: {
        'Field': {
            'MobilePhone'            : 'Mobile Phone',
            'UserId'                   : 'User Id',
            'Password'               : 'Password',
            'RequestOtp'             : 'Request OTP',
            'Login'                 : 'Login',
            'RequestAgain'           : 'Request again',
            'Otp'                    : 'One Time Password (OTP)',
            'MobilePhoneValidationMsg' : 'Must begin with 01xxxxxxxxx',
            'PasswordValidationMsg'  : 'Must be at least 8 alphanumeric characters',
            'NameCannotChange'       : 'Please check carefully, once registered you cannot change this by yourself!',
            'AlertUse'               : 'Alert! Your profile data may be used to file relevant government report'
        },
        'Message': {
            'OtpSent' : 'Please enter the OTP to login! If you did not receive the SMS, please retry in 90s!'
        },
        'CommonMessage': CommonMessage
    }
};
