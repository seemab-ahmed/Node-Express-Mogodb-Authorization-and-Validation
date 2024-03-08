const RequestLogger = (request, response, next) => {
  response.on("finish", () => {
    const { ip, method, url } = request;
    const { statusCode } = response;
    const hostname = require("os").hostname();
    const userAgent = request.get("user-agent") || "";
    console.log(
      `[hostname: ${hostname}] [method : ${method}] [url: ${url}] [status : ${statusCode}] [userAgent:[${userAgent}] Ip:[${ip}]]`
    );
  });
  next();
};

module.exports = {
  RequestLogger,
};
