const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server');

const {SECRET_KEY} = require('../config');

module.exports = (context) =>{
    const authHeader = context.req.headers.authorization;
    if(authHeader){
        const token = authHeader.split('Bearer ')[1].trim();
        if(token){
            try {
                const user = jwt.verify(token, SECRET_KEY);
                return user;
            } catch (error) {
                console.log(error)
                throw new AuthenticationError('Invalid/Expired token');
            }
        }
        throw new Error('Authentication token must be Bearer');
    }
    throw new Error('Authorization Header must be provided');


}