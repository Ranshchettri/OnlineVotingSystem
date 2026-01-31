const axios = require("axios");

(async () => {
  try {
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      email: "ranshsunar@gmail.com",
      password: "Admin@123456",
    });
    console.log("SUCCESS", res.data);
  } catch (err) {
    console.error("ERROR MESSAGE:", err.message);
    if (err.response) {
      console.error("STATUS:", err.response.status);
      console.error(
        "RESPONSE DATA:",
        JSON.stringify(err.response.data, null, 2),
      );
    }
    console.error("STACK:", err.stack);
    process.exit(1);
  }
})();
