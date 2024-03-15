const { plainToInstance } = require("class-transformer");
const { validate } = require("class-validator");
export * from "class-validator";

export const validationPipe = async (schema, requestObject) => {
  const transformedClass = plainToInstance(schema, requestObject);

  const validationOptions = {
    whitelist: true,
    forbidNonWhitelisted: true,
  };

  const errors = await validate(transformedClass, validationOptions);

  if (errors.length > 0) {
    let errorResponse = "";
    errors.forEach((error) => {
      errorResponse += `${Object.values(error.constraints).join(". ")}. `;
    });
    return errorResponse.trim();
  }
  return false;
};
