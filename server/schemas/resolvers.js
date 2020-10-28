// import user model
const { User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
// import sign token function from auth
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    // get a single user by their id
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select("-__v -password")

        return userData;
      }

      throw new AuthenticationError("Not logged in");
    },
  },
  Mutation: {
    // create a user, sign a token, and send it back
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
    },
    // login a user, sign a token, and send it back
    // {email, password} is destructured args
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Incorrect Credentials");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect Credentials");
      }

      const token = signToken(user);
      return { token, user };
    },
    // save a book to a user's `savedBooks` field by adding it to the set (to prevent duplicates)
    // context comes from context in the server.js created in the auth middleware function
    saveBook: async (parent, args, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: { ...args } } },
          { new: true, runValidators: true }
        );

        return updatedUser;
      }

      throw new AuthenticationError("You need to be logged in!");
    },
    // remove a book from `savedBooks`
    removeBook: async (parent, args, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: args.bookId } } },
          { new: true }
        );

        return updatedUser;
      }

      throw new AuthenticationError("You need to be logged in!");
    },
  },
};

module.exports = resolvers;