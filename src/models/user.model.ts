import { Model, Schema, model } from 'mongoose';

const bcrypt = require('bcrypt');
const validator = require('validator');

interface IUser { 
  name: string;
  _id: string; 
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthday: Date;
}

interface IUserModel extends Model<IUser> {
  signup(name:string, lastName: string, email: string, password: string, confirmPassword: string, birthday: Date): IUser;
  login(email: string, password: string): IUser;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a username']
    },
    lastName: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      required: [true, 'Enter a valid email']
    },
    password: {
      type: String,
      required: [true, "Password can't be blank"]
    },
    confirmPassword: {
      type: String
    },
    birthday: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
  }
);

UserSchema.statics.signup = async function (name:string, lastName: string, email: string, password: string, confirmPassword: string, birthday: string ) {

  //validation 
    if (!email || !password) {
      throw Error('All fields must be filled');
    }

    if (password !== confirmPassword) {
      throw Error('Passwords do not match');
    }
  
    if (!validator.isEmail(email)) {
      throw Error('Email is not valid');
    } 
    
    if (!validator.isStrongPassword(password)) {
      throw Error('Password is not strong enough');
    }

    const exists = await this.findOne({ email });
  
    if(exists){
      throw Error('Email already in use');
    }
  
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
  
    const user = await this.create({ email, password: hash, name, lastName, birthday });
  
    return user

}

UserSchema.statics.login = async function (email: string, password: string ) {

  if(!email || !password){
    throw Error('All fields must be filled');
  }

  const user = await this.findOne({ email });
  if (!user) {
    throw Error('Incorrect email');
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw Error('Incorrect password');
  }

  return user;
}

const UserModel = model<IUser, IUserModel>('User', UserSchema);

export default UserModel;
