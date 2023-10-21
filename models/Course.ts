import mongoose, { Document, Schema, Model } from "mongoose";

interface IComment extends Document {
  user: object;
  comment: string;
  commentReply: IComment[];
}

interface IReview extends Document {
  user: object;
  rating: number;
  comment: string;
  commentReply: IComment[];
}
interface ILink extends Document {
  title: string;
  url: string;
}

interface ICourseData extends Document {
  title: string;
  description: string;
  videoUrl: string;
  // videoThumbnail: object;
  videoSection: string;
  videoDuration: number;
  videoPlayer: string;
  links: ILink[];
  suggestions: string;
  questions: string;
}

interface ICourse extends Document {
  title: string;
  description: string;
  price: number;
  discount: number;
  // thumbnail: object;
  courseData: ICourseData[];
  reviews: IReview[];
  tags: string[];
  level: string;
  demoUrl: string;
  benifits: { title: string }[];
  requirements: string[];
  rating: number;
  purshased: number;
}

// Schemas

const reviewSchema = new Schema<IReview>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  rating: {
    type: Number,
    required: [true, "Please add a rating"],
  },
  comment: {
    type: String,
    required: [true, "Please add a comment"],
  },
  commentReply: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      comment: {
        type: String,
        required: [true, "Please add a comment"],
      },
    },
  ],
});

const linkSchema = new Schema<ILink>({
  title: {
    type: String,
    required: [true, "Please add a title"],
  },
  url: {
    type: String,
    required: [true, "Please add a url"],
  },
});

const commentSchema = new Schema<IComment>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  comment: {
    type: String,
    required: [true, "Please add a comment"],
  },
  commentReply: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      comment: {
        type: String,
        required: [true, "Please add a comment"],
      },
    },
  ],
});

const courseDataSchema = new Schema<ICourseData>({
  title: {
    type: String,
    required: [true, "Please add a title"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  videoUrl: {
    type: String,
    required: [true, "Please add a video url"],
  },
  // videoThumbnail: {
  //   type: Object,
  //   required: [true, "Please add a video thumbnail"],
  // },
  videoSection: {
    type: String,
    required: [true, "Please add a video section"],
  },
  videoDuration: {
    type: Number,
    required: [true, "Please add a video duration"],
  },
  videoPlayer: {
    type: String,
    required: [true, "Please add a video player"],
  },
  links: [linkSchema],
  suggestions: {
    type: String,
    required: [true, "Please add a suggestions"],
  },
  questions: [commentSchema],
});

const courseSchema = new Schema<ICourse>({
  title: {
    type: String,
    required: [true, "Please add a course title"],
  },
  description: {
    type: String,
    required: [true, "Please add a course description"],
  },
  price: {
    type: Number,
    required: [true, "Please add a course price"],
  },
  discount: {
    type: Number,
  },
  // thumbnail: {
  //   public_id: {
  //     type: String,
  //     // required: [true, "Please add a thumbnail public_id"],
  //   },
  //   url: {
  //     type: String,
  //     // required: [true, "Please add a thumbnail url"],
  //   },
  // },
  courseData: [courseDataSchema],
  reviews: [reviewSchema],
  tags: [String],
  level: {
    type: String,
    required: [true, "Please add a course level"],
  },
  demoUrl: {
    type: String,
    required: [true, "Please add a demo url"],
  },
  benifits: [
    {
      title: {
        type: String,
        required: [true, "Please add a benifit title"],
      },
    },
  ],
  requirements: [
    {
      title: {
        type: String,
        required: [true, "Please add a requirement title"],
      },
    },
  ],
  rating: {
    type: Number,
    required: [true, "Please add a rating"],
  },
  purshased: {
    type: Number,
    // required: [true, "Please add a purshased"],
  },
});

// Model
const Course: Model<ICourse> = mongoose.model("Course", courseSchema);

export default Course;