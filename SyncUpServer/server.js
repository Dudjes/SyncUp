const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());


mongoose.connect(
    "mongodb+srv://damianvanschie_db_user:dudjes2007@chatapplication.yiv2vyt.mongodb.net/SyncUp"
)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));



app.listen(3000, () => console.log("Server running on port 3000"));
