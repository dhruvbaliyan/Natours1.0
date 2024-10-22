const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true,"Plz Enter a valid name"]
    },
    email:{
        type:String,
        required:[true,"Plz Enter a valid email"],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail,'Plz Enter a valid Email']
    },
    photo:{
        type:String,
        default:'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'guide', 'lead-guide'],
        default: 'user'
    },
    password:{
        type:String,
        required:[true,"Plz Enter a valid password"],
        minlength:8,
        select:false
    },
    confirmPassword:{
        type:String,
        required:[true,"Plz Enter a valid confirm password"],
        validate:{
            validator:function(el){
                return el === this.password;
            },
            message:"Confirm Password must be same as Password"
        }
    },
    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetExpiresIn:Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    }
})

// if password was actually modified
userSchema.pre('save',async function(next){
    if(!this.isModified('password'))    return next();

    this.password=await bcrypt.hash(this.password,12);
    this.confirmPassword = undefined;
    next();

})
// Instance Method
userSchema.methods.correctPassword = async function(candidatePassword,userPassword){

    return await bcrypt.compare(candidatePassword,userPassword);
}

userSchema.methods.changedPasswordAfter = (JWTTimestamp)=> {
    if (this.passwordChangedAt) {
        const passwordChangedAtTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
        return JWTTimestamp.getTime() < passwordChangedAtTimestamp;
    }
    // If no `passwordChangedAt`, assume the password hasn't been changed
    return false;
};

userSchema.methods.ForgotPasswordToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
    .createHash('sha256')   // sha256 algorithm for cryptography
    .update(resetToken)
    .digest('hex');

    this.passwordResetExpiresIn = Date.now() + 10 * 60 *1000;

    console.log(this.passwordResetToken,{resetToken});
    return resetToken;
};

userSchema.pre(/^find/, function(next) {
    // this points to the current query
    this.find({ active: { $ne: false } });
    next();
  });

const User = mongoose.model('User',userSchema);

module.exports = User;