// import { DataSource } from "typeorm";

// // Using environment variables
// import dotenv from "dotenv";
// dotenv.config();

// const connectDB = new DataSource({
//   type: "postgres",
//   host: "localhost",
//   port: 5432,
//   username: "postgres",
//   password: 123,
//   database: "appchat",
//   logging: false,
//   synchronize: true,
//   entities: ["./entities/*.js"],
//   extra: {
//     ssl: {
//       rejectUnauthorized: false,
//     },
//   },
// });

// connectDB
//   .initialize()
//   .then(() => {
//     console.log(`Data Source has been initialized`);
//   })
//   .catch((err) => {
//     console.error(`Data Source initialization error`, err);
//   });

// export default connectDB;
