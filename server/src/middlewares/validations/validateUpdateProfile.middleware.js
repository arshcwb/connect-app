import ApiError from "../../../utils/ApiError.js";

const validateUpdateProfile = (req, res, next) => {
    const body = req.body || {};

    if (body.firstName && body.firstName.length > 50) {
        throw new ApiError(400, "First name must be less than 50 characters");
    }

    if (body.middleName && body.middleName.length > 50) {
        throw new ApiError(400, "Middle name must be less than 50 characters");
    }

    if (body.lastName && body.lastName.length > 50) {
        throw new ApiError(400, "Last name must be less than 50 characters");
    }

    if (body.username && body.username.length < 3) {
        throw new ApiError(400, "Username must be at least 3 characters long");
    }

    if (body.email && !body.email.includes("@")) {
        throw new ApiError(400, "Email must be a valid email");
    }

    if (body.location && body.location.length > 100) {
        throw new ApiError(400, "Location must be less than 100 characters");
    }

    if (body.occupation && body.occupation.length > 100) {
        throw new ApiError(400, "Occupation must be less than 100 characters");
    }

    next();
};

export default validateUpdateProfile;
