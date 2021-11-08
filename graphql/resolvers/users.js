const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server')

const {validateRegisterInput, validateLoginInput} = require('../../Util/Validators');
const User = require('../../modules/User');
const {SECRET_KEY} = require('../../config');


generateToken = (user)=>{
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
    },SECRET_KEY,{expiresIn:'1h'});
}

module.exports = {
    Mutation:{
        async  register(_,{registerInput: {username, password, confirmPassword, email}}, context, info){

            const {valid, errors } = validateRegisterInput(username, email, password, confirmPassword);
            if(!valid){
                throw new UserInputError('Errors',{
                    errors
                })
            }
            password =  await bcrypt.hash(password, 12);
            const newUser = new User({
                email, username, password, createdAt: new Date().toISOString()
            });


            const user = await User.findOne({username});
            if(user){
                throw new UserInputError('username is taken',{
                    errors: {
                        username: 'This username is taken'
                    }
                })
            }

            const res = await newUser.save();
            const token= generateToken(res);

            return {
                ...res._doc,
                id: res._id,
                token
            }
        },

        async login(_, {username, password}, context, info){
            const { errors, valid} =validateLoginInput(username, password);

            if(!valid){
                throw new UserInputError('Errors',{
                    errors
                })
            }

            let user = await User.findOne({username});

            if(!user){
                errors.general = 'User not found';
                throw new UserInputError('User not found',{
                    errors
                } );
            }

            const match = await bcrypt.compare(password, user.password);
            if(!match){
                errors.general = 'Wrong Credentials';
                throw new UserInputError('Wrong Credentials',{
                    errors
                } );
            }
            const token= generateToken(user);

            return {
                ...user._doc,
                id: user._id,
                token
            }
        }
    }
}