import mongoose from 'mongoose'
const { Schema } = mongoose

export default new Schema({
  _id: {
    type: String,
    required: true,
    minlength: [17, 'Minimum length of id is 17'],
    maxlength: [21, 'Maximum length of id is 21'],
    validate: {
      validator: v => /^(\d{17,21})$/.test(v),
      message: props => `${props.value} is not a valid id!`
    }
  },
  username: String,
  discriminator: {
    type: String,
    minlength: [4, 'Minimum length of discriminator is 4'],
    maxlength: [4, 'Maximum length of discriminator is 4'],
    validate: {
      validator: v => /^[0-9]{4}$/.test(v),
      message: props => `${props.value} is not a valid discriminator!`
    }
  },
  avatar: {
    default: null,
    type: String
  },
  banned: {
    default: false,
    type: Boolean
  },
  dates: {
    nextVote: {
      default: null,
      type: Date
    }
  },
  details: {
    summary: {
      default: null,
      maxlength: [100, 'Maximum length of User summary is 100'],
      type: String
    },
    permissions: {
      default: 0,
      type: Number
    }
  }
})
