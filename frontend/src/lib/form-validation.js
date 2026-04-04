import isEmail from "validator/es/lib/isEmail.js";
import isEmpty from "validator/es/lib/isEmpty.js";
import isLength from "validator/es/lib/isLength.js";
import equals from "validator/es/lib/equals.js";


const validateName = (name) => {
    if (isEmpty(name) || !isLength(name, {min: 3})) {
        throw new Error("Name must be provided")
    }
}

const validateEmail = (email) => {
    if (isEmpty(email) || !isEmail(email)) {
        throw new Error("Email must be a valid emails address")
    }
}

const validatePassword = (password) => {
    if (isEmpty(password)) {
        throw new Error("Password must be at least 8 characters long.")
    }
    if (!isLength(password, {min: 8})) {
        throw new Error("Password must be at least 8 characters long.")
    }
}

const matchPasswords = (password, confPassword) => {
    if (!equals(password, confPassword)) {
        throw new Error("Passwords don't match")
    }
}


const validateLoginForm = (data) => {
    if (!data) {
        throw new Error("Form data not provided")
    }

    validateEmail(data?.username)
    validatePassword(data?.password)
}

const validateSignupForm = (data) => {
    if (!data) {
        throw new Error("Form data not provided")
    }

    validateName(data?.name)
    validateEmail(data?.email)
    validatePassword(data?.password)
    matchPasswords(data?.password, data?.confPassword)
}

const validateStartAndEndDate = (start, end) => {
    const datesDict = {
        "sd": null,
        "dd": null
    }

    if (start && !isEmpty(String(start))) {
        datesDict.sd = new Date(start).toISOString().replace('T', ' ').replace('Z', '+00:00')
    }

    if (end && !isEmpty(String(end))) {
        datesDict.dd = new Date(end).toISOString().replace('T', ' ').replace('Z', '+00:00')
    }


    if (datesDict?.sd && datesDict?.dd && datesDict?.sd > datesDict?.dd) {
        throw new Error("Start date must be before the due date")
    }
    return datesDict
}

export {
    validateName,
    validateEmail,
    validatePassword,
    matchPasswords,
    validateLoginForm,
    validateSignupForm,
    validateStartAndEndDate
}