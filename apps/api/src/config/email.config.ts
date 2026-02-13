export const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '465', 10),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || 'trungkien24072005@gmail.com',
    pass: process.env.EMAIL_PASS || 'jgzvzjwlhbsmhpvk',
  },
};

export const sender = {
  name: 'FaB-O2O',
  email: 'trungkien24072005@gmail.com',
};
