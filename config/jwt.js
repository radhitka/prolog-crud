import jwt from 'jsonwebtoken';

const generateAuthToken = (id) => {
  const token = jwt.sign({ user_id: id }, process.env.JWT_KEY);
  return token;
};

export default generateAuthToken;
