const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const router = require("./src/Routes/route");
const commnMid = require("./src/Middleware/Auth");
const userprofile = require("./src/Models/profile");
const myDrillModel = require("./src/Models/myDrillModel");
const uploadDevice = require("./src/Models/uploadDevice");
const routineModel = require("./src/Models/routineModel");
const academyProfile = require("./src/Models/academyProfile");
const assignedByModel = require("./src/Models/assignedByModel");
const sncPlayerProfile = require("./src/Models/sncPlayerProfile");
const onGoingDrillModel = require("./src/Models/onGoingDrillModel");
const academy_coachModel = require("./src/Models/academy_coachModel");
const recommendationModel = require("./src/Models/recommendationModel");
const feedBackModel = require("./src/Models/feedBackModel");
const SnCPlayerModel = require("./src/Models/SnCPlayerModel");
const bcrypt = require("bcrypt");
const readinessSurvey = require("./src/Models/readinessSurvey");
const SessionModel = require("./src/Models/SessionModel");
const Test_Model = require("./src/Models/Test_Model");
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

mongoose.set("strictQuery", false);

//=====================[Multer Storage]=================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./upload/images");
  },
  filename: function (req, file, cb) {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5000000000,
  },
});
//*************************************************************************//

//============================[ User Profile]==============================
app.use("/image", express.static("./upload/images"));
app.post(
  "/:userId/userProfile",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.single("image"),
  async (req, res) => {
    try {
      let data = req.body;
      let file = req.file;
      let userid = req.params.userId;

      let { dob, gender, email, contact, height, weight, image, userId } = data;

      if (file) {
        data.image = `/image/${file.filename}`;
      }
      data.userId = userid;

      let userCreated = await userprofile.create(data);
      return res.status(201).send({
        status: true,
        message: "User Profile Created Successfully",
        data: userCreated,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//============================[Update User Profile]=======================
app.use("/image", express.static("./upload/images"));
app.put(
  "/:userId/UpdateProfile",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.single("image"),
  async (req, res) => {
    try {
      let data = req.body;
      let file = req.file;
      let userid = req.params.userId;

      let { image, dob, gender, email, contact, height, weight } = data;

      if (file) {
        data.image = `/image/${file.filename}`;
      }
      let user = await userprofile.findOneAndUpdate(
        { userId: userid },
        {
          $set: {
            dob: data.dob,
            gender: data.gender,
            email: data.email,
            contact: data.contact,
            height: data.height,
            weight: data.weight,
            image: data.image,
          },
        },
        { new: true }
      );

      return res.status(200).send({
        status: true,
        message: "User Profile Updated Successfully",
        data: user,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//===============================[ Get Image]===============================
app.get(
  "/:userId/getImage",
  commnMid.jwtValidation,
  commnMid.authorization,
  async (req, res) => {
    try {
      let body = req.query;

      let getImg = await userprofile.find(body);
      return res.status(200).send({
        status: true,
        message: "Success",
        data: getImg,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//=======================[ Upload Device]=============================================
app.use("/image", express.static("./upload/images"));
app.post(
  "/:userId/uploadDevice",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.fields([
    { name: "video", maxCount: 5 },
    { name: "thumbnail", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      let data = req.body;
      let file = req.files;
      let userid = req.params.userId;

      let { video, thumbnail, videoLength, title, category, tag, userId } =
        data;

      data.video = `/image/${file.video[0].filename}`;
      data.thumbnail = `/image/${file.thumbnail[0].filename}`;
      data.userId = userid;

      let uploadDeviceCreated = await uploadDevice.create(data);
      return res.status(201).send({
        data: uploadDeviceCreated,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//===========================[ Get My Video]=============================
app.get(
  "/:userId/myVideo",
  commnMid.jwtValidation,
  commnMid.authorization,
  async (req, res) => {
    try {
      let body = req.query;
      let userId = req.params.userId;

      let { category, title, tag } = body;

      let filter = {};

      if (category) {
        filter.category = category;
      }
      if (title) {
        filter.title = title;
      }
      if (tag) {
        filter.tag = tag;
      }
      if (userId) {
        filter.userId = userId;
      }

      let arr2 = [];

      let getVideo = await uploadDevice.find({ $or: [filter] });
      for (let i = 0; i > getVideo.length; i++) {
      }
      arr2.push(...getVideo);
      let OnGoingData = await onGoingDrillModel.find({ $or: [filter] });
      arr2.push(...OnGoingData);

      var MyDrillData = await myDrillModel.find({ $or: [filter] });

      for (let i = 0; i < MyDrillData.length; i++) {
        arr2.push(MyDrillData[i]);
        let userFeedback = await feedBackModel
          .find({ drill_id: MyDrillData[i]._id })
          .select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
      }
      return res.status(200).send({
        status: true,
        message: "Success",
        data: arr2,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//=======================[Get All Videos (Curriculum)]==============================
app.get("/curriculum", async (req, res) => {
  try {
    let data = req.query;

    let { category, title } = data;

    let filter = {};

    if (category) {
      filter.category = category;
    }
    if (title) {
      filter.title = title;
    }

    let Upload = await uploadDevice.find({ $or: [filter] });

    let lastIndex = Upload.length - 1;
    let lastObject = Upload[lastIndex];

    let arr = [];

    for (var i = 0; i < Upload.length; i++) {
      data.userId = Upload[i].userId;
      arr.push(data.userId);
    }

    let Alldrills = await myDrillModel.find({ userId: data.userId });

    let type = Alldrills ? true : false;

    let obj = [
      {
        title: lastObject.title,
        videoLength: lastObject.videoLength,
        video: lastObject.video,
        thumbnail: lastObject.thumbnail,
        category: lastObject.category,
        tag: lastObject.tag,
        isCompleted: type,
        drills: Alldrills,
      },
    ];

    return res.status(200).send({
      status: true,
      message: "Success",
      data: obj,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
});

//============================[My Drills]=======================================
app.use("/image", express.static("./upload/videos"));
app.post(
  "/:userId/myDrills",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.fields([
    { name: "video", maxCount: 5 },
    { name: "thumbnail", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      let data = req.body;
      let file = req.files;
      let userid = req.params.userId;

      let {
        title,
        category,
        repetation,
        sets,
        video,
        videoLength,
        thumbnail,
        userId,
        isCompleted,
        routine_id,
      } = data;

      if (file && file.video) {
        data.video = `/image/${file.video[0].filename}`;
      }

      if (file && file.thumbnail) {
        data.thumbnail = `/image/${file.thumbnail[0].filename}`;
      }

      data.userId = userid;

      let MyDrillCreated = await myDrillModel.create(data);

      let obj = {};
      obj["_id"] = MyDrillCreated._id;
      obj["title"] = MyDrillCreated.title;
      obj["category"] = MyDrillCreated.category;
      obj["repetation"] = MyDrillCreated.repetation;
      obj["sets"] = MyDrillCreated.sets;
      obj["video"] = MyDrillCreated.video;
      obj["videoLength"] = MyDrillCreated.videoLength;
      obj["thumbnail"] = MyDrillCreated.thumbnail;
      obj["createdAt"] = MyDrillCreated.createdAt;
      obj["userId"] = MyDrillCreated.userId;
      obj["isCompleted"] = MyDrillCreated.isCompleted;
      obj["routine_id"] = MyDrillCreated.routine_id;
      obj["comment"] = MyDrillCreated.comment;

      return res.status(201).send({
        status: true,
        message: "Success",
        data: obj,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//===================================[part-2 (snc Player)]===========================================
app.use("/image", express.static("./upload/images"));
app.post(
  "/:userId/sncPlayerProfile",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.single("image"),
  async (req, res) => {
    try {
      let data = req.body;
      let file = req.file;

      let {
        image,
        Height,
        Weight,
        Age,
        Gender,
        Sport,
        Dominance,
        Training_age,
        Recent_injuries,
      } = data;
      data.image = `/image/${file.filename}`;

      const sncPlayerCreated = await sncPlayerProfile.create(data);

      let obj = {};
      obj["image"] = sncPlayerCreated.image;
      obj["Height"] = sncPlayerCreated.Height;
      obj["Weight"] = sncPlayerCreated.Weight;
      obj["Age"] = sncPlayerCreated.Age;
      obj["Gender"] = sncPlayerCreated.Gender;
      obj["Sport"] = sncPlayerCreated.Sport;
      obj["Dominance"] = sncPlayerCreated.Dominance;
      obj["Training_age"] = sncPlayerCreated.Training_age;
      obj["Recent_injuries"] = sncPlayerCreated.Recent_injuries;

      return res.status(201).send({
        Status: true,
        Message: "Successfully Created",
        data: obj,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//============================[OnGoing Drills]=======================================
app.use("/image", express.static("./upload/videos"));
app.post(
  "/:userId/OnGoingDrills",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.fields([{ name: "video", maxCount: 5 }]),
  async (req, res) => {
    try {
      let data = req.body;
      let file = req.files;
      let userid = req.params.userId;

      let {
        userId,
        title,
        category,
        repetation,
        sets,
        video,
        comment,
        remarks,
        score,
      } = data;

      data.video = `/image/${file.video[0].filename}`;
      data.userId = userid;

      const OnGoingDrillCreated = await onGoingDrillModel.create(data);

      let obj = {
        _id: OnGoingDrillCreated._id,
        userId: OnGoingDrillCreated.userId,
        title: OnGoingDrillCreated.title,
        category: OnGoingDrillCreated.category,
        repetation: OnGoingDrillCreated.repetation,
        sets: OnGoingDrillCreated.sets,
        video: OnGoingDrillCreated.video,
        comment: OnGoingDrillCreated.comment,
        remarks: OnGoingDrillCreated.remarks,
        score: OnGoingDrillCreated.score,
        createdAt: OnGoingDrillCreated.createdAt,
      };

      return res.status(201).send({
        status: true,
        message: "Success",
        data: obj,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//============================[Get OnGoing Drills]=======================================
app.get(
  "/:userId/OnGoingDrill",
  commnMid.jwtValidation,
  commnMid.authorization,
  async (req, res) => {
    try {
      let data = req.query;
      let userid = req.params.userId;

      let { category, title } = data;

      let filter = {};

      if (category) {
        filter.category = category;
      }
      if (title) {
        filter.title = title;
      }

      let OnGoingDrillCreated = await onGoingDrillModel
        .find({ userId: userid, $or: [data, filter] })
        .lean();

      let arr = [];

      for (var i = 0; i < OnGoingDrillCreated.length; i++) {
        data.videoId = OnGoingDrillCreated[i]._id;
        arr.push(data.videoId);
      }
      let arr2 = [];
      for (let i = 0; i < OnGoingDrillCreated.length; i++) {
        arr2.push(OnGoingDrillCreated[i]);
      }

      for (let i = 0; i < arr2.length; i++) {
        let userRecommendation = await recommendationModel
          .find({ userId: arr2[i].userId })
          .select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
        arr2[i].recommendation = userRecommendation;
      }

      return res.status(201).send({
        status: true,
        message: "Success",
        data: arr2,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//===========================[ post Recommendation] =====================
app.use("/image", express.static("./upload/videos"));
app.post(
  "/:userId/recommendations",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.single("audioFile"),
  async (req, res) => {
    try {
      let data = req.body;
      let userid = req.params.userId;

      let { anecdote_no, message, audiolength, manual, videoId } = data;
      let file = req.file;
      let audioFile = `/image/${file.filename}`;
      data.audioFile = audioFile;

      let videoid = await onGoingDrillModel.find();
      data.userId = userid;

      let arr = [];

      for (let i = 0; i < videoid.length; i++) {
        data.videoId = videoid[i]._id;
        arr.push(data.videoId);
      }

      const RecommendationCreated = await recommendationModel.create(data);

      let obj = {
        userId: data.userId,
        videoId: data.videoId,
        anecdote_no: RecommendationCreated.anecdote_no,
        mesage: RecommendationCreated.message,
        audioFile: RecommendationCreated.audioFile,
        audiolength: RecommendationCreated.audiolength,
        createdat: RecommendationCreated.createdAt,
        manual: RecommendationCreated.manual,
      };

      return res.status(201).send({
        status: true,
        message: "Success",
        data: [obj],
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//==============================[Academy-Coach Profile]=================================
app.use("/image", express.static("./upload/images"));
app.post(
  "/:userId/academyProfile",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.single("image"),
  async (req, res) => {
    try {
      let data = req.body;
      let file = req.file;
      let userid = req.params.userId;

      let { userId, image, admin_name, email, contact, address } = data;

      if (file) {
        data.image = `/image/${file.filename}`;
      }

      data.userId = userid;

      let user2 = await academy_coachModel.findById({ _id: userid });

      if (user2.academy_name == null) {
        let user = await academy_coachModel.findByIdAndUpdate(
          { _id: userid },
          { academy_name: data.admin_name },
          { new: true }
        );
      }

      const academyCreated = await academyProfile.create(data);
      return res.status(201).send({
        status: true,
        message: "Academy/Coach Profile Created Successfully",
        data: academyCreated,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//============================[Update Academy Profile]=======================
app.use("/image", express.static("./upload/images"));
app.put(
  "/:userId/UpdateAcademyProfile",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.single("image"),
  async (req, res) => {
    try {
      let data = req.body;
      let file = req.file;
      let userid = req.params.userId;

      let { image, admin_name, email, contact, address } = data;

      if (req.file) {
        data.image = `/image/${file.filename}`;
      }
      let academy = await academyProfile.findOneAndUpdate(
        { userId: userid },
        {
          $set: {
            image: data.image,
            admin_name: data.admin_name,
            email: data.email,
            contact: data.contact,
            address: data.address,
          },
        },
        { new: true }
      );

      return res.status(200).send({
        status: true,
        message: "Academy/Coach Profile Updated Successfully",
        data: academy,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//============================[My Drills]=======================================
app.use("/image", express.static("./upload/videos"));
app.post(
  "/:userId/assignedByDrills",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.array("video", 100),
  async (req, res) => {
    try {
      let data = req.body;
      let files = req.files;
      let userId = req.params.userId;

      let { title, category, repetation, sets, assignedBy } = data;

      let video = files.map((file) => `/image/${file.filename}`);

      data.assignedBy = userId;

      data.video = video;

      let assignedByCreated = await assignedByModel.create(data);

      let responseObj = {};

      responseObj["_id"] = assignedByCreated._id;
      responseObj["title"] = assignedByCreated.title;
      responseObj["category"] = assignedByCreated.category;
      responseObj["repetation"] = assignedByCreated.repetation;
      responseObj["sets"] = assignedByCreated.sets;
      responseObj["video"] = assignedByCreated.video;
      responseObj["createdAt"] = assignedByCreated.createdAt;
      responseObj["assignedBy"] = assignedByCreated.assignedBy;

      return res.status(201).send({
        status: true,
        message: "Success",
        data: responseObj,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//============================[Get All Drills]=======================================
app.get(
  "/:userId/allDrill",
  commnMid.jwtValidation,
  commnMid.authorization,
  async (req, res) => {
    try {
      let data = req.query;
      let userid = req.params.userId;

      let { category, title } = data;

      let filter = {};

      if (category) {
        filter.category = category;
      }
      if (title) {
        filter.title = title;
      }

      let allRoutines = await routineModel
        .find({ userId: userid, $or: [filter] })
        .lean();

      let arr2 = [];
      for (var i = 0; i < allRoutines.length; i++) {
        arr2.push(allRoutines[i]);
      }
      for (let i = 0; i < arr2.length; i++) {
        let allDrill = await myDrillModel
          .find({ routine_id: arr2[i]._id })
          .lean();
        for (let j = 0; j < allDrill.length; j++) {
          let feedback = await feedBackModel.find({
            drill_id: allDrill[j]._id,
          });
          allDrill[j].Feedback = feedback;
        }
        arr2[i].allDrill = allDrill;
      }

      return res.status(201).send({
        status: true,
        message: "Success",
        data: arr2,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

// ===================[get feedback and remark] ==================//
app.get(
  "/:userId/getFeedbacks",
  commnMid.jwtValidation,
  commnMid.authorization,
  async (req, res) => {
    try {
      let data = req.query;
      let userid = req.params.userId;

      let { drill_id, video_id } = data;

      let filter = {};

      if (drill_id) {
        filter.drill_id = drill_id;
      }
      if (video_id) {
        filter.video_id = video_id;
      }

      let allfeedbacks = await feedBackModel.find({ $or: [filter] }).lean();
      return res.status(201).send({
        status: true,
        message: "Success",
        data: allfeedbacks,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);
//=================================================================================

app.post(
  "/:userId/create",
  commnMid.jwtValidation,
  commnMid.authorization,
  async (req, res) => {
    try {
      let data = req.body;
      let userid = req.params.userId;
      const allRoutines = await routineModel.find({ userId: userid }).lean();
      for (let i = 0; i < allRoutines.length; i++) {
        if (
          data.date == allRoutines[i].date &&
          data.time == allRoutines[i].time
        ) {
          return res.status(400).send({
            status: false,
            message: "you already have routine set for this time",
          });
        } else {
          const startDateString = data.date;
          const endDateString = data.end_date;
          const [startDay, startMonth, startYear] = startDateString.split("-");
          const [endDay, endMonth, endYear] = endDateString.split("-");

          const startdate = new Date(`${startYear}`, startMonth - 1, startDay);
          const end_date = new Date(`${endYear}`, endMonth - 1, endDay);

          var dateArray = [];
          for (
            let date = startdate;
            date <= end_date;
            date.setDate(date.getDate() + 1)
          ) {
            const dateString = date
              .toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
              .split("/")
              .reverse()
              .join("-");
            dateArray.push(dateString);
          }
        }
        console.log(dateArray);
      }

      return res.status(201).send({
        status: true,
        message: "Success",
        data: data,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//======================[Update User Profile]===============================
app.put(
  "/:userId/updateUserProfile",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.single("image"),
  async (req, res) => {
    try {
      let data = req.body;
      let userid = req.params.userId;

      let { image, dob, gender, email, contact, height, weight } = data;

      let user = await userprofile.findOneAndUpdate(
        { userId: userid },
        {
          $set: {
            dob: data.dob,
            gender: data.gender,
            email: data.email,
            contact: data.contact,
            height: data.height,
            weight: data.weight,
            image: data.image,
          },
        },
        { new: true }
      );

      return res.status(200).send({
        status: true,
        message: "User Profile Updated Successfully",
        data: user,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//======================[Update Academy/Coach Profile]===============================
app.put(
  "/:userId/updateCoachProfile",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.single("image"),
  async (req, res) => {
    try {
      let data = req.body;
      let userid = req.params.userId;

      let { image, admin_name, email, contact, address } = data;

      let academy = await academyProfile.findOneAndUpdate(
        { userId: userid },
        {
          $set: {
            image: data.image,
            admin_name: data.admin_name,
            email: data.email,
            contact: data.contact,
            address: data.address,
          },
        },
        { new: true }
      );

      return res.status(200).send({
        status: true,
        message: "Academy/Coach Profile Updated Successfully",
        data: academy,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//=================[New My Drill api]======================
app.post(
  "/:userId/createMyDrills",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.fields([
    { name: "video", maxCount: 5 },
    { name: "thumbnail", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      let userid = req.params.userId;
      let data = req.body;

      let {
        title,
        category,
        repetation,
        sets,
        video,
        videoLength,
        thumbnail,
        userId,
        isCompleted,
        routine_id,
      } = data;

      data.userId = userid;

      let myDrillsCreated = await myDrillModel.create(data);

      return res.status(201).send({
        status: true,
        message: "MyDrill Created Successfully",
        data: myDrillsCreated,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);
//=====================[New User Profile upload]=====================
app.post(
  "/:userId/videoUpload",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.fields([
    { name: "video", maxCount: 5 },
    { name: "thumbnail", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      let userid = req.params.userId;
      let data = req.body;

      let { video, thumbnail, videoLength, title, category, tag, userId } =
        data;

      data.userId = userid;

      let uploadDeviceCreated = await uploadDevice.create(data);

      return res.status(201).send({
        status: true,
        message: "Video Upload Successfully",
        data: uploadDeviceCreated,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);
//=================[New User Profile]=======================
app.post(
  "/:userId/createUserProfile",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.single("image"),
  async (req, res) => {
    try {
      let data = req.body;
      let userid = req.params.userId;

      let { dob, gender, email, contact, height, weight, image, userId } = data;

      data.userId = userid;

      let userCreated = await userprofile.create(data);
      return res.status(201).send({
        status: true,
        message: "User Profile Created Successfully",
        data: userCreated,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);
//=================[Academy/Coach Profile]=========================
app.post(
  "/:userId/academy_coachProfile",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.single("image"),
  async (req, res) => {
    try {
      let data = req.body;
      let userid = req.params.userId;

      let { userId, image, admin_name, email, contact, address } = data;

      data.userId = userid;

      let user2 = await academy_coachModel.findById({ _id: userid });

      if (user2.academy_name == null) {
        let user = await academy_coachModel.findByIdAndUpdate(
          { _id: userid },
          { academy_name: data.admin_name },
          { new: true }
        );
      }

      const academyCreated = await academyProfile.create(data);
      return res.status(201).send({
        status: true,
        message: "Academy/Coach Profile Created Successfully",
        data: academyCreated,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);

//=================[New SnC User Profile]=======================
app.post(
  "/:userId/createSnCProfile",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.single("image"),
  async (req, res) => {
    try {
      let data = req.body;
      let userId = req.params.userId;

      let {
        Height,
        Weight,
        Age,
        Gender,
        Sport,
        Dominance,
        Training_age,
        Recent_injuries,
        image,
      } = data;

      data.userId = userId;

      let userCreated = await sncPlayerProfile.create(data);
      return res.status(201).send({
        status: true,
        message: "SnC Player Profile Created Successfully",
        data: userCreated,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);
//=================[ Update SnC Player profile]==================
app.put(
  "/:userId/updateSnCPlayerProfile",
  commnMid.jwtValidation,
  commnMid.authorization,
  upload.single("image"),
  async (req, res) => {
    try {
      let data = req.body;
      let userId = req.params.userId;

      let {
        Height,
        Weight,
        Age,
        Gender,
        Sport,
        Dominance,
        Training_age,
        Recent_injuries,
        image,
      } = data;

      let user = await sncPlayerProfile.findOneAndUpdate(
        { userId: userId },
        {
          $set: {
            Height: data.Height,
            Weight: data.Weight,
            Age: data.Age,
            Gender: data.Gender,
            Sport: data.Sport,
            Dominance: data.Dominance,
            Training_age: data.Training_age,
            Recent_injuries: data.Recent_injuries,
            image: data.image,
          },
        },
        { new: true }
      );

      return res.status(200).send({
        status: true,
        message: "SnC Player Profile Updated Successfully",
        data: user,
      });
    } catch (error) {
      return res.status(500).send({
        status: false,
        message: error.message,
      });
    }
  }
);


//==========================[Update SNC Password]=================


app.post("/updateSncPassword", async (req, res) => {
  try {
    let data = req.body;
    let { email, password } = data;

    let user2 = await SnCPlayerModel.findOne({ email: email });

    const encryptedPassword = bcrypt.hashSync(password, 12);
    data.password = encryptedPassword;

    let user = await SnCPlayerModel.findOneAndUpdate(
      { email: email },
      { $set: { password: encryptedPassword } },
      { new: true }
    );
    ;
    return res.status(200).send({
      status: true,
      message: "Password Updated Successfully",
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      msg: error.message,
    });
  }
});

//=============[ get SNC contact ]================
app.post("/getSncContact", async (req, res) => {
  try {
    let email = req.body.email;

    let user = await SnCPlayerModel.findOne({ email: email });

    if (!user) {
      return res.status(400).send({
        status: false,
        msg: "This Email are not Registered.",
      });
    } else {
      return res.status(200).send({
        status: true,
        msg: "Get Contact",
        data: {
          phone: user.phone,
        },
      });
    }
  } catch (error) {
    return res.status(500).send({
      status: false,
      msg: error.message,
    });
  }
});


//=============[ get IsReadiness submitted for a day]================

app.get("/:userId/getReadinesssurvey", commnMid.jwtValidation, commnMid.authorization, async (req, res) => {
  try {
    let data = req.query;
    let userId = req.params.userId;

    let { date } = data;

    let filter = {};

    if (date) {
      filter.date = date;
    }
    let Readiness = await readinessSurvey.findOne({ userId: userId, date: date });
    if (Readiness) {
      return res.status(200).send({
        status: true,
        message: "Success",
        submitted: true
      });
    } else {
      return res.status(200).send({
        status: true,
        message: "Success",
        submitted: false,
      });
    }
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }

})



//================[SnC Session Type]========================



app.post("/SncSession", async (req, res) => {
  try {
    let data = req.body;

    let SessionArr = [];

    for (let i = 0; i < data.length; i++) {
      let { id, title } = data[i];

      let Session = await SessionModel.create(data[i]);
      SessionArr.push(Session);
    }

    return res.status(201).send({
      status: true,
      message: "Session Created Successfully",
      data: SessionArr,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
})
//==================[Get SnC Test Category]================
app.get("/GetSncSession", async (req, res) => {
  try {
    let body = req.query;
    let filter = {};

    if (body.id) {
      filter.id = body.id;
    }

    const Session = await SessionModel.find(filter).select({ id: 1, SessionType: 1, _id: 0 });

    return res.status(200).send({
      status: true,
      message: "Get Session Successfully",
      data: Session,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
})

// ========================[store Test score ]=======================//

app.post("/:userId/Test", commnMid.jwtValidation, commnMid.authorization, async (req, res) => {
  try {
    let data = req.body;
    let userId = req.params.userId;

    let TestArr = [];

    for (let i = 0; i < data.length; i++) {
      let {
        testId,
        catId,
        date,
        title,
        score,
        unit
      } = data;
      data.userId = userId;

      let Test = await Test_Model.create(data[i]);
      TestArr.push(Test);
    }

    return res.status(201).send({
      status: true,
      message: "Session Created Successfully",
      data: TestArr,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
})

//==================[Database Connectivity]==========================
mongoose
  .connect(
    "mongodb+srv://Cricket:4p8Pw0p31pioSP3d@cluster0.ayvqi4c.mongodb.net/Cricket-App"
  )
  .then(() => console.log("Database is connected successfully.."))
  .catch((Err) => console.log(Err));

app.use("/", router);

app.listen(port, function () {
  console.log(`Server is connected on Port ${port} ✅✅✅`);
});

// mongodb+srv://developerclumpcoder:nvoLLVn3YFf49lIC@cluster0.5sgifgr.mongodb.net/Cricket-App

//nvoLLVn3YFf49lIC
