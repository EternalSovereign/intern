const passValidator = require("password-validator");

const contactSchema = new passValidator();
const passwordSchema = new passValidator();
const usernameSchema = new passValidator();

contactSchema.is().digits(10);

passwordSchema
    .is()
    .min(8)
    .is()
    .max(20)
    .has()
    .uppercase()
    .has()
    .lowercase()
    .has()
    .digits(2)
    .has()
    .not()
    .spaces();

usernameSchema.is().min(3).is().max(20).has().not().spaces();

const passwordValidator = async (password) => {
    return passwordSchema.validate(password);
};

const usernameValidator = async (username) => {
    return usernameSchema.validate(username);
};

const contactValidator = async (contact) => {
    return contactSchema.validate(contact);
};

let regex = new RegExp(
    "([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|\"([]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|[[\t -Z^-~]*])" //RFC 5322 Format
);
const emailValidator = async (email) => {
    return regex.test(email);
};

module.exports = {
    passwordValidator,
    usernameValidator,
    contactValidator,
    emailValidator,
};
